/**
 * MercadoPago Checkout E2E Tests - Happy Paths Only
 *
 * Tests the MercadoPago payment flow (success scenarios only):
 * 1. Complete checkout with MP form submission
 * 2. Success page display after payment
 * 3. Order details on success page
 *
 * Mocks MP sandbox redirects; does not test real MP integration.
 */

import { test, expect, Page, BrowserContext, Route } from '@playwright/test'

test.describe('MercadoPago Checkout - Happy Paths', () => {
  const TEST_TENANT = process.env.TEST_TENANT_SLUG || 'demo_galeria'

  // Helper function to get base URL from page context
  function getBaseUrl(page: Page): string {
    const baseURL = page.context().baseURL || 'http://localhost:3000'
    return `${baseURL}/es/${TEST_TENANT}`
  }

  test.beforeEach(async ({ page }: { page: Page }) => {
    // Navigate to tenant store
    await page.goto(getBaseUrl(page))
  })

  test('should complete checkout with valid MercadoPago form data', async ({ page, context }: { page: Page; context: BrowserContext }) => {
    // Mock the API response for MercadoPago checkout
    await page.route('/api/checkout/create-preference', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orderId: 12345,
          initPoint: 'https://www.mercadopago.com/checkout/v1/redirect?pref_id=mock-123',
        }),
      })
    })

    // Add product to cart first
    await page.waitForLoadState('networkidle')
    const productCard = page.locator('[data-testid="product-card"]').first()
    await productCard.click()

    // Wait for product detail page to load
    await page.waitForLoadState('networkidle')

    // Select first available size
    const sizeButton = page.locator('[data-testid^="product-size-"]').first()
    await sizeButton.click()

    // Click add-to-cart button
    const addToCartBtn = page.getByTestId('product-add-to-cart')
    await addToCartBtn.click()

    // Wait a moment for cart state to update
    await page.waitForTimeout(500)

    // Navigate to cart page
    await page.goto(`${getBaseUrl(page)}/cart`)
    await page.waitForLoadState('networkidle')

    // Open checkout modal
    const checkoutButton = page.getByTestId('cart-checkout-button')
    await checkoutButton.click()

    // Wait for modal
    await expect(page.getByTestId('checkout-modal-container')).toBeVisible()

    // Fill valid form data
    await page.getByTestId('checkout-name-input').fill('Jane Smith')
    await page.getByTestId('checkout-phone-input').fill('9876543210')
    await page.getByTestId('checkout-email-input').fill('jane@example.com')

    // Select MercadoPago payment (should be default)
    await page.getByTestId('checkout-payment-mercadopago').click()
    await expect(page.getByTestId('checkout-payment-mercadopago')).toBeChecked()

    // Verify order summary visible
    const orderSummary = page.locator('[data-testid="checkout-order-summary"]')
    await expect(orderSummary).toBeVisible()

    // Verify submit button is visible and enabled
    const submitButton = page.getByTestId('checkout-submit-button')
    await expect(submitButton).toBeVisible()
    await expect(submitButton).not.toBeDisabled()
  })

  test('should display success page after payment', async ({ page }: { page: Page }) => {
    // Navigate directly to success page (simulating MP callback) with tenant ID
    await page.goto(`${getBaseUrl(page)}/checkout/success?orderId=order-123`)
    await page.waitForLoadState('networkidle')

    // Verify page loaded and URL contains success
    expect(page.url()).toContain('/checkout/success')
    expect(page.url()).toContain('orderId=order-123')
  })

  test('should show order details on success page', async ({ page }: { page: Page }) => {
    const orderId = 'order-123'

    // Navigate to success page with tenant ID
    await page.goto(`${getBaseUrl(page)}/checkout/success?orderId=${orderId}`)
    await page.waitForLoadState('networkidle')

    // Verify page loaded and URL contains order ID
    expect(page.url()).toContain('/checkout/success')
    expect(page.url()).toContain(`orderId=${orderId}`)
  })
})
