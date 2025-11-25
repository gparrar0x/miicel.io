/**
 * MercadoPago Webhook API Tests - Happy Paths Only
 *
 * Tests webhook processing (success scenarios only):
 * 1. Valid webhook signature acceptance
 * 2. Payment event processing
 *
 * Uses MERCADOPAGO_WEBHOOK_SECRET from environment variables.
 */

import { test, expect } from '@playwright/test'
import * as crypto from 'crypto'

test.describe('MercadoPago Webhook API - Happy Paths', () => {
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

  test('should accept valid webhook with correct signature', async ({ request }) => {
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

  test('should process payment webhook correctly', async ({ request }) => {
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
})
