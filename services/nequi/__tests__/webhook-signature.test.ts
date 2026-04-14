/**
 * Webhook signature verification — unit tests.
 *
 * The HMAC-SHA384 verification logic is currently inlined in the route handler.
 * This file replicates the same shape via a local helper so we exercise the
 * exact algorithm Kokoro implemented in app/api/webhooks/nequi/route.ts:
 *
 *   stringToSign = "content-type: ${contentType}\ndigest: ${digestHeader}"
 *   signature    = base64url(hmac-sha384(secret, stringToSign))
 *   digestHeader = "SHA-256=${base64(sha256(rawBody))}"
 *
 * If the route logic is later extracted into a pure helper (recommended), the
 * helper-under-test should be swapped here without touching test cases.
 */

import * as crypto from 'node:crypto'
import { describe, expect, it } from 'vitest'

// ---------------------------------------------------------------------------
// Local mirror of the verification logic from app/api/webhooks/nequi/route.ts
// ---------------------------------------------------------------------------

function computeDigestHeader(rawBody: string): string {
  return `SHA-256=${crypto.createHash('sha256').update(rawBody, 'utf8').digest('base64')}`
}

function computeSignature(stringToSign: string, secret: string): string {
  return crypto.createHmac('sha384', secret).update(stringToSign, 'utf8').digest('base64url')
}

function buildStringToSign(contentType: string, digestHeader: string): string {
  return `content-type: ${contentType}\ndigest: ${digestHeader}`
}

interface VerifyParams {
  rawBody: string
  contentType: string
  digestHeader: string
  signature: string
  secret: string
}

interface VerifyResult {
  digestOk: boolean
  signatureOk: boolean
}

function verifyWebhookSignature(params: VerifyParams): VerifyResult {
  // 1. Recompute digest from body, constant-time compare.
  const expectedDigest = computeDigestHeader(params.rawBody)
  let digestOk = false
  try {
    digestOk = crypto.timingSafeEqual(Buffer.from(params.digestHeader), Buffer.from(expectedDigest))
  } catch {
    digestOk = false
  }

  // 2. Recompute HMAC-SHA384, constant-time compare.
  const stringToSign = buildStringToSign(params.contentType, params.digestHeader)
  const expectedSig = computeSignature(stringToSign, params.secret)
  let signatureOk = false
  try {
    signatureOk = crypto.timingSafeEqual(Buffer.from(params.signature), Buffer.from(expectedSig))
  } catch {
    signatureOk = false
  }

  return { digestOk, signatureOk }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const SECRET = 'super-secret-webhook-key'
const VALID_BODY = JSON.stringify({
  messageId: '42',
  transactionId: 'tx-abc-123',
  paymentStatus: 'SUCCESS',
  value: '50000',
  phoneNumber: '3001234567',
})

function buildValidParams(overrides: Partial<VerifyParams> = {}): VerifyParams {
  const digestHeader = computeDigestHeader(VALID_BODY)
  const contentType = 'application/json'
  const stringToSign = buildStringToSign(contentType, digestHeader)
  const signature = computeSignature(stringToSign, SECRET)
  return {
    rawBody: VALID_BODY,
    contentType,
    digestHeader,
    signature,
    secret: SECRET,
    ...overrides,
  }
}

describe('webhook signature verification', () => {
  it('accepts a valid digest + signature with correct secret', () => {
    const result = verifyWebhookSignature(buildValidParams())
    expect(result.digestOk).toBe(true)
    expect(result.signatureOk).toBe(true)
  })

  it('rejects when secret is wrong', () => {
    const result = verifyWebhookSignature(buildValidParams({ secret: 'wrong-secret' }))
    expect(result.digestOk).toBe(true)
    expect(result.signatureOk).toBe(false)
  })

  it('rejects when body is tampered (digest mismatch cascades)', () => {
    const tampered = VALID_BODY.replace('SUCCESS', 'DENIED')
    const params = buildValidParams() // digest + sig still computed for original body
    const result = verifyWebhookSignature({ ...params, rawBody: tampered })
    // The digest header in params still matches the original body, not the tampered one,
    // so when the route recomputes from rawBody=tampered, digest fails.
    expect(result.digestOk).toBe(false)
  })

  it('rejects when signature has been tampered (single byte change)', () => {
    const params = buildValidParams()
    // Flip one base64url char (signature length must be preserved for timingSafeEqual)
    const tamperedSig =
      params.signature.slice(0, -1) + (params.signature.slice(-1) === 'A' ? 'B' : 'A')
    const result = verifyWebhookSignature({ ...params, signature: tamperedSig })
    expect(result.signatureOk).toBe(false)
  })

  it('rejects when signature length differs (timingSafeEqual would throw)', () => {
    const params = buildValidParams()
    const result = verifyWebhookSignature({ ...params, signature: 'short' })
    // Caught by try/catch → false
    expect(result.signatureOk).toBe(false)
  })

  it('rejects when content-type is altered (string-to-sign changes)', () => {
    const params = buildValidParams()
    // Same digest, but we change content-type → recomputed stringToSign differs
    const result = verifyWebhookSignature({ ...params, contentType: 'text/plain' })
    expect(result.digestOk).toBe(true)
    expect(result.signatureOk).toBe(false)
  })

  it('rejects when digest header is forged with wrong base64', () => {
    const params = buildValidParams()
    const result = verifyWebhookSignature({
      ...params,
      digestHeader: 'SHA-256=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    })
    expect(result.digestOk).toBe(false)
  })

  it('uses base64url (no +/= chars) — Nequi spec compliance', () => {
    const params = buildValidParams()
    expect(params.signature).not.toContain('+')
    expect(params.signature).not.toContain('/')
    expect(params.signature).not.toContain('=')
  })

  it('uses HMAC-SHA384 (96 hex chars / 64 base64url chars)', () => {
    const params = buildValidParams()
    // sha384 → 48 bytes → 64 base64url chars (no padding)
    expect(params.signature).toHaveLength(64)
  })

  it('digest header format: "SHA-256={base64(sha256(body))}"', () => {
    const params = buildValidParams()
    expect(params.digestHeader).toMatch(/^SHA-256=[A-Za-z0-9+/]+=*$/)
  })
})
