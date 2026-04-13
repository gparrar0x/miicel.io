/**
 * ProviderRouter — cost-based routing with capability filter and fallback.
 * Sort by costPerUnit ASC, filter by capability + quality, try first available.
 */

import type {
  ContentProvider,
  GeneratedImage,
  GeneratedVideo,
  ImageOptions,
  QualityTier,
  VideoOptions,
} from './content-provider'
import { GeminiFlashImageProvider } from './gemini-flash-image'
import { GeminiImagenProvider } from './gemini-imagen'

const QUALITY_RANK: Record<QualityTier, number> = { low: 0, medium: 1, high: 2 }

function meetsQuality(provider: ContentProvider, required: QualityTier): boolean {
  return QUALITY_RANK[provider.maxQuality] >= QUALITY_RANK[required]
}

export class ProviderRouter {
  private readonly providers: ContentProvider[]

  constructor(apiKey: string) {
    // Ordered by costPerUnit ascending (cheapest first)
    this.providers = [new GeminiFlashImageProvider(apiKey), new GeminiImagenProvider(apiKey)].sort(
      (a, b) => a.costPerUnit - b.costPerUnit,
    )
  }

  private selectProviders(
    capability: 'image' | 'video',
    quality: QualityTier = 'medium',
  ): ContentProvider[] {
    return this.providers.filter(
      (p) => p.capabilities.includes(capability) && meetsQuality(p, quality),
    )
  }

  async generateImage(options: ImageOptions): Promise<GeneratedImage[]> {
    const quality = options.quality ?? 'medium'
    const candidates = this.selectProviders('image', quality)

    if (!candidates.length) {
      throw new Error(`No image provider meets quality=${quality}`)
    }

    let lastError: unknown
    for (const provider of candidates) {
      try {
        return await provider.generateImage(options)
      } catch (err) {
        console.error(`[ProviderRouter] ${provider.id} failed:`, err)
        lastError = err
      }
    }

    throw new Error(
      `All image providers failed. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
    )
  }

  async generateVideo(options: VideoOptions): Promise<GeneratedVideo> {
    const quality = options.quality ?? 'medium'
    const candidates = this.selectProviders('video', quality)

    if (!candidates.length) {
      throw new Error(`No video provider meets quality=${quality}`)
    }

    let lastError: unknown
    for (const provider of candidates) {
      try {
        if (!provider.generateVideo) continue
        return await provider.generateVideo(options)
      } catch (err) {
        console.error(`[ProviderRouter] ${provider.id} failed:`, err)
        lastError = err
      }
    }

    throw new Error(
      `All video providers failed. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
    )
  }
}
