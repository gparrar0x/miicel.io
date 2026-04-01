import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

/**
 * Diagnostic endpoint — isolate Supabase connection hang.
 * Tests each layer independently. DELETE after debugging.
 */
export async function GET(request: Request) {
  const results: Record<string, string> = {}
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL']!
  const anon = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!
  const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

  // Step 1: env vars present?
  results['env_url'] = url ? 'ok' : 'MISSING'
  results['env_anon'] = anon ? `ok (${anon.slice(0, 10)}...)` : 'MISSING'
  results['env_service'] = serviceKey ? 'ok' : 'MISSING'

  // Step 2: raw fetch to Supabase REST
  try {
    const t0 = Date.now()
    const res = await fetch(`${url}/rest/v1/tenants?select=id&limit=1`, {
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
      },
      signal: AbortSignal.timeout(5000),
    })
    results['raw_fetch'] = `${res.status} in ${Date.now() - t0}ms`
  } catch (e: any) {
    results['raw_fetch'] = `ERROR: ${e.message}`
  }

  // Step 3: @supabase/supabase-js direct client
  try {
    const t0 = Date.now()
    const client = createClient(url, anon)
    const { data, error } = await client.from('tenants').select('id').limit(1)
    results['supabase_js'] = error
      ? `ERROR: ${error.message} (${Date.now() - t0}ms)`
      : `ok, ${data?.length} rows (${Date.now() - t0}ms)`
  } catch (e: any) {
    results['supabase_js'] = `EXCEPTION: ${e.message}`
  }

  // Step 4: @supabase/ssr createServerClient with cookie from request
  try {
    const t0 = Date.now()
    const cookieHeader = request.headers.get('cookie') ?? ''
    const parsed = cookieHeader
      ? cookieHeader.split(';').map((p) => {
          const idx = p.indexOf('=')
          return idx === -1
            ? { name: p.trim(), value: '' }
            : { name: p.slice(0, idx).trim(), value: p.slice(idx + 1).trim() }
        })
      : []
    const client = createServerClient(url, anon, {
      cookies: {
        getAll: () => parsed,
        setAll: () => {},
      },
    })
    const { data, error } = await client.from('tenants').select('id').limit(1)
    results['ssr_client'] = error
      ? `ERROR: ${error.message} (${Date.now() - t0}ms)`
      : `ok, ${data?.length} rows (${Date.now() - t0}ms)`
  } catch (e: any) {
    results['ssr_client'] = `EXCEPTION: ${e.message}`
  }

  // Step 5: createClientFromRequest from our lib
  try {
    const t0 = Date.now()
    const { createClientFromRequest } = await import('@/lib/supabase/server')
    const client = createClientFromRequest(request)
    const { data, error } = await client.from('tenants').select('id').limit(1)
    results['lib_client'] = error
      ? `ERROR: ${error.message} (${Date.now() - t0}ms)`
      : `ok, ${data?.length} rows (${Date.now() - t0}ms)`
  } catch (e: any) {
    results['lib_client'] = `EXCEPTION: ${e.message}`
  }

  return NextResponse.json(results)
}
