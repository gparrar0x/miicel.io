/**
 * Feature Flag API
 * GET /api/flags?key=flag_name&tenantId=1&userId=xxx
 *
 * Returns: { enabled: boolean, flag?: FeatureFlag }
 */

import { NextRequest, NextResponse } from 'next/server'
import { isEnabled, getFlag } from '@/lib/flags'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const key = searchParams.get('key')
  const tenantId = searchParams.get('tenantId')
  const userId = searchParams.get('userId')

  if (!key) {
    return NextResponse.json(
      { error: 'Missing required parameter: key' },
      { status: 400 }
    )
  }

  const context = {
    tenantId: tenantId ? parseInt(tenantId, 10) : undefined,
    userId: userId ?? undefined,
  }

  const enabled = await isEnabled(key, context)
  const flag = await getFlag(key)

  return NextResponse.json({
    enabled,
    flag: flag
      ? {
          key: flag.key,
          description: flag.description,
        }
      : null,
  })
}
