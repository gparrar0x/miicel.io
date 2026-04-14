/**
 * NequiCheckoutPage — page object for buyer Nequi checkout flow.
 *
 * Wraps the checkout modal Nequi tab + pending state + terminal states.
 * Locators come from tests/e2e/locators/nequi.locators.ts.
 *
 * Issue: SKY-274
 */

import { expect, type Locator, type Page } from '@playwright/test'
import { NequiLocators } from '../locators/nequi.locators'

export type NequiTerminal = 'approved' | 'rejected' | 'canceled' | 'expired'

export class NequiCheckoutPage {
  constructor(private readonly page: Page) {}

  // ---------------------------------------------------------------------------
  // Locator getters
  // ---------------------------------------------------------------------------

  getPaymentOption(): Locator {
    return this.page.locator(NequiLocators.checkout.paymentOption)
  }

  getPhoneInput(): Locator {
    return this.page.locator(NequiLocators.checkout.phoneInput)
  }

  getPhoneError(): Locator {
    return this.page.locator(NequiLocators.checkout.phoneError)
  }

  getSubmitButton(): Locator {
    return this.page.locator(NequiLocators.checkout.submitButton)
  }

  getPendingContainer(): Locator {
    return this.page.locator(NequiLocators.pending.container)
  }

  getCountdownTimer(): Locator {
    return this.page.locator(NequiLocators.pending.countdownTimer)
  }

  getDeeplinkButton(): Locator {
    return this.page.locator(NequiLocators.pending.deeplinkButton)
  }

  getStoreFallbackLink(): Locator {
    return this.page.locator(NequiLocators.pending.storeFallbackLink)
  }

  getTerminalContainer(state: NequiTerminal): Locator {
    return this.page.locator(NequiLocators.terminal[state])
  }

  getRetryButton(): Locator {
    return this.page.locator(NequiLocators.terminal.retryButton)
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  async selectNequi(): Promise<void> {
    await this.getPaymentOption().click()
  }

  async enterPhone(phone: string): Promise<void> {
    const input = this.getPhoneInput()
    await input.click()
    await input.fill(phone)
  }

  async submit(): Promise<void> {
    await this.getSubmitButton().click()
  }

  async clickDeeplink(): Promise<void> {
    await this.getDeeplinkButton().click()
  }

  async clickRetry(): Promise<void> {
    await this.getRetryButton().click()
  }

  // ---------------------------------------------------------------------------
  // Waits / assertions
  // ---------------------------------------------------------------------------

  async waitForPending(timeout: number = 10_000): Promise<void> {
    await expect(this.getPendingContainer()).toBeVisible({ timeout })
  }

  async waitForTerminal(state: NequiTerminal, timeout: number = 15_000): Promise<void> {
    await expect(this.getTerminalContainer(state)).toBeVisible({ timeout })
  }

  async expectPaymentOptionVisible(): Promise<void> {
    await expect(this.getPaymentOption()).toBeVisible()
  }

  async expectPaymentOptionHidden(): Promise<void> {
    await expect(this.getPaymentOption()).toBeHidden()
  }

  async expectPhoneError(): Promise<void> {
    await expect(this.getPhoneError()).toBeVisible()
  }
}
