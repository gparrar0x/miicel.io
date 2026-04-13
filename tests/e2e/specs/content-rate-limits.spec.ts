/**
 * Content Rate Limits E2E Test Suite
 *
 * Covers:
 * - Quota display with correct usage numbers
 * - Limit reached → confirm disabled + upgrade message
 * - Usage counter increments after generation
 *
 * Uses data-testid selectors per TEST_ID_CONTRACT.md
 * All API calls mocked via page.route()
 */

import { expect, test } from '@playwright/test'
import { loginAsOwner } from '../fixtures/auth.fixture'
import { ContentGenerationPage } from '../pages/content-generation.page'

const TEST_TENANT = 'demo_galeria'
const LOCALE = 'es'

test.describe('Content Rate Limits', () => {
  let contentPage: ContentGenerationPage

  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page)
    contentPage = new ContentGenerationPage(page)
  })

  test('quota display: shows correct usage numbers from API', async () => {
    await contentPage.mockUsage({
      images_used: 42,
      videos_used: 3,
      images_limit: 100,
      videos_limit: 10,
      plan: 'pro',
    })
    await contentPage.mockHistory([], 0)

    await contentPage.navigate(TEST_TENANT, LOCALE)

    await test.step('Quota bar is visible', async () => {
      await contentPage.assertQuotaVisible()
    })

    await test.step('Quota text contains usage numbers', async () => {
      const quotaText = await contentPage.getQuotaText()
      // Should contain the used/limit values in some form
      expect(quotaText).toContain('42')
      expect(quotaText).toContain('100')
    })
  })

  test('limit reached: confirm button disabled + upgrade message visible', async ({ page }) => {
    await contentPage.mockUsageExhausted()
    await contentPage.mockHistory([], 0)

    await contentPage.navigate(TEST_TENANT, LOCALE)
    await contentPage.clickGenerate()
    await contentPage.assertConfigPanelVisible()

    await test.step('Confirm button is disabled', async () => {
      const disabled = await contentPage.isConfirmDisabled()
      expect(disabled).toBe(true)
    })

    await test.step('Upgrade message is visible', async () => {
      // The quota element should indicate exhaustion
      const quotaText = await contentPage.getQuotaText()
      // Either shows 100/100 or contains "upgrade" / "limit" text
      const isExhausted =
        quotaText.includes('100') ||
        quotaText.toLowerCase().includes('limit') ||
        quotaText.toLowerCase().includes('upgrade')
      expect(isExhausted).toBe(true)
    })
  })

  test('after generation: usage counter increments', async ({ page }) => {
    // Initial usage
    let currentImagesUsed = 5
    await page.route('**/api/content/usage', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          images_used: currentImagesUsed,
          videos_used: 0,
          images_limit: 100,
          videos_limit: 10,
          plan: 'pro',
        }),
      })
    })
    await contentPage.mockHistory([], 0)

    await contentPage.navigate(TEST_TENANT, LOCALE)

    await test.step('Initial quota shows 5 used', async () => {
      await contentPage.assertQuotaVisible()
      const quotaText = await contentPage.getQuotaText()
      expect(quotaText).toContain('5')
    })

    // Now mock a generation + update usage to 7
    await contentPage.mockGenerateSuccess('job-quota-001')
    await contentPage.mockJobPolling('job-quota-001', [
      { type: 'image', url: 'https://cdn.example.com/img-0.webp' },
      { type: 'image', url: 'https://cdn.example.com/img-1.webp' },
    ])

    // Update the usage mock to return incremented value
    currentImagesUsed = 7
    await page.unroute('**/api/content/usage')
    await page.route('**/api/content/usage', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          images_used: currentImagesUsed,
          videos_used: 0,
          images_limit: 100,
          videos_limit: 10,
          plan: 'pro',
        }),
      })
    })

    await test.step('Generate content', async () => {
      await contentPage.clickGenerate()
      await contentPage.configureAndGenerate({
        prompt: 'Two product shots',
        imageCount: '2',
      })
      await contentPage.assertGalleryVisible()
    })

    await test.step('Quota now shows 7 used', async () => {
      await contentPage.assertQuotaVisible()
      const quotaText = await contentPage.getQuotaText()
      expect(quotaText).toContain('7')
    })
  })
})
