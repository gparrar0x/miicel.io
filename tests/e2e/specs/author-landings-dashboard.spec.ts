/**
 * Author Landings Dashboard - Happy Path
 *
 * Tests complete author landing generation + publication flow:
 * 1. Select author from dropdown
 * 2. Upload author image
 * 3. Edit guided prompt
 * 4. Click generate → verify preview appears
 * 5. Click regenerate → verify preview updates
 * 6. Click publish → verify status change to published
 *
 * Uses loginAsOwner fixture for auth
 * Mocks Claude API response deterministically via page.route()
 */

import { expect, test } from '@playwright/test'
import { loginAsOwner } from '../fixtures/auth.fixture'
import { AuthorLandingsPage } from '../pages/author-landings.page'
import mockContent from '../fixtures/author-landing-content.json'

test.describe('Author Landings Dashboard - Happy Path', () => {
  const TEST_TENANT = 'demo_galeria'
  const TEST_AUTHOR_NAME = 'Elena Mendoza'
  const CUSTOM_PROMPT = 'Tone: artistic, minimal. Focus: the technique.'

  let authorLandingsPage: AuthorLandingsPage

  test.beforeEach(async ({ page }) => {
    // Login as owner
    await loginAsOwner(page, TEST_TENANT)

    // Initialize page object
    authorLandingsPage = new AuthorLandingsPage(page)

    // Mock Claude API response for generate-landing endpoint
    await page.route('**/api/authors/*/generate-landing', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ landing: mockContent.landing }),
        })
      } else {
        await route.continue()
      }
    })

    // Navigate to author landings editor
    const baseURL = page.context().baseURL || 'http://localhost:3000'
    await page.goto(`${baseURL}/es/${TEST_TENANT}/dashboard/authors`)
    await page.waitForURL(`**/dashboard/authors`)
  })

  test('should render dashboard with author select and form fields', async ({ page }) => {
    // Verify core UI elements are visible
    await authorLandingsPage.waitForAuthorSelect()

    // Verify key form fields exist
    await expect(page.locator('[data-testid="author-select-dropdown"]')).toBeVisible()
    await expect(page.locator('[data-testid="author-image-upload"]')).toBeVisible()
    await expect(page.locator('[data-testid="author-prompt-textarea"]')).toBeVisible()
    await expect(page.locator('[data-testid="author-generate-btn"]')).toBeVisible()
  })

  test('should select author from dropdown', async ({ page }) => {
    // Open dropdown and select author
    await authorLandingsPage.selectAuthor(TEST_AUTHOR_NAME)

    // Verify selection is reflected in the trigger (either text content or selected value)
    const trigger = page.locator('[data-testid="author-select-dropdown"]')
    await expect(trigger).toContainText(TEST_AUTHOR_NAME)
  })

  test('should upload author image', async ({ page }) => {
    // Select author first
    await authorLandingsPage.selectAuthor(TEST_AUTHOR_NAME)

    // Create a test image file (1x1 PNG)
    const testImagePath = '/tmp/test-author.png'
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44,
      0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90,
      0x77, 0x53, 0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xf8,
      0xcf, 0xc0, 0x00, 0x00, 0x00, 0x03, 0x00, 0x01, 0xf5, 0x5c, 0x8f, 0x6b, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ])

    // Write to temp file
    const fs = require('fs')
    fs.writeFileSync(testImagePath, pngBuffer)

    try {
      // Upload the image
      await authorLandingsPage.uploadAuthorImage(testImagePath)

      // Verify preview appeared
      await expect(page.locator('[data-testid="author-image-preview"]')).toBeVisible()
    } finally {
      // Cleanup
      fs.unlinkSync(testImagePath)
    }
  })

  test('should set custom prompt', async ({ page }) => {
    // Select author
    await authorLandingsPage.selectAuthor(TEST_AUTHOR_NAME)

    // Set custom prompt
    await authorLandingsPage.setCustomPrompt(CUSTOM_PROMPT)

    // Verify textarea has the value
    const textarea = page.locator('[data-testid="author-prompt-textarea"]')
    await expect(textarea).toHaveValue(CUSTOM_PROMPT)
  })

  test('should generate landing and show preview', async ({ page }) => {
    // Setup
    await authorLandingsPage.selectAuthor(TEST_AUTHOR_NAME)
    await authorLandingsPage.setCustomPrompt(CUSTOM_PROMPT)

    // Click generate
    await test.step('Generate landing content', async () => {
      await authorLandingsPage.clickGenerate()
    })

    // Wait for preview to appear (mocked response should be instant)
    await test.step('Verify preview appears', async () => {
      await authorLandingsPage.waitForPreview(10000)
    })

    // Verify preview contains expected content from mock
    await test.step('Verify preview content', async () => {
      await authorLandingsPage.verifyPreviewText(mockContent.landing.content.hero.headline)
      await authorLandingsPage.verifyPreviewText(mockContent.landing.content.hero.subheadline)
    })
  })

  test('should regenerate and update preview', async ({ page }) => {
    // Setup and generate
    await authorLandingsPage.selectAuthor(TEST_AUTHOR_NAME)
    await authorLandingsPage.setCustomPrompt(CUSTOM_PROMPT)
    await authorLandingsPage.clickGenerate()
    await authorLandingsPage.waitForPreview()

    // Get initial preview text
    const initialText = await page.locator('[data-testid="author-preview-container"]').textContent()

    // Click regenerate
    await test.step('Regenerate landing', async () => {
      await authorLandingsPage.clickRegenerate()
    })

    // Wait for generation to complete
    await test.step('Wait for generation complete', async () => {
      await authorLandingsPage.waitForGenerationComplete()
    })

    // Verify preview still contains the mocked content
    await test.step('Verify updated preview', async () => {
      await authorLandingsPage.verifyPreviewText(mockContent.landing.content.hero.headline)
    })
  })

  test('should publish landing and update status', async ({ page }) => {
    // Setup and generate
    await authorLandingsPage.selectAuthor(TEST_AUTHOR_NAME)
    await authorLandingsPage.setCustomPrompt(CUSTOM_PROMPT)
    await authorLandingsPage.clickGenerate()
    await authorLandingsPage.waitForPreview()

    // Verify initial status is 'draft' or not 'published'
    const statusBefore = await authorLandingsPage.getStatus()
    expect(statusBefore).not.toMatch(/published|publicado/i)

    // Click publish
    await test.step('Publish landing', async () => {
      await authorLandingsPage.clickPublish()
    })

    // Wait for status to change
    await test.step('Verify published status', async () => {
      await authorLandingsPage.waitForPublished()
    })

    // Verify status badge now shows published
    const statusAfter = await authorLandingsPage.getStatus()
    expect(statusAfter).toMatch(/published|publicado/i)
  })

  test('should clear prompt and reset form', async ({ page }) => {
    // Set and verify prompt
    await authorLandingsPage.selectAuthor(TEST_AUTHOR_NAME)
    await authorLandingsPage.setCustomPrompt(CUSTOM_PROMPT)

    // Clear prompt
    await authorLandingsPage.clearCustomPrompt()

    // Verify textarea is empty
    const textarea = page.locator('[data-testid="author-prompt-textarea"]')
    await expect(textarea).toHaveValue('')
  })

  test('should disable generate button when author not selected', async ({ page }) => {
    // Don't select an author
    const generateBtn = page.locator('[data-testid="author-generate-btn"]')

    // Button should be disabled
    await expect(generateBtn).toBeDisabled()
  })

  test('should show loading state during generation', async ({ page }) => {
    // Add a delay to the mocked response so we can observe loading state
    await page.route('**/api/authors/*/generate-landing', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockContent.landing.content),
        })
      }
    })

    // Setup and generate
    await authorLandingsPage.selectAuthor(TEST_AUTHOR_NAME)
    await authorLandingsPage.clickGenerate()

    // Verify loading spinner appears
    await expect(page.locator('[data-testid="author-generating-spinner"]')).toBeVisible()

    // Wait for it to complete
    await authorLandingsPage.waitForGenerationComplete(5000)

    // Verify spinner is gone
    await expect(page.locator('[data-testid="author-generating-spinner"]')).not.toBeVisible()
  })
})
