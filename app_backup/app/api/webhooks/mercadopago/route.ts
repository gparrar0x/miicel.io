/**
 * POST /api/webhooks/mercadopago - MercadoPago IPN Webhook
 *
 * SKY-4 T4: Handles payment notifications from MercadoPago
 * Validates HMAC-SHA256 signature and updates order status
 */

import * as crypto from 'node:crypto'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    // 1. Validate MP signature (x-signature header)
    const signature = request.headers.get('x-signature')
    const xRequestId = request.headers.get('x-request-id')

    if (!signature) {
      return new Response('Missing signature', { status: 400 })
    }

    // Read body as text for signature validation
    const body = await request.text()

    // Validate signature using webhook secret
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('MERCADOPAGO_WEBHOOK_SECRET not configured')
      return new Response('Server configuration error', { status: 500 })
    }

    // MP signature format: ts={timestamp},v1={hash}
    // Parse signature header
    const sigParts = signature.split(',')
    let ts: string | null = null
    let hash: string | null = null

    for (const part of sigParts) {
      const [key, value] = part.split('=')
      if (key === 'ts') ts = value
      if (key === 'v1') hash = value
    }

    if (!ts || !hash) {
      return new Response('Invalid signature format', { status: 403 })
    }

    // Construct signed payload: ts + request-id + body
    const signedPayload = `${ts}.${xRequestId}.${body}`

    // Calculate expected signature
    const expectedHash = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex')

    // Compare signatures (constant-time comparison)
    if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash))) {
      console.error('Invalid webhook signature')
      return new Response('Invalid signature', { status: 403 })
    }

    // 2. Parse notification
    const data = JSON.parse(body)

    // Handle payment notifications
    if (data.type === 'payment') {
      const paymentId = data.data.id

      if (!paymentId) {
        return new Response('Missing payment ID', { status: 400 })
      }

      // 3. Fetch payment details from MP API
      // Note: This uses a global MP token since we don't know which tenant yet
      const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
      if (!mpAccessToken) {
        console.error('MERCADOPAGO_ACCESS_TOKEN not configured')
        return new Response('Server configuration error', { status: 500 })
      }

      const mpClient = new MercadoPagoConfig({ accessToken: mpAccessToken })
      const payment = new Payment(mpClient)
      const paymentInfo = await payment.get({ id: paymentId })

      // 4. Extract orderId from external_reference
      if (!paymentInfo.external_reference) {
        console.error('Payment missing external_reference')
        return new Response('OK', { status: 200 })
      }

      const orderId = parseInt(paymentInfo.external_reference, 10)

      if (Number.isNaN(orderId)) {
        console.error('Invalid order ID in external_reference')
        return new Response('OK', { status: 200 })
      }

      // 5. Update order status based on payment status
      const supabase = createServiceRoleClient()

      let newStatus: string
      switch (paymentInfo.status) {
        case 'approved':
          newStatus = 'paid'
          break
        case 'rejected':
          newStatus = 'cancelled'
          break
        case 'pending':
        case 'in_process':
          newStatus = 'pending'
          break
        case 'cancelled':
        case 'refunded':
        case 'charged_back':
          newStatus = 'cancelled'
          break
        default:
          newStatus = 'pending'
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          payment_id: paymentId.toString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (updateError) {
        console.error('Error updating order:', updateError)
        return new Response('Database error', { status: 500 })
      }

      console.log(`Order ${orderId} updated to ${newStatus} (payment ${paymentId})`)
      return new Response('OK', { status: 200 })
    }

    // Ignore other notification types
    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Unexpected error in webhook handler:', error)
    return new Response('Internal error', { status: 500 })
  }
}
