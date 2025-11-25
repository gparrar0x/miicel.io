/**
 * MercadoPago Checkout E2E Tests - Happy Paths Only
 *
 * Tests the MercadoPago payment flow (success scenarios only):
 * 1. Complete checkout with MP redirect
 * 2. Success page display
 * 3. Order number visible
 *
 * Mocks MP sandbox redirects; does not test real MP integration.
 */

import { test, expect } from '@playwright/test'
import { CheckoutPage } from '../pages/checkout.page'
import { StorefrontPage } from '../pages/storefront.page'

test.describe('MercadoPago Checkout - Happy Paths', () => {
  let checkoutPage: CheckoutPage
  let storefrontPage: StorefrontPage

  test.beforeEach(async ({ page }) => {
    checkoutPage = new CheckoutPage(page)
    storefrontPage = new StorefrontPage(page)

    // Navigate to test tenant storefront
    await storefrontPage.goto('test-store')
  })

  test('should complete checkout with valid MercadoPago form data', async ({ page }) => {
    // Mock MercadoPago preference response BEFORE opening modal
    await checkoutPage.mockMercadopagoPreferenceSuccess('order-123', 'https://www.mercadopago.com/checkout/mp-pref-123')

    const checkoutBtn = page.locator('[data-testid*="checkout"]').first()
    if (await checkoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await checkoutBtn.click()
    }

    expect(await checkoutPage.isModalVisible()).toBe(true)

    // Fill valid form
    await checkoutPage.fillCustomerForm({
      name: 'Jane Smith',
      phone: '9876543210',
      email: 'jane@example.com',
    })

    // Select MercadoPago (should be default)
    await checkoutPage.selectMercadopagoPayment()
    expect(await checkoutPage.isMercadopagoSelected()).toBe(true)

    // Submit form
    await checkoutPage.submitCheckout()

    // Wait for loading to complete
    await checkoutPage.waitForLoadingComplete()

    // Verify no validation errors
    const errors = await checkoutPage.getVisibleErrors()
    expect(Object.keys(errors).length).toBe(0)
  })

  test('should display success page after payment', async ({ page }) => {
    // Mock successful checkout
    await checkoutPage.mockMercadopagoPreferenceSuccess('order-123')

    // Navigate directly to success page (simulating MP callback)
    await checkoutPage.gotoSuccessPage('order-123')

    // Verify success page is displayed
    const isSuccess = await checkoutPage.isSuccessPageVisible()
    expect(isSuccess).toBe(true)

    // Verify content
    const title = page.locator(
      '[data-testid="checkout-success-title"], [data-testid="checkout-success-header"]'
    )
    expect(await title.isVisible({ timeout: 2000 }).catch(() => false)).toBe(true)
  })

  test('should show order number on success page', async ({ page }) => {
    const orderId = 'order-123'

    // Navigate to success page
    await checkoutPage.gotoSuccessPage(orderId)

    // Verify order number is displayed
    const orderElement = page.locator('[data-testid*="order"]')
    const isVisible = await orderElement.isVisible({ timeout: 2000 }).catch(() => false)
    expect(isVisible).toBe(true)
  })
})
