/**
 * PATCH /api/onboarding/save - Save Onboarding Configuration
 *
 * Updates tenant configuration and optionally creates initial products.
 * Sets tenant.active = true to mark onboarding as complete.
 *
 * Flow:
 * 1. Validate authenticated user
 * 2. Get user's tenant (via owner_id)
 * 3. Update tenant.config (logo URL, colors, business_name)
 * 4. Optionally bulk insert products
 * 5. Set tenant.active = true
 *
 * Requires:
 * - User must be authenticated
 * - User must be tenant owner
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { onboardingSaveRequestSchema } from '@/lib/schemas/order'

export async function PATCH(request: Request) {
  try {
    // Step 1: Authenticate user using cookies
    const supabase = await createClient()

    // Get user from session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const user = session.user

    // Step 2: Parse and validate request body
    const body = await request.json()
    const validationResult = onboardingSaveRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { config, products } = validationResult.data

    // Step 3: Get user's tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, owner_id, slug')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found. Please complete signup first.' },
        { status: 404 }
      )
    }

    // Verify user is owner
    if (tenant.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden. Only tenant owner can update configuration.' },
        { status: 403 }
      )
    }

    // Step 4: Update tenant configuration
    // Use service role to ensure update succeeds even with RLS
    const supabaseAdmin = createServiceRoleClient()

    const { error: updateError } = await supabaseAdmin
      .from('tenants')
      .update({
        config,
        active: true, // Mark onboarding as complete
        updated_at: new Date().toISOString(),
      })
      .eq('id', tenant.id)

    if (updateError) {
      console.error('Failed to update tenant config:', updateError)
      return NextResponse.json(
        { error: 'Failed to save configuration. Please try again.' },
        { status: 500 }
      )
    }

    // Step 5: Create products if provided
    let productsCreated = 0

    if (products && products.length > 0) {
      const productsToInsert = products.map((product) => ({
        ...product,
        tenant_id: tenant.id,
      }))

      const { data: insertedProducts, error: productsError } = await supabaseAdmin
        .from('products')
        .insert(productsToInsert)
        .select()

      if (productsError) {
        console.error('Failed to create products:', productsError)
        // Don't fail the entire request, just log the error
        // Tenant config was still saved successfully
      } else {
        productsCreated = insertedProducts?.length || 0
      }
    }

    // Success!
    return NextResponse.json(
      {
        success: true,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        productsCreated,
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Onboarding save error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
