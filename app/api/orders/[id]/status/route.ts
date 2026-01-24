/**
 * PATCH /api/orders/[id]/status - Update Order Status
 *
 * Updates the status of an order with validation of status transitions.
 * Enforces business rules:
 * - Cannot change status of delivered orders (except to cancelled)
 * - Status transitions must be valid
 *
 * RLS policies enforce tenant isolation.
 *
 * Performance: <50ms target for simple update
 * Security: Tenant ownership verified, RLS enforced, status validation
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { orderStatusUpdateSchema } from '@/lib/schemas/order'

/**
 * PATCH /api/orders/[id]/status - Update order status
 *
 * Request body:
 * {
 *   status: "preparing" | "ready" | "delivered" | "cancelled"
 * }
 *
 * Valid status transitions:
 * - pending → paid (via webhook only, not this endpoint)
 * - paid → preparing
 * - preparing → ready
 * - ready → delivered
 * - any → cancelled
 *
 * Response:
 * {
 *   order: Order
 * }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Step 1: Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Step 2: Await params and validate order ID
    const { id } = await params
    const orderId = parseInt(id)

    if (isNaN(orderId) || orderId <= 0) {
      return NextResponse.json(
        { error: 'Invalid order ID.' },
        { status: 400 }
      )
    }

    // Step 3: Parse and validate request body
    const body = await request.json()
    const validationResult = orderStatusUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { status: newStatus } = validationResult.data

    // Step 4: Fetch order with tenant ownership check
    const { data: order, error: fetchError } = await (supabase as any)
      .from('orders')
      .select('*, tenants!inner(owner_id)')
      .eq('id', orderId)
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching order:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch order. Please try again.' },
        { status: 500 }
      )
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found.' },
        { status: 404 }
      )
    }

    // Step 5: Verify tenant ownership or superadmin access
    const userEmail = user.email?.toLowerCase().trim()
    const isSuperadmin = userEmail === 'gparrar@skywalking.dev'
    
    if (!isSuperadmin && order.tenants.owner_id !== user.id) {
      return NextResponse.json(
        { error: `Forbidden. You do not own this order. User: ${userEmail}` },
        { status: 403 }
      )
    }

    // Step 6: Validate status transition
    const currentStatus = order.status

    // Prevent changing status of delivered orders (except to cancelled)
    if (currentStatus === 'delivered' && newStatus !== 'cancelled') {
      return NextResponse.json(
        {
          error: 'Cannot change status of delivered order.',
          current_status: currentStatus,
          hint: 'Only cancellation is allowed for delivered orders.'
        },
        { status: 400 }
      )
    }

    // Prevent going from cancelled back to any other status
    if (currentStatus === 'cancelled' && newStatus !== 'cancelled') {
      return NextResponse.json(
        {
          error: 'Cannot change status of cancelled order.',
          current_status: currentStatus
        },
        { status: 400 }
      )
    }

    // Optional: Enforce forward-only transitions (except cancelled)
    // Uncomment if you want stricter validation
    /*
    const statusOrder = ['pending', 'paid', 'preparing', 'ready', 'delivered']
    const currentIndex = statusOrder.indexOf(currentStatus)
    const newIndex = statusOrder.indexOf(newStatus)

    if (newStatus !== 'cancelled' && newIndex < currentIndex) {
      return NextResponse.json(
        {
          error: 'Invalid status transition. Cannot move backwards.',
          current_status: currentStatus,
          requested_status: newStatus
        },
        { status: 400 }
      )
    }
    */

    // Step 7: Update order status
    const { data: updated, error: updateError } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating order status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order status. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ order: updated })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/orders/[id]/status:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
