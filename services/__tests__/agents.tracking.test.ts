import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as supabaseServer from '@/lib/supabase/server'
import { checkBudget, getUsageSummary, trackUsage } from '../agents/tracking'

// ---- Mocks ----

// Mock the Supabase server module
vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: vi.fn(),
}))

/**
 * Create a chainable mock Supabase client matching the `.from().select().eq().gte()` pattern.
 */
function createMockSupabaseClient() {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  }
}

// ---- Tests ----

describe('tracking.checkBudget', () => {
  let mockClient: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockClient = createMockSupabaseClient()
    vi.mocked(supabaseServer.createServiceRoleClient).mockReturnValue(mockClient as any)
  })

  it('returns allowed=true when under budget', async () => {
    // Mock: one usage entry with $10 cost, limit $50
    const mockData = [{ cost_usd: '10.50' }]
    const selectFn = vi.fn(() => ({
      eq: vi.fn(() => ({
        gte: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
      })),
    }))

    mockClient.from = vi.fn(() => ({
      select: selectFn,
    }))

    const result = await checkBudget(1, 50)

    expect(result.allowed).toBe(true)
    expect(result.used).toBe(10.5)
    expect(result.limit).toBe(50)
    expect(mockClient.from).toHaveBeenCalledWith('agent_usage_logs')
  })

  it('returns allowed=false when over budget', async () => {
    // Mock: usage totaling $55, limit $50
    const mockData = [{ cost_usd: '30' }, { cost_usd: '25' }]
    const selectFn = vi.fn(() => ({
      eq: vi.fn(() => ({
        gte: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
      })),
    }))

    mockClient.from = vi.fn(() => ({
      select: selectFn,
    }))

    const result = await checkBudget(1, 50)

    expect(result.allowed).toBe(false)
    expect(result.used).toBe(55)
    expect(result.limit).toBe(50)
  })

  it('returns allowed=true when exactly at budget boundary', async () => {
    // Edge case: used === limit should still be false (strict <)
    const mockData = [{ cost_usd: '50' }]
    const selectFn = vi.fn(() => ({
      eq: vi.fn(() => ({
        gte: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
      })),
    }))

    mockClient.from = vi.fn(() => ({
      select: selectFn,
    }))

    const result = await checkBudget(1, 50)

    expect(result.allowed).toBe(false)
    expect(result.used).toBe(50)
  })

  it('fails open (allowed=true) on DB error', async () => {
    const selectFn = vi.fn(() => ({
      eq: vi.fn(() => ({
        gte: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Connection timeout' } })),
      })),
    }))

    mockClient.from = vi.fn(() => ({
      select: selectFn,
    }))

    // Mock console.error to verify error is logged
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await checkBudget(1, 50)

    expect(result.allowed).toBe(true)
    expect(result.used).toBe(0)
    expect(result.limit).toBe(50)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'tracking.checkBudget error:',
      'Connection timeout',
    )

    consoleErrorSpy.mockRestore()
  })

  it('uses default monthly budget when not specified', async () => {
    const mockData: any[] = []
    const selectFn = vi.fn(() => ({
      eq: vi.fn(() => ({
        gte: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
      })),
    }))

    mockClient.from = vi.fn(() => ({
      select: selectFn,
    }))

    const result = await checkBudget(1) // No limit specified

    expect(result.limit).toBe(50) // DEFAULT_MONTHLY_BUDGET_USD
  })

  it('filters by tenant_id and start of current month', async () => {
    const mockData: any[] = []
    const gteFn = vi.fn(() => Promise.resolve({ data: mockData, error: null }))
    const eqFn = vi.fn(() => ({ gte: gteFn }))
    const selectFn = vi.fn(() => ({ eq: eqFn }))

    mockClient.from = vi.fn(() => ({
      select: selectFn,
    }))

    await checkBudget(42, 100)

    expect(mockClient.from).toHaveBeenCalledWith('agent_usage_logs')
    expect(selectFn).toHaveBeenCalledWith('cost_usd')
    expect(eqFn).toHaveBeenCalledWith('tenant_id', 42)
    // gte call should have a start-of-month date
    expect(gteFn).toHaveBeenCalled()
    const gteCall = gteFn.mock.calls[0][1]
    expect(gteCall).toMatch(/^\d{4}-\d{2}-01T00:00:00/) // ISO format, day 01
  })
})

