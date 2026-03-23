/**
 * PATCH /api/admin/discounts/[id] — update discount
 * DELETE /api/admin/discounts/[id] — delete discount
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isSuperadmin } from '@/lib/auth/constants'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['fixed', 'percentage']).optional(),
  scope: z.enum(['order', 'item']).optional(),
  value: z.number().positive().optional(),
  valid_from: z.string().nullable().optional(),
  valid_to: z.string().nullable().optional(),
  active: z.boolean().optional(),
})

async function getDiscountWithAuth(discountId: string, userId: string, userEmail?: string) {
  const serviceClient = createServiceRoleClient()
  const { data: discount } = await serviceClient
    .from('discounts')
    .select('id, tenant_id, tenants!inner(owner_id)')
    .eq('id', discountId)
    .maybeSingle()

  if (!discount) return null

  const tenant = (discount as any).tenants
  if (!isSuperadmin(userEmail) && tenant.owner_id !== userId) return null

  return { discount, serviceClient }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await getDiscountWithAuth(id, user.id, user.email ?? undefined)
    if (!result) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    if (parsed.data.type === 'percentage' && parsed.data.value && parsed.data.value > 100) {
      return NextResponse.json({ error: 'Percentage cannot exceed 100%' }, { status: 400 })
    }

    const { data: updated, error } = await result.serviceClient
      .from('discounts')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update discount error:', error)
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    return NextResponse.json({ discount: updated })
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('PATCH discount error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await getDiscountWithAuth(id, user.id, user.email ?? undefined)
    if (!result) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
    }

    const { error } = await result.serviceClient.from('discounts').delete().eq('id', id)

    if (error) {
      console.error('Delete discount error:', error)
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('DELETE discount error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
