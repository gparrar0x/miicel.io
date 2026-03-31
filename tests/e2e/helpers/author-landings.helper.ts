/**
 * Author Landings Test Helpers
 *
 * Utilities for mocking Claude API responses, seeding test data, and assertions.
 */

import type { Page } from '@playwright/test'
import type { AuthorLandingContent } from '@/lib/schemas/author-landing'

/**
 * Mock Claude API response for generate-landing endpoint
 *
 * Intercepts POST /api/authors/[id]/generate-landing and returns mock content.
 * Allows optional delay to test loading states.
 */
export async function mockAuthorLandingAPI(
  page: Page,
  mockContent: AuthorLandingContent,
  delayMs: number = 0,
) {
  await page.route('**/api/authors/*/generate-landing', async (route) => {
    if (route.request().method() === 'POST') {
      // Simulate network delay if specified
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockContent),
      })
    } else {
      await route.continue()
    }
  })
}

/**
 * Mock author fetch endpoint
 *
 * Intercepts GET /api/authors?tenant_id=[id] and returns mock authors list.
 */
export async function mockAuthorsAPI(
  page: Page,
  authors: Array<{
    id: number
    name: string
    slug: string
    image_url: string | null
    tenant_id: number
  }>,
) {
  await page.route('**/api/authors*', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ authors }),
      })
    } else {
      route.continue()
    }
  })
}

/**
 * Create a minimal PNG image buffer for testing
 *
 * Returns a 1x1 PNG that can be used for file upload tests.
 * Safe to write to temp file and upload via Playwright.
 */
export function createTestImageBuffer(): Buffer {
  // 1x1 pixel PNG (white)
  return Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x00, 0x03, 0x00, 0x01, 0xf5, 0x5c, 0x8f, 0x6b, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
    0x44, 0xae, 0x42, 0x60, 0x82,
  ])
}

/**
 * Generate a realistic mock AuthorLandingContent for testing
 *
 * Useful for parameterized tests that need different content variations.
 */
export function generateMockAuthorContent(
  overrides?: Partial<AuthorLandingContent>,
): AuthorLandingContent {
  const defaults: AuthorLandingContent = {
    hero: {
      headline: 'Trazos que habitan paredes',
      subheadline: 'Grabados de gran formato nacidos en un taller de Mendoza.',
      cta_text: 'Explorar obras',
    },
    bio: {
      short: 'Empezó grabando por accidente. Hoy sus prints cubren muros en catorce países.',
      long: 'Un taller prestado y una prensa oxidada. Así empezó todo. Las primeras pruebas terminaron en el piso. Desde entonces, cada grabado nace del mismo ritual: elegir el papel, preparar la tinta, prensar a mano.',
    },
    seo: {
      meta_title: 'Grabados originales — Arte de pared',
      meta_description: 'Grabados de gran formato prensados a mano. Piezas para coleccionistas.',
    },
  }

  if (!overrides) return defaults

  return {
    hero: { ...defaults.hero, ...overrides.hero },
    bio: { ...defaults.bio, ...overrides.bio },
    seo: { ...defaults.seo, ...overrides.seo },
  }
}

/**
 * Verify author landing content is valid against Zod schema
 *
 * Useful for validating mock data before using in tests.
 */
export function validateAuthorLandingContent(content: unknown): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Type guard
  if (typeof content !== 'object' || content === null) {
    errors.push('Content must be an object')
    return { valid: false, errors }
  }

  const c = content as Record<string, any>

  // Hero validation
  if (!c.hero || typeof c.hero !== 'object') {
    errors.push('Missing hero section')
  } else {
    if (!c.hero.headline || typeof c.hero.headline !== 'string') {
      errors.push('Missing or invalid hero.headline')
    } else if (c.hero.headline.length > 60) {
      errors.push('hero.headline exceeds 60 chars')
    }

    if (!c.hero.subheadline || typeof c.hero.subheadline !== 'string') {
      errors.push('Missing or invalid hero.subheadline')
    } else if (c.hero.subheadline.length > 200) {
      errors.push('hero.subheadline exceeds 200 chars')
    }

    if (!c.hero.cta_text || typeof c.hero.cta_text !== 'string') {
      errors.push('Missing or invalid hero.cta_text')
    } else if (c.hero.cta_text.length > 40) {
      errors.push('hero.cta_text exceeds 40 chars')
    }
  }

  // Bio validation
  if (!c.bio || typeof c.bio !== 'object') {
    errors.push('Missing bio section')
  } else {
    if (!c.bio.short || typeof c.bio.short !== 'string') {
      errors.push('Missing or invalid bio.short')
    } else if (c.bio.short.length > 120) {
      errors.push('bio.short exceeds 120 chars')
    }

    if (!c.bio.long || typeof c.bio.long !== 'string') {
      errors.push('Missing or invalid bio.long')
    } else if (c.bio.long.length > 600) {
      errors.push('bio.long exceeds 600 chars')
    }
  }

  // SEO validation
  if (!c.seo || typeof c.seo !== 'object') {
    errors.push('Missing seo section')
  } else {
    if (!c.seo.meta_title || typeof c.seo.meta_title !== 'string') {
      errors.push('Missing or invalid seo.meta_title')
    } else if (c.seo.meta_title.length > 60) {
      errors.push('seo.meta_title exceeds 60 chars')
    }

    if (!c.seo.meta_description || typeof c.seo.meta_description !== 'string') {
      errors.push('Missing or invalid seo.meta_description')
    } else if (c.seo.meta_description.length > 155) {
      errors.push('seo.meta_description exceeds 155 chars')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Wait for toast notification with text matching pattern
 *
 * Useful for verifying success/error messages.
 */
export async function waitForToast(
  page: Page,
  pattern: RegExp | string,
  timeout: number = 5000,
): Promise<void> {
  const selector = typeof pattern === 'string' ? `text=${pattern}` : `text=/${pattern}/`
  await page.waitForSelector(`[role="alert"] ${selector}`, { timeout })
}

/**
 * Type of landing status in DB
 */
export type LandingStatus = 'draft' | 'published' | 'archived'

/**
 * Mock landing DB response
 * Useful for testing status transitions
 */
export function mockLandingResponse(
  landingId: number,
  authorId: number,
  status: LandingStatus,
  content: AuthorLandingContent,
) {
  return {
    id: landingId,
    author_id: authorId,
    content,
    status,
    generated_at: new Date().toISOString(),
    published_at: status === 'published' ? new Date().toISOString() : null,
  }
}
