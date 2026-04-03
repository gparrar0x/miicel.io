import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const checks: Record<string, 'ok' | 'fail'> = {}
  const start = Date.now()

  // DB connectivity
  try {
    const supabase = createServiceRoleClient()
    const { error } = await supabase.from('tenants').select('id').limit(1)
    checks.database = error ? 'fail' : 'ok'
  } catch {
    checks.database = 'fail'
  }

  const healthy = Object.values(checks).every((v) => v === 'ok')

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      checks,
      latency_ms: Date.now() - start,
      timestamp: new Date().toISOString(),
      service: 'micelio',
    },
    { status: healthy ? 200 : 503 },
  )
}
