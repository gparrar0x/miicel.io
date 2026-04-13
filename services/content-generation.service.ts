/**
 * ContentGenerationService — orchestrates image/video generation pipeline.
 * Flow: check limits → create job → generate images → (optional) video + reels
 *       → upload to Supabase Storage → update job status.
 *
 * Rate limits by plan (images/videos per calendar month):
 *   free:       10 images,  2 videos
 *   pro:       100 images, 20 videos
 *   enterprise:  ∞,         100 videos
 */

import { AppError } from '@skywalking/core/errors'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { ProviderRouter } from '@/lib/providers/provider-router'
import type { GenerateRequest } from '@/lib/schemas/content-generation'
import type { IContentGenerationRepo } from './repositories/content-generation.repo'
import type { ContentGenerationRow } from './repositories/content-generation.repo'

type Plan = 'free' | 'pro' | 'enterprise'

const LIMITS: Record<Plan, { images: number | null; videos: number | null }> = {
  free: { images: 10, videos: 2 },
  pro: { images: 100, videos: 20 },
  enterprise: { images: null, videos: 100 },
}

function currentPeriodStart(): string {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`
}

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new AppError('GEMINI_API_KEY not configured', 500)
  return key
}

// Tenant plan lookup — reads metadata.plan or defaults to 'free'
async function getTenantPlan(tenantId: number): Promise<Plan> {
  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('tenants')
    .select('metadata')
    .eq('id', tenantId)
    .maybeSingle()

  const plan = (data?.metadata as Record<string, unknown>)?.plan
  if (plan === 'pro' || plan === 'enterprise') return plan
  return 'free'
}

export class ContentGenerationService {
  constructor(private readonly repo: IContentGenerationRepo) {}

  async startGeneration(input: GenerateRequest): Promise<ContentGenerationRow> {
    const plan = await getTenantPlan(input.tenant_id)
    const limits = LIMITS[plan]
    const periodStart = currentPeriodStart()

    // Check limits
    const usage = await this.repo.getUsage(input.tenant_id, periodStart)
    const imagesUsed = usage?.images_used ?? 0
    const videosUsed = usage?.videos_used ?? 0
    const imageCount = input.image_count ?? 1

    if (limits.images !== null && imagesUsed + imageCount > limits.images) {
      throw new AppError(`Image limit reached for ${plan} plan (${limits.images}/month)`, 429)
    }

    if (input.generate_video && limits.videos !== null && videosUsed + 1 > limits.videos) {
      throw new AppError(`Video limit reached for ${plan} plan (${limits.videos}/month)`, 429)
    }

    const router = new ProviderRouter(getApiKey())
    const providerId = input.quality === 'high' ? 'gemini-imagen' : 'gemini-flash-image'

    const generation = await this.repo.createGeneration({
      tenant_id: input.tenant_id,
      product_id: input.product_id,
      provider: providerId,
      prompt: input.prompt,
      options: {
        aspect_ratio: input.aspect_ratio,
        quality: input.quality,
        image_count: imageCount,
        generate_video: input.generate_video,
        extract_reels: input.extract_reels,
      },
    })

    // Run async — do not await in request handler
    this._runPipeline(generation.id, input, router, periodStart, imageCount).catch((err) => {
      console.error(`[ContentGeneration] pipeline failed for ${generation.id}:`, err)
    })

    return generation
  }

  private async _runPipeline(
    generationId: string,
    input: GenerateRequest,
    router: ProviderRouter,
    periodStart: string,
    imageCount: number,
  ): Promise<void> {
    const supabase = createServiceRoleClient()

    await this.repo.updateGenerationStatus(generationId, 'processing', {
      started_at: new Date().toISOString(),
    })

    try {
      // Generate images
      const images = await router.generateImage({
        prompt: input.prompt,
        aspectRatio: input.aspect_ratio,
        quality: input.quality,
        count: imageCount,
      })

      for (const img of images) {
        const storagePath = `content/${input.tenant_id}/${generationId}/${Date.now()}.png`
        const { error: uploadError } = await supabase.storage
          .from('generated-assets')
          .upload(storagePath, img.data, { contentType: img.mimeType, upsert: false })

        if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

        const { data: urlData } = supabase.storage
          .from('generated-assets')
          .getPublicUrl(storagePath)

        await this.repo.createAsset({
          generation_id: generationId,
          asset_type: 'image',
          storage_path: storagePath,
          public_url: urlData?.publicUrl ?? undefined,
          mime_type: img.mimeType,
          size_bytes: img.data.length,
        })
      }

      await this.repo.incrementUsage(input.tenant_id, periodStart, imageCount, 0)

      // Optional video (Veo via hive/scripts/video_handler.py — called separately via CLI/worker)
      if (input.generate_video) {
        // Video generation is delegated to the hive video_handler.py script
        // (Veo API does not have a Node SDK; use: uv run hive/scripts/video_handler.py generate "prompt")
        // Store a placeholder asset with status note in metadata
        await this.repo.createAsset({
          generation_id: generationId,
          asset_type: 'video',
          storage_path: `content/${input.tenant_id}/${generationId}/video_pending`,
          mime_type: 'video/mp4',
          metadata: { status: 'pending_veo', note: 'Trigger video_handler.py externally' },
        })
        await this.repo.incrementUsage(input.tenant_id, periodStart, 0, 1)
      }

      await this.repo.updateGenerationStatus(generationId, 'completed', {
        completed_at: new Date().toISOString(),
      })
    } catch (err) {
      await this.repo.updateGenerationStatus(generationId, 'failed', {
        error: err instanceof Error ? err.message : String(err),
        completed_at: new Date().toISOString(),
      })
    }
  }

  async getJobStatus(
    id: string,
  ): Promise<
    | (ContentGenerationRow & {
        assets: import('./repositories/content-generation.repo').GeneratedAssetRow[]
      })
    | null
  > {
    return this.repo.getGeneration(id)
  }

  async getHistory(
    tenantId: number,
    productId: number,
    limit?: number,
  ): Promise<ContentGenerationRow[]> {
    return this.repo.listByProduct(productId, tenantId, limit)
  }

  async getUsage(tenantId: number): Promise<{
    usage: import('./repositories/content-generation.repo').GenerationUsageRow | null
    limits: { images: number | null; videos: number | null }
    plan: Plan
  }> {
    const plan = await getTenantPlan(tenantId)
    const periodStart = currentPeriodStart()
    const usage = await this.repo.getUsage(tenantId, periodStart)
    return { usage, limits: LIMITS[plan], plan }
  }

  async cancelJob(id: string): Promise<ContentGenerationRow> {
    return this.repo.updateGenerationStatus(id, 'cancelled', {
      completed_at: new Date().toISOString(),
    })
  }
}
