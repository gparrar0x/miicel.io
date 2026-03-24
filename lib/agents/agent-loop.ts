import Anthropic from '@anthropic-ai/sdk'
import type { AgentMessage, AgentResponse, ToolDefinition } from './types'

interface RunOptions {
  model: string
  maxTokens: number
  maxTurns: number
  /** Per-API-call timeout in ms. Defaults to 25 000. */
  callTimeoutMs?: number
}

/** Anthropic API error codes we want to surface as user-friendly messages. */
function classifyAnthropicError(err: unknown): string | null {
  if (!(err instanceof Error)) return null

  const msg = err.message.toLowerCase()
  const status = (err as { status?: number }).status

  if (status === 401 || msg.includes('authentication')) {
    return 'Agent service authentication error. Please contact support.'
  }
  if (status === 429 || msg.includes('rate limit') || msg.includes('too many')) {
    return 'The AI service is rate-limited right now. Please wait a moment and try again.'
  }
  if (status === 529 || msg.includes('overloaded') || msg.includes('overload')) {
    return 'The AI service is temporarily overloaded. Please try again in a few seconds.'
  }
  if (status && status >= 500) {
    return 'The AI service is experiencing issues. Please try again shortly.'
  }
  return null
}

/**
 * Wraps a promise with a timeout. Rejects with the provided message if exceeded.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMsg: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(timeoutMsg)), ms)
    promise.then(
      (v) => {
        clearTimeout(timer)
        resolve(v)
      },
      (e) => {
        clearTimeout(timer)
        reject(e)
      },
    )
  })
}

export async function runAgentLoop(
  client: Anthropic,
  systemPrompt: string,
  initialMessages: AgentMessage[],
  tools: ToolDefinition[],
  options: RunOptions,
): Promise<AgentResponse> {
  const { model, maxTokens, maxTurns, callTimeoutMs = 45_000 } = options

  const messages: Anthropic.MessageParam[] = initialMessages.map((m) => ({
    role: m.role,
    content:
      typeof m.content === 'string' ? m.content : (m.content as Anthropic.MessageParam['content']),
  }))

  const anthropicTools: Anthropic.Tool[] = tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.input_schema as Anthropic.Tool.InputSchema,
  }))

  let totalInputTokens = 0
  let totalOutputTokens = 0
  let turns = 0
  let finalText = ''

  while (turns < maxTurns) {
    turns++

    let response: Anthropic.Message
    try {
      response = await withTimeout(
        client.messages.create({
          model,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages,
          tools: anthropicTools.length > 0 ? anthropicTools : undefined,
        }),
        callTimeoutMs,
        `API call timed out after ${callTimeoutMs / 1000}s`,
      )
    } catch (err: unknown) {
      const friendly = classifyAnthropicError(err)
      if (friendly) {
        // Return partial result with friendly message
        return {
          content: finalText || friendly,
          agent: 'unknown',
          tokensUsed: { input: totalInputTokens, output: totalOutputTokens },
        }
      }
      // Re-throw unexpected errors — caller handles them
      throw err
    }

    totalInputTokens += response.usage.input_tokens
    totalOutputTokens += response.usage.output_tokens

    if (response.stop_reason === 'end_turn') {
      const textBlock = response.content.find((b) => b.type === 'text')
      finalText = textBlock?.type === 'text' ? textBlock.text : ''
      break
    }

    if (response.stop_reason === 'tool_use') {
      const assistantContent: Anthropic.MessageParam['content'] = response.content
      messages.push({ role: 'assistant', content: assistantContent })

      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const block of response.content) {
        if (block.type !== 'tool_use') continue

        const tool = tools.find((t) => t.name === block.name)
        let result: string

        if (!tool) {
          result = `Tool "${block.name}" not found.`
        } else {
          try {
            result = await tool.execute(block.input as Record<string, unknown>)
          } catch (err) {
            // Tool errors are non-fatal — pass error back as tool result and continue
            result = `Tool error: ${err instanceof Error ? err.message : String(err)}`
            console.error(`agent-loop: tool "${block.name}" failed:`, err)
          }
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
        })
      }

      messages.push({ role: 'user', content: toolResults })
      continue
    }

    // Unexpected stop reason — extract any text and break
    const textBlock = response.content.find((b) => b.type === 'text')
    finalText = textBlock?.type === 'text' ? textBlock.text : ''
    break
  }

  if (turns >= maxTurns && !finalText) {
    finalText = `[Warning: max turns (${maxTurns}) reached without completion]`
  }

  return {
    content: finalText,
    agent: 'unknown',
    tokensUsed: { input: totalInputTokens, output: totalOutputTokens },
  }
}
