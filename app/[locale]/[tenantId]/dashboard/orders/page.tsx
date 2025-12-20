import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { AdminOrdersClient } from "./AdminOrdersClient"
import { OrderResponse, OrderItem } from "@/lib/schemas/order"

interface PageProps {
    params: Promise<{ tenantId: string }>
}

export default async function AdminOrdersPage({ params }: PageProps) {
    const { tenantId } = await params
    const supabase = await createClient()

    // 1. Get Tenant - try by ID first, then by slug
    const numericId = parseInt(tenantId)
    const isNumeric = !isNaN(numericId)

    const { data: tenant } = await supabase
        .from("tenants")
        .select("id, slug, name")
        .eq(isNumeric ? "id" : "slug", isNumeric ? numericId : tenantId)
        .single()

    if (!tenant) {
        notFound()
    }

    // 2. Get Orders with customer details
    const { data: rawOrders, error } = await supabase
        .from("orders")
        .select(`
            *,
            customers (
                id,
                name,
                email,
                phone
            )
        `)
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false })
        .limit(100)

    if (error) {
        console.error("Error fetching orders:", error)
    }

    // Format orders with proper typing
    const orders: OrderResponse[] = (rawOrders || []).map(order => ({
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
        updated_at: order.updated_at || new Date().toISOString()
    }))

    return (
        <AdminOrdersClient
            initialOrders={orders}
            tenantId={tenant.id}
            tenantSlug={tenantId}
        />
    )
}
