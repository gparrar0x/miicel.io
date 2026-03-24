import { Bot, DollarSign, MessageSquare } from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import type { AgentStats } from '@/services/agents/dashboard'

interface AgentStatsCardsProps {
  stats: AgentStats
}

export function AgentStatsCards({ stats }: AgentStatsCardsProps) {
  return (
    <div
      data-testid="agents-stats-grid"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <StatCard
        title="Total Conversations"
        value={stats.totalConversations.toLocaleString()}
        icon={MessageSquare}
      />
      <StatCard
        title="Cost This Month"
        value={`$${stats.monthlyCost.toFixed(4)}`}
        icon={DollarSign}
      />
      <StatCard title="Active Agents" value={stats.activeAgents.toLocaleString()} icon={Bot} />
    </div>
  )
}
