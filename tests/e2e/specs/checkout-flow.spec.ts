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
  const TEST_TENANT = 'test-store' // Use existing test tenant or create one
  const BASE_URL = `http://localhost:3000/${TEST_TENANT}`

  test.beforeEach(async ({ page }) => {
    // Navigate to tenant store
    await page.goto(BASE_URL)
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
})
