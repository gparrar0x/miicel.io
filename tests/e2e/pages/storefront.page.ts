/**
 * Page Object Model for Storefront
 * Multi-template storefront at /{tenant}
 *
 * Encapsulates:
 * - Template rendering (gallery/detail/minimal)
 * - Theme CSS variable verification
 * - Product grid and card interactions
 * - Responsive behavior
 */

import { expect, type Locator, type Page } from '@playwright/test'

type TenantTemplate = 'gallery' | 'detail' | 'minimal'

export class StorefrontPage {
  readonly page: Page
  readonly productGrid: Locator

  constructor(page: Page) {
    this.page = page
    // ProductGrid has data-testid="product-grid-{template}"
    this.productGrid = page.locator('[data-testid^="product-grid-"]')
  }

  /**
   * Navigate to storefront
   * @param tenantSlug - Tenant slug (e.g., 'demo', 'superhotdog')
   */
  async goto(tenantSlug: string = 'test-store') {
    await this.page.goto(`/${tenantSlug}`)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Get currently rendered template type based on data-testid
   * @returns Template type or null if grid not found
   */
  async getRenderedTemplate(): Promise<TenantTemplate | null> {
    const testId = await this.productGrid.getAttribute('data-testid').catch(() => null)

    if (testId?.includes('gallery')) return 'gallery'
    if (testId?.includes('detail')) return 'detail'
    if (testId?.includes('minimal')) return 'minimal'

    return null
  }

  /**
   * Get all product cards currently rendered
   */
  async getProductCards(): Promise<Locator[]> {
    return await this.page.locator('[data-testid*="product-card"]').all()
  }

  /**
   * Get product card count
   */
  async getProductCardCount(): Promise<number> {
    const cards = await this.getProductCards()
    return cards.length
  }

  /**
   * Get CSS custom property value
   * Reads --var-name from computed styles on root element
   * @param varName - CSS variable name (without --)
   */
  async getCSSVariable(varName: string): Promise<string | null> {
    return await this.page.evaluate((name) => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`)
      return value ? value.trim() : null
    }, varName)
  }

  /**
   * Verify CSS color variable is set
   * @param varName - CSS variable name (without --)
   * @param expectedColor - Expected hex color (case-insensitive)
   */
  async verifyCSSColorVariable(varName: string, expectedColor: string): Promise<boolean> {
    const value = await this.getCSSVariable(varName)
    if (!value) return false

    // Normalize colors to lowercase for comparison
    return value.toLowerCase().includes(expectedColor.toLowerCase())
  }

  /**
   * Get product grid gap from CSS
   */
  async getGridGap(): Promise<string | null> {
    return await this.page.evaluate(() => {
      const gridElement = document.querySelector('[data-testid^="product-grid-"]')
      if (!gridElement) return null
      return getComputedStyle(gridElement).gap
    })
  }

  /**
   * Get product grid column count
   */
  async getGridColumnCount(): Promise<number | null> {
    return await this.page.evaluate(() => {
      const gridElement = document.querySelector('[data-testid^="product-grid-"]')
      if (!gridElement) return null

      const gridColsClass = Array.from(gridElement.classList).find(
        (cls) => cls.startsWith('grid-cols-') || cls.startsWith('lg:grid-cols-'),
      )

      if (!gridColsClass) return null

      const match = gridColsClass.match(/grid-cols-(\d+)/)
      return match ? parseInt(match[1], 10) : null
    })
  }

  /**
   * Check if product card has loading skeleton
   */
  async hasLoadingSkeleton(): Promise<boolean> {
    const skeleton = this.page.locator('[data-testid*="skeleton"]')
    return await skeleton.isVisible({ timeout: 1000 }).catch(() => false)
  }

  /**
   * Wait for product cards to load
   */
  async waitForProductsToLoad(timeout = 5000) {
    // Wait for grid to exist
    await expect(this.productGrid).toBeVisible({ timeout })

    // Wait for skeleton to disappear (if it exists)
    const skeleton = this.page.locator('[data-testid*="skeleton"]')
    await skeleton.waitFor({ state: 'hidden', timeout: 1000 }).catch(() => {
      // Skeleton might not exist, that's ok
    })
  }

  /**
   * Click a product by name
   * @param productName - Product name to search for
   */
  async clickProduct(productName: string) {
    const productLink = this.page.locator(`text=${productName}`).first()
    await productLink.click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Hover over a product card to trigger effects
   */
  async hoverOverProductCard(index = 0) {
    const cards = await this.getProductCards()
    if (cards[index]) {
      await cards[index].hover()
      // Wait for hover animation
      await this.page.waitForTimeout(300)
    }
  }

  /**
   * Get viewport dimensions
   */
  async getViewportSize(): Promise<{ width: number; height: number } | null> {
    return await this.page.viewportSize()
  }

  /**
   * Set mobile viewport
   */
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 })
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Set tablet viewport
   */
  async setTabletViewport() {
    await this.page.setViewportSize({ width: 768, height: 1024 })
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Set desktop viewport
   */
  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1280, height: 720 })
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Check for empty state message
   */
  async hasEmptyState(): Promise<boolean> {
    const emptyMessage = this.page.locator('text=No products found')
    return await emptyMessage.isVisible({ timeout: 1000 }).catch(() => false)
  }

  /**
   * Get error message if page failed to load
   */
  async getErrorMessage(): Promise<string | null> {
    const errorElement = this.page.locator('[role="alert"]')
    if (await errorElement.isVisible({ timeout: 500 }).catch(() => false)) {
      return await errorElement.textContent()
    }
    return null
  }

  /**
   * Check if theme provider is active (root has CSS vars set)
   */
  async hasThemeProvider(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const style = getComputedStyle(document.documentElement)
      // Check for at least one common theme CSS variable
      return style.getPropertyValue('--spacing-md').trim().length > 0
    })
  }

  /**
   * Take screenshot for visual regression
   * @param path - Screenshot name
   */
  async takeScreenshot(path: string) {
    await this.page.screenshot({ path })
  }
}
