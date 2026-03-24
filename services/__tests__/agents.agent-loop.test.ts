import { beforeEach, describe, expect, it, vi } from 'vitest'
import Anthropic from '@anthropic-ai/sdk'
import { runAgentLoop } from '@/lib/agents/agent-loop'
import type { AgentMessage, ToolDefinition } from '@/lib/agents/types'

// ---- Mocks ----

/**
 * Create a mock Anthropic client with controllable responses.
 */
function createMockAnthropicClient() {
  return {
    messages: {
      create: vi.fn(),
    },
  } as unknown as Anthropic
}

// ---- Fixtures ----

const systemPrompt = 'You are a helpful assistant.'

const initialMessages: AgentMessage[] = [
  {
    role: 'user',
    content: 'What is 2 + 2?',
  },
]

const tools: ToolDefinition[] = [
  {
    name: 'calculator',
    description: 'Perform arithmetic operations',
    input_schema: {
      type: 'object',
      properties: {
        operation: { type: 'string' },
        a: { type: 'number' },
        b: { type: 'number' },
      },
    },
    execute: vi.fn(),
  },
]

const baseOptions = {
  model: 'claude-sonnet-4-6',
  maxTokens: 1024,
  maxTurns: 5,
  callTimeoutMs: 5000,
}

// ---- Tests ----

