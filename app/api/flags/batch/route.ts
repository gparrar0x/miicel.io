/**
 * Batch Feature Flags API
 * GET /api/flags/batch?keys=flag1&keys=flag2&tenantId=1
 *
 * Returns: { flags: { flag1: true, flag2: false } }
 */

import { NextRequest, NextResponse } from 'next/server'
import { isEnabled } from '@/lib/flags'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const keys = searchParams.getAll('keys')
  const tenantId = searchParams.get('tenantId')
  const userId = searchParams.get('userId')

  if (!keys.length) {
    return NextResponse.json(
      { error: 'Missing required parameter: keys' },
      { status: 400 }
    )
  }

  const context = {
    tenantId: tenantId ? parseInt(tenantId, 10) : undefined,
    userId: userId ?? undefined,
  }

  // Evaluate all flags in parallel
  const results = await Promise.all(
    keys.map(async (key) => ({
      key,
      enabled: await isEnabled(key, context),
    }))
  )

  const flags = results.reduce(
    (acc, { key, enabled }) => {
      acc[key] = enabled
      return acc
    },
    {} as Record<string, boolean>
  )

  return NextResponse.json({ flags })
}
