import { createServerClient } from '@supabase/ssr'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET: For authenticated users to get their redirect URL
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()

    const locale = cookieStore.get('NEXT_LOCALE')?.value ||
                   request.headers.get('referer')?.match(/\/(en|es)\//)?.[1] ||
                   'es'

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ redirectTo: '/' })
    }

    const supabaseAdmin = createServiceRoleClient()
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('role, tenant_id, tenants(slug)')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (userRecord && ['tenant_admin', 'owner'].includes(userRecord.role) && userRecord.tenant_id) {
      const tenantSlug = (userRecord as any).tenants?.slug || userRecord.tenant_id
      return NextResponse.json({ redirectTo: `/${locale}/${tenantSlug}/dashboard` })
    }

    if (userRecord && userRecord.role === 'platform_admin') {
      return NextResponse.json({ redirectTo: `/${locale}` })
    }

    // Fallback: check tenants.owner_id
    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('slug')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (tenant) {
      return NextResponse.json({ redirectTo: `/${locale}/${tenant.slug}/dashboard` })
    }

    return NextResponse.json({ redirectTo: '/' })
  } catch (err: any) {
    console.error('Login redirect error:', err)
    return NextResponse.json({ redirectTo: '/' })
  }
}

// POST: For login flow with userId
export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()

    const locale = cookieStore.get('NEXT_LOCALE')?.value ||
                   request.headers.get('referer')?.match(/\/(en|es)\//)?.[1] ||
                   'es'

    let redirectTo = '/'

    const supabaseAdmin = createServiceRoleClient()
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('role, tenant_id, tenants(slug)')
      .eq('auth_user_id', userId)
      .maybeSingle()

    if (userRecord && ['tenant_admin', 'owner'].includes(userRecord.role) && userRecord.tenant_id) {
      const tenantSlug = (userRecord as any).tenants?.slug || userRecord.tenant_id
      redirectTo = `/${locale}/${tenantSlug}/dashboard`
    } else if (userRecord && userRecord.role === 'platform_admin') {
      redirectTo = `/${locale}`
    }

    return NextResponse.json({ redirectTo })
  } catch (err: any) {
    console.error('Login redirect error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to determine redirect' },
      { status: 500 }
    )
  }
}
