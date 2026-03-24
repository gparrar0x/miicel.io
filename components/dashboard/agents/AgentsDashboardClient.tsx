'use client'

import { ChartCard } from '@/components/dashboard/chart-card'
import { AgentStatsCards } from '@/components/dashboard/agents/AgentStatsCards'
import { ConversationsTable } from '@/components/dashboard/agents/ConversationsTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AgentStats, ConversationRow, DailyUsageRow } from '@/services/agents/dashboard'

interface AgentsDashboardClientProps {
  stats: AgentStats
  conversations: ConversationRow[]
  dailyUsage: DailyUsageRow[]
}

export function AgentsDashboardClient({
  stats,
  conversations,
  dailyUsage,
}: AgentsDashboardClientProps) {
  const chartData = dailyUsage.map((row) => ({
    name: row.date.slice(5), // MM-DD
    value: row.tokens_in + row.tokens_out,
  }))

  return (
    <div data-testid="agents-dashboard" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Agents</h1>
        <p className="text-sm text-muted-foreground">
          AI agent activity and usage for this tenant.
        </p>
      </div>

      {/* Stats */}
      <AgentStatsCards stats={stats} />

      {/* Recent conversations */}
      <Card className="border-border" data-testid="agents-conversations-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Conversations</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <ConversationsTable conversations={conversations} />
        </CardContent>
      </Card>

      {/* Usage chart */}
      <ChartCard title="Token Usage — Last 7 Days" data={chartData} />
    </div>
  )
}