describe('tracking.trackUsage', () => {
  let mockClient: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockClient = createMockSupabaseClient()
    vi.mocked(supabaseServer.createServiceRoleClient).mockReturnValue(mockClient as any)
  })

  it('inserts usage log into agent_usage_logs table', async () => {
    const insertFn = vi.fn(() => Promise.resolve({ data: null, error: null }))
    mockClient.from = vi.fn(() => ({
      insert: insertFn,
    }))

    await trackUsage({
      tenantId: 10,
      conversationId: 'conv-123',
      agentName: 'booking-agent',
      model: 'claude-sonnet-4-6',
      tokensIn: 500,
      tokensOut: 200,
    })

    expect(mockClient.from).toHaveBeenCalledWith('agent_usage_logs')
    expect(insertFn).toHaveBeenCalledWith({
      tenant_id: 10,
      conversation_id: 'conv-123',
      agent_name: 'booking-agent',
      model: 'claude-sonnet-4-6',
      tokens_in: 500,
      tokens_out: 200,
      cost_usd: expect.any(Number), // calculated cost
    })
  })

  it('calculates cost correctly for known models', async () => {
    const insertFn = vi.fn(() => Promise.resolve({ data: null, error: null }))
    mockClient.from = vi.fn(() => ({
      insert: insertFn,
    }))

    // claude-sonnet-4-6: input=3/1M, output=15/1M
    // tokensIn=1M, tokensOut=1M => cost = (1M/1M)*3 + (1M/1M)*15 = 18 USD
    await trackUsage({
      tenantId: 1,
      agentName: 'test',
      model: 'claude-sonnet-4-6',
      tokensIn: 1_000_000,
      tokensOut: 1_000_000,
    })

    const insertCall = insertFn.mock.calls[0][0]
    expect(insertCall.cost_usd).toBe(18)
  })

  it('handles unknown models by setting cost to 0', async () => {
    const insertFn = vi.fn(() => Promise.resolve({ data: null, error: null }))
    mockClient.from = vi.fn(() => ({
      insert: insertFn,
    }))

    await trackUsage({
      tenantId: 1,
      agentName: 'test',
      model: 'unknown-future-model',
      tokensIn: 1000,
      tokensOut: 1000,
    })

    const insertCall = insertFn.mock.calls[0][0]
    expect(insertCall.cost_usd).toBe(0)
  })

  it('sets conversation_id to null when not provided', async () => {
    const insertFn = vi.fn(() => Promise.resolve({ data: null, error: null }))
    mockClient.from = vi.fn(() => ({
      insert: insertFn,
    }))

    await trackUsage({
      tenantId: 5,
      agentName: 'test',
      model: 'claude-haiku-4-5',
      tokensIn: 100,
      tokensOut: 100,
    })

    const insertCall = insertFn.mock.calls[0][0]
    expect(insertCall.conversation_id).toBeNull()
  })

  it('does not throw on DB insert error (non-fatal)', async () => {
    const insertFn = vi.fn(() =>
      Promise.resolve({ data: null, error: { message: 'Write failed' } }),
    )
    mockClient.from = vi.fn(() => ({
      insert: insertFn,
    }))

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Should not throw
    await expect(
      trackUsage({
        tenantId: 1,
        agentName: 'test',
        model: 'claude-sonnet-4-6',
        tokensIn: 100,
        tokensOut: 100,
      }),
    ).resolves.not.toThrow()

    expect(consoleErrorSpy).toHaveBeenCalledWith('tracking.trackUsage error:', 'Write failed')

    consoleErrorSpy.mockRestore()
  })

  it('calculates cost for claude-opus-4-6 correctly', async () => {
    const insertFn = vi.fn(() => Promise.resolve({ data: null, error: null }))
    mockClient.from = vi.fn(() => ({
      insert: insertFn,
    }))

    // claude-opus-4-6: input=15/1M, output=75/1M
    // tokensIn=1M, tokensOut=1M => cost = 15 + 75 = 90 USD
    await trackUsage({
      tenantId: 1,
      agentName: 'test',
      model: 'claude-opus-4-6',
      tokensIn: 1_000_000,
      tokensOut: 1_000_000,
    })

    const insertCall = insertFn.mock.calls[0][0]
    expect(insertCall.cost_usd).toBe(90)
  })

  it('calculates cost for claude-haiku-4-5 correctly', async () => {
    const insertFn = vi.fn(() => Promise.resolve({ data: null, error: null }))
    mockClient.from = vi.fn(() => ({
      insert: insertFn,
    }))

    // claude-haiku-4-5: input=0.8/1M, output=4/1M
    // tokensIn=1M, tokensOut=1M => cost = 0.8 + 4 = 4.8 USD
    await trackUsage({
      tenantId: 1,
      agentName: 'test',
      model: 'claude-haiku-4-5',
      tokensIn: 1_000_000,
      tokensOut: 1_000_000,
    })

    const insertCall = insertFn.mock.calls[0][0]
    expect(insertCall.cost_usd).toBe(4.8)
  })
})

