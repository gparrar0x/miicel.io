/**
 * SocialRepository — Supabase queries for ig_posts, ig_post_insights, ig_webhook_events.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { MediaItem } from '../instagram.service'

// --- Row types ---

export interface IgPostRow {
  id: string
  tenant_id: number
  generation_id: string | null
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled'
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'REELS'
  caption: string | null
  media_urls: MediaItem[]
  ig_media_id: string | null
  ig_permalink: string | null
  scheduled_at: string | null
  published_at: string | null
  error: string | null
  publish_attempts: number
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface IgPostInsightRow {
  id: string
  ig_post_id: string
  tenant_id: number
  reach: number
  likes: number
  comments: number
  shares: number
  saves: number
  impressions: number
  video_views: number
  fetched_at: string
  created_at: string
}

export interface IgWebhookEventRow {
  id: string
  tenant_id: number | null
  event_type: string
  object_type: string
  field: string
  ig_media_id: string | null
  payload: Record<string, unknown>
  processed: boolean
  received_at: string
  created_at: string
}

// --- Input types ---

export interface CreateIgPostInput {
  tenant_id: number
  generation_id?: string
  status: IgPostRow['status']
  media_type: IgPostRow['media_type']
  caption?: string
  media_urls: MediaItem[]
  scheduled_at?: string
}

export interface UpdateIgPostInput {
  status?: IgPostRow['status']
  ig_media_id?: string
  ig_permalink?: string
  scheduled_at?: string | null
  published_at?: string
  error?: string | null
  caption?: string
  media_urls?: MediaItem[]
  publish_attempts?: number
  metadata?: Record<string, unknown>
}

export interface CreateInsightInput {
  ig_post_id: string
  tenant_id: number
  reach: number
  likes: number
  comments: number
  shares: number
  saves: number
  impressions: number
  video_views?: number
}

export interface CreateWebhookEventInput {
  tenant_id?: number
  event_type: string
  object_type: string
  field: string
  ig_media_id?: string
  payload: Record<string, unknown>
}

// --- Interface ---

export interface ISocialRepo {
  // ig_posts
  createPost(input: CreateIgPostInput): Promise<IgPostRow>
  getPost(id: string): Promise<IgPostRow | null>
  updatePost(id: string, input: UpdateIgPostInput): Promise<IgPostRow>
  listPosts(
    tenantId: number,
    opts?: { status?: IgPostRow['status']; limit?: number; offset?: number },
  ): Promise<IgPostRow[]>
  getScheduledDue(now: string): Promise<IgPostRow[]>
  countPublishedLast24h(): Promise<number>
  // ig_post_insights
  createInsight(input: CreateInsightInput): Promise<IgPostInsightRow>
  getLatestInsight(igPostId: string): Promise<IgPostInsightRow | null>
  listInsightsByTenant(
    tenantId: number,
    opts?: { afterDate?: string; limit?: number },
  ): Promise<IgPostInsightRow[]>
  // ig_webhook_events
  createWebhookEvent(input: CreateWebhookEventInput): Promise<IgWebhookEventRow>
  markWebhookProcessed(id: string): Promise<void>
  listUnprocessedWebhooks(limit?: number): Promise<IgWebhookEventRow[]>
}

// --- Implementation ---

export class SocialRepo implements ISocialRepo {
  constructor(private readonly supabase: SupabaseClient) {}

  // ---- ig_posts ----

  async createPost(input: CreateIgPostInput): Promise<IgPostRow> {
    const { data, error } = await this.supabase
      .from('ig_posts')
      .insert({
        tenant_id: input.tenant_id,
        generation_id: input.generation_id ?? null,
        status: input.status,
        media_type: input.media_type,
        caption: input.caption ?? null,
        media_urls: input.media_urls,
        scheduled_at: input.scheduled_at ?? null,
      })
      .select()
      .single()

    if (error || !data) throw new Error(`Failed to create ig_post: ${error?.message ?? 'unknown'}`)
    return data as IgPostRow
  }

  async getPost(id: string): Promise<IgPostRow | null> {
    const { data, error } = await this.supabase
      .from('ig_posts')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`Failed to get ig_post: ${error.message}`)
    return (data as IgPostRow) ?? null
  }

  async updatePost(id: string, input: UpdateIgPostInput): Promise<IgPostRow> {
    const { data, error } = await this.supabase
      .from('ig_posts')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) throw new Error(`Failed to update ig_post: ${error?.message ?? 'unknown'}`)
    return data as IgPostRow
  }

  async listPosts(
    tenantId: number,
    opts: { status?: IgPostRow['status']; limit?: number; offset?: number } = {},
  ): Promise<IgPostRow[]> {
    let query = this.supabase
      .from('ig_posts')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(opts.limit ?? 50)

    if (opts.status) query = query.eq('status', opts.status)
    if (opts.offset) query = query.range(opts.offset, opts.offset + (opts.limit ?? 50) - 1)

    const { data, error } = await query
    if (error) throw new Error(`Failed to list ig_posts: ${error.message}`)
    return (data ?? []) as IgPostRow[]
  }

  async getScheduledDue(now: string): Promise<IgPostRow[]> {
    const { data, error } = await this.supabase
      .from('ig_posts')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(25) // respect IG 25/24h rate limit

    if (error) throw new Error(`Failed to get scheduled posts: ${error.message}`)
    return (data ?? []) as IgPostRow[]
  }

  async countPublishedLast24h(): Promise<number> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count, error } = await this.supabase
      .from('ig_posts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('published_at', since)

    if (error) throw new Error(`Failed to count published posts: ${error.message}`)
    return count ?? 0
  }

  // ---- ig_post_insights ----

  async createInsight(input: CreateInsightInput): Promise<IgPostInsightRow> {
    const { data, error } = await this.supabase
      .from('ig_post_insights')
      .insert({
        ig_post_id: input.ig_post_id,
        tenant_id: input.tenant_id,
        reach: input.reach,
        likes: input.likes,
        comments: input.comments,
        shares: input.shares,
        saves: input.saves,
        impressions: input.impressions,
        video_views: input.video_views ?? 0,
        fetched_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error || !data) throw new Error(`Failed to create insight: ${error?.message ?? 'unknown'}`)
    return data as IgPostInsightRow
  }

  async getLatestInsight(igPostId: string): Promise<IgPostInsightRow | null> {
    const { data, error } = await this.supabase
      .from('ig_post_insights')
      .select('*')
      .eq('ig_post_id', igPostId)
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw new Error(`Failed to get insight: ${error.message}`)
    return (data as IgPostInsightRow) ?? null
  }

  async listInsightsByTenant(
    tenantId: number,
    opts: { afterDate?: string; limit?: number } = {},
  ): Promise<IgPostInsightRow[]> {
    let query = this.supabase
      .from('ig_post_insights')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('fetched_at', { ascending: false })
      .limit(opts.limit ?? 100)

    if (opts.afterDate) query = query.gte('fetched_at', opts.afterDate)

    const { data, error } = await query
    if (error) throw new Error(`Failed to list insights: ${error.message}`)
    return (data ?? []) as IgPostInsightRow[]
  }

  // ---- ig_webhook_events ----

  async createWebhookEvent(input: CreateWebhookEventInput): Promise<IgWebhookEventRow> {
    const { data, error } = await this.supabase
      .from('ig_webhook_events')
      .insert({
        tenant_id: input.tenant_id ?? null,
        event_type: input.event_type,
        object_type: input.object_type,
        field: input.field,
        ig_media_id: input.ig_media_id ?? null,
        payload: input.payload,
        processed: false,
      })
      .select()
      .single()

    if (error || !data)
      throw new Error(`Failed to create webhook event: ${error?.message ?? 'unknown'}`)
    return data as IgWebhookEventRow
  }

  async markWebhookProcessed(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('ig_webhook_events')
      .update({ processed: true })
      .eq('id', id)

    if (error) throw new Error(`Failed to mark webhook processed: ${error.message}`)
  }

  async listUnprocessedWebhooks(limit = 50): Promise<IgWebhookEventRow[]> {
    const { data, error } = await this.supabase
      .from('ig_webhook_events')
      .select('*')
      .eq('processed', false)
      .order('received_at', { ascending: true })
      .limit(limit)

    if (error) throw new Error(`Failed to list unprocessed webhooks: ${error.message}`)
    return (data ?? []) as IgWebhookEventRow[]
  }
}
