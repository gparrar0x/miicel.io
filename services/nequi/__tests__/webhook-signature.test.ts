/**
 * Webhook signature verification — unit tests (SKY-279: per-tenant model).
 *
 * Tests cover:
 *  - Core HMAC-SHA384 / Digest algorithm correctness
 *  - Per-tenant scenarios: correct tenant, tampered body, cross-tenant secret mismatch
 */

import * as crypto from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { verifyNequiWebhook } from '../webhook-signature'

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

interface TenantFixture {
  commerceCode: string
  appSecret: string
}

const TENANT_A: TenantFixture = { commerceCode: '11111111', appSecret: 'secret-tenant-a' }
const TENANT_B: TenantFixture = { commerceCode: '22222222', appSecret: 'secret-tenant-b' }

const SECRET = 'super-secret-webhook-key'
const VALID_BODY = JSON.stringify({
  commerceCode: TENANT_A.commerceCode,
  messageId: '42',
  transactionId: 'tx-abc-123',
  paymentStatus: 'SUCCESS',
  value: '50000',
  phoneNumber: '3001234567',
})

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

function computeDigestHeader(rawBody: string): string {
  return `SHA-256=${crypto.createHash('sha256').update(rawBody, 'utf8').digest('base64')}`
}

function computeSignature(stringToSign: string, secret: string): string {
  return crypto.createHmac('sha384', secret).update(stringToSign, 'utf8').digest('base64url')
}

function buildSignatureHeader(sig: string, keyId = 'nequi-key'): string {
  return `keyId="${keyId}", algorithm="hmac-sha384", signature="${sig}"`
}

interface ValidParams {
  rawBody: string
  appSecret: string
  contentType?: string
}

function buildValidCallParams(params: ValidParams): Parameters<typeof verifyNequiWebhook>[0] {
  const { rawBody, appSecret, contentType = 'application/json' } = params
  const digestHeader = computeDigestHeader(rawBody)
  const stringToSign = `content-type: ${contentType}\ndigest: ${digestHeader}`
  const sig = computeSignature(stringToSign, appSecret)
  return {
    rawBody,
    digestHeader,
    signatureHeader: buildSignatureHeader(sig),
    appSecret,
    contentType,
  }
}

// ---------------------------------------------------------------------------
// Core algorithm tests
// ---------------------------------------------------------------------------

