/**
 * POST /api/admin/modifier-groups/[groupId]/options
 * Create a modifier option. Admin auth required.
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { assertTenantAccess } from '@/lib/auth/tenant-access'
import { createClientFromRequest, createServiceRoleClient } from '@/lib/supabase/server'

const createSchema = z.object({
  name: z.string().min(1),
  price_delta: z.number().default(0),
  display_order: z.number().int().default(0),
})

export async function POST(request: Request, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params
    const supabase = createClientFromRequest(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceClient = createServiceRoleClient()

    // Validate group ownership via tenant access
    const { data: group } = await serviceClient
      .from('modifier_groups')
      .select('id, tenant_id')
      .eq('id', groupId)
      .maybeSingle()

    if (!group) {
      return NextResponse.json({ error: 'Modifier group not found' }, { status: 404 })
    }

    const access = await assertTenantAccess(supabase, user, group.tenant_id, {
      minRole: 'tenant_admin',
    })
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { data: option, error } = await serviceClient
      .from('modifier_options')
      .insert({
        tenant_id: group.tenant_id,
        modifier_group_id: groupId,
        name: parsed.data.name,
        price_delta: parsed.data.price_delta,
        display_order: parsed.data.display_order,
      })
      .select()
      .single()

    if (error) {
      console.error('Create modifier option error:', error)
      return NextResponse.json({ error: 'Failed to create option' }, { status: 500 })
    }

    return NextResponse.json({ option }, { status: 201 })
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('POST modifier options error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
