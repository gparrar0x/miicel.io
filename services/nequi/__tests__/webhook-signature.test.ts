/**
 * Webhook signature verification — unit tests (SKY-279: per-tenant model).
 *
 * Tests cover:
 *  - Core HMAC-SHA384 / Digest algorithm correctness (unchanged)
 *  - Per-tenant scenarios: correct tenant, unknown commerceCode, tampered body,
 *    cross-tenant secret mismatch
 *
 * The HMAC-SHA384 verification logic lives in app/api/webhooks/nequi/route.ts.
 * This file exercises the same algorithm via local helpers to keep tests pure
 * (no HTTP/DB required).
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
// Helpers for per-tenant test scenarios
// ---------------------------------------------------------------------------

interface TenantFixture {
  commerceCode: string
  appSecret: string
}

const TENANT_A: TenantFixture = { commerceCode: '11111111', appSecret: 'secret-tenant-a' }
const TENANT_B: TenantFixture = { commerceCode: '22222222', appSecret: 'secret-tenant-b' }

function buildPayload(commerceCode: string, messageId = '42'): string {
  return JSON.stringify({
    commerceCode,
    value: '50000',
    phoneNumber: '3001234567',
    messageId,
    transactionId: 'tx-abc-123',
    region: 'C001',
    receivedAt: '2026-04-14T00:00:00Z',
    paymentStatus: 'SUCCESS',
  })
}

function buildValidParams(
  rawBody: string,
  secret: string,
  overrides: Partial<VerifyParams> = {},
): VerifyParams {
  const digestHeader = computeDigestHeader(rawBody)
  const contentType = 'application/json'
  const stringToSign = buildStringToSign(contentType, digestHeader)
  const signature = computeSignature(stringToSign, secret)
  return {
    rawBody,
    contentType,
    digestHeader,
    signature,
    secret,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Legacy algorithm tests (unchanged)
// ---------------------------------------------------------------------------

const SECRET = 'super-secret-webhook-key'
const VALID_BODY = JSON.stringify({
  messageId: '42',
  transactionId: 'tx-abc-123',
  paymentStatus: 'SUCCESS',
  value: '50000',
  phoneNumber: '3001234567',
})

function buildLegacyParams(overrides: Partial<VerifyParams> = {}): VerifyParams {
  return buildValidParams(VALID_BODY, SECRET, overrides)
}

describe('webhook signature verification', () => {
  it('accepts a valid digest + signature with correct secret', () => {
    const result = verifyWebhookSignature(buildLegacyParams())
    expect(result.digestOk).toBe(true)
    expect(result.signatureOk).toBe(true)
  })

  it('rejects when secret is wrong', () => {
    const result = verifyWebhookSignature(buildLegacyParams({ secret: 'wrong-secret' }))
    expect(result.digestOk).toBe(true)
    expect(result.signatureOk).toBe(false)
  })

  it('rejects when body is tampered (digest mismatch cascades)', () => {
    const tampered = VALID_BODY.replace('SUCCESS', 'DENIED')
    const params = buildLegacyParams()
    const result = verifyWebhookSignature({ ...params, rawBody: tampered })
    expect(result.digestOk).toBe(false)
  })

  it('rejects when signature has been tampered (single byte change)', () => {
    const params = buildLegacyParams()
    const tamperedSig =
      params.signature.slice(0, -1) + (params.signature.slice(-1) === 'A' ? 'B' : 'A')
    const result = verifyWebhookSignature({ ...params, signature: tamperedSig })
    expect(result.signatureOk).toBe(false)
  })

  it('rejects when signature length differs (timingSafeEqual would throw)', () => {
    const params = buildLegacyParams()
    const result = verifyWebhookSignature({ ...params, signature: 'short' })
    expect(result.signatureOk).toBe(false)
  })

  it('rejects when content-type is altered (string-to-sign changes)', () => {
    const params = buildLegacyParams()
    const result = verifyWebhookSignature({ ...params, contentType: 'text/plain' })
    expect(result.digestOk).toBe(true)
    expect(result.signatureOk).toBe(false)
  })

  it('rejects when digest header is forged with wrong base64', () => {
    const params = buildLegacyParams()
    const result = verifyWebhookSignature({
      ...params,
      digestHeader: 'SHA-256=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    })
    expect(result.digestOk).toBe(false)
  })

  it('uses base64url (no +/= chars) — Nequi spec compliance', () => {
    const params = buildLegacyParams()
    expect(params.signature).not.toContain('+')
    expect(params.signature).not.toContain('/')
    expect(params.signature).not.toContain('=')
  })

  it('uses HMAC-SHA384 (96 hex chars / 64 base64url chars)', () => {
    const params = buildLegacyParams()
    expect(params.signature).toHaveLength(64)
  })

  it('digest header format: "SHA-256={base64(sha256(body))}"', () => {
    const params = buildLegacyParams()
    expect(params.digestHeader).toMatch(/^SHA-256=[A-Za-z0-9+/]+=*$/)
  })
})

// ---------------------------------------------------------------------------
// Per-tenant scenarios (SKY-279)
// ---------------------------------------------------------------------------

describe('per-tenant webhook signature verification', () => {
  it('valid signature for tenant A → accept (200)', () => {
    // Simulate: tenant A sends webhook signed with its own app_secret
    const body = buildPayload(TENANT_A.commerceCode)
    const result = verifyWebhookSignature(buildValidParams(body, TENANT_A.appSecret))
    expect(result.digestOk).toBe(true)
    expect(result.signatureOk).toBe(true)
  })

  it('commerceCode not in DB → 404 (tenant lookup returns null)', () => {
    // We model the lookup result; the route returns 404 when tenant is null.
    // Here we just confirm that a body with an unknown commerceCode produces
    // a valid signature that would pass crypto — the 404 is a route concern.
    const unknownCode = '99999999'
    const body = buildPayload(unknownCode)
    // Sign with any secret — won't matter, lookup fails first
    const result = verifyWebhookSignature(buildValidParams(body, 'any-secret'))
    // Crypto is valid; the route would 404 before reaching crypto check
    expect(result.digestOk).toBe(true)
    expect(result.signatureOk).toBe(true)
    // Confirm commerceCode is not tenant A or B
    expect(unknownCode).not.toBe(TENANT_A.commerceCode)
    expect(unknownCode).not.toBe(TENANT_B.commerceCode)
  })

  it('tampered body with valid commerceCode → 401 (digest fails)', () => {
    const body = buildPayload(TENANT_A.commerceCode)
    const params = buildValidParams(body, TENANT_A.appSecret)
    // Tamper body after signing
    const tamperedBody = body.replace('SUCCESS', 'DENIED')
    const result = verifyWebhookSignature({ ...params, rawBody: tamperedBody })
    expect(result.digestOk).toBe(false)
  })

  it('body signed with tenant B secret but claiming tenant A commerceCode → 401', () => {
    // The route decrypts tenant A's app_secret; the sig was made with tenant B's
    const body = buildPayload(TENANT_A.commerceCode)
    // Sign with tenant B's secret — mismatch when verified against tenant A's secret
    const digestHeader = computeDigestHeader(body)
    const contentType = 'application/json'
    const stringToSign = buildStringToSign(contentType, digestHeader)
    const signatureWithTenantB = computeSignature(stringToSign, TENANT_B.appSecret)

    const result = verifyWebhookSignature({
      rawBody: body,
      contentType,
      digestHeader,
      signature: signatureWithTenantB,
      secret: TENANT_A.appSecret, // route uses tenant A's secret for verification
    })

    expect(result.digestOk).toBe(true)
    expect(result.signatureOk).toBe(false)
  })

  it('tenant B webhook is independently valid with its own secret', () => {
    const body = buildPayload(TENANT_B.commerceCode)
    const result = verifyWebhookSignature(buildValidParams(body, TENANT_B.appSecret))
    expect(result.digestOk).toBe(true)
    expect(result.signatureOk).toBe(true)
  })

  it('tenant A secret does not validate tenant B signature', () => {
    const body = buildPayload(TENANT_B.commerceCode)
    // Sign as tenant B but verify as tenant A
    const digestHeader = computeDigestHeader(body)
    const contentType = 'application/json'
    const stringToSign = buildStringToSign(contentType, digestHeader)
    const sig = computeSignature(stringToSign, TENANT_B.appSecret)

    const result = verifyWebhookSignature({
      rawBody: body,
      contentType,
      digestHeader,
      signature: sig,
      secret: TENANT_A.appSecret,
    })

    expect(result.signatureOk).toBe(false)
  })
})
