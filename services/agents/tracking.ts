import { createServiceRoleClient } from '@/lib/supabase/server'

// USD per 1M tokens — March 2026
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-opus-4-6': { input: 15, output: 75 },
  'claude-haiku-4-5': { input: 0.8, output: 4 },
}

function calcCost(model: string, tokensIn: number, tokensOut: number): number {
  const pricing = MODEL_PRICING[model]
  if (!pricing) return 0
  return (tokensIn / 1_000_000) * pricing.input + (tokensOut / 1_000_000) * pricing.output
}

export async function trackUsage(params: {
  tenantId: number
  conversationId?: string
  agentName: string
  model: string
  tokensIn: number
  tokensOut: number
}): Promise<void> {
  const { tenantId, conversationId, agentName, model, tokensIn, tokensOut } = params
  const db = createServiceRoleClient()

  const cost_usd = calcCost(model, tokensIn, tokensOut)

  const { error } = await db.from('agent_usage_logs').insert({
    tenant_id: tenantId,
    conversation_id: conversationId ?? null,
    agent_name: agentName,
    model,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    cost_usd,
  })

  if (error) {
    // Non-fatal — log but don't crash the request
    console.error('tracking.trackUsage error:', error.message)
  }
}

const DEFAULT_MONTHLY_BUDGET_USD = 50

/**
 * Check whether a tenant is within their monthly agent budget.
 * Reads the current month's cost from agent_usage_logs.
 */
export async function checkBudget(
  tenantId: number,
  monthlyLimitUsd = DEFAULT_MONTHLY_BUDGET_USD,
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const db = createServiceRoleClient()

  const startOfMonth = new Date()
  startOfMonth.setUTCDate(1)
  startOfMonth.setUTCHours(0, 0, 0, 0)

  const { data, error } = await db
    .from('agent_usage_logs')
    .select('cost_usd')
    .eq('tenant_id', tenantId)
    .gte('created_at', startOfMonth.toISOString())

  if (error) {
    // Fail open — don't block requests if budget check fails
    console.error('tracking.checkBudget error:', error.message)
    return { allowed: true, used: 0, limit: monthlyLimitUsd }
  }

  const used = ((data ?? []) as Array<{ cost_usd: string | number }>).reduce(
    (sum, row) => sum + Number(row.cost_usd),
    0,
  )

  return { allowed: used < monthlyLimitUsd, used, limit: monthlyLimitUsd }
}

export async function getUsageSummary(
  tenantId: number,
  since?: Date,
): Promise<{
  totalCost: number
  totalTokensIn: number
  totalTokensOut: number
  byAgent: Record<string, { cost: number; requests: number }>
}> {
  const db = createServiceRoleClient()

  let query = db
    .from('agent_usage_logs')
    .select('agent_name, tokens_in, tokens_out, cost_usd')
    .eq('tenant_id', tenantId)

  if (since) {
    query = query.gte('created_at', since.toISOString())
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`tracking.getUsageSummary: ${error.message}`)
  }

  const rows = (data ?? []) as Array<{
    agent_name: string
    tokens_in: number
    tokens_out: number
    cost_usd: string | number
  }>

  let totalCost = 0
  let totalTokensIn = 0
  let totalTokensOut = 0
  const byAgent: Record<string, { cost: number; requests: number }> = {}

  for (const row of rows) {
    const cost = Number(row.cost_usd)
    totalCost += cost
    totalTokensIn += row.tokens_in
    totalTokensOut += row.tokens_out

    if (!byAgent[row.agent_name]) {
      byAgent[row.agent_name] = { cost: 0, requests: 0 }
    }
    byAgent[row.agent_name].cost += cost
    byAgent[row.agent_name].requests += 1
  }

  return { totalCost, totalTokensIn, totalTokensOut, byAgent }
}
