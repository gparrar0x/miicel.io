/**
 * DELETE /api/admin/orders/[orderId]/discount — remove applied discount
 * Admin auth required.
 */

import { AppError } from '@skywalking/core/errors'
import { NextResponse } from 'next/server'
import { isSuperadmin } from '@/lib/auth/constants'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
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

    const serviceClient = createServiceRoleClient()

    // Fetch order
    const { data: order } = await serviceClient
      .from('orders')
      .select('id, tenant_id, total_before_discount, discount_id, tenants!inner(owner_id)')
      .eq('id', orderIdNum)
      .maybeSingle()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const tenant = (order as any).tenants
    if (!isSuperadmin(user.email) && tenant.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!order.discount_id) {
      return NextResponse.json({ error: 'No discount applied to this order' }, { status: 400 })
    }

    // Restore original total
    const { error: updateError } = await serviceClient
      .from('orders')
      .update({
        discount_id: null,
        discount_snapshot: null,
        discount_amount: 0,
        total: order.total_before_discount,
      })
      .eq('id', orderIdNum)

    if (updateError) {
      console.error('Remove discount error:', updateError)
      return NextResponse.json({ error: 'Failed to remove discount' }, { status: 500 })
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
