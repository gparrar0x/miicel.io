import { notFound } from 'next/navigation'
import { NequiSettingsForm } from '@/components/dashboard/settings/NequiSettingsForm'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ tenantId: string; locale: string }>
}

export default async function NequiSettingsPage({ params }: PageProps) {
  const { tenantId } = await params
  const supabase = await createClient()

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Nequi</h1>
        <p className="text-muted-foreground">
          Configura los pagos push de Nequi para clientes en Colombia
        </p>
      </div>
      <NequiSettingsForm tenantId={tenant.id} />
    </div>
  )
}
