/**
 * GET /api/orders/[id]/nequi-status
 *
 * Poll Nequi transaction status for a pending order.
 * Public endpoint — buyer does not have a session.
 *
 * Auth: order token (x-order-token header) set during checkout creation.
 *   - The token is the order's checkout_id (Nequi transactionId) which is
 *     only returned to the client at checkout creation time and is not
 *     guessable (opaque Nequi ID). This prevents probing other orders.
 *
 * Flow:
 *   1. Parse orderId
 *   2. Fetch order + tenant (single join query via service role)
 *   3. Validate order token (x-order-token == order.checkout_id)
 *   4. If already terminal → return DB state (no Nequi call)
 *   5. Else → decrypt creds → NequiClient.getPaymentStatus()
 *   6. If terminal status returned → update order in DB
 *   7. Return contracted shape
 *
 * Response 200:
 * {
 *   status: 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled'
 *   raw_status_code?: string
 *   message?: string
 *   updated_at: string  // ISO
 * }
 */

import * as crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { decryptToken } from '@/lib/encryption'
import { getClientIp, rateLimitExceededResponse, ratelimitLight } from '@/lib/rate-limit'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { NequiClient } from '@/services/nequi/nequi.client'
import type { NequiSecureConfig } from '@/services/repositories/tenant.repo'

const TERMINAL_STATUSES = new Set(['paid', 'failed', 'expired', 'cancelled'])

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Rate limit
  const ip = getClientIp(request)
  const { success, limit, remaining, reset } = await ratelimitLight.limit(ip)
  if (!success) {
    return rateLimitExceededResponse(limit, remaining, reset)
  }

  const { id } = await params
  const orderId = parseInt(id, 10)

  if (Number.isNaN(orderId) || orderId <= 0) {
    return NextResponse.json({ error: 'ID de orden inválido' }, { status: 400 })
  }

  // Order token validation — prevents probing other orders
  const orderToken = request.headers.get('x-order-token')
  if (!orderToken) {
    return NextResponse.json({ error: 'Token de orden requerido' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()

  // Fetch order with tenant join in one query
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(
      'id, status, checkout_id, payment_method, updated_at, tenant_id, tenants!inner(id, secure_config)',
    )
    .eq('id', orderId)
    .eq('payment_method', 'nequi')
    .maybeSingle()

  if (orderError) {
    console.error('[nequi-status] DB error:', orderError)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }

  if (!order) {
    return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
  }

  // Validate order token == checkout_id (constant-time)
  const transactionId = order.checkout_id
  if (!transactionId) {
    return NextResponse.json({ error: 'Orden sin transacción Nequi asociada' }, { status: 422 })
  }

  try {
    if (!crypto.timingSafeEqual(Buffer.from(orderToken), Buffer.from(transactionId))) {
      return NextResponse.json({ error: 'Token de orden inválido' }, { status: 401 })
    }
  } catch {
    // Buffer length mismatch → different strings
    return NextResponse.json({ error: 'Token de orden inválido' }, { status: 401 })
  }

  // If already terminal, return DB state — don't hit Nequi
  const currentStatus = order.status as string
  if (TERMINAL_STATUSES.has(currentStatus)) {
    return NextResponse.json({
      status: currentStatus,
      updated_at: order.updated_at,
    })
  }

  // Decrypt Nequi credentials from tenant secure_config
  const tenantRow = Array.isArray(order.tenants) ? order.tenants[0] : order.tenants
  const secureConfig = (tenantRow as { secure_config?: { nequi?: NequiSecureConfig } } | null)
    ?.secure_config
  const nequiCreds = secureConfig?.nequi

  if (!nequiCreds) {
    return NextResponse.json({ error: 'Nequi no configurado para esta tienda' }, { status: 422 })
  }

  let clientId: string
  let apiKey: string
  let appSecret: string

  try {
    clientId = decryptToken(nequiCreds.client_id)
    apiKey = decryptToken(nequiCreds.api_key)
    appSecret = decryptToken(nequiCreds.app_secret)
  } catch {
    console.error('[nequi-status] Failed to decrypt credentials')
    return NextResponse.json({ error: 'Error interno de configuración' }, { status: 500 })
  }

  const client = new NequiClient({
    clientId,
    apiKey,
    appSecret,
    phoneNumber: nequiCreds.phone_number,
    commerceCode: nequiCreds.commerce_code ?? '',
  })

  let nequiStatus: Awaited<ReturnType<NequiClient['getPaymentStatus']>>

  try {
    nequiStatus = await client.getPaymentStatus(transactionId)
  } catch (err: unknown) {
    console.error('[nequi-status] Nequi API error:', err)
    return NextResponse.json({ error: 'Error al consultar Nequi' }, { status: 502 })
  }

  const now = new Date().toISOString()

  // Persist terminal status to DB
  if (TERMINAL_STATUSES.has(nequiStatus.status)) {
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: nequiStatus.status,
        updated_at: now,
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('[nequi-status] Failed to update order status:', updateError)
      // Non-fatal — return the status anyway
    }
  }

  return NextResponse.json({
    status: nequiStatus.status,
    ...(nequiStatus.rawCode ? { raw_status_code: nequiStatus.rawCode } : {}),
    ...(nequiStatus.message ? { message: nequiStatus.message } : {}),
    updated_at: now,
  })
}
