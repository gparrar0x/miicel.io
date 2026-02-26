/**
 * Complete Purchase Flow E2E Test
 *
 * Tests the full buyer journey:
 * 1. Browse catalog
 * 2. Select product(s)
 * 3. Add to cart
 * 4. Complete checkout with MercadoPago
 * 5. Return to success page (simulated MP callback)
 * 6. Verify WhatsApp button available
 *
 * Uses data-testid selectors per TEST_ID_CONTRACT.md
 */

import { expect, type Page, type Route, test } from '@playwright/test'

test.describe('Complete Purchase Flow - Happy Path', () => {
  const TEST_TENANT = 'demo_galeria'

  // Helper function to get base URL from page context
  function getBaseUrl(page: Page): string {
    const baseURL = page.context().baseURL || 'http://localhost:3000'
    return `${baseURL}/es/${TEST_TENANT}`
  }

  // Mock order data for success page
  const mockOrderData = {
    orderId: '99999',
    customer: {
      name: 'Test Buyer',
      email: 'buyer@test.com',
      phone: '5491155667788',
    },
    items: [{ name: 'Producto Test', quantity: 1, price: 1500.0, currency: 'ARS' }],
    total: 1500.0,
    currency: 'ARS',
    paymentMethod: 'mercadopago',
    status: 'paid', // Important: enables WhatsApp button
  }

  test('should complete full purchase journey: catalog → cart → checkout → MP → success → WhatsApp', async ({
    page,
  }) => {
    // ========================================
    // STEP 1: Browse Catalog
    // ========================================
    await page.goto(getBaseUrl(page))
    await page.waitForLoadState('networkidle')

    // Verify catalog loads with products
    const productCards = page.locator('[data-testid="product-card"]')
    await expect(productCards.first()).toBeVisible({ timeout: 10000 })

    const productCount = await productCards.count()
    expect(productCount).toBeGreaterThan(0)

    // ========================================
    // STEP 2: Select Product
    // ========================================
    // Click first product to view details
    await productCards.first().click()
    await page.waitForLoadState('networkidle')

    // Verify product detail page loaded
    await expect(page.getByTestId('product-add-to-cart')).toBeVisible({ timeout: 5000 })

    // ========================================
    // STEP 3: Add to Cart
    // ========================================
    // Select size if available (some products require it)
    const sizeButtons = page.locator('[data-testid^="product-size-"]')
    const sizeCount = await sizeButtons.count()
    if (sizeCount > 0) {
      await sizeButtons.first().click()
    }

    // Add to cart
    await page.getByTestId('product-add-to-cart').click()
    await page.waitForTimeout(500) // Wait for cart state update

    // ========================================
    // STEP 4: Go to Cart
    // ========================================
    await page.goto(`${getBaseUrl(page)}/cart`)
    await page.waitForLoadState('networkidle')

    // Verify cart has items
    await expect(page.getByTestId('cart-items-list')).toBeVisible()
    await expect(page.getByTestId('cart-checkout-button')).toBeVisible()

    // ========================================
    // STEP 5: Open Checkout Modal
    // ========================================
    await page.getByTestId('cart-checkout-button').click()
    await expect(page.getByTestId('checkout-modal-container')).toBeVisible()

    // ========================================
    // STEP 6: Fill Checkout Form
    // ========================================
    await page.getByTestId('checkout-name-input').fill('Test Buyer')
    await page.getByTestId('checkout-phone-input').fill('5491155667')
    await page.getByTestId('checkout-email-input').fill('buyer@test.com')

    // Select MercadoPago
    await page.getByTestId('checkout-payment-mercadopago').click()
    await expect(page.getByTestId('checkout-payment-mercadopago')).toBeChecked()

    // Verify order summary
    await expect(page.getByTestId('checkout-order-summary')).toBeVisible()
    await expect(page.getByTestId('checkout-total')).toBeVisible()

    // Verify submit button ready
    const submitButton = page.getByTestId('checkout-submit-button')
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()

    // ========================================
    // STEP 7: Submit Checkout (Mocked)
    // ========================================
    // Mock the checkout API to return MP redirect URL
    await page.route('/api/checkout/create-preference', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          orderId: 99999,
          initPoint: `${getBaseUrl(page)}/checkout/success?external_reference=99999&status=approved&payment_id=12345`,
        }),
      })
    })

    // Mock order API for success page
    await page.route('/api/orders/99999', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOrderData),
      })
    })

    // Submit the form
    await submitButton.click()

    // Wait for redirect (mocked to success page)
    await page.waitForURL(/checkout\/success/, { timeout: 10000 })

    // ========================================
    // STEP 8: Verify Success Page
    // ========================================
    await expect(page.getByTestId('checkout-success-header')).toBeVisible()
    await expect(page.getByTestId('checkout-success-order-id')).toContainText('99999')

    // Verify customer info
    await expect(page.getByTestId('checkout-success-customer-name')).toContainText('Test Buyer')
    await expect(page.getByTestId('checkout-success-customer-email')).toContainText(
      'buyer@test.com',
    )

    // Verify order items
    await expect(page.getByTestId('checkout-success-item-0')).toBeVisible()

    // Verify total
    await expect(page.getByTestId('checkout-success-total')).toBeVisible()

    // ========================================
    // STEP 9: Verify WhatsApp Button
    // ========================================
    // WhatsApp button should be visible when status = 'paid'
    const whatsappButton = page.getByTestId('checkout-success-whatsapp')
    await expect(whatsappButton).toBeVisible()

    // Verify WhatsApp link format
    const href = await whatsappButton.getAttribute('href')
    expect(href).toContain('wa.me')
    expect(href).toContain('5491155667788') // Customer phone
    expect(href).toContain('99999') // Order ID in message

    // Verify other action buttons
    await expect(page.getByTestId('checkout-success-continue-shopping')).toBeVisible()
    await expect(page.getByTestId('checkout-success-print')).toBeVisible()
  })

  test('should show success page with payment info from MercadoPago callback', async ({ page }) => {
    // Mock order API
    await page.route('/api/orders/88888', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockOrderData,
          orderId: '88888',
        }),
      })
    })

    // Simulate MercadoPago callback URL with all params
    await page.goto(
      `${getBaseUrl(page)}/checkout/success?collection_id=123456&collection_status=approved&payment_id=123456&status=approved&external_reference=88888&payment_type=credit_card&merchant_order_id=789&preference_id=pref-xyz`,
    )

    await page.waitForLoadState('networkidle')

    // Verify success page loaded
    await expect(page.getByTestId('checkout-success-header')).toBeVisible()

    // Verify MP payment info is displayed
    await expect(page.getByTestId('checkout-success-payment-id')).toContainText('123456')
    await expect(page.getByTestId('checkout-success-payment-status')).toContainText('approved')
  })

  test('should handle cash payment flow without WhatsApp button until confirmed', async ({
    page,
  }) => {
    // Mock order with pending status (cash payment)
    await page.route('/api/orders/77777', async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockOrderData,
          orderId: '77777',
          paymentMethod: 'cash',
          status: 'pending', // Not paid yet
        }),
      })
    })

    await page.goto(`${getBaseUrl(page)}/checkout/success?orderId=77777`)
    await page.waitForLoadState('networkidle')

    // Verify success page loaded
    await expect(page.getByTestId('checkout-success-header')).toBeVisible()

    // WhatsApp button should NOT be visible for pending orders
    await expect(page.getByTestId('checkout-success-whatsapp')).not.toBeVisible()

    // Other buttons should still work
    await expect(page.getByTestId('checkout-success-continue-shopping')).toBeVisible()
    await expect(page.getByTestId('checkout-success-print')).toBeVisible()
  })
})
