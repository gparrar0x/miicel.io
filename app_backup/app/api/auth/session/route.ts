import { getServerSession } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const { session, error } = await getServerSession()

  if (error || !session) {
    return NextResponse.json({ session: null }, { status: 401 })
  }

  return NextResponse.json({ session })
}
