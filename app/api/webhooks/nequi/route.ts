/**
 * POST /api/webhooks/nequi — Nequi Conecta push payment webhook.
 *
 * Per-tenant signature model (SKY-279):
 *   Each merchant has their own Nequi Conecta account with its own app_secret.
 *   We parse the body first to extract commerceCode, look up the tenant,
 *   decrypt that tenant's app_secret, then verify the HMAC-SHA384 signature.
 *
 * Flow:
 *   1. Rate limit
 *   2. Read raw body as text (required for HMAC)
 *   3. Parse JSON → extract commerceCode → 400 if missing
 *   4. Lookup tenant by commerceCode → 404 if not found
 *   5. Decrypt tenant app_secret
 *   6. Verify Digest header (SHA-256 of raw body)
 *   7. Verify Signature header (HMAC-SHA384 with tenant secret) → 401 on mismatch
 *   8. Process order update
 *
 * Security:
 *   - Rate limit (light tier, 20 req/10 s)
 *   - Digest: SHA-256=${base64(sha256(raw_body))}
 *   - Signature: HMAC-SHA384 base64url, constant-time compare
 *   - 401 only on security failures; 200 on internal errors (prevents retry storms)
 *   - 400 on missing/malformed mandatory fields
 *   - 404 on unknown commerceCode (log warning)
 */

import * as crypto from 'node:crypto'
import { decryptToken } from '@/lib/encryption'
import { getClientIp, rateLimitExceededResponse, ratelimitLight } from '@/lib/rate-limit'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { TenantRepo } from '@/services/repositories/tenant.repo'
import { mapWebhookPaymentStatus } from '@/services/nequi/status-mapper'

export async function POST(request: Request) {
  // 1. Rate limit
  const ip = getClientIp(request)
  const { success, limit, remaining, reset } = await ratelimitLight.limit(ip)
  if (!success) {
    return rateLimitExceededResponse(limit, remaining, reset)
  }

  // 2. Read raw body as text — critical for HMAC verification
  const rawBody = await request.text()

  // 3. Parse JSON and extract commerceCode
  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    console.error('[nequi-webhook] Failed to parse JSON body')
    return new Response('Malformed JSON', { status: 400 })
  }

  const commerceCode = payload.commerceCode as string | undefined
  if (!commerceCode) {
    console.error('[nequi-webhook] Missing commerceCode in payload')
    return new Response('Missing commerceCode', { status: 400 })
  }

  // 4. Lookup tenant by commerceCode
  const supabase = createServiceRoleClient()
  const tenantRepo = new TenantRepo(supabase)

  let tenant: Awaited<ReturnType<typeof tenantRepo.findByNequiCommerceCode>>
  try {
    tenant = await tenantRepo.findByNequiCommerceCode(commerceCode)
  } catch (err) {
    console.error('[nequi-webhook] DB error during tenant lookup:', err)
    return new Response('OK', { status: 200 })
  }

  if (!tenant) {
    console.warn('[nequi-webhook] Unknown commerceCode:', commerceCode)
    return new Response('Tenant not found', { status: 404 })
  }

  // 5. Decrypt tenant app_secret
  const nequiConfig = tenant.secure_config?.nequi
  if (!nequiConfig?.app_secret) {
    console.error('[nequi-webhook] Tenant has no app_secret configured, tenantId:', tenant.id)
    return new Response('OK', { status: 200 })
  }

  let appSecret: string
  try {
    appSecret = decryptToken(nequiConfig.app_secret)
  } catch (err) {
    console.error('[nequi-webhook] Failed to decrypt app_secret for tenantId:', tenant.id, err)
    return new Response('OK', { status: 200 })
  }

  // 6. Verify Digest header: SHA-256=${base64(sha256(rawBody))}
  const digestHeader = request.headers.get('Digest') ?? request.headers.get('digest')
  if (!digestHeader) {
    console.error('[nequi-webhook] Missing Digest header')
    return new Response('Missing Digest header', { status: 401 })
  }

  const expectedDigest = `SHA-256=${crypto
    .createHash('sha256')
    .update(rawBody, 'utf8')
    .digest('base64')}`

  try {
    if (!crypto.timingSafeEqual(Buffer.from(digestHeader), Buffer.from(expectedDigest))) {
      console.error('[nequi-webhook] Digest mismatch, tenantId:', tenant.id)
      return new Response('Invalid digest', { status: 401 })
    }
  } catch {
    console.error('[nequi-webhook] Digest buffer length mismatch')
    return new Response('Invalid digest', { status: 401 })
  }

  // 7. Verify Signature header (HMAC-SHA384 with tenant app_secret)
  const signatureHeader = request.headers.get('Signature') ?? request.headers.get('signature')
  if (!signatureHeader) {
    console.error('[nequi-webhook] Missing Signature header')
    return new Response('Missing Signature header', { status: 401 })
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
    .createHmac('sha384', appSecret)
    .update(stringToSign, 'utf8')
    .digest('base64url')

  try {
    if (!crypto.timingSafeEqual(Buffer.from(parsedSignature), Buffer.from(expectedSig))) {
      console.error('[nequi-webhook] Signature mismatch, tenantId:', tenant.id)
      return new Response('Invalid signature', { status: 401 })
    }
  } catch {
    // Buffer length mismatch → definitely invalid
    console.error('[nequi-webhook] Signature buffer length mismatch')
    return new Response('Invalid signature', { status: 401 })
  }

  // 8. Extract fields and process order
  const messageId = payload.messageId as string | undefined
  const transactionId = payload.transactionId as string | undefined
  const rawStatus = payload.paymentStatus as string | undefined

  if (!messageId || !transactionId || !rawStatus) {
    console.error('[nequi-webhook] Missing required fields', {
      messageId,
      transactionId,
      rawStatus,
      tenantId: tenant.id,
    })
    // Missing fields — return 200 so Nequi doesn't retry forever
    return new Response('OK', { status: 200 })
  }

  const orderId = parseInt(messageId, 10)
  if (Number.isNaN(orderId)) {
    console.error('[nequi-webhook] Invalid orderId in messageId:', messageId)
    return new Response('OK', { status: 200 })
  }

  const mapped = mapWebhookPaymentStatus(rawStatus as 'SUCCESS' | 'CANCELED' | 'DENIED')

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

  return new Response('OK', { status: 200 })
}
