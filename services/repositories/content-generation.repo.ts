/**
 * ContentGenerationRepository — Supabase queries for content_generations,
 * generated_assets, and generation_usage tables.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export interface ContentGenerationRow {
  id: string
  tenant_id: number
  product_id: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  provider: string
  prompt: string
  options: Record<string, unknown>
  error: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface GeneratedAssetRow {
  id: string
  generation_id: string
  asset_type: 'image' | 'video' | 'reel'
  storage_path: string
  public_url: string | null
  mime_type: string
  size_bytes: number | null
  duration_ms: number | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface GenerationUsageRow {
  id: string
  tenant_id: number
  period_start: string
  images_used: number
  videos_used: number
  created_at: string
  updated_at: string
}

export interface CreateGenerationInput {
  tenant_id: number
  product_id: number
  provider: string
  prompt: string
  options?: Record<string, unknown>
}

export interface CreateAssetInput {
  generation_id: string
  asset_type: 'image' | 'video' | 'reel'
  storage_path: string
  public_url?: string
  mime_type: string
  size_bytes?: number
  duration_ms?: number
  metadata?: Record<string, unknown>
}

export interface IContentGenerationRepo {
  createGeneration(input: CreateGenerationInput): Promise<ContentGenerationRow>
  getGeneration(
    id: string,
  ): Promise<(ContentGenerationRow & { assets: GeneratedAssetRow[] }) | null>
  updateGenerationStatus(
    id: string,
    status: ContentGenerationRow['status'],
    extra?: Partial<Pick<ContentGenerationRow, 'error' | 'started_at' | 'completed_at'>>,
  ): Promise<ContentGenerationRow>
  listByProduct(
    productId: number,
    tenantId: number,
    limit?: number,
  ): Promise<ContentGenerationRow[]>
  createAsset(input: CreateAssetInput): Promise<GeneratedAssetRow>
  getUsage(tenantId: number, periodStart: string): Promise<GenerationUsageRow | null>
  incrementUsage(
    tenantId: number,
    periodStart: string,
    images?: number,
    videos?: number,
  ): Promise<GenerationUsageRow>
}

export class ContentGenerationRepo implements IContentGenerationRepo {
  constructor(private readonly supabase: SupabaseClient) {}

  async createGeneration(input: CreateGenerationInput): Promise<ContentGenerationRow> {
    const { data, error } = await this.supabase
      .from('content_generations')
      .insert({
        tenant_id: input.tenant_id,
        product_id: input.product_id,
        provider: input.provider,
        prompt: input.prompt,
        options: input.options ?? {},
        status: 'pending',
      })
      .select()
      .single()

    if (error || !data)
      throw new Error(`Failed to create generation: ${error?.message ?? 'Unknown error'}`)
    return data as ContentGenerationRow
  }

  async getGeneration(
    id: string,
  ): Promise<(ContentGenerationRow & { assets: GeneratedAssetRow[] }) | null> {
    const { data, error } = await this.supabase
      .from('content_generations')
      .select('*, assets:generated_assets(*)')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`Failed to fetch generation: ${error.message}`)
    return data as (ContentGenerationRow & { assets: GeneratedAssetRow[] }) | null
  }

  async updateGenerationStatus(
    id: string,
    status: ContentGenerationRow['status'],
    extra?: Partial<Pick<ContentGenerationRow, 'error' | 'started_at' | 'completed_at'>>,
  ): Promise<ContentGenerationRow> {
    const { data, error } = await this.supabase
      .from('content_generations')
      .update({ status, ...extra, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error || !data)
      throw new Error(`Failed to update generation: ${error?.message ?? 'Unknown error'}`)
    return data as ContentGenerationRow
  }

  async listByProduct(
    productId: number,
    tenantId: number,
    limit = 50,
  ): Promise<ContentGenerationRow[]> {
    const { data, error } = await this.supabase
      .from('content_generations')
      .select('*')
      .eq('product_id', productId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Failed to list generations: ${error.message}`)
    return (data ?? []) as ContentGenerationRow[]
  }

  async createAsset(input: CreateAssetInput): Promise<GeneratedAssetRow> {
    const { data, error } = await this.supabase
      .from('generated_assets')
      .insert({
        generation_id: input.generation_id,
        asset_type: input.asset_type,
        storage_path: input.storage_path,
        public_url: input.public_url ?? null,
        mime_type: input.mime_type,
        size_bytes: input.size_bytes ?? null,
        duration_ms: input.duration_ms ?? null,
        metadata: input.metadata ?? {},
      })
      .select()
      .single()

    if (error || !data)
      throw new Error(`Failed to create asset: ${error?.message ?? 'Unknown error'}`)
    return data as GeneratedAssetRow
  }

  async getUsage(tenantId: number, periodStart: string): Promise<GenerationUsageRow | null> {
    const { data, error } = await this.supabase
      .from('generation_usage')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('period_start', periodStart)
      .maybeSingle()

    if (error) throw new Error(`Failed to fetch usage: ${error.message}`)
    return (data as GenerationUsageRow) ?? null
  }

  async incrementUsage(
    tenantId: number,
    periodStart: string,
    images = 0,
    videos = 0,
  ): Promise<GenerationUsageRow> {
    // Upsert then increment — Supabase does not support increment in one step without RPC
    const existing = await this.getUsage(tenantId, periodStart)

    if (!existing) {
      const { data, error } = await this.supabase
        .from('generation_usage')
        .insert({
          tenant_id: tenantId,
          period_start: periodStart,
          images_used: images,
          videos_used: videos,
        })
        .select()
        .single()
      if (error || !data)
        throw new Error(`Failed to create usage record: ${error?.message ?? 'Unknown error'}`)
      return data as GenerationUsageRow
    }

    const { data, error } = await this.supabase
      .from('generation_usage')
      .update({
        images_used: existing.images_used + images,
        videos_used: existing.videos_used + videos,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error || !data)
      throw new Error(`Failed to increment usage: ${error?.message ?? 'Unknown error'}`)
    return data as GenerationUsageRow
  }
}
