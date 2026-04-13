/**
 * SocialService — business logic for Instagram publishing, scheduling, and insights.
 *
 * Rate limit guard: IG allows 25 posts per 24h per account.
 * MVP: single INSTAGRAM_ACCESS_TOKEN + INSTAGRAM_ACCOUNT_ID (not per-tenant).
 */

import { AppError } from '@skywalking/core/errors'
import { InstagramService } from './instagram.service'
import type { ISocialRepo, IgPostRow } from './repositories/social.repo'
import type { PublishRequest, EditPostInput, InsightsSummary } from '@/lib/schemas/social'

const IG_DAILY_LIMIT = 25

export class SocialService {
  constructor(
    private readonly repo: ISocialRepo,
    private readonly ig: InstagramService,
  ) {}

  // --- Public API ---

  async publishPost(input: PublishRequest): Promise<IgPostRow> {
    // Guard: rate limit
    const published24h = await this.repo.countPublishedLast24h()
    if (published24h >= IG_DAILY_LIMIT) {
      throw new AppError(`Instagram rate limit reached: ${IG_DAILY_LIMIT} posts per 24 hours`, 429)
    }

    // Create post record in publishing state
    const post = await this.repo.createPost({
      tenant_id: input.tenant_id,
      generation_id: input.generation_id,
      status: 'publishing',
      media_type: input.media_type,
      caption: input.caption,
      media_urls: input.media_urls,
    })

    // Attempt publish (async, non-blocking in handlers — callers decide)
    return this._doPublish(post)
  }

  async schedulePost(input: PublishRequest): Promise<IgPostRow> {
    if (!input.scheduled_at) {
      throw new AppError('scheduled_at is required for scheduling', 400)
    }

    const scheduledDate = new Date(input.scheduled_at)
    if (scheduledDate <= new Date()) {
      throw new AppError('scheduled_at must be in the future', 400)
    }

    return this.repo.createPost({
      tenant_id: input.tenant_id,
      generation_id: input.generation_id,
      status: 'scheduled',
      media_type: input.media_type,
      caption: input.caption,
      media_urls: input.media_urls,
      scheduled_at: input.scheduled_at,
    })
  }

  async cancelScheduled(id: string, tenantId: number): Promise<IgPostRow> {
    const post = await this._assertOwnership(id, tenantId)

    if (post.status !== 'scheduled') {
      throw new AppError('Only scheduled posts can be cancelled', 400)
    }

    return this.repo.updatePost(id, { status: 'cancelled' })
  }

  async editScheduled(id: string, tenantId: number, input: EditPostInput): Promise<IgPostRow> {
    const post = await this._assertOwnership(id, tenantId)

    if (post.status !== 'scheduled' && post.status !== 'draft') {
      throw new AppError('Only scheduled or draft posts can be edited', 400)
    }

    const update: Parameters<ISocialRepo['updatePost']>[1] = {}
    if (input.caption !== undefined) update.caption = input.caption
    if (input.scheduled_at !== undefined) update.scheduled_at = input.scheduled_at
    if (input.media_urls !== undefined) update.media_urls = input.media_urls

    return this.repo.updatePost(id, update)
  }

  async listPosts(
    tenantId: number,
    opts?: { status?: IgPostRow['status']; limit?: number; offset?: number },
  ): Promise<IgPostRow[]> {
    return this.repo.listPosts(tenantId, opts)
  }

  async getPost(id: string, tenantId: number): Promise<IgPostRow> {
    return this._assertOwnership(id, tenantId)
  }

  async getInsightsSummary(tenantId: number, periodDays: number): Promise<InsightsSummary> {
    const afterDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString()

    const insights = await this.repo.listInsightsByTenant(tenantId, { afterDate })
    const posts = await this.repo.listPosts(tenantId, { status: 'published', limit: 1000 })

    const totalPosts = posts.length
    const totals = insights.reduce(
      (acc, i) => ({
        reach: acc.reach + i.reach,
        likes: acc.likes + i.likes,
        comments: acc.comments + i.comments,
        shares: acc.shares + i.shares,
        saves: acc.saves + i.saves,
        impressions: acc.impressions + i.impressions,
      }),
      { reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, impressions: 0 },
    )

    // Engagement rate = (likes + comments + shares + saves) / reach * 100
    const engagementNumerator = totals.likes + totals.comments + totals.shares + totals.saves
    const avgEngagementRate = totals.reach > 0 ? (engagementNumerator / totals.reach) * 100 : 0

    // Top post by reach
    let topPostId: string | null = null
    let topPostReach = 0
    for (const i of insights) {
      if (i.reach > topPostReach) {
        topPostReach = i.reach
        topPostId = i.ig_post_id
      }
    }

    return {
      tenant_id: tenantId,
      period_days: periodDays,
      total_posts: totalPosts,
      total_reach: totals.reach,
      total_likes: totals.likes,
      total_comments: totals.comments,
      total_shares: totals.shares,
      total_saves: totals.saves,
      total_impressions: totals.impressions,
      avg_engagement_rate: Math.round(avgEngagementRate * 100) / 100,
      top_post_id: topPostId,
      top_post_reach: topPostReach,
    }
  }