describe('runAgentLoop', () => {
  let mockClient: ReturnType<typeof createMockAnthropicClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockClient = createMockAnthropicClient()
  })

  describe('happy path', () => {
    it('returns response when API returns end_turn', async () => {
      const mockResponse: Anthropic.Message = {
        id: 'msg-1',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: 'The answer is 4.',
          },
        ],
        model: 'claude-sonnet-4-6',
        stop_reason: 'end_turn',
        usage: {
          input_tokens: 50,
          output_tokens: 20,
        },
      }

      vi.mocked(mockClient.messages.create).mockResolvedValue(mockResponse)

      const result = await runAgentLoop(
        mockClient,
        systemPrompt,
        initialMessages,
        tools,
        baseOptions,
      )

      expect(result.content).toBe('The answer is 4.')
      expect(result.tokensUsed.input).toBe(50)
      expect(result.tokensUsed.output).toBe(20)
      expect(mockClient.messages.create).toHaveBeenCalledTimes(1)
    })

    it('extracts text from first text block when multiple blocks present', async () => {
      const mockResponse: Anthropic.Message = {
        id: 'msg-1',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: 'First text block',
          },
          {
            type: 'text',
            text: 'Second text block (ignored)',
          },
        ],
        model: 'claude-sonnet-4-6',
        stop_reason: 'end_turn',
        usage: { input_tokens: 10, output_tokens: 5 },
      }

      vi.mocked(mockClient.messages.create).mockResolvedValue(mockResponse)

      const result = await runAgentLoop(mockClient, systemPrompt, initialMessages, [], baseOptions)

      expect(result.content).toBe('First text block')
    })

    it('handles tool use and executes tools', async () => {
      const toolUseResponse: Anthropic.Message = {
        id: 'msg-1',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'tool_use',
            id: 'tool-call-1',
            name: 'calculator',
            input: { operation: 'add', a: 2, b: 2 },
          },
        ],
        model: 'claude-sonnet-4-6',
        stop_reason: 'tool_use',
        usage: { input_tokens: 50, output_tokens: 30 },
      }

      const finalResponse: Anthropic.Message = {
        id: 'msg-2',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: 'The calculator returned 4.',
          },
        ],
        model: 'claude-sonnet-4-6',
        stop_reason: 'end_turn',
        usage: { input_tokens: 80, output_tokens: 50 },
      }

      vi.mocked(mockClient.messages.create)
        .mockResolvedValueOnce(toolUseResponse)
        .mockResolvedValueOnce(finalResponse)

      vi.mocked(tools[0].execute).mockResolvedValue('4')

      const result = await runAgentLoop(
        mockClient,
        systemPrompt,
        initialMessages,
        tools,
        baseOptions,
      )

      expect(result.content).toBe('The calculator returned 4.')
      expect(result.tokensUsed.input).toBe(130) // 50 + 80
      expect(result.tokensUsed.output).toBe(80) // 30 + 50
      expect(tools[0].execute).toHaveBeenCalledWith({ operation: 'add', a: 2, b: 2 })
    })

    it('accumulates tokens across multiple turns', async () => {
      const response1: Anthropic.Message = {
        id: 'msg-1',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'tool_use', id: 'tool-1', name: 'calculator', input: {} }],
        model: 'claude-sonnet-4-6',
        stop_reason: 'tool_use',
        usage: { input_tokens: 50, output_tokens: 30 },
      }

      const response2: Anthropic.Message = {
        id: 'msg-2',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: 'Done.',
          },
        ],
        model: 'claude-sonnet-4-6',
        stop_reason: 'end_turn',
        usage: { input_tokens: 60, output_tokens: 20 },
      }

      vi.mocked(mockClient.messages.create)
        .mockResolvedValueOnce(response1)
        .mockResolvedValueOnce(response2)

      vi.mocked(tools[0].execute).mockResolvedValue('result')

      const result = await runAgentLoop(
        mockClient,
        systemPrompt,
        initialMessages,
        tools,
        baseOptions,
      )

      expect(result.tokensUsed.input).toBe(110) // 50 + 60
      expect(result.tokensUsed.output).toBe(50) // 30 + 20
    })
  })

  describe('error handling', () => {
    it('returns friendly message on 401 authentication error', async () => {
      const error = new Error('Unauthorized')
      ;(error as any).status = 401

      vi.mocked(mockClient.messages.create).mockRejectedValue(error)

      const result = await runAgentLoop(mockClient, systemPrompt, initialMessages, [], baseOptions)

      expect(result.content).toContain('authentication error')
      expect(result.content).toContain('contact support')
    })

    it('returns friendly message on 429 rate limit error', async () => {
      const error = new Error('Too many requests')
      ;(error as any).status = 429

      vi.mocked(mockClient.messages.create).mockRejectedValue(error)

      const result = await runAgentLoop(mockClient, systemPrompt, initialMessages, [], baseOptions)

      expect(result.content).toContain('rate-limited')
    })

    it('returns friendly message on 529 overload error', async () => {
      const error = new Error('Service Unavailable')
      ;(error as any).status = 529

      vi.mocked(mockClient.messages.create).mockRejectedValue(error)

      const result = await runAgentLoop(mockClient, systemPrompt, initialMessages, [], baseOptions)

      expect(result.content).toContain('temporarily overloaded')
    })

    it('returns friendly message on generic 5xx error', async () => {
      const error = new Error('Internal Server Error')
      ;(error as any).status = 500

      vi.mocked(mockClient.messages.create).mockRejectedValue(error)

      const result = await runAgentLoop(mockClient, systemPrompt, initialMessages, [], baseOptions)

      expect(result.content).toContain('experiencing issues')
    })

    it('re-throws non-classified errors', async () => {
      const error = new Error('Unexpected network error')

      vi.mocked(mockClient.messages.create).mockRejectedValue(error)

      await expect(
        runAgentLoop(mockClient, systemPrompt, initialMessages, [], baseOptions),
      ).rejects.toThrow('Unexpected network error')
    })

    it('handles timeout with custom message', async () => {
      // Use a very short timeout
      const shortTimeoutOptions = { ...baseOptions, callTimeoutMs: 1 }

      // Create a never-resolving promise
      vi.mocked(mockClient.messages.create).mockReturnValue(
        new Promise(() => {}), // Never resolves
      )

      await expect(
        runAgentLoop(mockClient, systemPrompt, initialMessages, [], shortTimeoutOptions),
      ).rejects.toThrow(/timed out after/)
    })

    it('handles tool execution errors gracefully', async () => {
      const toolUseResponse: Anthropic.Message = {
        id: 'msg-1',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'tool_use',
            id: 'tool-1',
            name: 'calculator',
            input: { operation: 'divide', a: 1, b: 0 },
          },
        ],
        model: 'claude-sonnet-4-6',
        stop_reason: 'tool_use',
        usage: { input_tokens: 50, output_tokens: 30 },
      }

      const finalResponse: Anthropic.Message = {
        id: 'msg-2',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: 'The tool returned an error but I continued.',
          },
        ],
        model: 'claude-sonnet-4-6',
        stop_reason: 'end_turn',
        usage: { input_tokens: 80, output_tokens: 50 },
      }

      vi.mocked(mockClient.messages.create)
        .mockResolvedValueOnce(toolUseResponse)
        .mockResolvedValueOnce(finalResponse)

      const toolError = new Error('Division by zero')
      vi.mocked(tools[0].execute).mockRejectedValue(toolError)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await runAgentLoop(
        mockClient,
        systemPrompt,
        initialMessages,
        tools,
        baseOptions,
      )

      expect(result.content).toContain('continued')
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('tool "calculator" failed'),
        toolError,
      )

      consoleErrorSpy.mockRestore()
    })

    it('calls undefined tool and returns error message', async () => {
      const toolUseResponse: Anthropic.Message = {
        id: 'msg-1',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'tool_use',
            id: 'tool-1',
            name: 'undefined-tool',
            input: {},
          },
        ],
        model: 'claude-sonnet-4-6',
        stop_reason: 'tool_use',
        usage: { input_tokens: 50, output_tokens: 30 },
      }

      const finalResponse: Anthropic.Message = {
        id: 'msg-2',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: 'Tool not found, but continuing.',
          },
        ],
        model: 'claude-sonnet-4-6',
        stop_reason: 'end_turn',
        usage: { input_tokens: 80, output_tokens: 50 },
      }

      vi.mocked(mockClient.messages.create)
        .mockResolvedValueOnce(toolUseResponse)
        .mockResolvedValueOnce(finalResponse)

      const result = await runAgentLoop(
        mockClient,
        systemPrompt,
        initialMessages,
        tools,
        baseOptions,
      )

      expect(result.content).toContain('continuing')
    })
  })

  describe('max turns and edge cases', () => {
    it('stops after reaching max turns', async () => {
      // Create responses that will never end naturally (always tool_use)
      const toolResponse: Anthropic.Message = {
        id: 'msg-1',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'tool_use',
            id: 'tool-1',
            name: 'calculator',
            input: {},
          },
        ],
        model: 'claude-sonnet-4-6',
        stop_reason: 'tool_use',
        usage: { input_tokens: 50, output_tokens: 30 },
      }

      vi.mocked(mockClient.messages.create).mockResolvedValue(toolResponse)
      vi.mocked(tools[0].execute).mockResolvedValue('result')

      const result = await runAgentLoop(mockClient, systemPrompt, initialMessages, tools, {
        ...baseOptions,
        maxTurns: 2,
      })

      expect(mockClient.messages.create).toHaveBeenCalledTimes(2)
      expect(result.content).toContain('max turns')
    })

    it('handles response with no text block on end_turn', async () => {
      const mockResponse: Anthropic.Message = {
        id: 'msg-1',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'tool_use',
            id: 'tool-1',
            name: 'calculator',
            input: {},
          },
        ],
        model: 'claude-sonnet-4-6',
        stop_reason: 'end_turn',
        usage: { input_tokens: 50, output_tokens: 30 },
      }

      vi.mocked(mockClient.messages.create).mockResolvedValue(mockResponse)

      const result = await runAgentLoop(
        mockClient,
        systemPrompt,
        initialMessages,
        tools,
        baseOptions,
      )

      expect(result.content).toBe('')
    })

    it('constructs correct API call parameters', async () => {
      const mockResponse: Anthropic.Message = {
        id: 'msg-1',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: 'Response' }],
        model: 'claude-sonnet-4-6',
        stop_reason: 'end_turn',
        usage: { input_tokens: 10, output_tokens: 5 },
      }

      vi.mocked(mockClient.messages.create).mockResolvedValue(mockResponse)

      await runAgentLoop(mockClient, systemPrompt, initialMessages, tools, baseOptions)

      expect(mockClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: systemPrompt,
          tools: expect.arrayContaining([
            expect.objectContaining({
              name: 'calculator',
              description: 'Perform arithmetic operations',
            }),
          ]),
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: 'What is 2 + 2?',
            }),
          ]),
        }),
      )
    })

    it('omits tools when empty array provided', async () => {
      const mockResponse: Anthropic.Message = {
        id: 'msg-1',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: 'Response' }],
        model: 'claude-sonnet-4-6',
        stop_reason: 'end_turn',
        usage: { input_tokens: 10, output_tokens: 5 },
      }

      vi.mocked(mockClient.messages.create).mockResolvedValue(mockResponse)

      await runAgentLoop(mockClient, systemPrompt, initialMessages, [], baseOptions)

      const call = vi.mocked(mockClient.messages.create).mock.calls[0][0]
      expect(call.tools).toBeUndefined()
    })

    it('returns partial result with friendly error message when API fails mid-conversation', async () => {
      const error = new Error('Rate limited')
      ;(error as any).status = 429

      vi.mocked(mockClient.messages.create).mockRejectedValue(error)

      const result = await runAgentLoop(mockClient, systemPrompt, initialMessages, [], baseOptions)

      expect(result.tokensUsed.input).toBe(0)
      expect(result.tokensUsed.output).toBe(0)
      expect(result.content).toContain('rate-limited')
    })
  })

  describe('agent response structure', () => {
    it('always returns agent field as "unknown"', async () => {
      const mockResponse: Anthropic.Message = {
        id: 'msg-1',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: 'Response' }],
        model: 'claude-sonnet-4-6',
        stop_reason: 'end_turn',
        usage: { input_tokens: 10, output_tokens: 5 },
      }

      vi.mocked(mockClient.messages.create).mockResolvedValue(mockResponse)

      const result = await runAgentLoop(mockClient, systemPrompt, initialMessages, [], baseOptions)

      expect(result.agent).toBe('unknown')
    })

    it('includes all required response fields', async () => {
      const mockResponse: Anthropic.Message = {
        id: 'msg-1',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: 'Test response' }],
        model: 'claude-sonnet-4-6',
        stop_reason: 'end_turn',
        usage: { input_tokens: 25, output_tokens: 15 },
      }

      vi.mocked(mockClient.messages.create).mockResolvedValue(mockResponse)

      const result = await runAgentLoop(mockClient, systemPrompt, initialMessages, [], baseOptions)

      expect(result).toHaveProperty('content')
      expect(result).toHaveProperty('agent')
      expect(result).toHaveProperty('tokensUsed')
      expect(result.tokensUsed).toHaveProperty('input')
      expect(result.tokensUsed).toHaveProperty('output')
    })
  })
})
