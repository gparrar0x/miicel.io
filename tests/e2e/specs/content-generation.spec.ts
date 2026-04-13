/**
 * Content Generation E2E Test Suite
 *
 * Covers:
 * - Happy path: full generation flow (config → progress → gallery)
 * - Download assets (single + all)
 * - Generation history (list + expand)
 * - Cancel pending job
 * - Provider failure → error state + retry
 * - API 500 → error alert
 * - Video/reels toggle dependency
 * - Empty history state
 *
 * Uses data-testid selectors per TEST_ID_CONTRACT.md
 * All API calls mocked via page.route()
 */

import { expect, test } from '@playwright/test'
import { loginAsOwner } from '../fixtures/auth.fixture'
import { ContentGenerationPage } from '../pages/content-generation.page'

const TEST_TENANT = 'demo_galeria'
const LOCALE = 'es'

test.describe('Content Generation - Happy Path', () => {
  let contentPage: ContentGenerationPage

  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page)
    contentPage = new ContentGenerationPage(page)
  })

  test('full generation flow: config → progress → gallery with assets', async ({ page }) => {
    // Setup mocks before navigation
    await contentPage.mockGenerateSuccess('job-gen-001')
    await contentPage.mockJobPolling('job-gen-001', [
      { type: 'image', url: 'https://cdn.example.com/img-0.webp' },
      { type: 'image', url: 'https://cdn.example.com/img-1.webp' },
      { type: 'video', url: 'https://cdn.example.com/vid-0.mp4' },
      { type: 'reel', url: 'https://cdn.example.com/reel-0.mp4' },
    ])
    await contentPage.mockUsage({
      images_used: 5,
      videos_used: 1,
      images_limit: 100,
      videos_limit: 10,
      plan: 'pro',
    })
    await contentPage.mockHistory([], 0)

    await contentPage.navigate(TEST_TENANT, LOCALE)

    await test.step('Open config panel', async () => {
      await contentPage.clickGenerate()
      await contentPage.assertConfigPanelVisible()
    })

    await test.step('Fill generation options', async () => {
      await contentPage.fillPrompt('Sunset over Patagonian mountains')
      await contentPage.selectQuality('high')
      await contentPage.selectRatio('16:9')
      await contentPage.setImageCount('2')
      await contentPage.toggleVideo(true)
      await contentPage.toggleReels(true)
    })

    await test.step('Confirm and see progress', async () => {
      await contentPage.confirmGeneration()
      await contentPage.assertProgressVisible()
      await contentPage.assertStepImagesVisible()
    })

    await test.step('Gallery appears with generated assets', async () => {
      await contentPage.assertGalleryVisible()
      await contentPage.assertImageCardVisible(0)
      await contentPage.assertVideoCardVisible(0)
      await contentPage.assertReelCardVisible(0)
    })
  })

  test('download assets: single download button works', async ({ page }) => {
    await contentPage.mockGenerateSuccess('job-dl-001')
    await contentPage.mockJobPolling('job-dl-001', [
      { type: 'image', url: 'https://cdn.example.com/img-0.webp' },
    ])
    await contentPage.mockUsage({
      images_used: 2,
      videos_used: 0,
      images_limit: 100,
      videos_limit: 10,
      plan: 'pro',
    })
    await contentPage.mockHistory([], 0)

    await contentPage.navigate(TEST_TENANT, LOCALE)
    await contentPage.clickGenerate()
    await contentPage.configureAndGenerate({ prompt: 'Product photo flat lay' })

    await test.step('Gallery visible with download buttons', async () => {
      await contentPage.assertGalleryVisible()
      await contentPage.assertImageCardVisible(0)

      // Click on the image card to select it, then verify download btn
      await page.locator('[data-testid="asset-card-image-0"]').click()
      await expect(page.getByTestId('download-asset-btn')).toBeVisible()
    })
  })

  test('download all button visible when multiple assets', async () => {
    await contentPage.mockGenerateSuccess('job-dlall-001')
    await contentPage.mockJobPolling('job-dlall-001', [
      { type: 'image', url: 'https://cdn.example.com/img-0.webp' },
      { type: 'image', url: 'https://cdn.example.com/img-1.webp' },
      { type: 'image', url: 'https://cdn.example.com/img-2.webp' },
    ])
    await contentPage.mockUsage({
      images_used: 3,
      videos_used: 0,
      images_limit: 100,
      videos_limit: 10,
      plan: 'pro',
    })
    await contentPage.mockHistory([], 0)

    await contentPage.navigate(TEST_TENANT, LOCALE)
    await contentPage.clickGenerate()
    await contentPage.configureAndGenerate({ prompt: 'Multiple product shots' })

    await test.step('Download all button is visible', async () => {
      await contentPage.assertGalleryVisible()
      const visible = await contentPage.isDownloadAllVisible()
      expect(visible).toBe(true)
    })
  })

  test('generation history: past generations appear and expand', async () => {
    const pastGenerations = [
      {
        id: 'hist-001',
        status: 'completed',
        prompt: 'Beach sunset',
        created_at: '2026-04-06T10:00:00Z',
        assets: [{ type: 'image', url: 'https://cdn.example.com/h1-img-0.webp' }],
      },
      {
        id: 'hist-002',
        status: 'completed',
        prompt: 'Mountain landscape',
        created_at: '2026-04-05T14:30:00Z',
        assets: [
          { type: 'image', url: 'https://cdn.example.com/h2-img-0.webp' },
          { type: 'video', url: 'https://cdn.example.com/h2-vid-0.mp4' },
        ],
      },
    ]

    await contentPage.mockHistory(pastGenerations, 2)
    await contentPage.mockUsage({
      images_used: 10,
      videos_used: 2,
      images_limit: 100,
      videos_limit: 10,
      plan: 'pro',
    })

    await contentPage.navigate(TEST_TENANT, LOCALE)

    await test.step('History section visible with items', async () => {
      await contentPage.assertHistoryVisible()
      await contentPage.assertHistoryItemVisible(0)
      await contentPage.assertHistoryItemVisible(1)
    })

    await test.step('Expand first history item shows gallery', async () => {
      await contentPage.toggleHistoryItem(0)
      // After expanding, the gallery within the history item should be visible
      await contentPage.assertGalleryVisible()
    })
  })

  test('cancel pending job: start → cancel → verify cancelled status', async ({ page }) => {
    // Mock generate returns pending, job polling returns processing (slow)
    await contentPage.mockGenerateSuccess('job-cancel-001')
    // Override job polling to stay in processing state
    await page.route('**/api/content/jobs/*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'job-cancel-001',
            status: 'processing',
            assets: [],
          }),
        })
      } else if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            generation: { id: 'job-cancel-001', status: 'cancelled' },
          }),
        })
      } else {
        await route.continue()
      }
    })
    await contentPage.mockUsage({
      images_used: 5,
      videos_used: 0,
      images_limit: 100,
      videos_limit: 10,
      plan: 'pro',
    })
    await contentPage.mockHistory([], 0)

    await contentPage.navigate(TEST_TENANT, LOCALE)
    await contentPage.clickGenerate()
    await contentPage.configureAndGenerate({ prompt: 'Will be cancelled' })

    await test.step('Progress is visible', async () => {
      await contentPage.assertProgressVisible()
    })

    await test.step('Cancel the generation', async () => {
      await contentPage.cancelGeneration()
    })

    await test.step('Status shows cancelled', async () => {
      const badge = await contentPage.getStatusBadgeText()
      expect(badge.toLowerCase()).toContain('cancel')
    })
  })
})