describe('webhook signature verification', () => {
  it('accepts a valid digest + signature with correct secret', () => {
    const result = verifyNequiWebhook(
      buildValidCallParams({ rawBody: VALID_BODY, appSecret: SECRET }),
    )
    expect(result.ok).toBe(true)
  })

  it('rejects when secret is wrong', () => {
    const params = buildValidCallParams({ rawBody: VALID_BODY, appSecret: SECRET })
    const result = verifyNequiWebhook({ ...params, appSecret: 'wrong-secret' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('bad-signature')
  })

  it('rejects when body is tampered (digest mismatch)', () => {
    const params = buildValidCallParams({ rawBody: VALID_BODY, appSecret: SECRET })
    const tampered = VALID_BODY.replace('SUCCESS', 'DENIED')
    const result = verifyNequiWebhook({ ...params, rawBody: tampered })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('bad-digest')
  })

  it('rejects when signature has been tampered (single byte change)', () => {
    const params = buildValidCallParams({ rawBody: VALID_BODY, appSecret: SECRET })
    // Mangle last char of signature inside the header
    const tamperedHeader = params.signatureHeader.replace(/"$/, (s) => (s === '"' ? 'X"' : '"'))
    const result = verifyNequiWebhook({ ...params, signatureHeader: tamperedHeader + 'X' })
    expect(result.ok).toBe(false)
  })

  it('rejects when signature field is missing from header', () => {
    const params = buildValidCallParams({ rawBody: VALID_BODY, appSecret: SECRET })
    const result = verifyNequiWebhook({
      ...params,
      signatureHeader: 'keyId="key", algorithm="hmac-sha384"',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('malformed-signature')
  })

  it('rejects when content-type is altered (string-to-sign changes)', () => {
    const params = buildValidCallParams({ rawBody: VALID_BODY, appSecret: SECRET })
    const result = verifyNequiWebhook({ ...params, contentType: 'text/plain' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('bad-signature')
  })

  it('rejects when digest header is forged with wrong base64', () => {
    const params = buildValidCallParams({ rawBody: VALID_BODY, appSecret: SECRET })
    const result = verifyNequiWebhook({
      ...params,
      digestHeader: 'SHA-256=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('bad-digest')
  })

  it('uses base64url (no +/= chars) — Nequi spec compliance', () => {
    const params = buildValidCallParams({ rawBody: VALID_BODY, appSecret: SECRET })
    // Extract sig from signatureHeader
    const match = params.signatureHeader.match(/signature="([^"]+)"/)
    const sig = match?.[1] ?? ''
    expect(sig).not.toContain('+')
    expect(sig).not.toContain('/')
    expect(sig).not.toContain('=')
  })

  it('uses HMAC-SHA384 (64 base64url chars)', () => {
    const digestHeader = computeDigestHeader(VALID_BODY)
    const stringToSign = `content-type: application/json\ndigest: ${digestHeader}`
    const sig = computeSignature(stringToSign, SECRET)
    expect(sig).toHaveLength(64)
  })

  it('digest header format: "SHA-256={base64(sha256(body))}"', () => {
    const digestHeader = computeDigestHeader(VALID_BODY)
    expect(digestHeader).toMatch(/^SHA-256=[A-Za-z0-9+/]+=*$/)
  })
})

// ---------------------------------------------------------------------------
// Per-tenant scenarios (SKY-279)
// ---------------------------------------------------------------------------

describe('per-tenant webhook signature verification', () => {
  it('valid signature for tenant A → accept', () => {
    const body = buildPayload(TENANT_A.commerceCode)
    const result = verifyNequiWebhook(
      buildValidCallParams({ rawBody: body, appSecret: TENANT_A.appSecret }),
    )
    expect(result.ok).toBe(true)
  })

  it('tampered body with valid commerceCode → bad-digest', () => {
    const body = buildPayload(TENANT_A.commerceCode)
    const params = buildValidCallParams({ rawBody: body, appSecret: TENANT_A.appSecret })
    const tamperedBody = body.replace('SUCCESS', 'DENIED')
    const result = verifyNequiWebhook({ ...params, rawBody: tamperedBody })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('bad-digest')
  })

  it('body signed with tenant B secret but claiming tenant A commerceCode → bad-signature', () => {
    const body = buildPayload(TENANT_A.commerceCode)
    // Build headers with tenant B's secret, but verify with tenant A's
    const digestHeader = computeDigestHeader(body)
    const stringToSign = `content-type: application/json\ndigest: ${digestHeader}`
    const sigWithTenantB = computeSignature(stringToSign, TENANT_B.appSecret)

    const result = verifyNequiWebhook({
      rawBody: body,
      digestHeader,
      signatureHeader: buildSignatureHeader(sigWithTenantB),
      appSecret: TENANT_A.appSecret,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('bad-signature')
  })

  it('tenant B webhook is independently valid with its own secret', () => {
    const body = buildPayload(TENANT_B.commerceCode)
    const result = verifyNequiWebhook(
      buildValidCallParams({ rawBody: body, appSecret: TENANT_B.appSecret }),
    )
    expect(result.ok).toBe(true)
  })

  it('tenant A secret does not validate tenant B signature', () => {
    const body = buildPayload(TENANT_B.commerceCode)
    const digestHeader = computeDigestHeader(body)
    const stringToSign = `content-type: application/json\ndigest: ${digestHeader}`
    const sig = computeSignature(stringToSign, TENANT_B.appSecret)

    const result = verifyNequiWebhook({
      rawBody: body,
      digestHeader,
      signatureHeader: buildSignatureHeader(sig),
      appSecret: TENANT_A.appSecret,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('bad-signature')
  })
})
