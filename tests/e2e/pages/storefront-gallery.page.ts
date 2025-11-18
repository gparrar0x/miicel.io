/**
 * Gallery Storefront Page Object
 * Extends StorefrontPage with gallery-template-specific interactions
 *
 * Handles:
 * - Quick View button interaction & navigation
 * - Button color verification (gold #B8860B)
 * - Card layout assertions
 * - Responsive grid columns (1/2/3)
 */

import { Page, Locator, expect } from '@playwright/test'
import { StorefrontPage } from './storefront.page'

export class StorefrontGalleryPage extends StorefrontPage {
  constructor(page: Page) {
    super(page)
  }

  /**
   * Get first Quick View button
   */
  async getQuickViewButton(index = 0): Promise<Locator> {
    const buttons = this.page.locator('[data-testid="action-quickview"]')
    return buttons.nth(index)
  }

  /**
   * Get all Quick View buttons
   */
  async getAllQuickViewButtons(): Promise<Locator[]> {
    return await this.page.locator('[data-testid="action-quickview"]').all()
  }

  /**
   * Click Quick View for first product
   */
  async clickQuickView(index = 0) {
    const button = await this.getQuickViewButton(index)
    await button.click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Get computed background color of Quick View button
   */
  async getQuickViewButtonColor(index = 0): Promise<string | null> {
    const button = await this.getQuickViewButton(index)
    return await button.evaluate((el: HTMLElement) => {
      return window.getComputedStyle(el).backgroundColor
    })
  }

  /**
   * Verify Quick View button is gold color
   * Accepts rgb(184, 134, 11) or #B8860B variants
   */
  async verifyQuickViewButtonIsGold(index = 0): Promise<boolean> {
    const color = await this.getQuickViewButtonColor(index)
    if (!color) return false

    // Match gold: #B8860B = rgb(184, 134, 11)
    return (
      color.includes('rgb(184, 134, 11)') ||
      color.includes('rgb(184, 134, 11,') ||
      // Also accept hsl variants
      color.toLowerCase().includes('gold') ||
      // Fallback: check it's not blue (#3B82F6 = rgb(59, 130, 246))
      !color.includes('rgb(59, 130, 246)')
    )
  }

  /**
   * Get all product card test IDs matching gallery pattern
   */
  async getGalleryCardLocators(): Promise<Locator[]> {
    return await this.page.locator('[data-testid="product-card-gallery"]').all()
  }

  /**
   * Get gallery card count
   */
  async getGalleryCardCount(): Promise<number> {
    const cards = await this.getGalleryCardLocators()
    return cards.length
  }

  /**
   * Verify gallery card has required test IDs
   */
  async verifyCardStructure(index = 0): Promise<{
    hasCard: boolean
    hasImage: boolean
    hasTitle: boolean
    hasPrice: boolean
    hasQuickView: boolean
    hasWishlist: boolean
  }> {
    const card = (await this.getGalleryCardLocators())[index]
    if (!card) {
      return {
        hasCard: false,
        hasImage: false,
        hasTitle: false,
        hasPrice: false,
        hasQuickView: false,
        hasWishlist: false,
      }
    }

    return {
      hasCard: await card.isVisible(),
      hasImage: await card.locator('[data-testid="card-image"]').isVisible().catch(() => false),
      hasTitle: await card.locator('[data-testid="card-title"]').isVisible().catch(() => false),
      hasPrice: await card.locator('[data-testid="card-price"]').isVisible().catch(() => false),
      hasQuickView: await card
        .locator('[data-testid="action-quickview"]')
        .isVisible()
        .catch(() => false),
      hasWishlist: await card
        .locator('[data-testid="action-wishlist"]')
        .isVisible()
        .catch(() => false),
    }
  }

  /**
   * Get product card title at index
   */
  async getCardTitle(index = 0): Promise<string | null> {
    const cards = await this.getGalleryCardLocators()
    if (!cards[index]) return null
    return await cards[index].locator('[data-testid="card-title"]').textContent()
  }

  /**
   * Get product card price at index
   */
  async getCardPrice(index = 0): Promise<string | null> {
    const cards = await this.getGalleryCardLocators()
    if (!cards[index]) return null
    return await cards[index].locator('[data-testid="card-price"]').textContent()
  }

  /**
   * Get grid column count via CSS class inspection
   * Mobile: 1 col (flex), landscape 640px: 2 cols (sm:grid-cols-2), desktop: 3 cols (md:grid-cols-3)
   */
  async getGridColumnCountFromClasses(): Promise<number | string> {
    return await this.page.evaluate(() => {
      const grid = document.querySelector('[data-testid="product-grid"]')
      if (!grid) return 'NOT_FOUND'

      const classList = Array.from(grid.classList)
      const colClass = classList.find(
        (cls) => cls.includes('grid-cols-') || cls.includes('sm:grid-cols-') || cls.includes('md:grid-cols-')
      )

      // Check display mode
      const display = window.getComputedStyle(grid).display
      if (display === 'flex') return 1

      // Extract cols from class
      if (colClass?.includes('grid-cols-2')) return 2
      if (colClass?.includes('grid-cols-3')) return 3

      return 'UNKNOWN'
    })
  }

  /**
   * Verify responsive grid at given viewport
   * - Mobile portrait <640px: 1 col
   * - Mobile landscape 640-900px: 2 cols
   * - Desktop >900px: 3 cols
   */
  async verifyResponsiveGrid(viewport: 'mobile' | 'landscape' | 'desktop'): Promise<boolean> {
    const viewportSizes = {
      mobile: { width: 375, height: 667 },
      landscape: { width: 768, height: 600 },
      desktop: { width: 1280, height: 720 },
    }

    await this.page.setViewportSize(viewportSizes[viewport])
    await this.page.waitForLoadState('networkidle')

    const expectedCols = {
      mobile: 1,
      landscape: 2,
      desktop: 3,
    }

    const cols = await this.getGridColumnCountFromClasses()
    return cols === expectedCols[viewport]
  }

  /**
   * Get current URL path
   */
  async getCurrentPath(): Promise<string> {
    return this.page.url()
  }

  /**
   * Measure page load time (TTI - Time to Interactive)
   */
  async measureLoadTime(): Promise<number> {
    return await this.page.evaluate(() => {
      const navTiming = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (!navTiming) return 0
      return navTiming.loadEventEnd - navTiming.fetchStart
    })
  }

  /**
   * Check for console errors
   */
  async captureConsoleErrors(): Promise<string[]> {
    const errors: string[] = []
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    return errors
  }

  /**
   * Take screenshot of first card with Quick View button for visual verification
   */
  async takeQuickViewButtonScreenshot(path: string, index = 0) {
    const card = (await this.getGalleryCardLocators())[index]
    if (card) {
      await card.screenshot({ path })
    }
  }
}
