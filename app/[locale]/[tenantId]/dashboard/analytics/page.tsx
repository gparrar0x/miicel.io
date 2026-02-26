import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ tenantId: string; locale: string }>
}

export const metadata: Metadata = {
  title: 'Analytics Dashboard',
  description: 'Sales metrics and business analytics',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AnalyticsPage({ params }: PageProps) {
  const { tenantId, locale } = await params
  const supabase = await createClient()

  // Get Tenant - try by ID first, then by slug
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

  return <AnalyticsDashboard tenantId={tenant.id.toString()} locale={locale} />
}
