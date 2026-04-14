/**
 * Buyer Nequi Checkout — happy path + rejection / cancel / expired / gating
 *
 * Scenarios 2-8 of SKY-274:
 *   2. checkout_happy_path_SUCCESS
 *   3. checkout_user_CANCELED
 *   4. checkout_nequi_DENIED
 *   5. checkout_timeout_expired
 *   6. currency_gating_ARS_hides_nequi
 *   7. phone_validation_invalid_regex
 *   8. webhook_invalid_signature_returns_401
 *
 * Strategy:
 * - Stub /api/checkout/create-preference + /api/orders/{id}/nequi-status to
 *   keep tests deterministic (no real Nequi API call).
 * - Tenant must already exist with Nequi credentials + COP currency.
 *   Either seed via helper (requires SUPABASE_SERVICE_ROLE_KEY), or rely on
 *   the `sazon-criollo` demo tenant + manual seeding before running.
 */

import { expect, type Page, test } from '@playwright/test'
import successFixture from '../fixtures/nequi/success.json'
import {
  mockNequiCheckoutPreference,
  mockNequiStatusPolling,
  postMockWebhook,
} from '../helpers/nequi.helper'
import { NequiLocators } from '../locators/nequi.locators'
import { NequiCheckoutPage } from '../pages/nequi-checkout.page'

const TEST_TENANT = process.env.TEST_NEQUI_TENANT_SLUG || 'sazon-criollo'
const ARS_TENANT = process.env.TEST_ARS_TENANT_SLUG || 'demo_galeria'
const TEST_ORDER_ID = 99999
const TEST_TX_ID = 'test-nequi-tx-001'

function tenantUrl(page: Page, slug: string, locale: string = 'es'): string {
  const baseURL = page.context().baseURL || 'http://localhost:3000'
  return `${baseURL}/${locale}/${slug}`
}

/**
 * Helper: add product to cart + open checkout modal.
 * Mirrors the pattern used by checkout-mercadopago.spec.ts.
 */
async function addProductAndOpenCheckout(page: Page, slug: string) {
  await page.goto(tenantUrl(page, slug))
  await page.waitForLoadState('networkidle')

  const productCard = page.locator('[data-testid="product-card"]').first()
  await productCard.click()
  await page.waitForLoadState('networkidle')

  const sizeButton = page.locator('[data-testid^="product-size-"]').first()
  if (await sizeButton.isVisible({ timeout: 1500 }).catch(() => false)) {
    await sizeButton.click()
  }

  const addToCartBtn = page.getByTestId('product-add-to-cart')
  await addToCartBtn.click()
  await page.waitForTimeout(500)

  await page.goto(`${tenantUrl(page, slug)}/cart`)
  await page.waitForLoadState('networkidle')

  await page.getByTestId('cart-checkout-button').click()
  await expect(page.getByTestId('checkout-modal-container')).toBeVisible()

  // Required customer fields
  await page.getByTestId('checkout-name-input').fill('Carlos Tester')
  await page.getByTestId('checkout-phone-input').fill('3001234567')
  await page.getByTestId('checkout-email-input').fill(`buyer-${Date.now()}@test.com`)
}

