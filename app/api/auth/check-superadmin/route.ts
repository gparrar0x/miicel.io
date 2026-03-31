import { NextResponse } from 'next/server'
import { createClientFromRequest } from '@/lib/supabase/server'

/**
 * API endpoint to check if current user is superadmin
 * Required because SUPER_ADMINS env var is server-side only
 */
export async function GET(request: Request) {
  try {
    const supabase = createClientFromRequest(request)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ isSuperAdmin: false })
    }

    const superAdmins = process.env.SUPER_ADMINS?.split(',').map((e) => e.trim()) || []
    const isSuperAdmin = superAdmins.includes(user.email)

    return NextResponse.json({ isSuperAdmin })
  } catch (error) {
    console.error('Error checking superadmin status:', error)
    return NextResponse.json({ isSuperAdmin: false })
  }
}
