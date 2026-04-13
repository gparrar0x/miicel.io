import { z } from 'zod'

// POST /api/content/generate
export const generateRequestSchema = z.object({
  tenant_id: z.number().int().positive(),
  product_id: z.number().int().positive(),
  prompt: z.string().min(1, 'Prompt is required').max(2000),
  aspect_ratio: z.enum(['1:1', '16:9', '9:16', '4:3', '3:4']).optional(),
  quality: z.enum(['low', 'medium', 'high']).optional(),
  image_count: z.number().int().min(1).max(4).optional(),
  generate_video: z.boolean().optional(),
  extract_reels: z.boolean().optional(),
})

export type GenerateRequest = z.infer<typeof generateRequestSchema>

// GET /api/content/jobs/[id]
export const jobStatusResponseSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.number().int(),
  product_id: z.number().int(),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']),
  provider: z.string(),
  prompt: z.string(),
  error: z.string().nullable(),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  created_at: z.string(),
  assets: z.array(
    z.object({
      id: z.string().uuid(),
      asset_type: z.enum(['image', 'video', 'reel']),
      public_url: z.string().nullable(),
      mime_type: z.string(),
      size_bytes: z.number().nullable(),
      duration_ms: z.number().nullable(),
      created_at: z.string(),
    }),
  ),
})

export type JobStatusResponse = z.infer<typeof jobStatusResponseSchema>

// GET /api/content/history
export const historyResponseSchema = z.object({
  generations: z.array(
    z.object({
      id: z.string().uuid(),
      product_id: z.number().int(),
      status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']),
      provider: z.string(),
      prompt: z.string(),
      created_at: z.string(),
      asset_count: z.number().int(),
    }),
  ),
  total: z.number().int(),
})

export type HistoryResponse = z.infer<typeof historyResponseSchema>

// GET /api/content/usage
export const usageResponseSchema = z.object({
  tenant_id: z.number().int(),
  period_start: z.string(),
  images_used: z.number().int(),
  videos_used: z.number().int(),
  images_limit: z.number().int().nullable(), // null = unlimited
  videos_limit: z.number().int().nullable(),
  plan: z.enum(['free', 'pro', 'enterprise']),
})

export type UsageResponse = z.infer<typeof usageResponseSchema>
