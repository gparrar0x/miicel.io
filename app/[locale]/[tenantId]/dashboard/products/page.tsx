import { notFound } from 'next/navigation'
import type { AuthorOption, Product } from '@/lib/schemas/product'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { AdminProductsClient } from './AdminProductsClient'

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function AdminProductsPage({ params }: PageProps) {
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

  // 2. Get Products + Authors in parallel
  // Authors use service role to bypass RLS (same pattern as /api/authors)
  const adminClient = createServiceRoleClient()
  const [productsResult, authorsResult] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false }),
    adminClient.from('authors').select('id, name').eq('tenant_id', tenant.id).order('name'),
  ])

  if (productsResult.error) {
    console.error('Error fetching products:', productsResult.error)
  }

  // Cast to Product type (ensure schema matches)
  const formattedProducts: Product[] = (productsResult.data || []).map((p) => ({
    ...p,
  })) as unknown as Product[]

  const authors: AuthorOption[] = (authorsResult.data || []) as AuthorOption[]

  return (
    <AdminProductsClient
      initialProducts={formattedProducts}
      tenantId={tenant.id}
      tenantSlug={tenantId}
      template={tenant.template}
      authors={authors}
    />
  )
}
