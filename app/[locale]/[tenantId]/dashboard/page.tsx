import { use } from 'react'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'

export default function DashboardPage({ params }: { params: Promise<{ tenantId: string; locale: string }> }) {
  const { tenantId, locale } = use(params)

  return <AnalyticsDashboard tenantId={tenantId} locale={locale} />
}
