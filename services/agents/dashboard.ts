import { createServiceRoleClient } from '@/lib/supabase/server'

export interface AgentStats {
  totalConversations: number
  monthlyCost: number
  activeAgents: number
}

export interface ConversationRow {
  id: string
  thread_id: string
  last_message: string
  agent_name: string
  status: string
  updated_at: string
}

export interface DailyUsageRow {
  date: string
  tokens_in: number
  tokens_out: number
  cost: number
}

export interface ConversationMessage {
  role: string
  content: string
  agent?: string
  timestamp: string
}

export interface ConversationDetail {
  id: string
  thread_id: string
  messages: ConversationMessage[]
  status: string
}

export async function getAgentStats(tenantId: number): Promise<AgentStats> {
  const db = createServiceRoleClient()

  const [{ count: totalConversations }, usageResult, agentsResult] = await Promise.all([
    db
      .from('agent_conversations')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId),

    db
      .from('agent_usage_logs')
      .select('cost_usd')
      .eq('tenant_id', tenantId)
      .gte(
        'created_at',
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      ),

    db.from('agent_conversations').select('agent_name').eq('tenant_id', tenantId),
  ])

  const monthlyCost = (usageResult.data ?? []).reduce(
    (sum: number, row: { cost_usd: string | number }) => sum + Number(row.cost_usd),
    0,
  )

  const activeAgents = new Set(
    (agentsResult.data ?? []).map((r: { agent_name: string }) => r.agent_name),
  ).size

  return {
    totalConversations: totalConversations ?? 0,
    monthlyCost,
    activeAgents,
  }
}

export async function getRecentConversations(
  tenantId: number,
  limit = 20,
): Promise<ConversationRow[]> {
  const db = createServiceRoleClient()

  const { data, error } = await db
    .from('agent_conversations')
    .select('id, thread_id, messages, agent_name, status, updated_at')
    .eq('tenant_id', tenantId)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getRecentConversations error:', error.message)
    return []
  }

  return (data ?? []).map((row: any) => {
    const msgs = (row.messages ?? []) as Array<{ role: string; content: string }>
    const lastMsg = msgs.filter((m) => m.role === 'assistant').pop()
    return {
      id: row.id,
      thread_id: row.thread_id,
      last_message: lastMsg?.content?.slice(0, 100) ?? '',
      agent_name: row.agent_name ?? '',
      status: row.status,
      updated_at: row.updated_at,
    }
  }) as ConversationRow[]
}

export async function getDailyUsage(tenantId: number, days = 7): Promise<DailyUsageRow[]> {
  const db = createServiceRoleClient()
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await db
    .from('agent_usage_logs')
    .select('tokens_in, tokens_out, cost_usd, created_at')
    .eq('tenant_id', tenantId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getDailyUsage error:', error.message)
    return []
  }

  // Aggregate by day
  const byDay: Record<string, { tokens_in: number; tokens_out: number; cost: number }> = {}

  for (const row of data ?? []) {
    const day = new Date(row.created_at).toISOString().slice(0, 10)
    if (!byDay[day]) byDay[day] = { tokens_in: 0, tokens_out: 0, cost: 0 }
    byDay[day].tokens_in += Number(row.tokens_in)
    byDay[day].tokens_out += Number(row.tokens_out)
    byDay[day].cost += Number(row.cost_usd)
  }

  return Object.entries(byDay).map(([date, vals]) => ({ date, ...vals }))
}

export async function getConversation(
  tenantId: number,
  threadId: string,
): Promise<ConversationDetail | null> {
  const db = createServiceRoleClient()

  const { data, error } = await db
    .from('agent_conversations')
    .select('id, thread_id, messages, status')
    .eq('tenant_id', tenantId)
    .eq('thread_id', threadId)
    .single()

  if (error) {
    console.error('getConversation error:', error.message)
    return null
  }

  return data as ConversationDetail
}
