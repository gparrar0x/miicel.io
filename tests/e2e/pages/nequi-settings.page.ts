/**
 * NequiSettingsPage — page object for /dashboard/settings/nequi.
 *
 * Encapsulates form interactions for the NequiSettingsForm component.
 * Locators come from tests/e2e/locators/nequi.locators.ts (no inline selectors).
 *
 * Issue: SKY-274
 */

import { expect, type Locator, type Page } from '@playwright/test'
import { NequiLocators } from '../locators/nequi.locators'

export interface NequiCredentialsInput {
  clientId: string
  apiKey: string
  appSecret: string
  phoneNumber: string
}

export class NequiSettingsPage {
  constructor(private readonly page: Page) {}

  async goto(tenantSlug: string, locale: string = 'es'): Promise<void> {
    await this.page.goto(`/${locale}/${tenantSlug}/dashboard/settings/nequi`)
    await this.page.waitForLoadState('domcontentloaded')
  }

  // ---------------------------------------------------------------------------
  // Locator getters
  // ---------------------------------------------------------------------------

  getForm(): Locator {
    return this.page.locator(NequiLocators.settings.form)
  }

  getClientIdInput(): Locator {
    return this.page.locator(NequiLocators.settings.clientIdInput)
  }

  getApiKeyInput(): Locator {
    return this.page.locator(NequiLocators.settings.apiKeyInput)
  }

  getAppSecretInput(): Locator {
    return this.page.locator(NequiLocators.settings.appSecretInput)
  }

  getPhoneInput(): Locator {
    return this.page.locator(NequiLocators.settings.phoneInput)
  }

  getSaveButton(): Locator {
    return this.page.locator(NequiLocators.settings.saveButton)
  }

  getStatusBadge(): Locator {
    return this.page.locator(NequiLocators.settings.statusBadge)
  }

  getCurrencyWarning(): Locator {
    return this.page.locator(NequiLocators.settings.currencyWarning)
  }

  getSuccessToast(): Locator {
    return this.page.locator(NequiLocators.settings.successToast)
  }

  getErrorToast(): Locator {
    return this.page.locator(NequiLocators.settings.errorToast)
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  async fillCredentials(creds: NequiCredentialsInput): Promise<void> {
    await this.getClientIdInput().fill(creds.clientId)
    await this.getApiKeyInput().fill(creds.apiKey)
    await this.getAppSecretInput().fill(creds.appSecret)
    await this.getPhoneInput().fill(creds.phoneNumber)
  }

  async save(): Promise<void> {
    await this.getSaveButton().click()
  }

  // ---------------------------------------------------------------------------
  // Assertions (kept thin — composable from specs)
  // ---------------------------------------------------------------------------

  async expectFormVisible(): Promise<void> {
    await expect(this.getForm()).toBeVisible()
  }

  async expectSuccessToast(): Promise<void> {
    await expect(this.getSuccessToast()).toBeVisible({ timeout: 5_000 })
  }

  async expectErrorToast(): Promise<void> {
    await expect(this.getErrorToast()).toBeVisible({ timeout: 5_000 })
  }

  async expectActiveBadge(): Promise<void> {
    await expect(this.getStatusBadge()).toBeVisible()
    await expect(this.getStatusBadge()).toContainText('Activo')
  }

  async expectInactiveBadge(): Promise<void> {
    await expect(this.getStatusBadge()).toBeVisible()
    await expect(this.getStatusBadge()).toContainText('Sin configurar')
  }

  async expectCurrencyWarning(): Promise<void> {
    await expect(this.getCurrencyWarning()).toBeVisible()
  }

  async expectSaveDisabled(): Promise<void> {
    await expect(this.getSaveButton()).toBeDisabled()
  }
}
