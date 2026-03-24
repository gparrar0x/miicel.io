import type Anthropic from '@anthropic-ai/sdk'

export interface ToolDefinition {
  name: string
  description: string
  input_schema: Record<string, unknown>
  execute: (input: Record<string, unknown>) => Promise<string>
}

export interface AgentDefinition {
  name: string
  description: string
  systemPrompt: string
  model: string
  tools: ToolDefinition[]
  maxTokens?: number
}

export type AgentMessageContent = string | Anthropic.MessageParam['content']

export interface AgentMessage {
  role: 'user' | 'assistant'
  content: AgentMessageContent
}

export interface AgentResponse {
  content: string
  agent: string
  tokensUsed: { input: number; output: number }
}

export interface OrchestratorConfig {
  agents: Record<string, AgentDefinition>
  defaultModel: string
  maxTurns: number
}