describe('tracking.getUsageSummary', () => {
  let mockClient: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mockClient = createMockSupabaseClient()
    vi.mocked(supabaseServer.createServiceRoleClient).mockReturnValue(mockClient as any)
  })

  it('aggregates usage correctly by agent', async () => {
    const mockData = [
      { agent_name: 'booking-agent', tokens_in: 500, tokens_out: 200, cost_usd: '5.00' },
      { agent_name: 'booking-agent', tokens_in: 300, tokens_out: 100, cost_usd: '3.00' },
      { agent_name: 'search-agent', tokens_in: 1000, tokens_out: 500, cost_usd: '10.00' },
    ]

    const eqFn = vi.fn(() => Promise.resolve({ data: mockData, error: null }))
    const selectFn = vi.fn(() => ({ eq: eqFn }))

    mockClient.from = vi.fn(() => ({
      select: selectFn,
    }))

    const result = await getUsageSummary(5)

    expect(result.totalCost).toBe(18)
    expect(result.totalTokensIn).toBe(1800)
    expect(result.totalTokensOut).toBe(800)
    expect(result.byAgent).toEqual({
      'booking-agent': { cost: 8, requests: 2 },
      'search-agent': { cost: 10, requests: 1 },
    })
  })

  it('returns empty summary when no data', async () => {
    const eqFn = vi.fn(() => Promise.resolve({ data: [], error: null }))
    const selectFn = vi.fn(() => ({ eq: eqFn }))

    mockClient.from = vi.fn(() => ({
      select: selectFn,
    }))

    const result = await getUsageSummary(99)

    expect(result.totalCost).toBe(0)
    expect(result.totalTokensIn).toBe(0)
    expect(result.totalTokensOut).toBe(0)
    expect(result.byAgent).toEqual({})
  })

  it('filters by tenant_id', async () => {
    const eqFn = vi.fn(() => Promise.resolve({ data: [], error: null }))
    const selectFn = vi.fn(() => ({ eq: eqFn }))

    mockClient.from = vi.fn(() => ({
      select: selectFn,
    }))

    await getUsageSummary(42)

    expect(mockClient.from).toHaveBeenCalledWith('agent_usage_logs')
    expect(selectFn).toHaveBeenCalledWith('agent_name, tokens_in, tokens_out, cost_usd')
    expect(eqFn).toHaveBeenCalledWith('tenant_id', 42)
  })

  it('filters by since date when provided', async () => {
    const mockData: any[] = []
    const gteFn = vi.fn(() => Promise.resolve({ data: mockData, error: null }))
    const eqFn = vi.fn(() => ({ gte: gteFn }))
    const selectFn = vi.fn(() => ({ eq: eqFn }))

    mockClient.from = vi.fn(() => ({
      select: selectFn,
    }))

    const sinceDate = new Date('2026-03-01')
    const result = await getUsageSummary(7, sinceDate)

    expect(mockClient.from).toHaveBeenCalledWith('agent_usage_logs')
    expect(eqFn).toHaveBeenCalledWith('tenant_id', 7)
    expect(gteFn).toHaveBeenCalled()
  })

  it('throws on DB error', async () => {
    const eqFn = vi.fn(() => Promise.resolve({ data: null, error: { message: 'Query failed' } }))
    const selectFn = vi.fn(() => ({ eq: eqFn }))

    mockClient.from = vi.fn(() => ({
      select: selectFn,
    }))

    await expect(getUsageSummary(1)).rejects.toThrow('tracking.getUsageSummary: Query failed')
  })

  it('handles numeric and string cost_usd values', async () => {
    const mockData = [
      { agent_name: 'agent-1', tokens_in: 100, tokens_out: 50, cost_usd: '5.25' },
      { agent_name: 'agent-2', tokens_in: 200, tokens_out: 100, cost_usd: 10.75 },
    ]

    const eqFn = vi.fn(() => Promise.resolve({ data: mockData, error: null }))
    const selectFn = vi.fn(() => ({ eq: eqFn }))

    mockClient.from = vi.fn(() => ({
      select: selectFn,
    }))

    const result = await getUsageSummary(1)

    expect(result.totalCost).toBe(16)
    expect(result.byAgent['agent-1'].cost).toBe(5.25)
    expect(result.byAgent['agent-2'].cost).toBe(10.75)
  })
})
