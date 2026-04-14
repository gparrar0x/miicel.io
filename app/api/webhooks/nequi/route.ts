/**
 * POST /api/webhooks/nequi — Nequi Conecta push payment webhook.
 *
 * PLATFORM-LEVEL SECRET:
 *   NEQUI_WEBHOOK_SECRET is a single platform-wide env var used for signature
 *   verification. We verify the signature BEFORE parsing the body to look up
 *   the tenant — so per-tenant secrets are not feasible here. Register this
 *   endpoint in the Nequi Conecta portal as the global notification URL.
 *
 * Security:
 *   1. Rate limit (light tier, 20 req/10 s)
 *   2. Digest header: SHA-256=${base64(sha256(raw_body))}
 *   3. Signature header: HMAC-SHA384, constant-time compare
 *   4. Returns 200 always for non-security errors (prevents retry storms)
 *   5. Returns 401 only on invalid signature
 *   6. Returns 400 on malformed body (but still logs — avoid re-queues)
 */

import * as crypto from 'node:crypto'
import { getClientIp, rateLimitExceededResponse, ratelimitLight } from '@/lib/rate-limit'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { mapWebhookPaymentStatus } from '@/services/nequi/status-mapper'

export async function POST(request: Request) {
  // 1. Rate limit
  const ip = getClientIp(request)
  const { success, limit, remaining, reset } = await ratelimitLight.limit(ip)
  if (!success) {
    return rateLimitExceededResponse(limit, remaining, reset)
  }

  // 2. Read raw body as text — critical for digest verification
  const rawBody = await request.text()

  // 3. Verify Digest header: SHA-256=${base64(sha256(rawBody))}
  const digestHeader = request.headers.get('Digest') ?? request.headers.get('digest')
  if (!digestHeader) {
    console.error('[nequi-webhook] Missing Digest header')
    return new Response('Missing Digest header', { status: 401 })
  }

  const expectedDigest = `SHA-256=${crypto
    .createHash('sha256')
    .update(rawBody, 'utf8')
    .digest('base64')}`

  if (!crypto.timingSafeEqual(Buffer.from(digestHeader), Buffer.from(expectedDigest))) {
    console.error('[nequi-webhook] Digest mismatch')
    return new Response('Invalid digest', { status: 401 })
  }

  // 4. Verify Signature header (HMAC-SHA384)
  const signatureHeader = request.headers.get('Signature') ?? request.headers.get('signature')
  if (!signatureHeader) {
    console.error('[nequi-webhook] Missing Signature header')
    return new Response('Missing Signature header', { status: 401 })
  }

  const webhookSecret = process.env.NEQUI_WEBHOOK_SECRET
  if (!webhookSecret) {
    // Config error — don't expose detail, but don't reject either (could lock us out)
    console.error('[nequi-webhook] NEQUI_WEBHOOK_SECRET not configured')
    return new Response('OK', { status: 200 })
  }

  // Parse Signature: keyId="...", signature="..."
  let parsedSignature: string | null = null
  for (const part of signatureHeader.split(',')) {
    const [k, v] = part.trim().split('=')
    if (k === 'signature') {
      parsedSignature = v?.replace(/^"|"$/g, '') ?? null
    }
  }

  if (!parsedSignature) {
    console.error('[nequi-webhook] Cannot parse signature field')
    return new Response('Invalid Signature format', { status: 401 })
  }

  // stringToSign = "content-type: application/json\ndigest: {digestHeader}"
  const contentType = request.headers.get('content-type') ?? 'application/json'
  const stringToSign = `content-type: ${contentType}\ndigest: ${digestHeader}`

  const expectedSig = crypto
    .createHmac('sha384', webhookSecret)
    .update(stringToSign, 'utf8')
    .digest('base64url')

  try {
    if (!crypto.timingSafeEqual(Buffer.from(parsedSignature), Buffer.from(expectedSig))) {
      console.error('[nequi-webhook] Signature mismatch')
      return new Response('Invalid signature', { status: 401 })
    }
  } catch {
    // Buffer length mismatch → definitely invalid
    console.error('[nequi-webhook] Signature buffer length mismatch')
    return new Response('Invalid signature', { status: 401 })
  }

  // 5. Parse body
  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    console.error('[nequi-webhook] Failed to parse JSON body')
    // Malformed — return 400 but won't retry if 4xx
    return new Response('Malformed JSON', { status: 400 })
  }

  // 6. Extract fields
  // Nequi webhook shape: { messageId, transactionId, paymentStatus, ... }
  const messageId = payload.messageId as string | undefined
  const transactionId = payload.transactionId as string | undefined
  const rawStatus = payload.paymentStatus as string | undefined

  if (!messageId || !transactionId || !rawStatus) {
    console.error('[nequi-webhook] Missing required fields', {
      messageId,
      transactionId,
      rawStatus,
    })
    // Missing fields — return 200 so Nequi doesn't retry forever
    return new Response('OK', { status: 200 })
  }

  const orderId = parseInt(messageId, 10)
  if (Number.isNaN(orderId)) {
    console.error('[nequi-webhook] Invalid orderId in messageId:', messageId)
    return new Response('OK', { status: 200 })
  }

  // 7. Map status
  const mapped = mapWebhookPaymentStatus(rawStatus as 'SUCCESS' | 'CANCELED' | 'DENIED')

  // 8. Update order
  const supabase = createServiceRoleClient()

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: mapped,
      payment_id: transactionId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (updateError) {
    // Log but return 200 — internal DB error shouldn't cause Nequi to retry
    console.error('[nequi-webhook] Failed to update order:', updateError)
    return new Response('OK', { status: 200 })
  }

  // 9. Return 200 always (non-security path)
  return new Response('OK', { status: 200 })
}
