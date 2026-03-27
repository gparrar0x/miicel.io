import { notFound } from 'next/navigation'
import { AgentsDashboardClient } from '@/components/dashboard/agents/AgentsDashboardClient'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getAgentStats, getDailyUsage, getRecentConversations } from '@/services/agents/dashboard'

interface PageProps {
  params: Promise<{ tenantId: string; locale: string }>
}

export default async function AgentsDashboardPage({ params }: PageProps) {
  const { tenantId } = await params

  // Resolve tenant numeric ID
  const db = createServiceRoleClient()
  const numericId = Number(tenantId)
  const isNumeric = !Number.isNaN(numericId)

  const { data: tenant } = await (db as any)
    .from('tenants')
    .select('id')
    .eq(isNumeric ? 'id' : 'slug', isNumeric ? numericId : tenantId)
    .single()

  if (!tenant) notFound()

  const [stats, conversations, dailyUsage] = await Promise.all([
    getAgentStats(tenant.id),
    getRecentConversations(tenant.id, 20),
    getDailyUsage(tenant.id, 7),
  ])

  return (
    <AgentsDashboardClient stats={stats} conversations={conversations} dailyUsage={dailyUsage} />
  )
}
