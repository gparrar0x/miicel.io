/**
 * Complete Purchase Flow E2E Test with Real MercadoPago Sandbox
 *
 * Tests the full buyer journey with REAL MercadoPago sandbox integration:
 * 1. Browse catalog
 * 2. Select product(s)
 * 3. Add to cart
 * 4. Complete checkout form (including notes/questions)
 * 5. Redirect to MercadoPago sandbox
 * 6. Complete payment in MercadoPago sandbox
 * 7. Return to success page
 * 8. Verify WhatsApp button and message
 *
 * Uses data-testid selectors per TEST_ID_CONTRACT.md
 * Requires MERCADOPAGO_TEST_* environment variables for sandbox credentials
 */

import { test, expect, Page } from '@playwright/test'
import { MercadoPagoHelper, MercadoPagoCardData } from '../helpers/mercadopago.helper'

test.describe('Complete Purchase Flow - MercadoPago Sandbox', () => {
  const TEST_TENANT = process.env.TEST_TENANT_SLUG || 'demo_galeria'

  // Helper function to get base URL from page context
  function getBaseUrl(page: Page): string {
    const baseURL = page.context().baseURL || 'http://localhost:3000'
    return `${baseURL}/es/${TEST_TENANT}`
  }

  // MercadoPago sandbox test card data (from environment or defaults)
  function getMercadoPagoCardData(): MercadoPagoCardData {
    // Default test card for Argentina (approved)
    // Official test cards from: https://www.mercadopago.com/developers/es/docs/adobe-commerce/resources/test/cards
    // Card: Mastercard 5031 7557 3453 0604 | CVV: 123 | Exp: 11/30
    // For approved payments, cardholder name must be "APRO" and DNI "12345678"
    return {
      cardNumber: process.env.MERCADOPAGO_TEST_CARD_NUMBER || '5031 7557 3453 0604',
      cardholder: process.env.MERCADOPAGO_TEST_CARDHOLDER || 'APRO',
      expirationMonth: process.env.MERCADOPAGO_TEST_EXPIRATION_MONTH || '11',
      expirationYear: process.env.MERCADOPAGO_TEST_EXPIRATION_YEAR || '30',
      cvv: process.env.MERCADOPAGO_TEST_CVV || '123',
      installments: 1,
      dni: process.env.MERCADOPAGO_TEST_DNI || '12345678',
    }
  }

  test.beforeEach(async ({ page }) => {
    // Skip test if MP sandbox credentials not configured
    test.skip(
      !process.env.MERCADOPAGO_TEST_ACCESS_TOKEN,
      'MERCADOPAGO_TEST_ACCESS_TOKEN not set. Skipping sandbox test.'
    )
  })

  test('should complete full purchase journey with real MercadoPago sandbox', async ({
    page,
  }) => {
    const mpHelper = new MercadoPagoHelper(page)
    const cardData = getMercadoPagoCardData()

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
      await page.waitForTimeout(500)
    }

    // Add to cart
    await page.getByTestId('product-add-to-cart').click()
    await page.waitForTimeout(1000) // Wait for cart state update

    // ========================================
    // STEP 4: Go to Cart
    // ========================================
    await page.goto(`${getBaseUrl(page)}/cart`)
    await page.waitForLoadState('networkidle')

    // Verify cart has items
    await expect(page.getByTestId('cart-items-list')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('cart-checkout-button')).toBeVisible()

    // ========================================
    // STEP 5: Open Checkout Modal
    // ========================================
    await page.getByTestId('cart-checkout-button').click()
    await expect(page.getByTestId('checkout-modal-container')).toBeVisible({ timeout: 5000 })

    // ========================================
    // STEP 6: Fill Checkout Form (including notes/questions)
    // ========================================
    const testCustomerName = 'Test Buyer E2E'
    const testCustomerPhone = '1234567890'
    const testCustomerEmail = 'buyer-e2e@test.com'
    const testNotes = 'Esta es una pregunta/observación de prueba para el test E2E'

    await page.getByTestId('checkout-name-input').fill(testCustomerName)
    await page.getByTestId('checkout-phone-input').fill(testCustomerPhone)
    await page.getByTestId('checkout-email-input').fill(testCustomerEmail)

    // Fill notes field (questions/observations)
    const notesField = page.getByTestId('checkout-input-notes')
    if (await notesField.isVisible({ timeout: 2000 })) {
      await notesField.fill(testNotes)
    }

    // Select MercadoPago payment method
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
    // STEP 7: Submit Checkout (Real API call)
    // ========================================
    // Take screenshot before submitting
    await page.screenshot({ path: 'before-checkout-submit.png' })

    // Submit the form - this will make a real API call to create MP preference
    await submitButton.click()

    // Wait for redirect to MercadoPago (no mocking)
    await page.waitForTimeout(2000) // Give time for API call

    // ========================================
    // STEP 8: Complete Payment in MercadoPago Sandbox
    // ========================================
    // Wait for MP page to load
    await mpHelper.waitForMercadoPagoPage()

    // Take screenshot of MP page
    await mpHelper.takeDebugScreenshot('mp-page-loaded')

    // Fill payment form with test card
    await mpHelper.fillPaymentForm(cardData)

    // Take screenshot after filling form
    await mpHelper.takeDebugScreenshot('mp-form-filled')

    // Handle any verification steps (captcha, etc.)
    await mpHelper.handleVerificationSteps()

    // Complete payment
    await mpHelper.completePayment()

    // Take screenshot after payment submission
    await mpHelper.takeDebugScreenshot('mp-payment-submitted')

    // Wait for MP processing and redirect back
    console.log('⏳ Waiting for MercadoPago to process payment...')
    await page.waitForTimeout(1000) // Brief wait for MP to start processing

    // ========================================
    // STEP 9: Return to Success Page
    // ========================================
    // Wait for redirect back to our platform (shorter timeout for sandbox)
    await mpHelper.waitForRedirectToSuccess(getBaseUrl(page), 30000)

    // Verify we're on success page
    await expect(page).toHaveURL(/checkout\/success/, { timeout: 10000 })
    await expect(page.getByTestId('checkout-success-header')).toBeVisible({ timeout: 10000 })

    // ========================================
    // STEP 10: Verify Success Page Data
    // ========================================
    // Verify order ID is displayed
    const orderIdElement = page.getByTestId('checkout-success-order-id')
    await expect(orderIdElement).toBeVisible()
    const orderIdText = await orderIdElement.textContent()
    expect(orderIdText).toBeTruthy()

    // Extract order ID from text (format: #12345)
    const orderIdMatch = orderIdText?.match(/#(\d+)/)
    const orderId = orderIdMatch ? orderIdMatch[1] : null
    expect(orderId).toBeTruthy()

    // Verify customer info
    await expect(page.getByTestId('checkout-success-customer-name')).toContainText(
      testCustomerName
    )
    await expect(page.getByTestId('checkout-success-customer-email')).toContainText(
      testCustomerEmail
    )

    // Verify order items
    await expect(page.getByTestId('checkout-success-item-0')).toBeVisible()

    // Verify total
    await expect(page.getByTestId('checkout-success-total')).toBeVisible()

    // Verify payment status (should be approved/paid)
    const paymentStatus = page.getByTestId('checkout-success-payment-status')
    if (await paymentStatus.isVisible({ timeout: 2000 })) {
      const statusText = await paymentStatus.textContent()
      expect(statusText?.toLowerCase()).toMatch(/approved|paid|aprobado/)
    }

    // ========================================
    // STEP 11: Verify WhatsApp Button
    // ========================================
    // WhatsApp button should be visible when status = 'paid'
    const whatsappButton = page.getByTestId('checkout-success-whatsapp')
    await expect(whatsappButton).toBeVisible({ timeout: 5000 })

    // Verify WhatsApp link format
    const href = await whatsappButton.getAttribute('href')
    expect(href).toBeTruthy()
    expect(href).toContain('wa.me')
    expect(href).toContain('text=')

    // Verify message contains order details
    if (href) {
      const url = new URL(href)
      const message = decodeURIComponent(url.searchParams.get('text') || '')
      
      // Verify message contains order ID
      expect(message).toContain(orderId || '')
      
      // Verify message contains customer name
      expect(message).toContain(testCustomerName)
      
      // Verify message contains total
      expect(message).toMatch(/\d+\.\d{2}/) // Price format
    }

    // Verify other action buttons
    await expect(page.getByTestId('checkout-success-continue-shopping')).toBeVisible()
    await expect(page.getByTestId('checkout-success-print')).toBeVisible()

    // ========================================
    // STEP 12: Test WhatsApp Button Click (Optional)
    // ========================================
    // Note: Playwright can't actually open WhatsApp, but we can verify
    // the link opens in a new window/tab
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page', { timeout: 5000 }).catch(() => null),
      whatsappButton.click(),
    ])

    // If new page opened, verify it's WhatsApp
    if (newPage) {
      await newPage.waitForLoadState('networkidle', { timeout: 10000 })
      const newPageUrl = newPage.url()
      expect(newPageUrl).toContain('wa.me')
      await newPage.close()
    }

    // Take final screenshot
    await page.screenshot({ path: 'checkout-success-complete.png', fullPage: true })
  })

  test('should handle MercadoPago sandbox errors gracefully', async ({ page }) => {
    // This test can be expanded to test error scenarios
    // For now, we'll just verify the flow doesn't break with invalid data
    test.skip(true, 'Error handling test to be implemented')
  })
})

