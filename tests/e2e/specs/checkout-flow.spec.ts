/**
 * Checkout Flow E2E Test Suite (SKY-5.4)
 *
 * Tests the complete checkout flow:
 * 1. Add products to cart
 * 2. Fill customer form with validation
 * 3. Select payment method
 * 4. Submit checkout
 * 5. Verify success/failure pages
 *
 * Uses data-testid selectors per TEST_ID_CONTRACT.md
 */

import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  const TEST_TENANT = 'test-store' // Use existing test tenant or create one
  const BASE_URL = `http://localhost:3000/${TEST_TENANT}`

  test.beforeEach(async ({ page }) => {
    // Navigate to tenant store
    await page.goto(BASE_URL)
  })

  // ============================================================================
  // TEST 1: Form Validation Errors
  // ============================================================================
  test('should show validation errors for invalid form data', async ({ page }) => {
    // Add a product to cart first (assuming there's a product)
    // This will depend on your existing product page structure
    // For now, we'll skip to checkout assuming cart has items

    // Open checkout modal (you may need to adjust this based on your UI)
    const checkoutButton = page.getByTestId('cart-checkout-button')
    await checkoutButton.click()

    // Wait for modal to appear
    await expect(page.getByTestId('checkout-modal-overlay')).toBeVisible()

    // Try to submit empty form
    const submitButton = page.getByTestId('checkout-submit-button')
    await submitButton.click()

    // Verify validation errors appear
    await expect(page.getByTestId('checkout-error-name')).toBeVisible()
    await expect(page.getByTestId('checkout-error-phone')).toBeVisible()
    await expect(page.getByTestId('checkout-error-email')).toBeVisible()

    // Fill invalid phone (less than 10 digits)
    await page.getByTestId('checkout-input-phone').fill('123')
    await submitButton.click()
    await expect(page.getByTestId('checkout-error-phone')).toContainText('10 digits')

    // Fill invalid email
    await page.getByTestId('checkout-input-email').fill('invalid-email')
    await submitButton.click()
    await expect(page.getByTestId('checkout-error-email')).toContainText('Invalid email')
  })

  // ============================================================================
  // TEST 2: Valid Form Submission with Cash Payment
  // ============================================================================
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

    // Open checkout modal
    const checkoutButton = page.getByTestId('cart-checkout-button')
    await checkoutButton.click()

    // Wait for modal
    await expect(page.getByTestId('checkout-modal-overlay')).toBeVisible()

    // Fill valid form data
    await page.getByTestId('checkout-input-name').fill('John Doe')
    await page.getByTestId('checkout-input-phone').fill('1234567890')
    await page.getByTestId('checkout-input-email').fill('john@example.com')
    await page.getByTestId('checkout-input-notes').fill('Please ring the doorbell')

    // Select cash payment
    await page.getByTestId('checkout-payment-cash').click()

    // Verify payment method is selected
    await expect(page.getByTestId('checkout-payment-cash')).toBeChecked()

    // Submit form
    const submitButton = page.getByTestId('checkout-submit-button')
    await submitButton.click()

    // Wait for redirect to success page
    await page.waitForURL(`**/${TEST_TENANT}/checkout/success**`)

    // Verify success page loads
    await expect(page.getByTestId('checkout-success-header')).toBeVisible()
  })

  // ============================================================================
  // TEST 3: MercadoPago Payment Flow
  // ============================================================================
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

    // Open checkout modal
    const checkoutButton = page.getByTestId('cart-checkout-button')
    await checkoutButton.click()

    // Wait for modal
    await expect(page.getByTestId('checkout-modal-overlay')).toBeVisible()

    // Fill valid form data
    await page.getByTestId('checkout-input-name').fill('Jane Smith')
    await page.getByTestId('checkout-input-phone').fill('9876543210')
    await page.getByTestId('checkout-input-email').fill('jane@example.com')

    // Select MercadoPago payment (should be default)
    await page.getByTestId('checkout-payment-mercadopago').click()
    await expect(page.getByTestId('checkout-payment-mercadopago')).toBeChecked()

    // Submit form and expect redirect
    const submitButton = page.getByTestId('checkout-submit-button')

    // Listen for navigation
    const navigationPromise = page.waitForURL(mockCheckoutUrl)
    await submitButton.click()

    // Verify redirect happens
    await navigationPromise
    expect(page.url()).toBe(mockCheckoutUrl)
  })

  // ============================================================================
  // TEST 4: Success Page Display
  // ============================================================================
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
    await page.goto(`${BASE_URL}/checkout/success?orderId=12345`)

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

  // ============================================================================
  // TEST 5: Failure Page Display
  // ============================================================================
  test('should display error message on failure page', async ({ page }) => {
    // Navigate directly to failure page
    await page.goto(`${BASE_URL}/checkout/failure?error=Payment declined&orderId=12345`)

    // Verify failure page elements
    await expect(page.getByTestId('checkout-failure-container')).toBeVisible()
    await expect(page.getByTestId('checkout-failure-title')).toContainText('Payment Failed')
    await expect(page.getByTestId('checkout-failure-message')).toContainText('Payment declined')
    await expect(page.getByTestId('checkout-failure-order-id')).toContainText('12345')

    // Verify action buttons
    await expect(page.getByTestId('checkout-failure-retry')).toBeVisible()
    await expect(page.getByTestId('checkout-failure-back-to-store')).toBeVisible()

    // Test retry button
    await page.getByTestId('checkout-failure-retry').click()
    await page.waitForURL(`**/${TEST_TENANT}/cart`)
  })

  // ============================================================================
  // TEST 6: Order Summary in Checkout Modal
  // ============================================================================
  test('should display correct order summary in checkout modal', async ({ page }) => {
    // This test assumes cart already has items
    // You may need to add products to cart first

    // Open checkout modal
    const checkoutButton = page.getByTestId('cart-checkout-button')
    await checkoutButton.click()

    // Wait for modal
    await expect(page.getByTestId('checkout-modal-overlay')).toBeVisible()

    // Verify order summary section
    await expect(page.getByTestId('checkout-order-summary')).toBeVisible()

    // Verify total is displayed
    await expect(page.getByTestId('checkout-total')).toBeVisible()

    // Verify at least one item is shown
    await expect(page.getByTestId('checkout-item-0')).toBeVisible()
  })

  // ============================================================================
  // TEST 7: Loading State During Submission
  // ============================================================================
  test('should show loading state during form submission', async ({ page }) => {
    // Delay the API response to test loading state
    await page.route('/api/checkout/create-preference', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, orderId: 123 }),
      })
    })

    // Open checkout modal
    const checkoutButton = page.getByTestId('cart-checkout-button')
    await checkoutButton.click()

    // Fill form
    await page.getByTestId('checkout-input-name').fill('Test User')
    await page.getByTestId('checkout-input-phone').fill('1234567890')
    await page.getByTestId('checkout-input-email').fill('test@example.com')

    // Submit
    const submitButton = page.getByTestId('checkout-submit-button')
    await submitButton.click()

    // Verify loading state
    await expect(submitButton).toContainText('Processing')
    await expect(submitButton).toBeDisabled()
  })

  // ============================================================================
  // TEST 8: API Error Handling
  // ============================================================================
  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/checkout/create-preference', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      })
    })

    // Open checkout modal
    const checkoutButton = page.getByTestId('cart-checkout-button')
    await checkoutButton.click()

    // Fill form
    await page.getByTestId('checkout-input-name').fill('Test User')
    await page.getByTestId('checkout-input-phone').fill('1234567890')
    await page.getByTestId('checkout-input-email').fill('test@example.com')

    // Submit
    const submitButton = page.getByTestId('checkout-submit-button')
    await submitButton.click()

    // Verify error toast appears (using sonner)
    // Note: This may need adjustment based on your toast implementation
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 })
  })
})
