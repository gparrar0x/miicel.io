import Anthropic from '@anthropic-ai/sdk'
import { runAgentLoop } from './agent-loop'
import type { AgentMessage, AgentResponse, OrchestratorConfig, ToolDefinition } from './types'

const ORCHESTRATOR_SYSTEM_PROMPT = `You are Micelio, an AI orchestrator for the Miicel.io platform.

You coordinate a team of specialist agents. For each user message:
1. Decide if you can answer directly (simple questions, greetings, platform info).
2. If the task requires specialist knowledge, delegate to the right agent using the delegate_to_agent tool.

Available agents:
{AGENT_LIST}

Rules:
- Delegate research, fact-checking, or real-time data questions to oraculo-research-specialist.
- Delegate marketing, copywriting, social media, email campaigns, content creation to pregon-marketing-specialist.
- Answer simple questions directly without delegating.
- Never hallucinate agent names — only delegate to agents listed above.
- Respond in the same language the user uses.`

export async function orchestrate(
  message: string,
  tenantId: string,
  config: OrchestratorConfig,
  conversationHistory: AgentMessage[] = [],
): Promise<AgentResponse> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const agentList = Object.values(config.agents)
    .map((a) => `- ${a.name}: ${a.description}`)
    .join('\n')

  const systemPrompt = ORCHESTRATOR_SYSTEM_PROMPT.replace(
    '{AGENT_LIST}',
    agentList || 'No agents configured.',
  )

  const delegateTool: ToolDefinition = {
    name: 'delegate_to_agent',
    description: 'Delegate a task to a specialist agent',
    input_schema: {
      type: 'object',
      properties: {
        agent_name: {
          type: 'string',
          description: 'Name of the agent to delegate to',
        },
        task: {
          type: 'string',
          description: 'The task to delegate, with full context',
        },
      },
      required: ['agent_name', 'task'],
    },
    execute: async (input) => {
      const { agent_name, task } = input as { agent_name: string; task: string }
      const agent = config.agents[agent_name]

      if (!agent) {
        return `Agent "${agent_name}" not found. Available: ${Object.keys(config.agents).join(', ')}`
      }

      const result = await runAgentLoop(
        client,
        agent.systemPrompt,
        [{ role: 'user', content: task }],
        agent.tools,
        {
          model: agent.model,
          maxTokens: agent.maxTokens ?? 4096,
          maxTurns: Math.floor(config.maxTurns / 2),
        },
      )

      return result.content
    },
  }

  const initialMessages: AgentMessage[] = [
    ...conversationHistory,
    { role: 'user', content: `[tenant: ${tenantId}] ${message}` },
  ]

  const result = await runAgentLoop(client, systemPrompt, initialMessages, [delegateTool], {
    model: config.defaultModel,
    maxTokens: 4096,
    maxTurns: config.maxTurns,
  })

  return {
    ...result,
    agent: 'micelio',
  }
}
