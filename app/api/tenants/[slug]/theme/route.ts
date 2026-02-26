/**
 * GET /api/tenants/[slug]/theme - Fetch Tenant Theme Configuration
 * PATCH /api/tenants/[slug]/theme - Update Tenant Theme Configuration
 *
 * GET: Returns template + theme_overrides for any authenticated tenant member
 * PATCH: Updates template/overrides, requires OWNER role
 *
 * Schema: tenants.template (enum) + tenants.theme_overrides (JSONB)
 * Validation: DB trigger + Zod schema (see lib/schemas/theme.ts)
 *
 * Auth:
 * - GET: Any tenant member (check tenant_users.tenant_id = tenant.id)
 * - PATCH: OWNER only (check tenant_users.role = 'OWNER')
 *
 * Created: 2025-11-16 (Issue #5)
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { updateThemeSchema } from '@/lib/schemas/theme'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database.types'

const slugParamSchema = z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format')

/**
 * GET /api/tenants/[slug]/theme
 *
 * Returns tenant template + theme_overrides
 * Auth: Any authenticated user who is member of the tenant
 *
 * Response:
 * {
 *   "template": "gallery",
 *   "overrides": { "gridCols": 3, ... }
 * }
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const supabase = await createClient()

    // Step 1: Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    // Step 2: Validate slug
    const { slug: rawSlug } = await params
    const validationResult = slugParamSchema.safeParse(rawSlug)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid slug format. Use lowercase alphanumeric with hyphens.' },
        { status: 400 },
      )
    }

    const slug = validationResult.data

    // Step 3: Fetch tenant and verify user membership
    const { data: tenant, error: fetchError } = await supabase
      .from('tenants')
      .select('id, slug, template, theme_overrides, tenant_users!inner(user_id)')
      .eq('slug', slug)
      .eq('active', true)
      .eq('tenant_users.user_id', user.id)
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching tenant theme:', fetchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found or access denied' }, { status: 404 })
    }

    // Step 4: Build response
    return NextResponse.json({
      template: tenant.template,
      overrides: tenant.theme_overrides || {},
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/tenants/[slug]/theme:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/tenants/[slug]/theme
 *
 * Updates tenant template and/or theme_overrides
 * Auth: User must be OWNER of tenant
 *
 * Request body:
 * {
 *   "template"?: "gallery" | "detail" | "minimal",
 *   "overrides"?: { gridCols?: number, ... }
 * }
 *
 * At least one field required. Partial updates allowed for overrides.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const supabase = await createClient()

    // Step 1: Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    // Step 2: Validate slug
    const { slug: rawSlug } = await params
    const slugValidation = slugParamSchema.safeParse(rawSlug)

    if (!slugValidation.success) {
      return NextResponse.json(
        { error: 'Invalid slug format. Use lowercase alphanumeric with hyphens.' },
        { status: 400 },
      )
    }

    const slug = slugValidation.data

    // Step 3: Parse and validate request body
    const body = await request.json()
    const bodyValidation = updateThemeSchema.safeParse(body)

    if (!bodyValidation.success) {
      return NextResponse.json({ error: bodyValidation.error.issues[0].message }, { status: 400 })
    }

    const { template, overrides } = bodyValidation.data

    // Step 4: Verify tenant exists and user is OWNER
    const { data: tenant, error: fetchError } = await supabase
      .from('tenants')
      .select('id, template, theme_overrides, tenant_users!inner(user_id, role)')
      .eq('slug', slug)
      .eq('active', true)
      .eq('tenant_users.user_id', user.id)
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching tenant for update:', fetchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found or access denied' }, { status: 404 })
    }

    // Type assertion for nested relation (Supabase returns array for inner join)
    const tenantUsers = tenant.tenant_users as unknown as Array<{ user_id: string; role: string }>
    const userRole = tenantUsers.find((tu) => tu.user_id === user.id)?.role

    if (userRole !== 'OWNER') {
      return NextResponse.json(
        { error: 'Forbidden. Only tenant owners can update theme configuration.' },
        { status: 403 },
      )
    }

    // Step 5: Build update object
    const updateData: {
      template?: string
      theme_overrides?: Json
      updated_at: string
    } = {
      updated_at: new Date().toISOString(),
    }

    if (template !== undefined) {
      updateData.template = template
    }

    if (overrides !== undefined) {
      // Merge with existing overrides (partial update)
      updateData.theme_overrides = {
        ...((tenant.theme_overrides as Record<string, unknown>) || {}),
        ...overrides,
      } as Json
    }

    // Step 6: Update tenant
    const { data: updated, error: updateError } = await supabase
      .from('tenants')
      .update(updateData)
      .eq('id', tenant.id)
      .select('template, theme_overrides')
      .single()

    if (updateError) {
      console.error('Error updating tenant theme:', updateError)
      // DB trigger validation errors will appear here
      return NextResponse.json(
        { error: updateError.message || 'Failed to update theme configuration' },
        { status: 400 },
      )
    }

    // Step 7: Return updated theme
    return NextResponse.json({
      template: updated.template,
      overrides: updated.theme_overrides || {},
    })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/tenants/[slug]/theme:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
