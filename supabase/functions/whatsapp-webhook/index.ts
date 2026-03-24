import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface WhatsAppMessage {
  id: string
  from: string
  timestamp: string
  type: string
  text?: { body: string }
  image?: { id: string; mime_type: string; sha256: string; caption?: string }
  video?: { id: string; mime_type: string; sha256: string; caption?: string }
  audio?: { id: string; mime_type: string; sha256: string }
  document?: { id: string; mime_type: string; sha256: string; filename?: string }
  sticker?: { id: string; mime_type: string; sha256: string }
}

interface WhatsAppContact {
  wa_id: string
  profile?: { name: string }
}

interface WebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: WhatsAppMessage[]
        contacts?: WhatsAppContact[]
      }
    }>
  }>
}

function extractMediaUrl(msg: WhatsAppMessage): string | null {
  const mediaTypes = ['image', 'video', 'audio', 'document', 'sticker'] as const
  for (const t of mediaTypes) {
    const m = msg[t] as { id?: string } | undefined
    if (m?.id) return `media_id:${m.id}` // actual URL requires Graph API call; store media_id for now
  }
  return null
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)

  // GET — Meta webhook verification
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
      return new Response(challenge, { status: 200 })
    }
    return new Response('Forbidden', { status: 403 })
  }

  // POST — receive messages; ack immediately
  if (req.method === 'POST') {
    let payload: WebhookPayload
    try {
      payload = await req.json()
    } catch {
      return new Response('Bad Request', { status: 400 })
    }

    // Fire-and-forget — don't block Meta's 20s timeout
    EdgeRuntime.waitUntil(processMessages(payload))

    return new Response('OK', { status: 200 })
  }

  return new Response('Method Not Allowed', { status: 405 })
})

async function processMessages(payload: WebhookPayload): Promise<void> {
  const entries = payload.entry ?? []

  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      const value = change.value
      if (!value?.messages?.length) continue

      const contacts: Record<string, string> = {}
      for (const c of value.contacts ?? []) {
        contacts[c.wa_id] = c.profile?.name ?? ''
      }

      const rows = value.messages.map((msg) => ({
        wamid: msg.id,
        from_number: msg.from,
        from_name: contacts[msg.from] ?? null,
        message_type: msg.type,
        body: msg.text?.body ?? null,
        media_url: extractMediaUrl(msg),
        timestamp: new Date(parseInt(msg.timestamp, 10) * 1000).toISOString(),
        raw_payload: payload,
      }))

      const { error } = await supabase
        .from('whatsapp_messages')
        .upsert(rows, { onConflict: 'wamid', ignoreDuplicates: true })

      if (error) {
        console.error(JSON.stringify({ event: 'insert_error', error: error.message }))
      }
    }
  }
}
