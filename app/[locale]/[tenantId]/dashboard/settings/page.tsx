import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsClient } from './SettingsClient'

interface PageProps {
  params: Promise<{ tenantId: string; locale: string }>
}

export default async function SettingsPage({ params }: PageProps) {
  const { tenantId } = await params
  const supabase = await createClient()

  // 1. Get Tenant - try by ID first, then by slug
  const numericId = parseInt(tenantId, 10)
  const isNumeric = !Number.isNaN(numericId)

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, slug, name, config')
    .eq(isNumeric ? 'id' : 'slug', isNumeric ? numericId : tenantId)
    .single()

  if (!tenant) {
    notFound()
  }

  // Note: Ownership verification handled by API endpoint (/api/settings)
  // which checks tenant.owner_id === user.id

  return (
    <SettingsClient
      tenantId={tenant.id}
      tenantSlug={tenantId}
      tenantName={tenant.name}
      initialConfig={(tenant.config as any) || {}}
    />
  )
}
