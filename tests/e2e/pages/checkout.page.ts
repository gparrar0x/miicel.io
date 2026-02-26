/**
 * Page Object Model for Checkout Flow
 * Encapsulates all checkout interactions including form validation, payment methods, and submission
 */

import { expect, type Page } from '@playwright/test'
import { CheckoutLocators } from '../locators/checkout.locators'

export class CheckoutPage {
  readonly page: Page
  private readonly locators = CheckoutLocators

  constructor(page: Page) {
    this.page = page
  }

  // ============================================================================
  // MODAL MANAGEMENT
  // ============================================================================

  /**
   * Verify checkout modal is visible
   */
  async isModalVisible(): Promise<boolean> {
    return await this.page
      .locator(this.locators.modal.container)
      .isVisible({ timeout: 5000 })
      .catch(() => false)
  }

  /**
   * Close checkout modal
   */
  async closeModal() {
    const closeBtn = this.page.locator(this.locators.modal.closeButton)
    if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await closeBtn.click()
      await expect(this.page.locator(this.locators.modal.container)).toBeHidden({ timeout: 5000 })
    }
  }

  // ============================================================================
  // FORM FIELD INTERACTIONS
  // ============================================================================

  /**
   * Fill customer name
   */
  async fillName(name: string) {
    const input = this.page.locator(this.locators.customerForm.nameInput)
    await expect(input).toBeVisible({ timeout: 5000 })
    await input.clear()
    await input.fill(name)
  }

  /**
   * Fill customer phone
   */
  async fillPhone(phone: string) {
    const input = this.page.locator(this.locators.customerForm.phoneInput)
    await expect(input).toBeVisible({ timeout: 5000 })
    await input.clear()
    await input.fill(phone)
  }

  /**
   * Fill customer email
   */
  async fillEmail(email: string) {
    const input = this.page.locator(this.locators.customerForm.emailInput)
    await expect(input).toBeVisible({ timeout: 5000 })
    await input.clear()
    await input.fill(email)
  }

  /**
   * Fill customer address
   */
  async fillAddress(address: string) {
    const input = this.page.locator(this.locators.customerForm.addressInput)
    if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
      await input.clear()
      await input.fill(address)
    }
  }

  /**
   * Fill city
   */
  async fillCity(city: string) {
    const input = this.page.locator(this.locators.customerForm.cityInput)
    if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
      await input.clear()
      await input.fill(city)
    }
  }

  /**
   * Fill zip code
   */
  async fillZip(zip: string) {
    const input = this.page.locator(this.locators.customerForm.zipInput)
    if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
      await input.clear()
      await input.fill(zip)
    }
  }

  /**
   * Select country
   */
  async selectCountry(country: string) {
    const select = this.page.locator(this.locators.customerForm.countrySelect)
    if (await select.isVisible({ timeout: 2000 }).catch(() => false)) {
      await select.selectOption(country)
    }
  }

  /**
   * Fill complete customer form
   */
  async fillCustomerForm(data: {
    name: string
    phone: string
    email: string
    address?: string
    city?: string
    zip?: string
    country?: string
  }) {
    await this.fillName(data.name)
    await this.fillPhone(data.phone)
    await this.fillEmail(data.email)

    if (data.address) await this.fillAddress(data.address)
    if (data.city) await this.fillCity(data.city)
    if (data.zip) await this.fillZip(data.zip)
    if (data.country) await this.selectCountry(data.country)
  }

  // ============================================================================
  // PAYMENT METHOD SELECTION
  // ============================================================================

  /**
   * Select MercadoPago payment method
   */
  async selectMercadopagoPayment() {
    const radio = this.page.locator(this.locators.paymentMethod.mercadopagoRadio)
    await expect(radio).toBeVisible({ timeout: 5000 })
    await radio.click()
  }

  /**
   * Get selected payment method
   */
  async getSelectedPaymentMethod(): Promise<string | null> {
    const radios = await this.page.locator('[data-testid*="payment"][data-testid*="radio"]').all()
    for (const radio of radios) {
      const checked = await radio.isChecked()
      if (checked) {
        const testId = await radio.getAttribute('data-testid')
        return testId || null
      }
    }
    return null
  }

  /**
   * Verify MercadoPago is selected
   */
  async isMercadopagoSelected(): Promise<boolean> {
    const radio = this.page.locator(this.locators.paymentMethod.mercadopagoRadio)
    return await radio.isChecked()
  }

  // ============================================================================
  // VALIDATION ERRORS
  // ============================================================================

  /**
   * Get validation error for field
   */
  async getFieldError(fieldName: string): Promise<string | null> {
    const errorTestId = `checkout-${fieldName}-error`
    const errorElement = this.page.locator(`[data-testid="${errorTestId}"]`)

    if (await errorElement.isVisible({ timeout: 2000 }).catch(() => false)) {
      return await errorElement.textContent()
    }
    return null
  }

  /**
   * Verify field has error
   */
  async hasFieldError(fieldName: string): Promise<boolean> {
    const error = await this.getFieldError(fieldName)
    return error !== null && error.length > 0
  }

  /**
   * Get all visible errors
   */
  async getVisibleErrors(): Promise<Record<string, string>> {
    const errors: Record<string, string> = {}
    const errorElements = await this.page.locator(this.locators.validation.fieldError).all()

    for (const elem of errorElements) {
      const testId = await elem.getAttribute('data-testid')
      const text = await elem.textContent()
      if (testId && text) {
        errors[testId] = text
      }
    }

    return errors
  }

  // ============================================================================
  // ORDER SUMMARY
  // ============================================================================

  /**
   * Get order summary total
   */
  async getTotal(): Promise<string | null> {
    const total = this.page.locator(this.locators.summary.total)
    if (await total.isVisible({ timeout: 2000 }).catch(() => false)) {
      return await total.textContent()
    }
    return null
  }

  /**
   * Get item count from summary
   */
  async getItemsCount(): Promise<string | null> {
    const count = this.page.locator(this.locators.summary.itemsCount)
    if (await count.isVisible({ timeout: 2000 }).catch(() => false)) {
      return await count.textContent()
    }
    return null
  }

  /**
   * Verify order summary is visible
   */
  async isSummaryVisible(): Promise<boolean> {
    const summary = this.page.locator(this.locators.summary.container)
    return await summary.isVisible({ timeout: 2000 }).catch(() => false)
  }

  // ============================================================================
  // FORM SUBMISSION
  // ============================================================================

  /**
   * Submit checkout form
   */
  async submitCheckout() {
    const button = this.page.locator(this.locators.submit.button)
    await expect(button).toBeVisible({ timeout: 5000 })
    await button.click()
  }

  /**
   * Check if submit button is disabled
   */
  async isSubmitDisabled(): Promise<boolean> {
    const button = this.page.locator(this.locators.submit.button)
    return await button.isDisabled()
  }

  /**
   * Check if loading state is visible
   */
  async isLoading(): Promise<boolean> {
    const spinner = this.page.locator(this.locators.submit.loadingSpinner)
    return await spinner.isVisible({ timeout: 2000 }).catch(() => false)
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingComplete(timeout = 10000) {
    const spinner = this.page.locator(this.locators.submit.loadingSpinner)
    await spinner.waitFor({ state: 'hidden', timeout }).catch(() => {
      // Loading might not show, that's ok
    })
  }

  // ============================================================================
  // SUCCESS PAGE
  // ============================================================================

  /**
   * Navigate to success page
   */
  async gotoSuccessPage(orderId: string) {
    await this.page.goto(`/checkout/success?orderId=${orderId}`)
  }

  /**
   * Verify success page is displayed
   */
  async isSuccessPageVisible(): Promise<boolean> {
    const container = this.page.locator(this.locators.successPage.container)
    return await container.isVisible({ timeout: 5000 }).catch(() => false)
  }

  /**
   * Get order number from success page
   */
  async getSuccessOrderNumber(): Promise<string | null> {
    const element = this.page.locator(this.locators.successPage.orderNumber)
    if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
      return await element.textContent()
    }
    return null
  }

  /**
   * Click continue button on success page
   */
  async clickSuccessContinueButton() {
    const button = this.page.locator(this.locators.successPage.continueButton)
    if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
      await button.click()
    }
  }

  // ============================================================================
  // FAILURE PAGE
  // ============================================================================

  /**
   * Navigate to failure page
   */
  async gotoFailurePage() {
    await this.page.goto(`/checkout/failure`)
  }

  /**
   * Verify failure page is displayed
   */
  async isFailurePageVisible(): Promise<boolean> {
    const container = this.page.locator(this.locators.failurePage.container)
    return await container.isVisible({ timeout: 5000 }).catch(() => false)
  }

  /**
   * Get error message from failure page
   */
  async getFailureMessage(): Promise<string | null> {
    const message = this.page.locator(this.locators.failurePage.message)
    if (await message.isVisible({ timeout: 2000 }).catch(() => false)) {
      return await message.textContent()
    }
    return null
  }

  /**
   * Click retry button on failure page
   */
  async clickRetryButton() {
    const button = this.page.locator(this.locators.failurePage.retryButton)
    if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
      await button.click()
    }
  }

  /**
   * Click home button on failure page
   */
  async clickHomeButton() {
    const button = this.page.locator(this.locators.failurePage.homeButton)
    if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
      await button.click()
    }
  }

  // ============================================================================
  // API ROUTE MOCKING
  // ============================================================================

  /**
   * Mock successful MercadoPago preference creation
   */
  async mockMercadopagoPreferenceSuccess(
    orderId = '123',
    initPoint = 'https://www.mercadopago.com/test',
  ) {
    await this.page.route(this.locators.api.createPreferenceEndpoint, (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          orderId,
          initPoint,
        }),
      })
    })
  }

  /**
   * Mock MercadoPago preference API error
   */
  async mockMercadopagoPreferenceError(status = 500, message = 'Server error') {
    await this.page.route(this.locators.api.createPreferenceEndpoint, (route) => {
      route.fulfill({
        status,
        body: JSON.stringify({ error: message }),
      })
    })
  }

  /**
   * Mock checkout submission success
   */
  async mockCheckoutSubmitSuccess(orderId = '123') {
    await this.page.route(this.locators.api.submitCheckoutEndpoint, (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          orderId,
        }),
      })
    })
  }

  /**
   * Mock checkout submission error
   */
  async mockCheckoutSubmitError(status = 500, message = 'Server error') {
    await this.page.route(this.locators.api.submitCheckoutEndpoint, (route) => {
      route.fulfill({
        status,
        body: JSON.stringify({ error: message }),
      })
    })
  }
}
