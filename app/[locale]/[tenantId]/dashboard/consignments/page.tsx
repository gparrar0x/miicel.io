import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ConsignmentsClient } from './ConsignmentsClient'
import { isEnabled, Flags } from '@/lib/flags'

interface PageProps {
  params: Promise<{ locale: string; tenantId: string }>
}

/**
 * Consignments Overview Page
 *
 * Server component that fetches initial data
 * Delegates interactivity to ConsignmentsClient
 * Feature flag: only available for gallery template tenants
 */
export default async function ConsignmentsPage({ params }: PageProps) {
  const { locale, tenantId } = await params
  const supabase = await createClient()

  // Get tenant - try by ID first, then by slug
  const numericId = parseInt(tenantId)
  const isNumeric = !isNaN(numericId)

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, slug, name, template')
    .eq(isNumeric ? 'id' : 'slug', isNumeric ? numericId : tenantId)
    .single()

  if (!tenant) {
    notFound()
  }

  // Check feature flag - redirect if not enabled for this tenant
  const canAccessConsignments = await isEnabled(Flags.CONSIGNMENTS, {
    tenantId: tenant.id,
    tenantTemplate: tenant.template
  })

  if (!canAccessConsignments) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ConsignmentsClient tenantId={tenant.id} tenantSlug={tenantId} locale={locale} />
    </div>
  )
}