test.describe('Nequi checkout — buyer flow', () => {
  test('2. checkout_happy_path_SUCCESS', async ({ page }) => {
    await mockNequiCheckoutPreference(page, {
      success: true,
      orderId: TEST_ORDER_ID,
      nequiTransactionId: TEST_TX_ID,
    })

    await addProductAndOpenCheckout(page, TEST_TENANT)

    const checkout = new NequiCheckoutPage(page)
    await checkout.expectPaymentOptionVisible()
    await checkout.selectNequi()
    await checkout.enterPhone('3001234567')

    // Initial polling → pending so the pending state renders
    await mockNequiStatusPolling(page, 'pending')

    await checkout.submit()
    await checkout.waitForPending()

    // Verify pending UI elements (deeplink + countdown + icon)
    await expect(page.locator(NequiLocators.pending.icon)).toBeVisible()
    await expect(page.locator(NequiLocators.pending.countdownTimer)).toBeVisible()
    await expect(page.locator(NequiLocators.pending.deeplinkButton)).toBeVisible()

    // Now flip the polling response to paid → terminal state
    await mockNequiStatusPolling(page, 'paid')
    await checkout.waitForTerminal('approved')
  })

  test('3. checkout_user_CANCELED', async ({ page }) => {
    await mockNequiCheckoutPreference(page, {
      success: true,
      orderId: TEST_ORDER_ID,
      nequiTransactionId: TEST_TX_ID,
    })
    await addProductAndOpenCheckout(page, TEST_TENANT)

    const checkout = new NequiCheckoutPage(page)
    await checkout.selectNequi()
    await checkout.enterPhone('3001234567')

    await mockNequiStatusPolling(page, 'pending')
    await checkout.submit()
    await checkout.waitForPending()

    await mockNequiStatusPolling(page, 'cancelled')
    await checkout.waitForTerminal('canceled')

    // Retry button is the recovery affordance
    await expect(page.locator(NequiLocators.terminal.retryButton)).toBeVisible()
  })

  test('4. checkout_nequi_DENIED', async ({ page }) => {
    await mockNequiCheckoutPreference(page, {
      success: true,
      orderId: TEST_ORDER_ID,
      nequiTransactionId: TEST_TX_ID,
    })
    await addProductAndOpenCheckout(page, TEST_TENANT)

    const checkout = new NequiCheckoutPage(page)
    await checkout.selectNequi()
    await checkout.enterPhone('3001234567')

    await mockNequiStatusPolling(page, 'pending')
    await checkout.submit()
    await checkout.waitForPending()

    await mockNequiStatusPolling(page, 'failed')
    await checkout.waitForTerminal('rejected')
  })

  test('5. checkout_timeout_expired', async ({ page }) => {
    // Install fake clock so 5-min countdown can be advanced synthetically
    await page.clock.install()

    await mockNequiCheckoutPreference(page, {
      success: true,
      orderId: TEST_ORDER_ID,
      nequiTransactionId: TEST_TX_ID,
    })
    await addProductAndOpenCheckout(page, TEST_TENANT)

    const checkout = new NequiCheckoutPage(page)
    await checkout.selectNequi()
    await checkout.enterPhone('3001234567')

    // Polling always pending for the lifetime of this test
    await mockNequiStatusPolling(page, 'pending')

    await checkout.submit()
    await checkout.waitForPending()

    // Fast-forward past the 5-minute window
    await page.clock.fastForward(305_000)

    await checkout.waitForTerminal('expired')
    await expect(page.locator(NequiLocators.terminal.retryButton)).toBeVisible()
  })

  test('6. currency_gating_ARS_hides_nequi', async ({ page }) => {
    // ARS tenant — Nequi must NOT appear as a payment option
    await addProductAndOpenCheckout(page, ARS_TENANT)

    const checkout = new NequiCheckoutPage(page)
    await checkout.expectPaymentOptionHidden()
  })

  test('7. phone_validation_invalid_regex', async ({ page }) => {
    await mockNequiCheckoutPreference(page, {
      success: true,
      orderId: TEST_ORDER_ID,
      nequiTransactionId: TEST_TX_ID,
    })
    await addProductAndOpenCheckout(page, TEST_TENANT)

    const checkout = new NequiCheckoutPage(page)
    await checkout.expectPaymentOptionVisible()
    await checkout.selectNequi()

    // 1) Wrong leading digit (must start with 3)
    await checkout.enterPhone('1234567890')
    await checkout.submit()
    await checkout.expectPhoneError()

    // 2) Too short (8 digits) — masked input strips to first 10, leading digit still wrong
    await checkout.enterPhone('30012345')
    await checkout.submit()
    await checkout.expectPhoneError()

    // 3) Letters → masked input strips them, leaving empty → still invalid
    await checkout.enterPhone('abcdefghij')
    await checkout.submit()
    await checkout.expectPhoneError()
  })

  test('8. webhook_invalid_signature_returns_401', async ({ request }) => {
    const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'

    const response = await postMockWebhook(
      request,
      baseUrl,
      successFixture as Parameters<typeof postMockWebhook>[2],
      { invalidSignature: true },
    )

    expect(response.status()).toBe(401)
  })
})
