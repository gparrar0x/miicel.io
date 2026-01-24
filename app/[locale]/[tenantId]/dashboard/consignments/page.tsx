import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ConsignmentsClient } from './ConsignmentsClient'

interface PageProps {
  params: Promise<{ locale: string; tenantId: string }>
}

/**
 * Consignments Overview Page
 *
 * Server component that fetches initial data
 * Delegates interactivity to ConsignmentsClient
 */
export default async function ConsignmentsPage({ params }: PageProps) {
  const { locale, tenantId } = await params
  const supabase = await createClient()

  // Get tenant - try by ID first, then by slug
  const numericId = parseInt(tenantId)
  const isNumeric = !isNaN(numericId)

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, slug, name')
    .eq(isNumeric ? 'id' : 'slug', isNumeric ? numericId : tenantId)
    .single()

  if (!tenant) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ConsignmentsClient tenantId={tenant.id} tenantSlug={tenantId} locale={locale} />
    </div>
  )
}
