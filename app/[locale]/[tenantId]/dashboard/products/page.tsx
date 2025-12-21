import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { AdminProductsClient } from "./AdminProductsClient"
import { Product } from "@/lib/schemas/product"

interface PageProps {
    params: Promise<{ tenantId: string }>
}

export default async function AdminProductsPage({ params }: PageProps) {
    const { tenantId } = await params
    const supabase = await createClient()

    // 1. Get Tenant - try by ID first, then by slug
    const numericId = parseInt(tenantId)
    const isNumeric = !isNaN(numericId)

    const { data: tenant } = await supabase
        .from("tenants")
        .select("id, slug, name, template")
        .eq(isNumeric ? "id" : "slug", isNumeric ? numericId : tenantId)
        .single()

    if (!tenant) {
        notFound()
    }

    // 2. Get Products
    const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching products:", error)
        // Handle error appropriately, maybe show empty state or error message
    }

    // Cast to Product type (ensure schema matches)
    const formattedProducts: Product[] = ((products || []).map((p) => ({
        ...p,
        // Ensure types match if there are any discrepancies
    })) as unknown) as Product[]

    return (
        <AdminProductsClient
            initialProducts={formattedProducts}
            tenantId={tenant.id}
            tenantSlug={tenantId}
            template={tenant.template}
        />
    )
}
