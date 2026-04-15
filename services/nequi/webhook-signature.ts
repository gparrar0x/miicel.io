/**
 * verifyNequiWebhook — pure HMAC-SHA384 signature verification for Nequi Conecta webhooks.
 *
 * Algorithm:
 *   1. Digest: SHA-256=${base64(sha256(rawBody))} — must match Digest header
 *   2. stringToSign: "content-type: {ct}\ndigest: {digestHeader}"
 *   3. Signature: HMAC-SHA384(stringToSign, appSecret) → base64url
 */

import * as crypto from 'node:crypto'

export type VerifyNequiWebhookResult =
  | { ok: true }
  | { ok: false; reason: 'bad-digest' | 'bad-signature' | 'malformed-signature' }

export function verifyNequiWebhook(params: {
  rawBody: string
  digestHeader: string
  signatureHeader: string
  appSecret: string
  contentType?: string
}): VerifyNequiWebhookResult {
  const { rawBody, digestHeader, signatureHeader, appSecret } = params
  const contentType = params.contentType ?? 'application/json'

  // 1. Verify Digest: SHA-256=${base64(sha256(rawBody))}
  const expectedDigest = `SHA-256=${crypto
    .createHash('sha256')
    .update(rawBody, 'utf8')
    .digest('base64')}`

  try {
    if (!crypto.timingSafeEqual(Buffer.from(digestHeader), Buffer.from(expectedDigest))) {
      return { ok: false, reason: 'bad-digest' }
    }
  } catch {
    // Buffer length mismatch → definitely invalid
    return { ok: false, reason: 'bad-digest' }
  }

  // 2. Parse Signature header: keyId="...", signature="..."
  let parsedSignature: string | null = null
  for (const part of signatureHeader.split(',')) {
    const eqIdx = part.indexOf('=')
    if (eqIdx === -1) continue
    const k = part.slice(0, eqIdx).trim()
    const v = part.slice(eqIdx + 1).trim()
    if (k === 'signature') {
      parsedSignature = v.replace(/^"|"$/g, '') || null
    }
  }

  if (!parsedSignature) {
    return { ok: false, reason: 'malformed-signature' }
  }

  // 3. Verify HMAC-SHA384
  const stringToSign = `content-type: ${contentType}\ndigest: ${digestHeader}`
  const expectedSig = crypto
    .createHmac('sha384', appSecret)
    .update(stringToSign, 'utf8')
    .digest('base64url')

  try {
    if (!crypto.timingSafeEqual(Buffer.from(parsedSignature), Buffer.from(expectedSig))) {
      return { ok: false, reason: 'bad-signature' }
    }
  } catch {
    // Buffer length mismatch → definitely invalid
    return { ok: false, reason: 'bad-signature' }
  }

  return { ok: true }
}
