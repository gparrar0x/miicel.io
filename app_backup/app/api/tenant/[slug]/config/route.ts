/**
 * GET /api/tenant/[slug]/config - Fetch Tenant Configuration
 *
 * Returns public tenant configuration including branding, colors, and business info.
 * Used by storefront pages to apply dynamic theming.
 *
 * Flow:
 * 1. Validate slug parameter format
 * 2. Query tenants_public view (bypasses RLS, only active tenants)
 * 3. Parse config JSONB and build response DTO
 * 4. Return with cache headers (5 min cache)
 *
 * Response: TenantConfigResponse
 * Cache: public, max-age=300, stale-while-revalidate=600
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const slugParamSchema = z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format')

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    // Await params (Next.js 16 requirement)
    const { slug: rawSlug } = await params

    // Validate slug parameter
    const validationResult = slugParamSchema.safeParse(rawSlug)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid slug format. Use lowercase alphanumeric with hyphens.' },
        { status: 400 },
      )
    }

    const slug = validationResult.data
    const supabase = await createClient()

    // Query tenants table (template field)
    // Note: tenants_public view doesn't include template column
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('id, slug, name, config, template, active')
      .eq('slug', slug)
      .eq('active', true)
      .maybeSingle()

    if (error) {
      console.error('Supabase error fetching tenant:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Parse config JSONB (type assertion safe due to view constraints)
    const config = (tenant.config as any) || {}

    // Build response DTO with safe fallbacks matching Product Page design system
    const validTemplates = ['gallery', 'detail', 'minimal', 'restaurant'] as const
    const rawTemplate = (tenant as any).template
    const template = validTemplates.includes(rawTemplate) ? rawTemplate : 'gallery'

    const response = {
      id: tenant.slug,
      businessName: config.business_name || config.business?.name || tenant.name,
      subtitle: config.subtitle || config.business?.subtitle || null,
      location: config.location || config.business?.location || null,
      bannerUrl: config.banner_url || config.banner || null,
      logoUrl: config.logo_url || config.logo || null,
      logoTextUrl: config.logo_text_url || config.logoText || null,
      colors: {
        primary: config.colors?.primary || '#3B82F6',
        secondary: config.colors?.secondary || '#10B981',
        accent: config.colors?.accent || config.colors?.primary || '#3B82F6',
        background: config.colors?.background || '#FFFFFF',
        surface: config.colors?.surface || '#F8F8F8',
        textPrimary: config.colors?.textPrimary || config.colors?.text_primary || '#000000',
        textSecondary: config.colors?.textSecondary || config.colors?.text_secondary || '#999999',
      },
      hours: config.hours || {},
      currency: config.currency || 'USD',
      template,
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        // Cache for 5 minutes, allow stale content for 10 minutes while revalidating
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Tenant config error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
