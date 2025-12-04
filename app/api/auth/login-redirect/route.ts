import { createServiceRoleClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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

    // Detect locale from cookie or referer
    const locale = cookieStore.get('NEXT_LOCALE')?.value ||
                   request.headers.get('referer')?.match(/\/(en|es)\//)?.[1] ||
                   'es'

    // Determine redirect URL
    let redirectTo = '/' // Default to root (tenant list) for platform_admin

    // Check user role in users table
    const supabaseAdmin = createServiceRoleClient()
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('role, tenant_id')
      .eq('auth_user_id', userId)
      .single()

    if (userRecord && userRecord.role === 'tenant_admin' && userRecord.tenant_id) {
      // Tenant admin: redirect to their tenant dashboard
      redirectTo = `/${locale}/${userRecord.tenant_id}/dashboard`
    } else if (userRecord && userRecord.role === 'platform_admin') {
      // Platform admin: redirect to root (tenant list)
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
