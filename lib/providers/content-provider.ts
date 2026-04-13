/**
 * ContentProvider — interface + shared types for image/video generation.
 */

export type QualityTier = 'low' | 'medium' | 'high'

export interface ImageOptions {
  prompt: string
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
  quality?: QualityTier
  count?: number
}

export interface VideoOptions {
  prompt: string
  durationSeconds?: number
  aspectRatio?: '16:9' | '9:16' | '1:1'
  quality?: QualityTier
}

export interface GeneratedImage {
  data: Buffer
  mimeType: string
  widthPx?: number
  heightPx?: number
}

export interface GeneratedVideo {
  data: Buffer
  mimeType: string
  durationMs?: number
}

export interface ContentProvider {
  readonly id: string
  readonly displayName: string
  readonly costPerUnit: number // USD per image or per video second
  readonly capabilities: ('image' | 'video')[]
  readonly minQuality: QualityTier
  readonly maxQuality: QualityTier

  generateImage(options: ImageOptions): Promise<GeneratedImage[]>
  generateVideo?(options: VideoOptions): Promise<GeneratedVideo>
}

export type ProviderCapability = 'image' | 'video'