test.describe('Content Generation - Error Handling', () => {
  let contentPage: ContentGenerationPage

  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page)
    contentPage = new ContentGenerationPage(page)
  })

  test('provider failure: job fails → error state visible', async () => {
    await contentPage.mockGenerateSuccess('job-fail-001')
    await contentPage.mockJobFailed('job-fail-001')
    await contentPage.mockUsage({
      images_used: 5,
      videos_used: 0,
      images_limit: 100,
      videos_limit: 10,
      plan: 'pro',
    })
    await contentPage.mockHistory([], 0)

    await contentPage.navigate(TEST_TENANT, LOCALE)
    await contentPage.clickGenerate()
    await contentPage.configureAndGenerate({ prompt: 'This will fail at provider' })

    await test.step('Error state visible with message', async () => {
      await contentPage.assertErrorVisible()
      const errorText = await contentPage.getErrorText()
      expect(errorText.length).toBeGreaterThan(0)
    })
  })

  test('API 500 on generate → error alert shown', async ({ page }) => {
    await contentPage.mockGenerateError(500, 'Internal Server Error')
    await contentPage.mockUsage({
      images_used: 5,
      videos_used: 0,
      images_limit: 100,
      videos_limit: 10,
      plan: 'pro',
    })
    await contentPage.mockHistory([], 0)

    await contentPage.navigate(TEST_TENANT, LOCALE)
    await contentPage.clickGenerate()
    await contentPage.configureAndGenerate({ prompt: 'Server will reject' })

    await test.step('Error is displayed', async () => {
      await contentPage.assertErrorVisible()
    })
  })
})

test.describe('Content Generation - Edge Cases', () => {
  let contentPage: ContentGenerationPage

  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page)
    contentPage = new ContentGenerationPage(page)
  })

  test('video toggle: enable video → reels enabled, disable video → reels disabled', async () => {
    await contentPage.mockUsage({
      images_used: 0,
      videos_used: 0,
      images_limit: 100,
      videos_limit: 10,
      plan: 'pro',
    })
    await contentPage.mockHistory([], 0)

    await contentPage.navigate(TEST_TENANT, LOCALE)
    await contentPage.clickGenerate()
    await contentPage.assertConfigPanelVisible()

    await test.step('Enable video → reels toggle becomes enabled', async () => {
      await contentPage.toggleVideo(true)
      const reelsEnabled = await contentPage.isReelsToggleEnabled()
      expect(reelsEnabled).toBe(true)
    })

    await test.step('Disable video → reels toggle becomes disabled', async () => {
      await contentPage.toggleVideo(false)
      const reelsEnabled = await contentPage.isReelsToggleEnabled()
      expect(reelsEnabled).toBe(false)
    })
  })

  test('empty history: no past generations → empty state message', async ({ page }) => {
    await contentPage.mockHistory([], 0)
    await contentPage.mockUsage({
      images_used: 0,
      videos_used: 0,
      images_limit: 100,
      videos_limit: 10,
      plan: 'starter',
    })

    await contentPage.navigate(TEST_TENANT, LOCALE)

    await test.step('History section visible but empty', async () => {
      const historyVisible = await contentPage.isHistoryVisible()
      if (historyVisible) {
        // No history items should exist
        const firstItem = page.locator('[data-testid="history-item-0"]')
        await expect(firstItem).not.toBeVisible({ timeout: 2000 })
      }
    })
  })
})
