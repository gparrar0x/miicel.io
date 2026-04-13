/**
 * InstagramService — Instagram Graph API v22 via fetch().
 * Endpoints: https://graph.instagram.com/v22.0/
 *
 * Env vars:
 *   INSTAGRAM_ACCESS_TOKEN  — Meta access token (instagram_content_publish scope)
 *   INSTAGRAM_ACCOUNT_ID    — Instagram Business/Creator account ID (numeric string)
 */

import { AppError } from '@skywalking/core/errors'

const IG_BASE = 'https://graph.instagram.com/v22.0'
const POLL_INTERVAL_MS = 5_000
const POLL_MAX_ATTEMPTS = 24 // 2 min max

export interface MediaItem {
  type: 'IMAGE' | 'VIDEO'
  url: string
}

export interface IgPublishResult {
  ig_media_id: string
  ig_permalink?: string
}

export interface IgMediaInsights {
  reach: number
  likes: number
  comments: number
  shares: number
  saves: number
  impressions: number
  video_views: number
}

// --- Config ---

function getConfig(): { token: string; accountId: string } {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID
  if (!token) throw new AppError('INSTAGRAM_ACCESS_TOKEN not configured', 500)
  if (!accountId) throw new AppError('INSTAGRAM_ACCOUNT_ID not configured', 500)
  return { token, accountId }
}

// --- HTTP primitives ---

async function igGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const { token } = getConfig()
  const qs = new URLSearchParams({ ...params, access_token: token })
  const res = await fetch(`${IG_BASE}/${path}?${qs}`, {
    signal: AbortSignal.timeout(30_000),
  })
  const body = await res.json()
  if (!res.ok) {
    const msg = body?.error?.message ?? `HTTP ${res.status}`
    throw new AppError(`IG API error: ${msg}`, res.status >= 500 ? 502 : 400)
  }
  return body as T
}

async function igPost<T>(
  path: string,
  params: Record<string, string> = {},
  data?: Record<string, string>,
): Promise<T> {
  const { token } = getConfig()
  const qs = new URLSearchParams({ ...params, access_token: token })
  const res = await fetch(`${IG_BASE}/${path}?${qs}`, {
    method: 'POST',
    headers: data ? { 'Content-Type': 'application/json' } : {},
    body: data ? JSON.stringify(data) : undefined,
    signal: AbortSignal.timeout(30_000),
  })
  const body = await res.json()
  if (!res.ok) {
    const msg = body?.error?.message ?? `HTTP ${res.status}`
    throw new AppError(`IG API error: ${msg}`, res.status >= 500 ? 502 : 400)
  }
  return body as T
}

// --- Container polling ---

async function pollContainer(containerId: string): Promise<void> {
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
    const { status_code } = await igGet<{ status_code: string }>(containerId, {
      fields: 'status_code',
    })
    if (status_code === 'FINISHED') return
    if (status_code === 'ERROR') {
      throw new AppError('IG container processing failed (status_code=ERROR)', 502)
    }
  }
  throw new AppError('IG container processing timeout (2 min)', 504)
}

// --- Permalink fetch ---

async function fetchPermalink(mediaId: string): Promise<string | undefined> {
  try {
    const { permalink } = await igGet<{ permalink?: string }>(mediaId, { fields: 'permalink' })
    return permalink
  } catch {
    return undefined
  }
}

// --- Publish methods ---

export class InstagramService {
  /**
   * Publish a single photo post.
   */
  async publishPhoto(imageUrl: string, caption?: string): Promise<IgPublishResult> {
    const { accountId } = getConfig()

    const containerParams: Record<string, string> = { image_url: imageUrl }
    if (caption) containerParams.caption = caption

    const { id: containerId } = await igPost<{ id: string }>(`${accountId}/media`, containerParams)

    // Photos process fast but wait briefly
    await new Promise((r) => setTimeout(r, 2_000))

    const { id: mediaId } = await igPost<{ id: string }>(`${accountId}/media_publish`, {
      creation_id: containerId,
    })

    const permalink = await fetchPermalink(mediaId)
    return { ig_media_id: mediaId, ig_permalink: permalink }
  }

  /**
   * Publish a Reel (video). Polls for processing completion.
   */
  async publishReel(videoUrl: string, caption?: string): Promise<IgPublishResult> {
    const { accountId } = getConfig()

    const containerParams: Record<string, string> = {
      video_url: videoUrl,
      media_type: 'REELS',
    }
    if (caption) containerParams.caption = caption

    const { id: containerId } = await igPost<{ id: string }>(`${accountId}/media`, containerParams)

    await pollContainer(containerId)

    const { id: mediaId } = await igPost<{ id: string }>(`${accountId}/media_publish`, {
      creation_id: containerId,
    })

    const permalink = await fetchPermalink(mediaId)
    return { ig_media_id: mediaId, ig_permalink: permalink }
  }

  /**
   * Publish a carousel (2–10 items, images and/or videos).
   */
  async publishCarousel(items: MediaItem[], caption?: string): Promise<IgPublishResult> {
    const { accountId } = getConfig()

    if (items.length < 2 || items.length > 10) {
      throw new AppError('Carousel requires 2–10 items', 400)
    }

    // Step 1: create child containers
    const childIds: string[] = []
    for (const item of items) {
      const params: Record<string, string> = { is_carousel_item: 'true' }
      if (item.type === 'IMAGE') {
        params.image_url = item.url
      } else {
        params.video_url = item.url
        params.media_type = 'VIDEO'
      }
      const { id } = await igPost<{ id: string }>(`${accountId}/media`, params)
      childIds.push(id)
    }

    // Step 2: create carousel container
    const carouselParams: Record<string, string> = {
      media_type: 'CAROUSEL',
      children: childIds.join(','),
    }
    if (caption) carouselParams.caption = caption

    const { id: containerId } = await igPost<{ id: string }>(`${accountId}/media`, carouselParams)

    await new Promise((r) => setTimeout(r, 3_000))

    // Step 3: publish
    const { id: mediaId } = await igPost<{ id: string }>(`${accountId}/media_publish`, {
      creation_id: containerId,
    })

    const permalink = await fetchPermalink(mediaId)
    return { ig_media_id: mediaId, ig_permalink: permalink }
  }

  /**
   * Fetch per-media insights. Returns zeroes for metrics not available (e.g. video_views on photos).
   */
  async getMediaInsights(igMediaId: string): Promise<IgMediaInsights> {
    type InsightValue = { name: string; values?: { value: number }[]; value?: number }
    const { data } = await igGet<{ data: InsightValue[] }>(`${igMediaId}/insights`, {
      metric: 'reach,likes,comments,shares,saved,impressions,video_views',
    })

    const get = (name: string): number => {
      const entry = data.find((d) => d.name === name)
      if (!entry) return 0
      // v22 returns {value: N} directly for most metrics
      if (typeof entry.value === 'number') return entry.value
      // Some metrics use {values: [{value: N}]}
      return entry.values?.[0]?.value ?? 0
    }

    return {
      reach: get('reach'),
      likes: get('likes'),
      comments: get('comments'),
      shares: get('shares'),
      saves: get('saved'),
      impressions: get('impressions'),
      video_views: get('video_views'),
    }
  }
}
