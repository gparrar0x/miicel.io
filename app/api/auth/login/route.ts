import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const cookieStore = await cookies()

    // Detect locale from cookie or referer
    const locale =
      cookieStore.get('NEXT_LOCALE')?.value ||
      request.headers.get('referer')?.match(/\/(en|es)\//)?.[1] ||
      'es'

    // Collect cookies to set in response
    const cookiesToSet: Array<{ name: string; value: string; options: any }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookiesToSet.push({ name, value, options })
          },
          remove(name: string, options: any) {
            cookiesToSet.push({ name, value: '', options })
          },
        },
      },
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
    // Use service role to bypass RLS during login flow
    const supabaseAdmin = createServiceRoleClient()
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('role, tenant_id')
      .eq('auth_user_id', data.user.id)
      .single()

    if (userRecord && ['tenant_admin', 'owner'].includes(userRecord.role) && userRecord.tenant_id) {
      // Tenant admin: redirect to their tenant dashboard
      redirectTo = `/${locale}/${userRecord.tenant_id}/dashboard`
    } else if (userRecord && userRecord.role === 'platform_admin') {
      // Platform admin: redirect to root (tenant list)
      redirectTo = `/${locale}`
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
          redirectTo = `/${locale}/${tenant.slug}/dashboard`
        }
      }
    }

    // Return response with cookies
    const res = NextResponse.json({
      user: data.user,
      session: data.session,
      redirectTo,
    })

    // Set all collected cookies
    cookiesToSet.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options)
    })

    return res
  } catch (err: any) {
    console.error('Login error:', err)
    return NextResponse.json({ error: err.message || 'Login failed' }, { status: 500 })
  }
}
