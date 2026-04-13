/**
 * GeminiImagenProvider — higher quality via Imagen 4.0 (predict endpoint).
 * Cost: ~$0.04 per image (Imagen 4.0).
 */

import type {
  ContentProvider,
  GeneratedImage,
  GeneratedVideo,
  ImageOptions,
  QualityTier,
  VideoOptions,
} from './content-provider'

const IMAGEN_MODEL = 'imagen-4.0-generate-001'
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

export class GeminiImagenProvider implements ContentProvider {
  readonly id = 'gemini-imagen'
  readonly displayName = 'Gemini Imagen 4.0'
  readonly costPerUnit = 0.04
  readonly capabilities: ('image' | 'video')[] = ['image']
  readonly minQuality: QualityTier = 'medium'
  readonly maxQuality: QualityTier = 'high'

  constructor(private readonly apiKey: string) {}

  async generateImage(options: ImageOptions): Promise<GeneratedImage[]> {
    const count = Math.min(options.count ?? 1, 4)
    const url = `${BASE_URL}/${IMAGEN_MODEL}:predict?key=${this.apiKey}`
    const payload = {
      instances: [{ prompt: options.prompt }],
      parameters: {
        sampleCount: count,
        aspectRatio: options.aspectRatio ?? '1:1',
      },
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!resp.ok) {
      const errBody = await resp.text()
      throw new Error(`GeminiImagen error ${resp.status}: ${errBody}`)
    }

    const data = await resp.json()
    const predictions: { bytesBase64Encoded: string; mimeType?: string }[] = data?.predictions ?? []
    if (!predictions.length) throw new Error('GeminiImagen: no predictions returned')

    return predictions.map((p) => ({
      data: Buffer.from(p.bytesBase64Encoded, 'base64'),
      mimeType: p.mimeType ?? 'image/png',
    }))
  }

  // Video not supported by this provider
  generateVideo(_options: VideoOptions): Promise<GeneratedVideo> {
    throw new Error('GeminiImagenProvider does not support video generation')
  }
}
