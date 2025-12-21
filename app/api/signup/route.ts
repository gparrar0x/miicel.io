/**
 * POST /api/signup - Create Tenant + User Atomically
 *
 * Creates a new tenant account with owner user in one atomic operation.
 * Uses service role client to bypass RLS for tenant creation.
 *
 * Flow:
 * 1. Validate input (email, password, businessName, slug)
 * 2. Create auth user (Supabase Auth)
 * 3. Create tenant row with service role (bypasses RLS)
 * 4. Set tenant.owner_id = user.id
 * 5. Rollback if either fails
 *
 * Security:
 * - Service role only used for tenant insertion
 * - All inputs validated with Zod
 * - Slug uniqueness checked before creation
 * - Password meets minimum requirements (8 chars)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { signupRequestSchema } from '@/lib/schemas/order'
import type { Database } from '@/types/supabase'

// Service role client for bypassing RLS
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = signupRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password, businessName, slug } = validationResult.data

    // Step 1: Check if slug is already taken
    const { data: existingTenant } = await supabaseAdmin
      .from('tenants')
      .select('slug')
      .eq('slug', slug)
      .single()

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Slug already taken. Please choose a different one.' },
        { status: 409 }
      )
    }

    // Step 2: Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for now
    })

    if (authError || !authData.user) {
      console.error('Auth creation failed:', authError)
      return NextResponse.json(
        { error: authError?.message || 'Failed to create user account' },
        { status: 500 }
      )
    }

    const userId = authData.user.id

    // Step 3: Create tenant (using service role to bypass RLS)
    const { data: tenantData, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({
        slug,
        name: businessName,
        owner_email: email,
        owner_id: userId,
        plan: 'free',
        active: true,
        template: 'gallery', // Default template
        theme_overrides: {}, // Empty overrides (uses template defaults)
        config: {
          business_name: businessName,
          colors: {
            primary: '#3B82F6', // Default blue
            secondary: '#10B981', // Default green
          },
        },
      })
      .select()
      .single()

    if (tenantError) {
      console.error('Tenant creation failed:', tenantError)

      // Rollback: Delete the auth user we just created
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId)
      } catch (rollbackError) {
        console.error('Rollback failed - orphaned user created:', userId, rollbackError)
      }

      return NextResponse.json(
        { error: 'Failed to create tenant. Please try again.' },
        { status: 500 }
      )
    }

    // Step 4: Create owner record in public.users
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        tenant_id: tenantData.id,
        email,
        role: 'owner',
        name: businessName,
        auth_user_id: userId,
        is_active: true,
      })

    if (userError) {
      console.error('User record creation failed:', userError)
      // Non-fatal: tenant + auth exist, just log warning
      // Owner can still access via tenants.owner_id fallback
    }

    // Success!
    return NextResponse.json(
      {
        userId,
        tenantSlug: tenantData.slug,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
