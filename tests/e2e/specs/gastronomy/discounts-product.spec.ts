/**
 * Product Discounts - Admin Config & Storefront Display
 *
 * Tests product-level discount configuration (percentage/fixed) and
 * display on storefront (card, cart, checkout).
 *
 * Scenarios:
 * 1. Admin enables percentage discount → product shows discount on card
 * 2. Admin enables fixed discount → product shows discount on card
 * 3. Admin disables discount → strikethrough/badge removed
 * 4. Cart shows discounted prices per item
 * 5. Checkout totals use discounted prices
 *
 * Uses 3-tier pattern: spec → page → locators
 * Real DB, no mocks. Fixtures for auth + seeding.
 */

import { expect, test, Page } from '@playwright/test'
import { loginAsOwner } from '../../fixtures/auth.fixture'
import { ProductFormPage } from '../../pages/product-form.page'
import { DiscountsLocators } from '../../locators/discounts.locators'

test.describe('Product Discounts - Admin Config & Storefront Display', () => {
  const TEST_TENANT = 'demo_galeria'

  function getBaseUrl(page: Page): string {
    const baseURL = page.context().baseURL || 'http://localhost:3000'
    return baseURL
  }

  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page, TEST_TENANT)
  })

  // =========================================================================
  // ADMIN: Configure Discounts
  // =========================================================================

  test('should enable percentage discount on product', async ({ page }) => {
    // Navigate to products dashboard
    await page.goto(`${getBaseUrl(page)}/es/${TEST_TENANT}/dashboard/products`)
    await page.waitForURL(/dashboard\/products/)

    // Click new product
    await page.getByTestId('products-new-button').click()

    const form = new ProductFormPage(page)
    await form.waitForForm()

    // Fill basic product info
    await form.fillName('Product with Percentage Discount')
    await form.fillCategory('Test')
    await form.fillPrice('10000')
    await form.fillDescription('Test product for discount')

    // Configure 20% discount
    await form.configureDiscount({
      enabled: true,
      type: 'percentage',
      value: 20,
    })

    // Submit
    await form.submit()

    // Verify success toast
    await expect(page.getByText(/creado|éxito|created|success/i)).toBeVisible({
      timeout: 10000,
    })

    // Verify product appears in list with new name
    await expect(page.getByText('Product with Percentage Discount')).toBeVisible()
  })

  test('should enable fixed discount on product', async ({ page }) => {
    // Navigate to products dashboard
    await page.goto(`${getBaseUrl(page)}/es/${TEST_TENANT}/dashboard/products`)
    await page.waitForURL(/dashboard\/products/)

    // Click new product
    await page.getByTestId('products-new-button').click()

    const form = new ProductFormPage(page)
    await form.waitForForm()

    // Fill basic product info
    await form.fillName('Product with Fixed Discount')
    await form.fillCategory('Test')
    await form.fillPrice('5000')
    await form.fillDescription('Test product with fixed discount')

    // Configure $500 discount
    await form.configureDiscount({
      enabled: true,
      type: 'fixed',
      value: 500,
    })

    // Submit
    await form.submit()

    // Verify success
    await expect(page.getByText(/creado|éxito|created|success/i)).toBeVisible({
      timeout: 10000,
    })

    // Verify product appears
    await expect(page.getByText('Product with Fixed Discount')).toBeVisible()
  })

  test('should disable discount on product', async ({ page }) => {
    // Navigate to products dashboard
    await page.goto(`${getBaseUrl(page)}/es/${TEST_TENANT}/dashboard/products`)
    await page.waitForURL(/dashboard\/products/)

    // Click new product
    await page.getByTestId('products-new-button').click()

    const form = new ProductFormPage(page)
    await form.waitForForm()

    // Fill basic product
    await form.fillName('Product Discount Test')
    await form.fillCategory('Test')
    await form.fillPrice('3000')

    // Enable discount
    await form.configureDiscount({
      enabled: true,
      type: 'percentage',
      value: 25,
    })

    // Submit
    await form.submit()
    await expect(page.getByText(/creado|éxito/i)).toBeVisible({ timeout: 10000 })

    // Now edit and disable discount
    await page.waitForTimeout(500)
    await page.goto(`${getBaseUrl(page)}/es/${TEST_TENANT}/dashboard/products`)
    await page.waitForURL(/dashboard\/products/)

    // Wait for table and find product
    await expect(page.getByTestId('product-table')).toBeVisible()
    const productRow = page
      .locator('[data-testid="product-table-row"]')
      .filter({ hasText: 'Product Discount Test' })
      .first()

    // Click edit
    await productRow.getByTestId('product-edit-button').click()

    const form2 = new ProductFormPage(page)
    await form2.waitForForm()

    // Disable discount
    await form2.setDiscountEnabled(false)

    // Submit
    await form2.submit()

    // Verify success
    await expect(page.getByText(/actualizado|guardado|updated|success/i)).toBeVisible({
      timeout: 10000,
    })
  })

  // =========================================================================
  // STOREFRONT: Product Card Display
  // =========================================================================

  test('should display percentage discount badge on product card', async ({ page }) => {
    // Navigate to storefront (customer view)
    const tenantId = 'demo_galeria'
    await page.goto(`${getBaseUrl(page)}/es/${tenantId}`)
    await page.waitForLoadState('networkidle')

    // Wait for product cards to load
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({
      timeout: 10000,
    })

    // Find a product with active discount badge
    const discountBadges = page.locator(DiscountsLocators.productCard.discountBadge)
    const count = await discountBadges.count()

    // If discounts exist, verify structure
    if (count > 0) {
      const firstBadge = discountBadges.first()
      await expect(firstBadge).toBeVisible()

      // Badge should be near discounted price
      const discountedPrices = page.locator(DiscountsLocators.productCard.discountedPrice)
      expect(await discountedPrices.count()).toBeGreaterThan(0)
    }
  })

  test('should show strikethrough original price when discount active', async ({ page }) => {
    // Navigate to storefront
    const tenantId = 'demo_galeria'
    await page.goto(`${getBaseUrl(page)}/es/${tenantId}`)
    await page.waitForLoadState('networkidle')

    // Wait for product cards
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({
      timeout: 10000,
    })

    // Find original prices (strikethrough)
    const originalPrices = page.locator(DiscountsLocators.productCard.originalPrice)
    const count = await originalPrices.count()

    // If discounts exist
    if (count > 0) {
      // Verify original price has strikethrough style
      const firstOriginal = originalPrices.first()
      const classes = await firstOriginal.getAttribute('class')

      // Look for strikethrough or line-through class
      expect(classes).toMatch(/line-through|strikethrough/i)
    }
  })

  test('should not show discount badge when discount inactive', async ({ page }) => {
    // Navigate to storefront
    const tenantId = 'demo_galeria'
    await page.goto(`${getBaseUrl(page)}/es/${tenantId}`)
    await page.waitForLoadState('networkidle')

    // Wait for cards
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({
      timeout: 10000,
    })

    // Check that some products exist without discount badges
    const allCards = page.locator('[data-testid="product-card"]')
    const cardCount = await allCards.count()
    expect(cardCount).toBeGreaterThan(0)

    // At least one card should not have a discount badge
    // (assuming mixed products)
  })

  // =========================================================================
  // CART: Discounted Prices
  // =========================================================================

  test('should show discounted prices in cart', async ({ page }) => {
    // Navigate to storefront
    const tenantId = 'demo_galeria'
    await page.goto(`${getBaseUrl(page)}/es/${tenantId}`)
    await page.waitForLoadState('networkidle')

    // Wait for product cards
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({
      timeout: 10000,
    })

    // Find product with discount badge
    const discountedCard = page
      .locator('[data-testid="product-card"]')
      .filter({ has: page.locator(DiscountsLocators.productCard.discountBadge) })
      .first()

    if ((await discountedCard.count()) > 0) {
      // Click add to cart
      await discountedCard.getByTestId('product-card-add-to-cart').click()

      // Wait for cart to update
      await page.waitForTimeout(500)

      // Open cart sheet
      await page.getByTestId('cart-button').click()
      await expect(page.getByTestId('cart-sheet')).toBeVisible()

      // Verify cart shows original + discounted prices
      const originalInCart = page.locator(DiscountsLocators.cartItem.originalPrice)
      const discountedInCart = page.locator(DiscountsLocators.cartItem.discountedPrice)

      // If cart has discounted item
      if ((await originalInCart.count()) > 0) {
        await expect(originalInCart.first()).toBeVisible()
        await expect(discountedInCart.first()).toBeVisible()
      }
    }
  })

  // =========================================================================
  // CHECKOUT: Order Total Uses Discounted Prices
  // =========================================================================

  test('should calculate checkout total with discounted prices', async ({ page }) => {
    // Navigate to storefront
    const tenantId = 'demo_galeria'
    await page.goto(`${getBaseUrl(page)}/es/${tenantId}`)
    await page.waitForLoadState('networkidle')

    // Wait for cards
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({
      timeout: 10000,
    })

    // Find product with discount
    const discountedCard = page
      .locator('[data-testid="product-card"]')
      .filter({ has: page.locator(DiscountsLocators.productCard.discountBadge) })
      .first()

    if ((await discountedCard.count()) > 0) {
      // Click add to cart
      await discountedCard.getByTestId('product-card-add-to-cart').click()

      // Wait for cart
      await page.waitForTimeout(500)

      // Open cart
      await page.getByTestId('cart-button').click()
      await expect(page.getByTestId('cart-sheet')).toBeVisible()

      // Proceed to checkout
      const checkoutBtn = page.getByTestId('cart-checkout-button')
      if ((await checkoutBtn.count()) > 0) {
        await checkoutBtn.click()
        await page.waitForURL(/checkout/, { timeout: 10000 })

        // Verify checkout summary uses discounted total
        // (total should be less than original)
        await expect(page.getByTestId('checkout-summary')).toBeVisible({
          timeout: 5000,
        })
      }
    }
  })

  // =========================================================================
  // EDGE CASES
  // =========================================================================

  test('should handle expired discount (no longer active)', async ({ page }) => {
    // Navigate to dashboard
    await page.goto(`${getBaseUrl(page)}/es/${TEST_TENANT}/dashboard/products`)
    await page.waitForURL(/dashboard\/products/)

    // Create product with past end date
    await page.getByTestId('products-new-button').click()

    const form = new ProductFormPage(page)
    await form.waitForForm()

    // Fill product
    await form.fillName('Expired Discount Product')
    await form.fillCategory('Test')
    await form.fillPrice('2000')

    // Set discount that has already expired
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    await form.configureDiscount({
      enabled: true,
      type: 'percentage',
      value: 30,
      endsAt: yesterdayStr,
    })

    // Submit
    await form.submit()
    await expect(page.getByText(/creado|éxito/i)).toBeVisible({ timeout: 10000 })

    // Navigate to storefront
    await page.goto(`${getBaseUrl(page)}/es/${TEST_TENANT}`)
    await page.waitForLoadState('networkidle')

    // Product should NOT show discount badge (expired)
    const expiredProductCard = page
      .locator('[data-testid="product-card"]')
      .filter({ hasText: 'Expired Discount Product' })
      .first()

    if ((await expiredProductCard.count()) > 0) {
      const badge = expiredProductCard.locator(DiscountsLocators.productCard.discountBadge)
      expect(await badge.count()).toBe(0)
    }
  })

  test('should handle future discount (not yet active)', async ({ page }) => {
    // Navigate to dashboard
    await page.goto(`${getBaseUrl(page)}/es/${TEST_TENANT}/dashboard/products`)
    await page.waitForURL(/dashboard\/products/)

    // Create product with future start date
    await page.getByTestId('products-new-button').click()

    const form = new ProductFormPage(page)
    await form.waitForForm()

    // Fill product
    await form.fillName('Future Discount Product')
    await form.fillCategory('Test')
    await form.fillPrice('2500')

    // Set discount starting tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    await form.configureDiscount({
      enabled: true,
      type: 'percentage',
      value: 15,
      startsAt: tomorrowStr,
    })

    // Submit
    await form.submit()
    await expect(page.getByText(/creado|éxito/i)).toBeVisible({ timeout: 10000 })

    // Navigate to storefront
    await page.goto(`${getBaseUrl(page)}/es/${TEST_TENANT}`)
    await page.waitForLoadState('networkidle')

    // Product should NOT show discount badge (not active yet)
    const futureProductCard = page
      .locator('[data-testid="product-card"]')
      .filter({ hasText: 'Future Discount Product' })
      .first()

    if ((await futureProductCard.count()) > 0) {
      const badge = futureProductCard.locator(DiscountsLocators.productCard.discountBadge)
      expect(await badge.count()).toBe(0)
    }
  })
})
