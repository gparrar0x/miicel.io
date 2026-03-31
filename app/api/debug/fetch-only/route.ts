import { NextResponse } from 'next/server'

/** Node.js runtime — raw fetch to Supabase, zero library imports */
export async function GET() {
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const key = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

  if (!url || !key) {
    return NextResponse.json({ error: 'env missing', url: !!url, key: !!key }, { status: 500 })
  }

  try {
    const t0 = Date.now()
    const res = await fetch(`${url}/rest/v1/tenants?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(5000),
    })
    const data = await res.json()
    return NextResponse.json({
      ok: true,
      status: res.status,
      rows: data?.length,
      ms: Date.now() - t0,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
