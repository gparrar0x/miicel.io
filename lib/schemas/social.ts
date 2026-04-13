import { z } from 'zod'

// --- Enums ---

export const mediaTypeSchema = z.enum(['IMAGE', 'VIDEO', 'CAROUSEL', 'REELS'])
export const postStatusSchema = z.enum([
  'draft',
  'scheduled',
  'publishing',
  'published',
  'failed',
  'cancelled',
])

// --- Media item (for carousels) ---

export const mediaItemSchema = z.object({
  type: z.enum(['IMAGE', 'VIDEO']),
  url: z.string().url('Media URL must be a valid URL'),
})

// --- POST /api/social/publish ---

export const publishRequestSchema = z.object({
  tenant_id: z.number().int().positive(),
  media_type: mediaTypeSchema,
  caption: z.string().max(2200, 'Caption max 2200 chars').optional(),
  media_urls: z
    .array(mediaItemSchema)
    .min(1, 'At least one media item required')
    .max(10, 'Max 10 items in a carousel'),
  scheduled_at: z.string().datetime({ message: 'scheduled_at must be ISO 8601' }).optional(),
  generation_id: z.string().uuid().optional(),
})

export type PublishRequest = z.infer<typeof publishRequestSchema>

// --- PATCH /api/social/posts/[id] ---

export const editPostSchema = z.object({
  caption: z.string().max(2200).optional(),
  scheduled_at: z.string().datetime().nullable().optional(),
  media_urls: z.array(mediaItemSchema).min(1).max(10).optional(),
})

export type EditPostInput = z.infer<typeof editPostSchema>

// --- Response shapes ---

export const postResponseSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.number().int(),
  generation_id: z.string().uuid().nullable(),
  status: postStatusSchema,
  media_type: mediaTypeSchema,
  caption: z.string().nullable(),
  media_urls: z.array(mediaItemSchema),
  ig_media_id: z.string().nullable(),
  ig_permalink: z.string().nullable(),
  scheduled_at: z.string().nullable(),
  published_at: z.string().nullable(),
  error: z.string().nullable(),
  publish_attempts: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type PostResponse = z.infer<typeof postResponseSchema>

// --- GET /api/social/posts (query params) ---

export const listPostsQuerySchema = z.object({
  tenant_id: z.coerce.number().int().positive(),
  status: postStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
})

export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>

// --- GET /api/social/insights/summary ---

export const insightsSummarySchema = z.object({
  tenant_id: z.number().int(),
  period_days: z.number().int(),
  total_posts: z.number().int(),
  total_reach: z.number().int(),
  total_likes: z.number().int(),
  total_comments: z.number().int(),
  total_shares: z.number().int(),
  total_saves: z.number().int(),
  total_impressions: z.number().int(),
  avg_engagement_rate: z.number(),
  top_post_id: z.string().uuid().nullable(),
  top_post_reach: z.number().int(),
})

export type InsightsSummary = z.infer<typeof insightsSummarySchema>

// --- GET /api/social/insights/summary (query params) ---

export const insightsSummaryQuerySchema = z.object({
  tenant_id: z.coerce.number().int().positive(),
  period_days: z.coerce.number().int().min(1).max(90).optional().default(30),
})

export type InsightsSummaryQuery = z.infer<typeof insightsSummaryQuerySchema>