  // --- Cron handlers ---

  /**
   * processScheduledPosts — called every 5 min by cron.
   * Publishes all posts where scheduled_at <= now and status = 'scheduled'.
   */
  async processScheduledPosts(): Promise<{ processed: number; failed: number }> {
    const due = await this.repo.getScheduledDue(new Date().toISOString())
    let processed = 0
    let failed = 0

    for (const post of due) {
      // Guard: check rate limit before each post
      const published24h = await this.repo.countPublishedLast24h()
      if (published24h >= IG_DAILY_LIMIT) {
        console.warn('[SocialService] IG daily limit reached, deferring remaining scheduled posts')
        break
      }

      try {
        await this.repo.updatePost(post.id, { status: 'publishing' })
        await this._doPublish(post)
        processed++
      } catch (err) {
        console.error(`[SocialService] Failed to publish scheduled post ${post.id}:`, err)
        failed++
      }
    }

    return { processed, failed }
  }

  /**
   * updateInsights — called every 6h by cron.
   * Fetches fresh insights for all published posts that have an ig_media_id.
   */
  async updateInsights(): Promise<{ updated: number; errors: number }> {
    // Get all published posts with ig_media_id across all tenants
    // Uses service role client context (called from cron, no RLS filter needed)
    const posts = await this.repo.listPosts(0 as unknown as number, {
      status: 'published',
      limit: 100,
    })
    // Note: listPosts with tenantId=0 won't match real tenants — cron uses service role
    // The actual cross-tenant query is done via createServiceRoleClient in the cron route.
    // This method is designed to be called with a service-role-backed repo instance.

    let updated = 0
    let errors = 0

    for (const post of posts) {
      if (!post.ig_media_id) continue

      try {
        const insights = await this.ig.getMediaInsights(post.ig_media_id)
        await this.repo.createInsight({
          ig_post_id: post.id,
          tenant_id: post.tenant_id,
          ...insights,
        })
        updated++
      } catch (err) {
        console.error(`[SocialService] Failed to fetch insights for post ${post.id}:`, err)
        errors++
      }
    }

    return { updated, errors }
  }

  // --- Private ---

  private async _assertOwnership(id: string, tenantId: number): Promise<IgPostRow> {
    const post = await this.repo.getPost(id)
    if (!post) throw new AppError('Post not found', 404)
    if (post.tenant_id !== tenantId) throw new AppError('Forbidden', 403)
    return post
  }

  private async _doPublish(post: IgPostRow): Promise<IgPostRow> {
    try {
      await this.repo.updatePost(post.id, {
        publish_attempts: post.publish_attempts + 1,
        error: null,
      })

      let result
      switch (post.media_type) {
        case 'IMAGE':
          result = await this.ig.publishPhoto(
            post.media_urls[0]?.url ?? '',
            post.caption ?? undefined,
          )
          break
        case 'REELS':
        case 'VIDEO':
          result = await this.ig.publishReel(
            post.media_urls[0]?.url ?? '',
            post.caption ?? undefined,
          )
          break
        case 'CAROUSEL':
          result = await this.ig.publishCarousel(post.media_urls, post.caption ?? undefined)
          break
        default:
          throw new AppError(`Unsupported media_type: ${post.media_type}`, 400)
      }

      return this.repo.updatePost(post.id, {
        status: 'published',
        ig_media_id: result.ig_media_id,
        ig_permalink: result.ig_permalink,
        published_at: new Date().toISOString(),
        error: null,
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      await this.repo.updatePost(post.id, {
        status: 'failed',
        error: errorMsg,
      })
      throw err
    }
  }
}
