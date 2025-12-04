import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    // Determine redirect URL
    let redirectTo = '/' // Default to root (tenant list) for superadmins

    // Check user role in users table (MII_4: tenant_admin, staff, platform_admin)
    const { data: userRecord } = await supabase
      .from('users')
      .select('role, tenant_id, tenants(slug)')
      .eq('auth_user_id', data.user.id)
      .single()

    if (userRecord && userRecord.role === 'tenant_admin' && userRecord.tenants) {
      // Tenant admin: redirect to their tenant dashboard
      const tenantSlug = (userRecord.tenants as any).slug
      redirectTo = `/es/${tenantSlug}/dashboard`
    } else if (userRecord && userRecord.role === 'platform_admin') {
      // Platform admin: redirect to root (tenant list)
      redirectTo = '/'
    } else {
      // Fallback: check old logic (tenants.owner_id)
      const { data: isSuperAdmin } = await supabase.rpc('is_superadmin')

      if (!isSuperAdmin) {
        // If not superadmin, find their tenant
        const { data: tenant } = await supabase
          .from('tenants')
          .select('slug')
          .eq('owner_id', data.user.id)
          .single()

        if (tenant) {
          redirectTo = `/es/${tenant.slug}/dashboard`
        }
      }
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
      redirectTo,
    })
  } catch (err: any) {
    console.error('Login error:', err)
    return NextResponse.json(
      { error: err.message || 'Login failed' },
      { status: 500 }
    )
  }
}
