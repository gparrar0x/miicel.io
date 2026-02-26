/**
 * GET /api/orders/[id] - Get Order Details
 *
 * Fetches a single order by ID with customer and items details
 * Used by success/failure pages to display order information
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const orderId = parseInt(id, 10)

    if (Number.isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch order with customer details and tenant config
    const { data: order, error } = await (supabase as any)
      .from('orders')
      .select(`
        id,
        tenant_id,
        items,
        total,
        status,
        payment_method,
        payment_id,
        notes,
        created_at,
        customers (
          id,
          name,
          email,
          phone
        ),
        tenants (
          id,
          config
        )
      `)
      .eq('id', orderId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching order:', error)
      return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Extract WhatsApp phone from tenant config
    const tenantConfig = (order.tenants as any)?.config || {}
    const tenantWhatsapp = tenantConfig.whatsapp || null

    // Transform response
    const response = {
      orderId: order.id.toString(),
      customer: {
        name: order.customers?.name || 'Unknown',
        email: order.customers?.email || '',
        phone: order.customers?.phone || '',
      },
      items: ((order.items as any[]) || []).map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        currency: item.currency || 'USD',
      })),
      total: order.total,
      currency: (order.items as any[])?.[0]?.currency || 'USD',
      paymentMethod: order.payment_method,
      status: order.status,
      createdAt: order.created_at,
      tenantWhatsapp,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Unexpected error in GET /api/orders/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
