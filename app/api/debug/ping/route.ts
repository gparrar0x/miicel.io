import { NextResponse } from 'next/server'

/** Minimal Node.js runtime endpoint — no imports beyond NextResponse */
export async function GET() {
  return NextResponse.json({ ping: 'pong', runtime: 'nodejs', ts: Date.now() })
}
