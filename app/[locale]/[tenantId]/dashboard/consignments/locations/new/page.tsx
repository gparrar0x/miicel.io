import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NewLocationClient } from './NewLocationClient'

interface PageProps {
  params: Promise<{ tenantId: string }>
}

/**
 * New Location Page
 *
 * Server component for creating a new consignment location
 */
export default async function NewLocationPage({ params }: PageProps) {
  const { tenantId } = await params
  const supabase = await createClient()

  // Get tenant
  const numericId = parseInt(tenantId, 10)
  const isNumeric = !Number.isNaN(numericId)

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, slug, name')
    .eq(isNumeric ? 'id' : 'slug', isNumeric ? numericId : tenantId)
    .single()

  if (!tenant) {
    notFound()
  }

  return <NewLocationClient tenantId={tenant.id} tenantSlug={tenantId} />
}
