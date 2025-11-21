/**
 * Settings API - Get and Update Tenant Configuration
 *
 * GET: Fetch full tenant settings (public + private)
 * PATCH: Update tenant settings (config, secure_config, mp_access_token)
 *
 * Security:
 * - Requires authentication
 * - Verifies tenant ownership
 * - Encrypts mp_access_token on save
 * - RLS policies enforce tenant isolation
 */

import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { encryptToken, decryptToken } from '@/lib/encryption'
import { z } from 'zod'

/**
 * GET /api/settings?tenant_id=123
 *
 * Returns complete tenant settings including:
 * - Public config (colors, business info, template)
 * - Private secure_config
 * - Decrypted MP access token (if exists)
 *
 * Response:
 * {
 *   id: number,
 *   slug: string,
 *   name: string,
 *   config: {...},
 *   secure_config: {...},
 *   mp_access_token: string | null,
 *   template: string,
 *   theme_overrides: {...}
 * }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenant_id')

    if (!tenantId || isNaN(parseInt(tenantId))) {
      return NextResponse.json(
        { error: 'Valid tenant_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Fetch tenant with ownership check
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', parseInt(tenantId))
      .maybeSingle()

    if (tenantError) {
      console.error('Error fetching tenant:', tenantError)
      return NextResponse.json(
        { error: 'Failed to fetch tenant settings.' },
        { status: 500 }
      )
    }

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found.' },
        { status: 404 }
      )
    }

    // Verify ownership (allow superadmin)
    const isSuperAdmin = user.email === 'gparrar@skywalking.dev'
    if (!isSuperAdmin && tenant.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden. You do not own this tenant.' },
        { status: 403 }
      )
    }

    // Decrypt MP token if exists
    let mpAccessToken = null
    if (tenant.mp_access_token) {
      try {
        mpAccessToken = decryptToken(tenant.mp_access_token)
      } catch (error) {
        console.error('Failed to decrypt MP token:', error)
        // Continue without token rather than failing
      }
    }

    // Return settings
    return NextResponse.json({
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      owner_email: tenant.owner_email,
      config: tenant.config || {},
      secure_config: tenant.secure_config || {},
      mp_access_token: mpAccessToken,
      template: tenant.template,
      theme_overrides: tenant.theme_overrides || {},
      plan: tenant.plan,
      active: tenant.active
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/settings?tenant_id=123
 *
 * Updates tenant settings. All fields optional.
 *
 * Request body:
 * {
 *   name?: string,
 *   config?: object,           // Public config (colors, business, etc.)
 *   secure_config?: object,    // Private config
 *   mp_access_token?: string,  // Will be encrypted
 *   template?: string,
 *   theme_overrides?: object
 * }
 *
 * Response:
 * {
 *   success: true,
 *   tenant: {...}
 * }
 */
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenant_id')

    if (!tenantId || isNaN(parseInt(tenantId))) {
      return NextResponse.json(
        { error: 'Valid tenant_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Fetch tenant for ownership check
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, owner_id')
      .eq('id', parseInt(tenantId))
      .maybeSingle()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found.' },
        { status: 404 }
      )
    }

    // Verify ownership (allow superadmin)
    const isSuperAdmin = user.email === 'gparrar@skywalking.dev'
    if (!isSuperAdmin && tenant.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden. You do not own this tenant.' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Build update object (only include provided fields)
    const updates: any = {
      updated_at: new Date().toISOString()
    }

    if (body.name !== undefined) updates.name = body.name
    if (body.config !== undefined) updates.config = body.config
    if (body.secure_config !== undefined) updates.secure_config = body.secure_config
    if (body.template !== undefined) updates.template = body.template
    if (body.theme_overrides !== undefined) updates.theme_overrides = body.theme_overrides

    // Encrypt MP access token if provided
    if (body.mp_access_token !== undefined) {
      if (body.mp_access_token === null || body.mp_access_token === '') {
        updates.mp_access_token = null
      } else {
        try {
          updates.mp_access_token = encryptToken(body.mp_access_token)
        } catch (error) {
          console.error('Failed to encrypt MP token:', error)
          return NextResponse.json(
            { error: 'Failed to encrypt payment token. Check ENCRYPTION_KEY env var.' },
            { status: 500 }
          )
        }
      }
    }

    // Update tenant (use service role for superadmin to bypass RLS)
    const updateClient = isSuperAdmin ? createServiceRoleClient() : supabase
    const { data: updated, error: updateError } = await updateClient
      .from('tenants')
      .update(updates)
      .eq('id', parseInt(tenantId))
      .select()
      .single()

    if (updateError) {
      console.error('Error updating tenant:', updateError)
      return NextResponse.json(
        { error: 'Failed to update tenant settings.' },
        { status: 500 }
      )
    }

    // Return success (without decrypted token)
    return NextResponse.json({
      success: true,
      tenant: {
        id: updated.id,
        slug: updated.slug,
        name: updated.name,
        config: updated.config,
        template: updated.template,
        theme_overrides: updated.theme_overrides
      }
    })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
