/**
 * GET /api/cron/instagram-insights — refresh insights for all published posts.
 * Runs every 6 hours via Vercel cron. Protected by CRON_SECRET.
 * Uses service role: fetches across all tenants.
 */

import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { InstagramService } from '@/services/instagram.service'
import type { IgPostRow, IgPostInsightRow } from '@/services/repositories/social.repo'
import type { SupabaseClient } from '@supabase/supabase-js'

const BATCH_LIMIT = 100

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const ig = new InstagramService()

  try {
    const result = await refreshInsights(supabase, ig)

    return NextResponse.json({
      status: 'ok',
      updated: result.updated,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[cron/instagram-insights] error:', err)
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

async function refreshInsights(
  supabase: SupabaseClient,
  ig: InstagramService,
): Promise<{ updated: number; errors: number }> {
  // Fetch published posts with ig_media_id across all tenants (service role bypasses RLS)
  const { data: posts, error } = await supabase
    .from('ig_posts')
    .select('id, tenant_id, ig_media_id')
    .eq('status', 'published')
    .not('ig_media_id', 'is', null)
    .order('published_at', { ascending: false })
    .limit(BATCH_LIMIT)

  if (error) throw new Error(`Failed to fetch published posts: ${error.message}`)

  let updated = 0
  let errors = 0

  for (const post of posts ?? []) {
    if (!post.ig_media_id) continue

    try {
      const insights = await ig.getMediaInsights(post.ig_media_id as string)

      const { error: insertError } = await supabase.from('ig_post_insights').insert({
        ig_post_id: post.id as string,
        tenant_id: post.tenant_id as number,
        reach: insights.reach,
        likes: insights.likes,
        comments: insights.comments,
        shares: insights.shares,
        saves: insights.saves,
        impressions: insights.impressions,
        video_views: insights.video_views,
        fetched_at: new Date().toISOString(),
      })

      if (insertError) throw new Error(insertError.message)
      updated++
    } catch (err) {
      console.error(`[cron/instagram-insights] post ${post.id}:`, err)
      errors++
    }
  }

  return { updated, errors }
}
