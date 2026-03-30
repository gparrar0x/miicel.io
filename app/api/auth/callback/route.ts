import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const cookieStore = await cookies()
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

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user?.email) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // Verify email exists in users table — OAuth is for existing users only
  const userRecord = await getUserByEmail(data.user.email)

  if (!userRecord) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=no_account`)
  }

  // Resolve destination based on role (mirrors login-redirect logic)
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'es'

  let redirectTo = `/${locale}`

  if (['tenant_admin', 'owner'].includes(userRecord.role) && userRecord.tenant_id) {
    const supabaseAdmin = createServiceRoleClient()
    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('slug')
      .eq('id', userRecord.tenant_id)
      .single()

    redirectTo = `/${locale}/${tenant?.slug ?? userRecord.tenant_id}/dashboard`
  }
  // platform_admin lands on /${locale} (default above)

  const response = NextResponse.redirect(`${origin}${redirectTo}`)

  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })

  return response
}
