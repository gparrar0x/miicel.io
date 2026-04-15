/**
 * PATCH /api/admin/modifier-groups/[groupId] — update modifier group
 * DELETE /api/admin/modifier-groups/[groupId] — delete modifier group
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { assertTenantAccess } from '@/lib/auth/tenant-access'
import { createClientFromRequest, createServiceRoleClient } from '@/lib/supabase/server'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  min_selections: z.number().int().min(0).optional(),
  max_selections: z.number().int().min(1).optional(),
  display_order: z.number().int().optional(),
  active: z.boolean().optional(),
})

async function getGroupWithAuth(
  groupId: string,
  supabase: ReturnType<typeof createClientFromRequest>,
  user: import('@supabase/supabase-js').User,
) {
  const serviceClient = createServiceRoleClient()
  const { data: group } = await serviceClient
    .from('modifier_groups')
    .select('id, tenant_id')
    .eq('id', groupId)
    .maybeSingle()

  if (!group) return null

  const access = await assertTenantAccess(supabase, user, group.tenant_id, {
    minRole: 'tenant_admin',
  })
  if (!access.ok) return { group: null, serviceClient, accessError: access }

  return { group, serviceClient, accessError: null }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
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

    const result = await getGroupWithAuth(groupId, supabase, user)
    if (!result) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
    }
    if (result.accessError) {
      return NextResponse.json(
        { error: result.accessError.error },
        { status: result.accessError.status },
      )
    }
    if (!result.group) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { data: updated, error } = await result.serviceClient
      .from('modifier_groups')
      .update(parsed.data)
      .eq('id', groupId)
      .select()
      .single()

    if (error) {
      console.error('Update modifier group error:', error)
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    return NextResponse.json({ group: updated })
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('PATCH modifier-groups error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
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

    const result = await getGroupWithAuth(groupId, supabase, user)
    if (!result) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
    }
    if (result.accessError) {
      return NextResponse.json(
        { error: result.accessError.error },
        { status: result.accessError.status },
      )
    }
    if (!result.group) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
    }

    const { error } = await result.serviceClient.from('modifier_groups').delete().eq('id', groupId)

    if (error) {
      console.error('Delete modifier group error:', error)
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('DELETE modifier-groups error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
