/**
 * GET /api/admin/flags - List all feature flags
 *
 * Superadmin only. Returns all feature flags ordered by key.
 *
 * Response: { flags: FeatureFlag[] }
 */

import { NextResponse } from 'next/server'
import { isSuperadmin } from '@/lib/auth/constants'
import { createClientFromRequest, createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = createClientFromRequest(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isSuperadmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const serviceClient = createServiceRoleClient()
    const { data: flags, error } = await serviceClient
      .from('feature_flags')
      .select('*')
      .order('key', { ascending: true })

    if (error) {
      console.error('GET /api/admin/flags error:', error)
      return NextResponse.json({ error: 'Failed to fetch flags' }, { status: 500 })
    }

    return NextResponse.json({ flags })
  } catch (err) {
    console.error('GET /api/admin/flags unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
