/**
 * GET /api/cron/social-publish — publish scheduled IG posts.
 * Runs every 5 minutes via Vercel cron. Protected by CRON_SECRET.
 */

import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { SocialService } from '@/services/social.service'
import { SocialRepo } from '@/services/repositories/social.repo'
import { InstagramService } from '@/services/instagram.service'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const service = new SocialService(new SocialRepo(supabase), new InstagramService())

  try {
    const result = await service.processScheduledPosts()

    return NextResponse.json({
      status: 'ok',
      processed: result.processed,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[cron/social-publish] error:', err)
    return NextResponse.json(
      {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
