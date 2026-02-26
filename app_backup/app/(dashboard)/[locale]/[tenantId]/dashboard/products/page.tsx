import { notFound } from 'next/navigation'
import type { Product } from '@/lib/schemas/product'
import { createClient } from '@/lib/supabase/server'
import { AdminProductsClient } from './AdminProductsClient'

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function AdminProductsPage({ params }: PageProps) {
  const { tenantId } = await params
  const supabase = await createClient()

  // 1. Get Tenant UUID
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name')
    .eq('slug', tenantId)
    .single()

  if (!tenant) {
    notFound()
  }

  // 2. Get Products
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    // Handle error appropriately, maybe show empty state or error message
  }

  // Cast to Product type (ensure schema matches)
  const formattedProducts: Product[] = (products || []).map((p) => ({
    ...p,
    // Ensure types match if there are any discrepancies
  })) as unknown as Product[]

  return (
    <AdminProductsClient
      initialProducts={formattedProducts}
      tenantId={tenant.id}
      tenantSlug={tenantId}
      tenantName={tenant.name}
    />
  )
}
