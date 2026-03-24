import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { loadOraculoAgent } from '@/services/agents/oraculo'
import { loadPregonAgent } from '@/services/agents/pregon'

export const runtime = 'nodejs'

export async function GET() {
  const checks: Record<string, string> = {}
  let healthy = true

  // 1. Anthropic API key present
  if (process.env.ANTHROPIC_API_KEY) {
    checks.anthropic_key = 'ok'
  } else {
    checks.anthropic_key = 'missing'
    healthy = false
  }

  // 2. Supabase reachable
  try {
    const db = createServiceRoleClient()
    const { error } = await (db as any).from('agent_conversations').select('id').limit(1)
    checks.supabase = error ? `error: ${error.message}` : 'ok'
    if (error) healthy = false
  } catch (err) {
    checks.supabase = `unreachable: ${err instanceof Error ? err.message : String(err)}`
    healthy = false
  }

  // 3. Agents loaded
  const agents: string[] = []
  if (loadOraculoAgent()) agents.push('oraculo-research-specialist')
  if (loadPregonAgent()) agents.push('pregon-marketing-specialist')
  checks.agents_loaded = agents.length > 0 ? 'ok' : 'none'

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      agents,
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  )
}
