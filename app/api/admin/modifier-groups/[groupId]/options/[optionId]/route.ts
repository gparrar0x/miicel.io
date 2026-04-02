/**
 * PATCH /api/admin/modifier-groups/[groupId]/options/[optionId] — update option
 * DELETE /api/admin/modifier-groups/[groupId]/options/[optionId] — delete option
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isSuperadmin } from '@/lib/auth/constants'
import { createClientFromRequest, createServiceRoleClient } from '@/lib/supabase/server'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  price_delta: z.number().optional(),
  display_order: z.number().int().optional(),
  active: z.boolean().optional(),
})

type RouteParams = { params: Promise<{ groupId: string; optionId: string }> }

async function getOptionWithAuth(
  groupId: string,
  optionId: string,
  userId: string,
  userEmail?: string,
) {
  const serviceClient = createServiceRoleClient()
  const { data: option } = await serviceClient
    .from('modifier_options')
    .select('id, tenant_id, modifier_group_id, modifier_groups!inner(tenants!inner(owner_id))')
    .eq('id', optionId)
    .eq('modifier_group_id', groupId)
    .maybeSingle()

  if (!option) return null

  const tenant = (option as any).modifier_groups.tenants
  if (!isSuperadmin(userEmail) && tenant.owner_id !== userId) return null

  return { option, serviceClient }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { groupId, optionId } = await params
    const supabase = createClientFromRequest(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await getOptionWithAuth(groupId, optionId, user.id, user.email ?? undefined)
    if (!result) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { data: updated, error } = await result.serviceClient
      .from('modifier_options')
      .update(parsed.data)
      .eq('id', optionId)
      .select()
      .single()

    if (error) {
      console.error('Update modifier option error:', error)
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    return NextResponse.json({ option: updated })
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('PATCH modifier option error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { groupId, optionId } = await params
    const supabase = createClientFromRequest(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await getOptionWithAuth(groupId, optionId, user.id, user.email ?? undefined)
    if (!result) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
    }

    const { error } = await result.serviceClient
      .from('modifier_options')
      .delete()
      .eq('id', optionId)

    if (error) {
      console.error('Delete modifier option error:', error)
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('DELETE modifier option error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
