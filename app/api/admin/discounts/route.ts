/**
 * GET /api/admin/discounts — list discounts for tenant
 * POST /api/admin/discounts — create discount
 * Admin auth required.
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isSuperadmin } from '@/lib/auth/constants'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

const createSchema = z.object({
  tenant_id: z.number(),
  name: z.string().min(1),
  type: z.enum(['fixed', 'percentage']),
  scope: z.enum(['order', 'item']),
  value: z.number().positive(),
  valid_from: z.string().nullable().optional(),
  valid_to: z.string().nullable().optional(),
})

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenant_id')
    const activeOnly = searchParams.get('active') !== 'false'

    if (!tenantId) {
      return NextResponse.json({ error: 'tenant_id required' }, { status: 400 })
    }

    const serviceClient = createServiceRoleClient()

    // Verify ownership
    const { data: tenant } = await serviceClient
      .from('tenants')
      .select('id, owner_id')
      .eq('id', parseInt(tenantId, 10))
      .maybeSingle()

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }
    if (!isSuperadmin(user.email) && tenant.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let query = serviceClient
      .from('discounts')
      .select('*')
      .eq('tenant_id', parseInt(tenantId, 10))
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('active', true)
    }

    const { data: discounts, error } = await query
    if (error) {
      console.error('List discounts error:', error)
      return NextResponse.json({ error: 'Failed to fetch discounts' }, { status: 500 })
    }

    return NextResponse.json({ discounts: discounts ?? [] })
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('GET /api/admin/discounts error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    // Validate percentage cap
    if (parsed.data.type === 'percentage' && parsed.data.value > 100) {
      return NextResponse.json({ error: 'Percentage discount cannot exceed 100%' }, { status: 400 })
    }

    const serviceClient = createServiceRoleClient()

    // Verify ownership
    const { data: tenant } = await serviceClient
      .from('tenants')
      .select('id, owner_id')
      .eq('id', parsed.data.tenant_id)
      .maybeSingle()

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }
    if (!isSuperadmin(user.email) && tenant.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: discount, error } = await serviceClient
      .from('discounts')
      .insert({
        tenant_id: parsed.data.tenant_id,
        name: parsed.data.name,
        type: parsed.data.type,
        scope: parsed.data.scope,
        value: parsed.data.value,
        valid_from: parsed.data.valid_from ?? null,
        valid_to: parsed.data.valid_to ?? null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Create discount error:', error)
      return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 })
    }

    return NextResponse.json({ discount }, { status: 201 })
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('POST /api/admin/discounts error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
