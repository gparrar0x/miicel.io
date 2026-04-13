/**
 * GET  /api/webhooks/instagram — Meta webhook challenge verification.
 * POST /api/webhooks/instagram — receive and store IG webhook events.
 *
 * Security:
 *   GET:  verify hub.verify_token matches INSTAGRAM_WEBHOOK_VERIFY_TOKEN env var.
 *   POST: verify X-Hub-Signature-256 HMAC (app secret = INSTAGRAM_APP_SECRET env var).
 *
 * Meta docs: https://developers.facebook.com/docs/graph-api/webhooks/getting-started
 */

import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createServiceRoleClient } from '@/lib/supabase/server'

// --- GET: challenge handshake ---

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode !== 'subscribe') {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
  }

  const expectedToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN
  if (!expectedToken) {
    console.error('[webhooks/instagram] INSTAGRAM_WEBHOOK_VERIFY_TOKEN not configured')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  if (token !== expectedToken) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Respond with the challenge as plain text (Meta requirement)
  return new Response(challenge ?? '', { status: 200, headers: { 'Content-Type': 'text/plain' } })
}

// --- POST: receive events ---

export async function POST(request: Request) {
  const rawBody = await request.text()

  // Verify signature
  const signature = request.headers.get('x-hub-signature-256')
  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Store events fire-and-forget — always return 200 to Meta to prevent retries
  storeEvents(payload).catch((err) => {
    console.error('[webhooks/instagram] store events error:', err)
  })

  return NextResponse.json({ status: 'ok' }, { status: 200 })
}

// --- Helpers ---

function verifySignature(body: string, signature: string | null): boolean {
  const appSecret = process.env.INSTAGRAM_APP_SECRET
  if (!appSecret) {
    console.warn(
      '[webhooks/instagram] INSTAGRAM_APP_SECRET not configured — skipping signature check',
    )
    return true // graceful degradation in dev; enforce in prod
  }

  if (!signature || !signature.startsWith('sha256=')) return false

  const expected = createHmac('sha256', appSecret).update(body).digest('hex')
  const received = signature.replace('sha256=', '')

  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received, 'hex'))
  } catch {
    return false
  }
}

type WebhookEntry = {
  id?: string
  changes?: Array<{ field: string; value: Record<string, unknown> }>
}

async function storeEvents(payload: Record<string, unknown>): Promise<void> {
  const supabase = createServiceRoleClient()
  const objectType = (payload.object as string) ?? 'unknown'
  const entries = (payload.entry as WebhookEntry[]) ?? []

  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      const igMediaId = (change.value?.media_id as string) ?? (change.value?.id as string) ?? null

      await supabase.from('ig_webhook_events').insert({
        event_type: change.field,
        object_type: objectType,
        field: change.field,
        ig_media_id: igMediaId,
        payload: change.value ?? {},
        processed: false,
        received_at: new Date().toISOString(),
      })
    }
  }
}
