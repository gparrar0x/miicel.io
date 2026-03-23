/**
 * POST /api/admin/orders/[orderId]/apply-discount — apply discount to order
 * Admin auth required. Max 1 discount per order.
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isSuperadmin } from '@/lib/auth/constants'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

const applySchema = z.object({
  discount_id: z.string().uuid(),
})

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params
    const orderIdNum = parseInt(orderId, 10)
    if (isNaN(orderIdNum)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = applySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const serviceClient = createServiceRoleClient()

    // Fetch order with tenant
    const { data: order } = await serviceClient
      .from('orders')
      .select('id, tenant_id, total, total_before_discount, discount_id, tenants!inner(owner_id)')
      .eq('id', orderIdNum)
      .maybeSingle()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const tenant = (order as any).tenants
    if (!isSuperadmin(user.email) && tenant.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch discount
    const { data: discount } = await serviceClient
      .from('discounts')
      .select('*')
      .eq('id', parsed.data.discount_id)
      .eq('tenant_id', order.tenant_id)
      .eq('active', true)
      .maybeSingle()

    if (!discount) {
      return NextResponse.json({ error: 'Discount not found or inactive' }, { status: 404 })
    }

    // Validate validity window
    const now = new Date()
    if (discount.valid_from && new Date(discount.valid_from) > now) {
      return NextResponse.json({ error: 'Discount not yet valid' }, { status: 400 })
    }
    if (discount.valid_to && new Date(discount.valid_to) < now) {
      return NextResponse.json({ error: 'Discount expired' }, { status: 400 })
    }

    // Compute discount amount
    const baseTotal = order.total_before_discount ?? order.total
    let discountAmount: number

    if (discount.type === 'percentage') {
      discountAmount = Math.round(((baseTotal * discount.value) / 100) * 100) / 100
    } else {
      discountAmount = Math.min(discount.value, baseTotal)
    }

    const newTotal = Math.round((baseTotal - discountAmount) * 100) / 100

    const snapshot = {
      name: discount.name,
      type: discount.type,
      scope: discount.scope,
      value: discount.value,
    }

    // Update order
    const { error: updateError } = await serviceClient
      .from('orders')
      .update({
        discount_id: discount.id,
        discount_snapshot: snapshot,
        discount_amount: discountAmount,
        total_before_discount: baseTotal,
        total: newTotal,
      })
      .eq('id', orderIdNum)

    if (updateError) {
      console.error('Apply discount error:', updateError)
      return NextResponse.json({ error: 'Failed to apply discount' }, { status: 500 })
    }

    return NextResponse.json({
      order_id: orderIdNum,
      discount_amount: discountAmount,
      new_total: newTotal,
      discount_snapshot: snapshot,
    })
  } catch (err: any) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    console.error('POST apply-discount error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
