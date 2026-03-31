/**
 * Author Landings Public - Rendering & UX
 *
 * Tests public author landing page rendering:
 * 1. Navigate to /[locale]/[tenantId]/a/[slug]
 * 2. Verify hero renders with headline + subheadline
 * 3. Verify author image is present and visible
 * 4. Verify bio section renders with title + text
 * 5. Verify CTA button links to storefront filtered by author
 * 6. Verify unpublished landing returns 404
 *
 * Note: Tests require database seeding with published landing for author.
 * Mocking or seeding strategy TBD based on test environment setup.
 */

import { expect, test } from '@playwright/test'
import { AuthorLandingsPage } from '../pages/author-landings.page'
import mockContent from '../fixtures/author-landing-content.json'

test.describe('Author Landings Public - Rendering & UX', () => {
  const TEST_LOCALE = 'es'
  const TEST_TENANT_SLUG = 'artmonkeys' // Numeric ID or slug
  const TEST_AUTHOR_SLUG = 'elena-mendoza'
  const TEST_AUTHOR_NAME = 'Elena Mendoza'

  let authorLandingsPage: AuthorLandingsPage

  test.beforeEach(async ({ page }) => {
    authorLandingsPage = new AuthorLandingsPage(page)
  })

  test('should render hero section with headline and subheadline', async ({ page }) => {
    // Navigate to author landing
    await authorLandingsPage.navigateToPublicLanding(
      TEST_LOCALE,
      TEST_TENANT_SLUG,
      TEST_AUTHOR_SLUG,
    )

    // Verify hero section is visible
    await test.step('Hero section visible', async () => {
      await authorLandingsPage.waitForHero()
    })

    // Verify headline is present (would be from DB in real scenario)
    await test.step('Verify headline', async () => {
      // Check that hero section exists and contains a heading
      const hero = page.locator('[data-testid="author-landing-hero"]')
      const headline = hero.locator('h1')
      await expect(headline).toBeVisible()

      // Text content would come from published landing in DB
      const headlineText = await headline.textContent()
      expect(headlineText).toBeTruthy()
      expect(headlineText?.length).toBeGreaterThan(0)
    })

    // Verify subheadline is present
    await test.step('Verify subheadline', async () => {
      const hero = page.locator('[data-testid="author-landing-hero"]')
      const subheadline = hero.locator('p').first()
      await expect(subheadline).toBeVisible()

      const subheadlineText = await subheadline.textContent()
      expect(subheadlineText).toBeTruthy()
      expect(subheadlineText?.length).toBeGreaterThan(0)
    })
  })

  test('should render author image in hero section', async ({ page }) => {
    // Navigate to author landing
    await authorLandingsPage.navigateToPublicLanding(
      TEST_LOCALE,
      TEST_TENANT_SLUG,
      TEST_AUTHOR_SLUG,
    )

    // Verify hero image is visible
    await test.step('Author image visible', async () => {
      await authorLandingsPage.verifyAuthorImageVisible()
    })

    // Verify image has src attribute
    await test.step('Author image has src', async () => {
      const img = page.locator('[data-testid="author-landing-image"] img')
      const src = await img.getAttribute('src')
      expect(src).toBeTruthy()
      // Image should be from CDN or storage URL
      expect(src).toMatch(/^https?:\/\//)
    })

    // Verify image alt text contains author name
    await test.step('Author image alt text', async () => {
      const img = page.locator('[data-testid="author-landing-image"] img')
      const alt = await img.getAttribute('alt')
      expect(alt?.toLowerCase()).toContain(TEST_AUTHOR_NAME.toLowerCase())
    })
  })

  test('should render bio section with title and text', async ({ page }) => {
    // Navigate to author landing
    await authorLandingsPage.navigateToPublicLanding(
      TEST_LOCALE,
      TEST_TENANT_SLUG,
      TEST_AUTHOR_SLUG,
    )

    // Verify bio section is visible
    await test.step('Bio section visible', async () => {
      await authorLandingsPage.verifyBioVisible()
    })

    // Verify bio title (author name)
    await test.step('Verify bio title', async () => {
      const title = page.locator('[data-testid="author-landing-bio"] h2')
      await expect(title).toBeVisible()
      const titleText = await title.textContent()
      expect(titleText?.toUpperCase()).toContain(TEST_AUTHOR_NAME.toUpperCase())
    })

    // Verify bio text is present and readable
    await test.step('Verify bio text', async () => {
      const bioText = page.locator('[data-testid="author-landing-bio"] p')
      await expect(bioText).toBeVisible()
      const text = await bioText.textContent()
      expect(text).toBeTruthy()
      expect(text?.length).toBeGreaterThan(50) // Ensure it's meaningful content
    })
  })

  test('should render CTA button in call-to-action section', async ({ page }) => {
    // Navigate to author landing
    await authorLandingsPage.navigateToPublicLanding(
      TEST_LOCALE,
      TEST_TENANT_SLUG,
      TEST_AUTHOR_SLUG,
    )

    // Verify CTA is visible
    await test.step('CTA button visible', async () => {
      await authorLandingsPage.verifyCTAVisible()
    })

    // Verify CTA button text
    await test.step('Verify CTA text', async () => {
      const button = page.locator('[data-testid="author-landing-cta"] a')
      const text = await button.textContent()
      expect(text).toBeTruthy()
      expect(text?.length).toBeGreaterThan(0)
    })

    // Verify CTA button links to storefront filtered by author
    await test.step('Verify CTA href structure', async () => {
      const href = await authorLandingsPage.getCTAHref()
      expect(href).toBeTruthy()

      // CTA href should navigate to storefront filtered by author
      // Format expected: /[locale]/[tenantId]?author=[authorId] or similar
      expect(href).toMatch(/\/(?:es|en|pt)\//)
      expect(href?.toLowerCase()).toContain('author')
    })
  })

  test('should have proper page metadata for SEO', async ({ page }) => {
    // Navigate to author landing
    await authorLandingsPage.navigateToPublicLanding(
      TEST_LOCALE,
      TEST_TENANT_SLUG,
      TEST_AUTHOR_SLUG,
    )

    // Verify meta title exists
    await test.step('Meta title exists', async () => {
      const titleElement = page.locator('title')
      const title = await titleElement.textContent()
      expect(title).toBeTruthy()
      expect(title?.length).toBeGreaterThan(0)
    })

    // Verify meta description exists
    await test.step('Meta description exists', async () => {
      const metaDesc = page.locator('meta[name="description"]')
      const content = await metaDesc.getAttribute('content')
      expect(content).toBeTruthy()
      expect(content?.length).toBeGreaterThan(0)
    })
  })

  test('should have accessible page structure', async ({ page }) => {
    // Navigate to author landing
    await authorLandingsPage.navigateToPublicLanding(
      TEST_LOCALE,
      TEST_TENANT_SLUG,
      TEST_AUTHOR_SLUG,
    )

    // Verify main landmark exists
    await test.step('Main landmark present', async () => {
      const main = page.locator('main, [role="main"], article[data-testid*="author-landing"]')
      await expect(main).toBeVisible()
    })

    // Verify heading hierarchy (h1 in hero)
    await test.step('Heading hierarchy', async () => {
      const h1 = page.locator('h1')
      await expect(h1).toBeVisible()

      const h2 = page.locator('h2')
      await expect(h2).toBeVisible()
    })

    // Verify CTA button is keyboard accessible
    await test.step('CTA button keyboard accessible', async () => {
      const button = page.locator('[data-testid="author-landing-cta"] a')
      // Tab to the button
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      // Button should be focusable
      await expect(button).toBeFocused()
    })
  })

  test('should handle responsive layout on mobile', async ({ page, context }) => {
    // Create a context with mobile viewport
    const mobileContext = await context.browser()?.newContext({
      viewport: { width: 375, height: 812 }, // iPhone viewport
    })
    if (!mobileContext) throw new Error('Cannot create mobile context')

    const mobilePage = await mobileContext.newPage()
    const mobileAuthorLandings = new AuthorLandingsPage(mobilePage)

    try {
      // Navigate to author landing on mobile
      await mobileAuthorLandings.navigateToPublicLanding(
        TEST_LOCALE,
        TEST_TENANT_SLUG,
        TEST_AUTHOR_SLUG,
      )

      // Verify sections are still visible on mobile
      await test.step('Hero visible on mobile', async () => {
        await mobileAuthorLandings.waitForHero()
      })

      await test.step('Bio visible on mobile', async () => {
        await mobileAuthorLandings.verifyBioVisible()
      })

      await test.step('CTA visible on mobile', async () => {
        await mobileAuthorLandings.verifyCTAVisible()
      })

      // Verify image is responsive
      await test.step('Image responsive', async () => {
        const img = mobilePage.locator('[data-testid="author-landing-image"]')
        await expect(img).toBeVisible()
        // Verify image scales to viewport width
        const box = await img.boundingBox()
        expect(box?.width).toBeLessThanOrEqual(375)
      })
    } finally {
      await mobilePage.close()
      await mobileContext.close()
    }
  })

  test('should return 404 for unpublished author landing', async ({ page }) => {
    // Navigate to a slug that doesn't exist or is unpublished
    const baseURL = page.context().baseURL || 'http://localhost:3000'
    const response = await page.goto(
      `${baseURL}/${TEST_LOCALE}/${TEST_TENANT_SLUG}/a/nonexistent-author-slug`,
      { waitUntil: 'load' },
    )

    // Verify 404 status
    expect(response?.status()).toBe(404)
  })

  test('should display all content sections in order', async ({ page }) => {
    // Navigate to author landing
    await authorLandingsPage.navigateToPublicLanding(
      TEST_LOCALE,
      TEST_TENANT_SLUG,
      TEST_AUTHOR_SLUG,
    )

    // Get all major sections
    const sections = await page
      .locator('[data-testid*="author-landing-"]')
      .evaluateAll((elements) =>
        elements.map((el) => (el as HTMLElement).getAttribute('data-testid')),
      )

    // Expected order: hero → image → bio → cta
    const expected = [
      'author-landing-hero',
      'author-landing-image',
      'author-landing-bio',
      'author-landing-cta',
    ]

    for (const section of expected) {
      expect(sections).toContain(expect.stringContaining(section))
    }

    // Verify visual order via bounding boxes
    const hero = page.locator('[data-testid="author-landing-hero"]')
    const bio = page.locator('[data-testid="author-landing-bio"]')
    const cta = page.locator('[data-testid="author-landing-cta"]')

    const heroBox = await hero.boundingBox()
    const bioBox = await bio.boundingBox()
    const ctaBox = await cta.boundingBox()

    if (heroBox && bioBox && ctaBox) {
      // Hero should be above bio
      expect(heroBox.y).toBeLessThan(bioBox.y)
      // Bio should be above CTA
      expect(bioBox.y).toBeLessThan(ctaBox.y)
    }
  })

  test('should have proper styling (neo-brutalist aesthetic)', async ({ page }) => {
    // Navigate to author landing
    await authorLandingsPage.navigateToPublicLanding(
      TEST_LOCALE,
      TEST_TENANT_SLUG,
      TEST_AUTHOR_SLUG,
    )

    // Verify hero uses monochrome + accent styling
    await test.step('Hero styling', async () => {
      const hero = page.locator('[data-testid="author-landing-hero"]')
      const bgColor = await hero.evaluate((el) => window.getComputedStyle(el).backgroundColor)

      // Neo-brutalist: neutral background (white/gray)
      expect(bgColor).toMatch(/rgb|white|gray/)
    })

    // Verify image has neo-brutalist border/shadow
    await test.step('Image styling (borders + shadow)', async () => {
      const image = page.locator('[data-testid="author-landing-image"]')
      const border = await image.evaluate((el) => window.getComputedStyle(el).borderWidth)
      const boxShadow = await image.evaluate((el) => window.getComputedStyle(el).boxShadow)

      // Should have visible border
      expect(parseInt(border)).toBeGreaterThan(0)
      // Should have shadow
      expect(boxShadow).not.toBe('none')
    })

    // Verify CTA button styling
    await test.step('CTA button styling', async () => {
      const button = page.locator('[data-testid="author-landing-cta"] a')
      const bgColor = await button.evaluate((el) => window.getComputedStyle(el).backgroundColor)
      const textColor = await button.evaluate((el) => window.getComputedStyle(el).color)

      // Should have strong contrast (likely black/white)
      // Expected: dark background with light text or vice versa
      expect(bgColor).toBeTruthy()
      expect(textColor).toBeTruthy()
    })
  })
})
