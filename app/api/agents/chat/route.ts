import { NextResponse } from 'next/server'
import { z } from 'zod'
import { orchestrate } from '@/lib/agents/orchestrator'
import type { AgentMessage, OrchestratorConfig } from '@/lib/agents/types'
import { loadOraculoAgent } from '@/services/agents/oraculo'
import { loadPregonAgent } from '@/services/agents/pregon'
import { getOrCreateConversation, appendMessages } from '@/services/agents/memory'
import { trackUsage, checkBudget } from '@/services/agents/tracking'
export const runtime = 'nodejs'

const AGENT_TIMEOUT_MS = 55_000 // Vercel function hard limit is 60 s

const chatRequestSchema = z.object({
  message: z.string().min(1),
  tenant_id: z.string().min(1),
  thread_id: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = chatRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { message, tenant_id, thread_id } = parsed.data
    const tenantId = parseInt(tenant_id, 10)

    if (isNaN(tenantId)) {
      return NextResponse.json({ error: 'Invalid tenant_id' }, { status: 400 })
    }

    // --- Budget guard ---
    const budget = await checkBudget(tenantId)
    if (!budget.allowed) {
      return NextResponse.json(
        {
          error: 'Monthly agent budget exceeded',
          used_usd: budget.used,
          limit_usd: budget.limit,
        },
        { status: 402 },
      )
    }

    const threadId = thread_id ?? crypto.randomUUID()

    // Load or create conversation
    const conversation = await getOrCreateConversation(tenantId, threadId)

    // Build conversation history for orchestrator
    const history: AgentMessage[] = conversation.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    const oraculo = loadOraculoAgent()
    const pregon = loadPregonAgent()
    const agents: OrchestratorConfig['agents'] = {}
    if (oraculo) agents[oraculo.name] = oraculo
    if (pregon) agents[pregon.name] = pregon

    const config: OrchestratorConfig = {
      agents,
      defaultModel: 'claude-sonnet-4-6',
      maxTurns: 10,
    }

    // --- Timeout wrapper ---
    let response: Awaited<ReturnType<typeof orchestrate>>
    try {
      response = await Promise.race([
        orchestrate(message, tenant_id, config, history),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('__AGENT_TIMEOUT__')), AGENT_TIMEOUT_MS),
        ),
      ])
    } catch (err: unknown) {
      if (err instanceof Error && err.message === '__AGENT_TIMEOUT__') {
        return NextResponse.json(
          { error: 'Agent response timed out. Please try again.' },
          { status: 504 },
        )
      }
      throw err
    }

    // Persist new messages
    await appendMessages(
      conversation.id,
      [
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        {
          role: 'assistant',
          content: response.content,
          agent: response.agent,
          timestamp: new Date().toISOString(),
        },
      ],
      response.agent,
    )

    // Track usage (non-blocking — errors logged internally)
    await trackUsage({
      tenantId,
      conversationId: conversation.id,
      agentName: response.agent,
      model: config.defaultModel,
      tokensIn: response.tokensUsed.input,
      tokensOut: response.tokensUsed.output,
    })

    return NextResponse.json({
      content: response.content,
      agent: response.agent,
      thread_id: threadId,
      tokens_used: response.tokensUsed,
    })
  } catch (err: unknown) {
    console.error('POST /api/agents/chat error:', err)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: err instanceof Error ? err.message : String(err),
        debug: process.env.NODE_ENV === 'development' ? (err as Error)?.stack : undefined,
      },
      { status: 500 },
    )
  }
}
