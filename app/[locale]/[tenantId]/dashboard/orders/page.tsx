import { notFound } from 'next/navigation'
import { Flags, isEnabled } from '@/lib/flags'
import type { OrderItem, OrderResponse } from '@/lib/schemas/order'
import { createClient } from '@/lib/supabase/server'
import { AdminOrdersClient } from './AdminOrdersClient'

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function AdminOrdersPage({ params }: PageProps) {
  const { tenantId } = await params
  const supabase = await createClient()

  // 1. Get Tenant - try by ID first, then by slug
  const numericId = parseInt(tenantId, 10)
  const isNumeric = !Number.isNaN(numericId)

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, slug, name, template')
    .eq(isNumeric ? 'id' : 'slug', isNumeric ? numericId : tenantId)
    .single()

  if (!tenant) {
    notFound()
  }

  // Check if kitchen view is enabled for this tenant
  const showKitchenView = await isEnabled(Flags.KITCHEN_VIEW, {
    tenantId: tenant.id,
    tenantTemplate: tenant.template,
  })

  // 2. Get Orders with customer details
  const { data: rawOrders, error } = await supabase
    .from('orders')
    .select(`
            *,
            customers (
                id,
                name,
                email,
                phone
            )
        `)
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching orders:', error)
  }

  // Format orders with proper typing
  const orders: OrderResponse[] = (rawOrders || []).map((order) => ({
    id: order.id as number,
    tenant_id: order.tenant_id as number,
    customer: order.customers || null,
    items: (order.items as unknown as OrderItem[]) || [],
    total: order.total as number,
    status: order.status as string,
    payment_method: order.payment_method,
    payment_id: order.payment_id,
    notes: order.notes,
    created_at: order.created_at || new Date().toISOString(),
    updated_at: order.updated_at || new Date().toISOString(),
  }))

  return (
    <AdminOrdersClient
      initialOrders={orders}
      tenantId={tenant.id}
      tenantSlug={tenantId}
      showKitchenView={showKitchenView}
    />
  )
}
