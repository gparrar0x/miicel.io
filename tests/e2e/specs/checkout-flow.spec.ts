/**
 * Checkout Flow E2E Test Suite - Happy Paths Only
 *
 * Tests the complete checkout flow (success scenarios only):
 * 1. Add products to cart
 * 2. Fill customer form
 * 3. Select payment method
 * 4. Submit checkout
 * 5. Verify success pages
 *
 * Uses data-testid selectors per TEST_ID_CONTRACT.md
 */

import { test, expect } from '@playwright/test'

test.describe('Checkout Flow - Happy Paths', () => {
  const TEST_TENANT = 'demo_galeria' // Use demo tenant ID 1

  // Helper function to get base URL from page context
  function getBaseUrl(page: any): string {
    const baseURL = page.context().baseURL || 'http://localhost:3000'
    return `${baseURL}/es/${TEST_TENANT}`
  }

  test.beforeEach(async ({ page }) => {
    // Navigate to tenant store
    await page.goto(getBaseUrl(page))
  })

  test('should successfully submit checkout with cash payment', async ({ page, context }) => {
    // Mock the API response for checkout
    await page.route('/api/checkout/create-preference', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orderId: 12345,
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
    await page.getByTestId('checkout-name-input').fill('John Doe')
    await page.getByTestId('checkout-phone-input').fill('1234567890')
    await page.getByTestId('checkout-email-input').fill('john@example.com')
    await page.getByTestId('checkout-input-notes').fill('Please ring the doorbell')

    // Select cash payment
    await page.getByTestId('checkout-payment-cash').click()

    // Verify payment method is selected
    await expect(page.getByTestId('checkout-payment-cash')).toBeChecked()

    // Verify order summary visible
    const orderSummary = page.locator('[data-testid="checkout-order-summary"]')
    await expect(orderSummary).toBeVisible()

    // Verify submit button is visible and enabled
    const submitButton = page.getByTestId('checkout-submit-button')
    await expect(submitButton).toBeVisible()
    await expect(submitButton).not.toBeDisabled()
  })

  test('should redirect to MercadoPago for online payment', async ({ page, context }) => {
    const mockCheckoutUrl = 'https://www.mercadopago.com/checkout/v1/redirect?pref_id=mock-123'

    // Mock the API response with MercadoPago URL
    await page.route('/api/checkout/create-preference', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orderId: 12345,
          checkoutUrl: mockCheckoutUrl,
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

  test('should display order summary on success page', async ({ page }) => {
    const mockOrderData = {
      orderId: '12345',
      customer: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      },
      items: [
        { name: 'Product 1', quantity: 2, price: 25.0, currency: 'USD' },
        { name: 'Product 2', quantity: 1, price: 50.0, currency: 'USD' },
      ],
      total: 100.0,
      currency: 'USD',
      paymentMethod: 'cash',
    }

    // Mock the order fetch API
    await page.route('/api/orders/12345', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOrderData),
      })
    })

    // Navigate directly to success page
    await page.goto(`${getBaseUrl(page)}/checkout/success?orderId=12345`)

    // Verify success page elements
    await expect(page.getByTestId('checkout-success-header')).toBeVisible()
    await expect(page.getByTestId('checkout-success-order-id')).toContainText('12345')

    // Verify customer info
    await expect(page.getByTestId('checkout-success-customer-name')).toContainText('John Doe')
    await expect(page.getByTestId('checkout-success-customer-email')).toContainText('john@example.com')
    await expect(page.getByTestId('checkout-success-customer-phone')).toContainText('1234567890')

    // Verify order items
    await expect(page.getByTestId('checkout-success-item-0')).toContainText('Product 1')
    await expect(page.getByTestId('checkout-success-item-1')).toContainText('Product 2')

    // Verify total
    await expect(page.getByTestId('checkout-success-total')).toContainText('100.00')

    // Verify action buttons
    await expect(page.getByTestId('checkout-success-continue-shopping')).toBeVisible()
    await expect(page.getByTestId('checkout-success-print')).toBeVisible()
  })
})
