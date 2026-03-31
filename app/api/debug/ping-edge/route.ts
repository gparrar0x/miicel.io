import { NextResponse } from 'next/server'

export const runtime = 'edge'

/** Edge runtime endpoint for comparison */
export async function GET() {
  return NextResponse.json({ ping: 'pong', runtime: 'edge', ts: Date.now() })
}
