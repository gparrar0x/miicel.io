/**
 * SKY-4: MercadoPago Webhook API Tests
 *
 * Tests webhook signature validation and payment event processing.
 * Verifies:
 * 1. Valid webhook signature acceptance
 * 2. Invalid signature rejection (403)
 * 3. Correct payload processing
 * 4. Error handling for malformed requests
 *
 * Uses MERCADOPAGO_WEBHOOK_SECRET from environment variables.
 */

import { test, expect } from '@playwright/test'
import * as crypto from 'crypto'

test.describe('SKY-4: MercadoPago Webhook API', () => {
  const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'
  const WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || 'test-secret-key-for-testing'

  /**
   * Generate HMAC SHA256 signature for webhook
   */
  function generateSignature(payload: string): string {
    return crypto.createHmac('sha256', WEBHOOK_SECRET).update(payload).digest('hex')
  }

  /**
   * Create webhook payload
   */
  function createPayload(type: 'payment' | 'order' = 'payment', id: string = 'mp-123') {
    return JSON.stringify({
      type,
      data: { id },
      timestamp: new Date().toISOString(),
    })
  }

  // ============================================================================
  // T2: Webhook Signature Validation
  // ============================================================================

  test('T2.1: should accept valid webhook with correct signature', async ({ request }) => {
    const payload = createPayload('payment', 'mp-payment-001')
    const signature = generateSignature(payload)

    const response = await request.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: payload,
      headers: {
        'x-signature': signature,
        'content-type': 'application/json',
      },
    })

    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body).toHaveProperty('success')
    expect(body.success).toBe(true)
  })

  test('T2.2: should reject webhook with invalid signature', async ({ request }) => {
    const payload = createPayload('payment', 'mp-payment-002')
    const invalidSignature = 'invalid-signature-string'

    const response = await request.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: payload,
      headers: {
        'x-signature': invalidSignature,
        'content-type': 'application/json',
      },
    })

    expect(response.status()).toBe(403)

    const body = await response.json()
    expect(body).toHaveProperty('error')
    expect(body.error.toLowerCase()).toContain('signature')
  })

  test('T2.3: should reject webhook with missing signature header', async ({ request }) => {
    const payload = createPayload('payment', 'mp-payment-003')

    const response = await request.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: payload,
      headers: {
        'content-type': 'application/json',
      },
    })

    expect(response.status()).toBe(403)

    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  test('T2.4: should reject webhook with modified payload (signature mismatch)', async ({ request }) => {
    const payload = createPayload('payment', 'mp-payment-004')
    const signature = generateSignature(payload)

    // Modify payload after signing
    const modifiedPayload = JSON.stringify({
      ...JSON.parse(payload),
      tampered: true,
    })

    const response = await request.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: modifiedPayload,
      headers: {
        'x-signature': signature,
        'content-type': 'application/json',
      },
    })

    expect(response.status()).toBe(403)
  })

  // ============================================================================
  // T2: Webhook Payload Processing
  // ============================================================================

  test('T2.5: should process payment webhook correctly', async ({ request }) => {
    const payload = createPayload('payment', 'mp-123456')
    const signature = generateSignature(payload)

    const response = await request.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: payload,
      headers: {
        'x-signature': signature,
        'content-type': 'application/json',
      },
    })

    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body).toHaveProperty('processed')
    expect(body.processed).toBe(true)
  })

  test('T2.6: should handle webhook with order type', async ({ request }) => {
    const payload = createPayload('order', 'ord-789')
    const signature = generateSignature(payload)

    const response = await request.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: payload,
      headers: {
        'x-signature': signature,
        'content-type': 'application/json',
      },
    })

    // Should either accept order type or reject gracefully
    expect([200, 400]).toContain(response.status())
  })

  test('T2.7: should handle webhook with complex data', async ({ request }) => {
    const complexPayload = JSON.stringify({
      type: 'payment',
      data: {
        id: 'mp-complex-123',
        status: 'approved',
        status_detail: 'accredited',
        payment_type_id: 'credit_card',
        payment_method: {
          type: 'card',
          id: '1',
        },
        transaction_details: {
          total_paid_amount: 100.5,
          external_reference: 'order-ext-001',
        },
      },
      timestamp: new Date().toISOString(),
    })

    const signature = generateSignature(complexPayload)

    const response = await request.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: complexPayload,
      headers: {
        'x-signature': signature,
        'content-type': 'application/json',
      },
    })

    expect(response.status()).toBe(200)
  })

  // ============================================================================
  // T2: Error Handling
  // ============================================================================

  test('T2.8: should handle malformed JSON payload', async ({ request }) => {
    const signature = generateSignature('invalid')

    const response = await request.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: 'not-json-{invalid',
      headers: {
        'x-signature': signature,
        'content-type': 'application/json',
      },
    })

    // Should return 400 or 403 (invalid payload)
    expect([400, 403]).toContain(response.status())
  })

  test('T2.9: should handle empty payload', async ({ request }) => {
    const signature = generateSignature('')

    const response = await request.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: '',
      headers: {
        'x-signature': signature,
        'content-type': 'application/json',
      },
    })

    expect([400, 403]).toContain(response.status())
  })

  test('T2.10: should reject webhook with wrong HTTP method', async ({ request }) => {
    const payload = createPayload('payment', 'mp-method-test')
    const signature = generateSignature(payload)

    const response = await request.get(`${BASE_URL}/api/webhooks/mercadopago`, {
      headers: {
        'x-signature': signature,
        'content-type': 'application/json',
      },
    })

    // GET should not be allowed (405 or similar)
    expect(response.status()).not.toBe(200)
  })

  // ============================================================================
  // T2: Signature Algorithm Variations
  // ============================================================================

  test('T2.11: should use SHA256 algorithm correctly', async ({ request }) => {
    const payload = createPayload('payment', 'mp-sha256-test')

    // Correct: SHA256
    const correctSignature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(payload).digest('hex')

    const response = await request.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: payload,
      headers: {
        'x-signature': correctSignature,
        'content-type': 'application/json',
      },
    })

    expect(response.status()).toBe(200)
  })

  test('T2.12: should reject with wrong hash algorithm (SHA1)', async ({ request }) => {
    const payload = createPayload('payment', 'mp-sha1-test')

    // Wrong: SHA1 instead of SHA256
    const wrongSignature = crypto.createHmac('sha1', WEBHOOK_SECRET).update(payload).digest('hex')

    const response = await request.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: payload,
      headers: {
        'x-signature': wrongSignature,
        'content-type': 'application/json',
      },
    })

    expect(response.status()).toBe(403)
  })

  test('T2.13: should reject with wrong secret key', async ({ request }) => {
    const payload = createPayload('payment', 'mp-wrong-secret')

    // Correct signature but with different secret
    const wrongSecretSignature = crypto.createHmac('sha256', 'wrong-secret').update(payload).digest('hex')

    const response = await request.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: payload,
      headers: {
        'x-signature': wrongSecretSignature,
        'content-type': 'application/json',
      },
    })

    expect(response.status()).toBe(403)
  })

  // ============================================================================
  // T2: Rate Limiting & Replay Protection
  // ============================================================================

  test('T2.14: should handle duplicate webhook (replay)', async ({ request }) => {
    const payload = createPayload('payment', 'mp-duplicate-test')
    const signature = generateSignature(payload)

    // First request
    const response1 = await request.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: payload,
      headers: {
        'x-signature': signature,
        'content-type': 'application/json',
      },
    })

    expect(response1.status()).toBe(200)

    // Duplicate request (same payload)
    const response2 = await request.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: payload,
      headers: {
        'x-signature': signature,
        'content-type': 'application/json',
      },
    })

    // Should either accept (idempotent) or reject
    // Depends on implementation
    expect([200, 409]).toContain(response2.status())
  })

  test('T2.15: should handle rapid successive webhooks', async ({ request }) => {
    const signatures = []
    const payloads = []

    // Generate 5 unique webhooks
    for (let i = 0; i < 5; i++) {
      const payload = createPayload('payment', `mp-rapid-${i}`)
      const signature = generateSignature(payload)
      payloads.push(payload)
      signatures.push(signature)
    }

    // Send all in parallel (simulate traffic spike)
    const responses = await Promise.all(
      payloads.map((payload, i) =>
        request.post(`${BASE_URL}/api/webhooks/mercadopago`, {
          data: payload,
          headers: {
            'x-signature': signatures[i],
            'content-type': 'application/json',
          },
        })
      )
    )

    // All should succeed
    responses.forEach((response) => {
      expect([200, 202, 204]).toContain(response.status())
    })
  })

  // ============================================================================
  // T2: Response Validation
  // ============================================================================

  test('T2.16: should return valid response structure', async ({ request }) => {
    const payload = createPayload('payment', 'mp-response-test')
    const signature = generateSignature(payload)

    const response = await request.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: payload,
      headers: {
        'x-signature': signature,
        'content-type': 'application/json',
      },
    })

    expect(response.status()).toBe(200)

    const body = await response.json()

    // Response should have expected structure
    expect(body).toBeDefined()
    expect(typeof body === 'object').toBe(true)
  })

  test('T2.17: should return error response for invalid signature', async ({ request }) => {
    const payload = createPayload('payment', 'mp-error-response')

    const response = await request.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: payload,
      headers: {
        'x-signature': 'invalid-sig',
        'content-type': 'application/json',
      },
    })

    expect(response.status()).toBe(403)

    const body = await response.json()
    expect(body).toHaveProperty('error')
    expect(typeof body.error === 'string' || typeof body.error === 'object').toBe(true)
  })

  // ============================================================================
  // T2: Edge Cases
  // ============================================================================

  test('T2.18: should handle very long payload', async ({ request }) => {
    const longData = 'x'.repeat(10000)
    const payload = JSON.stringify({
      type: 'payment',
      data: { id: 'mp-long', content: longData },
    })

    const signature = generateSignature(payload)

    const response = await request.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: payload,
      headers: {
        'x-signature': signature,
        'content-type': 'application/json',
      },
    })

    // Should either accept or reject with 413 (Payload Too Large)
    expect([200, 413]).toContain(response.status())
  })

  test('T2.19: should handle special characters in signature', async ({ request }) => {
    const payload = createPayload('payment', 'mp-special-chars')
    const signature = generateSignature(payload)

    // Signature should be hex (alphanumeric only)
    const isValidHex = /^[a-f0-9]*$/.test(signature)
    expect(isValidHex).toBe(true)

    const response = await request.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: payload,
      headers: {
        'x-signature': signature,
        'content-type': 'application/json',
      },
    })

    expect(response.status()).toBe(200)
  })

  test('T2.20: should handle case-sensitive signature', async ({ request }) => {
    const payload = createPayload('payment', 'mp-case-sensitive')
    const signature = generateSignature(payload)

    // Try uppercase (should fail)
    const uppercaseSignature = signature.toUpperCase()

    const response = await request.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: payload,
      headers: {
        'x-signature': uppercaseSignature,
        'content-type': 'application/json',
      },
    })

    // Should reject (signatures are case-sensitive)
    expect(response.status()).toBe(403)
  })
})
