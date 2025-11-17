/**
 * GET /api/tenants/list - Public Tenants List
 *
 * Returns all active tenants for landing page display.
 * No auth required - public endpoint.
 *
 * Response: Array of {slug, name, logo, status}
 * Logo extracted from config.logo field (JSONB)
 *
 * Created: 2025-11-16 (SKY-41)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface TenantConfig {
  logo?: string
  business_name?: string
  colors?: {
    primary?: string
    secondary?: string
  }
  [key: string]: unknown
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Query all active tenants
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('slug, name, config, active')
      .eq('active', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching tenants:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tenants' },
        { status: 500 }
      )
    }

    // Map to required format
    const result = tenants.map((tenant) => {
      const config = (tenant.config as TenantConfig) || {}

      return {
        slug: tenant.slug,
        name: tenant.name,
        logo: config.logo || null,
        status: tenant.active ? 'active' : 'inactive',
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Unexpected error in GET /api/tenants/list:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
