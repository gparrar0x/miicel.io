import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

const SLACK_CHANNEL = 'C0AQNLALT2N' // #micelio-alerts
const PROD_URL = 'https://micelio.skyw.app'

export async function GET(request: Request) {
  // Verify cron secret (Vercel sets this header automatically)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const failures: string[] = []

  // Check 1: Database connectivity
  try {
    const supabase = createServiceRoleClient()
    const { error } = await supabase.from('tenants').select('id').limit(1)
    if (error) failures.push(`DB: ${error.message}`)
  } catch (err) {
    failures.push(`DB: ${err instanceof Error ? err.message : 'unreachable'}`)
  }

  // Check 2: Health endpoint responds (catches Lambda hangs)
  try {
    const res = await fetch(`${PROD_URL}/api/health`, {
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) failures.push(`Health endpoint: HTTP ${res.status}`)
    const body = await res.json()
    if (body.status !== 'ok') failures.push(`Health endpoint: status=${body.status}`)
  } catch (err) {
    failures.push(`Health endpoint: ${err instanceof Error ? err.message : 'timeout/unreachable'}`)
  }

  // Alert on failure
  if (failures.length > 0) {
    await alertSlack(failures)
  }

  return NextResponse.json({
    status: failures.length === 0 ? 'healthy' : 'alert_sent',
    failures,
    timestamp: new Date().toISOString(),
  })
}

async function alertSlack(failures: string[]) {
  const token = process.env.SLACK_BOT_TOKEN
  if (!token) return

  const failureList = failures.map((f) => `- ${f}`).join('\n')

  await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel: SLACK_CHANNEL,
      text: `ALERT: micelio production health check failed\n${failureList}`,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: ':rotating_light: Production Health Alert' },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Failures detected on micelio.skyw.app*\n\`\`\`\n${failureList}\n\`\`\``,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Action:* Rollback last deploy on <https://vercel.com|Vercel> first, then diagnose.',
          },
        },
      ],
    }),
  })
}
