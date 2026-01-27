import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EditLocationClient } from './EditLocationClient'
import { ConsignmentLocation } from '@/lib/types/consignment'

interface PageProps {
  params: Promise<{ locale: string; tenantId: string; id: string }>
}

/**
 * Edit Location Page
 *
 * Edit form for existing consignment location
 */
export default async function EditLocationPage({ params }: PageProps) {
  const { locale, tenantId, id } = await params
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Get tenant
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

  // Use service role client for superadmin to bypass RLS
  const isSuperAdmin = user.email === 'gparrar@skywalking.dev'
  const dbClient = isSuperAdmin ? createServiceRoleClient() : supabase

  // Get location
  const { data: location, error } = await dbClient.from('consignment_locations').select('*').eq('id', parseInt(id)).eq('tenant_id', tenant.id).single()

  if (error || !location) {
    notFound()
  }

  return (
    <EditLocationClient
      tenantId={tenant.id}
      tenantSlug={tenantId}
      locale={locale}
      location={location as unknown as ConsignmentLocation}
      locationId={id}
    />
  )
}
