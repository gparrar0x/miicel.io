/**
 * POST /api/admin/flags/toggle - Toggle feature flag for a tenant
 *
 * Superadmin only. Adds/removes tenant_id from flag's rules.tenants array.
 *
 * Body: { key: string, tenant_id: number, enabled: boolean }
 * Response: { flag: FeatureFlag }
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isSuperadmin } from '@/lib/auth/constants'
import { createClientFromRequest, createServiceRoleClient } from '@/lib/supabase/server'

const toggleSchema = z.object({
  key: z.string().min(1),
  tenant_id: z.number().int().positive(),
  enabled: z.boolean(),
})

interface FlagRules {
  tenants?: number[]
  [key: string]: unknown
}

export async function POST(request: Request) {
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

    const body = await request.json()
    const parsed = toggleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { key, tenant_id, enabled } = parsed.data
    const serviceClient = createServiceRoleClient()

    const { data: flag, error: fetchError } = await serviceClient
      .from('feature_flags')
      .select('*')
      .eq('key', key)
      .maybeSingle()

    if (fetchError) {
      console.error('POST /api/admin/flags/toggle fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch flag' }, { status: 500 })
    }

    if (!flag) {
      return NextResponse.json({ error: 'Flag not found' }, { status: 404 })
    }

    const rules: FlagRules = (flag.rules as FlagRules) || {}
    const tenants: number[] = Array.isArray(rules.tenants) ? [...rules.tenants] : []

    const updatedTenants = enabled
      ? tenants.includes(tenant_id)
        ? tenants
        : [...tenants, tenant_id]
      : tenants.filter((id) => id !== tenant_id)

    const updatedRules = { ...rules, tenants: updatedTenants }

    const { data: updatedFlag, error: updateError } = await serviceClient
      .from('feature_flags')
      .update({ rules: updatedRules as Record<string, unknown> })
      .eq('key', key)
      .select()
      .single()

    if (updateError) {
      console.error('POST /api/admin/flags/toggle update error:', updateError)
      return NextResponse.json({ error: 'Failed to update flag' }, { status: 500 })
    }

    return NextResponse.json({ flag: updatedFlag })
  } catch (err) {
    console.error('POST /api/admin/flags/toggle unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
