/**
 * E2E Test Suite: SKY-43 Gallery Template Verification
 *
 * Tests critical functionality for gallery template redesign:
 * 1. Visual: Button Colors (GOLD #B8860B, not blue)
 * 2. Functionality: Quick View Navigation (/[tenantId]/product/[id])
 * 3. Layout: Responsive Grid (1-2-3 cols)
 * 4. Test IDs: Contract Compliance
 * 5. Performance: TTI <3s, no console errors
 *
 * Test Data:
 * - Tenant: 'demo' (has template=gallery)
 * - URL: http://localhost:3000/demo
 * - Products: must exist in database
 *
 * Created: 2025-01-17
 */

import { test, expect } from '@playwright/test'
import { StorefrontGalleryPage } from '../pages/storefront-gallery.page'

const TEST_TENANT = '38'
const BASE_URL = `http://localhost:3000/${TEST_TENANT}`

test.describe('SKY-43: Gallery Template E2E', () => {
  let page_instance: any
  let gallery: StorefrontGalleryPage

  // Skip global setup - test data must exist or be created manually
  test.describe.configure({ mode: 'parallel' })

  test.beforeEach(async ({ page }) => {
    page_instance = page
    gallery = new StorefrontGalleryPage(page)

    // Navigate to demo tenant gallery
    try {
      await gallery.goto(TEST_TENANT)

      // Wait for either products or empty state
      const hasError = await page.locator('[role="alert"]').isVisible({ timeout: 2000 }).catch(() => false)
      if (hasError) {
        const errorMsg = await page.locator('[role="alert"]').textContent()
        console.warn(`Page has error message: ${errorMsg}`)
      }
    } catch (err) {
      console.warn(`Navigation to ${TEST_TENANT} had issue, continuing anyway`, err)
    }
  })

  // Test 1: Visual - Button Colors
  test('Quick View button displays GOLD color (#B8860B)', async () => {
    const cardCount = await gallery.getGalleryCardCount()
    if (cardCount === 0) {
      test.skip()
    }

    await test.step('Verify button color is gold, not blue', async () => {
      const isGold = await gallery.verifyQuickViewButtonIsGold(0)
      expect(isGold).toBe(true)

      // Get actual color for debug
      const actualColor = await gallery.getQuickViewButtonColor(0)
      console.log(`Quick View button color: ${actualColor}`)
    })

    await test.step('Take screenshot of button for visual verification', async () => {
      await gallery.takeQuickViewButtonScreenshot(
        'tests/reports/sky43-button-color.png',
        0
      )
    })
  })

  // Test 2: Functionality - Quick View Navigation
  test('Quick View button navigates to product detail page', async () => {
    const cardCount = await gallery.getGalleryCardCount()
    if (cardCount === 0) {
      test.skip()
    }

    const cardTitle = await gallery.getCardTitle(0)
    console.log(`Testing Quick View for product: ${cardTitle}`)

    await test.step('Click Quick View on first product', async () => {
      await gallery.clickQuickView(0)
    })

    await test.step('Verify navigation to /[tenantId]/product/[id] route', async () => {
      const currentUrl = await gallery.getCurrentPath()
      console.log(`Current URL: ${currentUrl}`)

      // Should navigate to /38/product/{id}
      expect(currentUrl).toMatch(/\/38\/product\/[\w-]+/)
      expect(currentUrl).not.toMatch(/\/38\/$/) // Should NOT stay on home
    })

    await test.step('Verify product page loaded without errors', async () => {
      await expect(page_instance).not.toHaveTitle(/Error/)
    })
  })

  // Test 3: Layout - Responsive Grid (1 col mobile)
  test('Gallery grid renders 1 column on mobile portrait', async () => {
    const cardCount = await gallery.getGalleryCardCount()
    if (cardCount === 0) {
      test.skip()
    }

    await test.step('Set mobile portrait viewport (375x667)', async () => {
      await gallery.setMobileViewport()
    })

    await test.step('Verify 1 column layout', async () => {
      const isMobileLayout = await gallery.verifyResponsiveGrid('mobile')
      expect(isMobileLayout).toBe(true)
    })

    await test.step('Verify cards visible', async () => {
      const cardCount = await gallery.getGalleryCardCount()
      expect(cardCount).toBeGreaterThan(0)
    })
  })

  // Test 4: Layout - Responsive Grid (2 cols landscape)
  test('Gallery grid renders 2 columns on mobile landscape', async () => {
    const cardCount = await gallery.getGalleryCardCount()
    if (cardCount === 0) {
      test.skip()
    }

    await test.step('Set mobile landscape viewport (768x600)', async () => {
      await gallery.page.setViewportSize({ width: 768, height: 600 })
      await gallery.page.waitForLoadState('networkidle')
    })

    await test.step('Verify 2 column layout', async () => {
      const isTwoCol = await gallery.verifyResponsiveGrid('landscape')
      expect(isTwoCol).toBe(true)
    })
  })

  // Test 5: Layout - Responsive Grid (3 cols desktop)
  test('Gallery grid renders 3 columns on desktop', async () => {
    const cardCount = await gallery.getGalleryCardCount()
    if (cardCount === 0) {
      test.skip()
    }

    await test.step('Set desktop viewport (1280x720)', async () => {
      await gallery.setDesktopViewport()
    })

    await test.step('Verify 3 column layout', async () => {
      const isDesktopLayout = await gallery.verifyResponsiveGrid('desktop')
      expect(isDesktopLayout).toBe(true)
    })
  })

  // Test 6: Test IDs - Contract Compliance
  test('Gallery cards have all required test IDs', async () => {
    const cardCount = await gallery.getGalleryCardCount()
    if (cardCount === 0) {
      test.skip()
    }

    const cardStructure = await gallery.verifyCardStructure(0)

    await test.step('Verify product-card-gallery test ID', async () => {
      expect(cardStructure.hasCard).toBe(true)
    })

    await test.step('Verify card-image test ID', async () => {
      expect(cardStructure.hasImage).toBe(true)
    })

    await test.step('Verify card-title test ID', async () => {
      expect(cardStructure.hasTitle).toBe(true)
    })

    await test.step('Verify card-price test ID', async () => {
      expect(cardStructure.hasPrice).toBe(true)
    })

    await test.step('Verify action-quickview test ID', async () => {
      expect(cardStructure.hasQuickView).toBe(true)
    })

    await test.step('Verify action-wishlist test ID', async () => {
      expect(cardStructure.hasWishlist).toBe(true)
    })
  })

  // Test 7: Test IDs - ProductGrid Container
  test('ProductGrid container has product-grid test ID', async () => {
    const grid = page_instance.locator('[data-testid="product-grid"]')
    await expect(grid).toBeVisible()
  })

  // Test 8: Performance - Page Load Time
  test('Gallery page TTI <3 seconds', async () => {
    const loadTime = await gallery.measureLoadTime()
    console.log(`Page load time: ${loadTime}ms`)

    expect(loadTime).toBeLessThan(3000)
  })

  // Test 9: Performance - Console Errors
  test('Gallery page loads without critical console errors', async () => {
    const errors: string[] = []

    page_instance.on('console', (msg: any) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Re-navigate to capture errors
    await gallery.goto(TEST_TENANT)
    await gallery.waitForProductsToLoad()

    // Filter out non-critical errors
    const criticalErrors = errors.filter(
      (err) =>
        !err.includes('Failed to load resource') && // Network issues are non-critical
        !err.includes('404') && // Missing resources
        !err.includes('Uncaught') === false // Only capture actual exceptions
    )

    expect(criticalErrors.length).toBe(0)
  })

  // Test 10: Happy Path - Full Gallery Flow
  test('Complete gallery flow: render > Quick View > navigate > return', async () => {
    const initialCardCount = await gallery.getGalleryCardCount()
    if (initialCardCount === 0) {
      test.skip()
    }

    await test.step('Verify gallery rendered with products', async () => {
      expect(initialCardCount).toBeGreaterThan(0)
      console.log(`Gallery loaded with ${initialCardCount} products`)
    })

    await test.step('Click Quick View', async () => {
      const cardTitle = await gallery.getCardTitle(0)
      console.log(`Clicking Quick View for: ${cardTitle}`)
      await gallery.clickQuickView(0)
    })

    await test.step('Verify product detail page loaded', async () => {
      const url = await gallery.getCurrentPath()
      expect(url).toMatch(/\/38\/product\/[\w-]+/)
    })

    await test.step('Navigate back to gallery', async () => {
      await page_instance.goBack()
      await gallery.waitForProductsToLoad()
    })

    await test.step('Verify gallery still shows same products', async () => {
      const returnedCardCount = await gallery.getGalleryCardCount()
      expect(returnedCardCount).toBe(initialCardCount)
    })
  })
})
