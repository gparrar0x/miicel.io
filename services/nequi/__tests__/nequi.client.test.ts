/**
 * NequiClient unit tests — mock mode + signed fetch + error wrapping.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NequiApiError } from '../errors'
import { NequiClient } from '../nequi.client'

const CREDS = {
  clientId: 'test-client-id',
  apiKey: 'test-api-key',
  appSecret: 'test-app-secret',
  phoneNumber: '3001234567',
}

describe('NequiClient — mock mode (option flag)', () => {
  it('requestPayment returns deterministic stub', async () => {
    const client = new NequiClient(CREDS, { mockMode: true })
    const result = await client.requestPayment({
      phoneNumber: '3001234567',
      amount: 1000,
      messageId: '42',
    })
    expect(result).toEqual({ transactionId: 'mock-tx-001', status: 'pending' })
  })

  it('getPaymentStatus returns pending stub', async () => {
    const client = new NequiClient(CREDS, { mockMode: true })
    const result = await client.getPaymentStatus('any-tx')
    expect(result).toEqual({ status: 'pending', rawCode: '33' })
  })

  it('mock mode does not call fetch', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    try {
      const client = new NequiClient(CREDS, { mockMode: true })
      await client.requestPayment({ phoneNumber: '3001234567', amount: 1000, messageId: '1' })
      await client.getPaymentStatus('tx-1')
      expect(fetchMock).not.toHaveBeenCalled()
    } finally {
      vi.unstubAllGlobals()
    }
  })
})

describe('NequiClient — mock mode (env var)', () => {
  const originalEnv = process.env.NEQUI_MOCK_MODE

  beforeEach(() => {
    process.env.NEQUI_MOCK_MODE = '1'
  })

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEQUI_MOCK_MODE
    } else {
      process.env.NEQUI_MOCK_MODE = originalEnv
    }
  })

  it('NEQUI_MOCK_MODE=1 enables mock mode without explicit option', async () => {
    const client = new NequiClient(CREDS)
    const result = await client.requestPayment({
      phoneNumber: '3001234567',
      amount: 1000,
      messageId: '42',
    })
    expect(result.transactionId).toBe('mock-tx-001')
  })
})

describe('NequiClient — real mode (mocked fetch)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function stubFetchOnce(
    response: Partial<Response> & { jsonValue?: unknown; textValue?: string },
  ) {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: response.ok ?? true,
      status: response.status ?? 200,
      json: vi.fn().mockResolvedValue(response.jsonValue ?? {}),
      text: vi.fn().mockResolvedValue(response.textValue ?? ''),
    } as unknown as Response)
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
  }

  it('requestPayment posts JSON body with SigV4 headers', async () => {
    const fetchMock = stubFetchOnce({
      ok: true,
      jsonValue: { transactionId: 'real-tx-123' },
    })

    const client = new NequiClient(CREDS, { mockMode: false, baseUrl: 'https://api.nequi.com/v2' })
    const result = await client.requestPayment({
      phoneNumber: '3001234567',
      amount: 5000,
      messageId: '99',
    })

    expect(result).toEqual({ transactionId: 'real-tx-123', status: 'pending' })
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [calledUrl, init] = fetchMock.mock.calls[0]
    expect(calledUrl).toBe('https://api.nequi.com/v2/charges')
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toMatch(/^AWS4-HMAC-SHA256 /)
    expect(init.headers['x-amz-date']).toMatch(/^\d{8}T\d{6}Z$/)
    expect(init.headers['x-api-key']).toBe('test-api-key')
    expect(init.body).toContain('"value":5000')
    expect(init.body).toContain('"messageId":"99"')
  })

  it('requestPayment normalises transactionId from data.transactionId path', async () => {
    stubFetchOnce({ ok: true, jsonValue: { data: { transactionId: 'nested-tx' } } })

    const client = new NequiClient(CREDS, { mockMode: false, baseUrl: 'https://api.nequi.com/v2' })
    const result = await client.requestPayment({
      phoneNumber: '3001234567',
      amount: 100,
      messageId: '1',
    })
    expect(result.transactionId).toBe('nested-tx')
  })

  it('requestPayment normalises transactionId from id path', async () => {
    stubFetchOnce({ ok: true, jsonValue: { id: 'flat-tx' } })

    const client = new NequiClient(CREDS, { mockMode: false, baseUrl: 'https://api.nequi.com/v2' })
    const result = await client.requestPayment({
      phoneNumber: '3001234567',
      amount: 100,
      messageId: '1',
    })
    expect(result.transactionId).toBe('flat-tx')
  })

  it('requestPayment throws NequiApiError when transactionId missing', async () => {
    stubFetchOnce({ ok: true, jsonValue: {} })

    const client = new NequiClient(CREDS, { mockMode: false, baseUrl: 'https://api.nequi.com/v2' })
    await expect(
      client.requestPayment({ phoneNumber: '3001234567', amount: 100, messageId: '1' }),
    ).rejects.toThrow(NequiApiError)
  })

  it('requestPayment wraps 5xx error into NequiApiError', async () => {
    stubFetchOnce({
      ok: false,
      status: 503,
      textValue: 'Service Unavailable',
    })

    const client = new NequiClient(CREDS, { mockMode: false, baseUrl: 'https://api.nequi.com/v2' })
    await expect(
      client.requestPayment({ phoneNumber: '3001234567', amount: 100, messageId: '1' }),
    ).rejects.toMatchObject({
      name: 'NequiApiError',
      code: 'NEQUI_REQUEST_FAILED',
      status: 503,
    })
  })

  it('requestPayment wraps 4xx error into NequiApiError', async () => {
    stubFetchOnce({
      ok: false,
      status: 401,
      textValue: 'Unauthorized',
    })

    const client = new NequiClient(CREDS, { mockMode: false, baseUrl: 'https://api.nequi.com/v2' })
    await expect(
      client.requestPayment({ phoneNumber: '3001234567', amount: 100, messageId: '1' }),
    ).rejects.toMatchObject({
      name: 'NequiApiError',
      status: 401,
    })
  })

  it('requestPayment propagates network errors (fetch rejection)', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'))
    vi.stubGlobal('fetch', fetchMock)

    const client = new NequiClient(CREDS, { mockMode: false, baseUrl: 'https://api.nequi.com/v2' })
    await expect(
      client.requestPayment({ phoneNumber: '3001234567', amount: 100, messageId: '1' }),
    ).rejects.toThrow('ECONNREFUSED')
  })

  it('getPaymentStatus performs GET and maps status code', async () => {
    const fetchMock = stubFetchOnce({
      ok: true,
      jsonValue: { status: { statusCode: '35', statusDesc: 'Approved' } },
    })

    const client = new NequiClient(CREDS, { mockMode: false, baseUrl: 'https://api.nequi.com/v2' })
    const result = await client.getPaymentStatus('tx-abc')

    expect(result).toEqual({ status: 'paid', rawCode: '35', message: 'Approved' })

    const [calledUrl, init] = fetchMock.mock.calls[0]
    expect(calledUrl).toBe('https://api.nequi.com/v2/charges/tx-abc')
    expect(init.method).toBe('GET')
    expect(init.body).toBeUndefined()
  })

  it('getPaymentStatus normalises rawCode from multiple paths', async () => {
    stubFetchOnce({ ok: true, jsonValue: { code: '10-454' } })

    const client = new NequiClient(CREDS, { mockMode: false, baseUrl: 'https://api.nequi.com/v2' })
    const result = await client.getPaymentStatus('tx-1')
    expect(result.status).toBe('expired')
    expect(result.rawCode).toBe('10-454')
  })

  it('getPaymentStatus wraps 5xx in NequiApiError', async () => {
    stubFetchOnce({ ok: false, status: 502, textValue: 'Bad Gateway' })

    const client = new NequiClient(CREDS, { mockMode: false, baseUrl: 'https://api.nequi.com/v2' })
    await expect(client.getPaymentStatus('tx-1')).rejects.toMatchObject({
      name: 'NequiApiError',
      code: 'NEQUI_STATUS_FAILED',
      status: 502,
    })
  })

  it('getPaymentStatus URL-encodes transaction id', async () => {
    const fetchMock = stubFetchOnce({ ok: true, jsonValue: { code: '33' } })

    const client = new NequiClient(CREDS, { mockMode: false, baseUrl: 'https://api.nequi.com/v2' })
    await client.getPaymentStatus('tx with spaces')

    const [calledUrl] = fetchMock.mock.calls[0]
    expect(calledUrl).toBe('https://api.nequi.com/v2/charges/tx%20with%20spaces')
  })
})
