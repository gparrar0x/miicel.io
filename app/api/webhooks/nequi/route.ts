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
 *   3. Validate Digest + Signature headers present — 401 if missing (no DB query)
 *   4. Parse + validate JSON payload via Zod → extract commerceCode → 400 if invalid
 *   5. Lookup tenant by commerceCode → 404 if not found
 *   6. Decrypt tenant app_secret
 *   7. Verify Digest header (SHA-256 of raw body)
 *   8. Verify Signature header (HMAC-SHA384 with tenant secret) → 401 on mismatch
 *   9. Process order update (scoped to tenant_id to prevent cross-tenant writes)
 *
 * Security:
 *   - Rate limit (light tier, 20 req/10 s)
 *   - Digest: SHA-256=${base64(sha256(raw_body))}
 *   - Signature: HMAC-SHA384 base64url, constant-time compare
 *   - 401 only on security failures; 200 on internal errors (prevents retry storms)
 *   - 400 on missing/malformed mandatory fields
 *   - 404 on unknown commerceCode (log warning)
 */

import { decryptToken } from '@/lib/encryption'
import { getClientIp, rateLimitExceededResponse, ratelimitLight } from '@/lib/rate-limit'
import { nequiWebhookPayloadSchema } from '@/lib/schemas/nequi.schema'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { TenantRepo } from '@/services/repositories/tenant.repo'
import { mapWebhookPaymentStatus } from '@/services/nequi/status-mapper'
import { verifyNequiWebhook } from '@/services/nequi/webhook-signature'

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const { success, limit, remaining, reset } = await ratelimitLight.limit(ip)
  if (!success) {
    return rateLimitExceededResponse(limit, remaining, reset)
  }

  /** raw body required for signature verification */
  const rawBody = await request.text()

  // Validate header presence before DB lookup — avoids a wasted round-trip on malformed callers
  const digestHeader = request.headers.get('Digest') ?? request.headers.get('digest')
  const signatureHeader = request.headers.get('Signature') ?? request.headers.get('signature')

  if (!digestHeader) {
    console.error('[nequi-webhook] Missing Digest header')
    return new Response('Missing Digest header', { status: 401 })
  }
  if (!signatureHeader) {
    console.error('[nequi-webhook] Missing Signature header')
    return new Response('Missing Signature header', { status: 401 })
  }

  let rawPayload: Record<string, unknown>
  try {
    rawPayload = JSON.parse(rawBody)
  } catch {
    console.error('[nequi-webhook] Failed to parse JSON body')
    return new Response('Malformed JSON', { status: 400 })
  }

  const parseResult = nequiWebhookPayloadSchema.safeParse(rawPayload)
  if (!parseResult.success) {
    console.error('[nequi-webhook] Invalid payload schema', parseResult.error.flatten())
    return new Response('Invalid payload', { status: 400 })
  }

  const payload = parseResult.data
  const { commerceCode } = payload

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

  let appSecret: string
  try {
    appSecret = decryptToken(tenant.secureConfig.nequi.app_secret)
  } catch (err) {
    console.error('[nequi-webhook] Failed to decrypt app_secret for tenantId:', tenant.id, err)
    return new Response('OK', { status: 200 })
  }

  const contentType = request.headers.get('content-type') ?? 'application/json'
  const verifyResult = verifyNequiWebhook({
    rawBody,
    digestHeader,
    signatureHeader,
    appSecret,
    contentType,
  })

  if (!verifyResult.ok) {
    console.error(
      '[nequi-webhook] Signature verification failed:',
      verifyResult.reason,
      'tenantId:',
      tenant.id,
    )
    if (verifyResult.reason === 'bad-digest') {
      return new Response('Invalid digest', { status: 401 })
    }
    return new Response('Invalid signature', { status: 401 })
  }

  const { messageId, transactionId, paymentStatus: rawStatus } = payload

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

  const mapped = mapWebhookPaymentStatus(rawStatus)

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: mapped,
      payment_id: transactionId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('nequi_transaction_id', transactionId)
    .eq('tenant_id', tenant.id)

  if (updateError) {
    // Log but return 200 — internal DB error shouldn't cause Nequi to retry
    console.error('[nequi-webhook] Failed to update order:', updateError)
    return new Response('OK', { status: 200 })
  }

  return new Response('OK', { status: 200 })
}
