/**
 * GeminiFlashImageProvider — cheapest option via Gemini Flash Image (generateContent endpoint).
 * Cost: ~$0.039 per image (Gemini 2.5 Flash).
 */

import type {
  ContentProvider,
  GeneratedImage,
  GeneratedVideo,
  ImageOptions,
  QualityTier,
  VideoOptions,
} from './content-provider'

const FLASH_MODEL = 'gemini-2.5-flash-image'
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

export class GeminiFlashImageProvider implements ContentProvider {
  readonly id = 'gemini-flash-image'
  readonly displayName = 'Gemini Flash Image'
  readonly costPerUnit = 0.039
  readonly capabilities: ('image' | 'video')[] = ['image']
  readonly minQuality: QualityTier = 'low'
  readonly maxQuality: QualityTier = 'medium'

  constructor(private readonly apiKey: string) {}

  async generateImage(options: ImageOptions): Promise<GeneratedImage[]> {
    const url = `${BASE_URL}/${FLASH_MODEL}:generateContent?key=${this.apiKey}`
    const payload = {
      contents: [{ parts: [{ text: options.prompt }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!resp.ok) {
      const errBody = await resp.text()
      throw new Error(`GeminiFlashImage error ${resp.status}: ${errBody}`)
    }

    const data = await resp.json()
    const candidates = data?.candidates ?? []
    if (!candidates.length) throw new Error('GeminiFlashImage: no candidates returned')

    const images: GeneratedImage[] = []
    for (const part of candidates[0]?.content?.parts ?? []) {
      if (part.inlineData) {
        const buf = Buffer.from(part.inlineData.data, 'base64')
        images.push({ data: buf, mimeType: part.inlineData.mimeType ?? 'image/png' })
      }
    }

    if (!images.length) throw new Error('GeminiFlashImage: no image in response')
    return images
  }

  // Video not supported by this provider
  generateVideo(_options: VideoOptions): Promise<GeneratedVideo> {
    throw new Error('GeminiFlashImageProvider does not support video generation')
  }
}
