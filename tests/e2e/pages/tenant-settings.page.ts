/**
 * Tenant Settings Page Object
 *
 * Encapsulates tenant settings dashboard interactions:
 * - Navigate to settings
 * - Configure WhatsApp number
 * - Validate input and error states
 * - Save configuration
 */

import { expect, type Locator, type Page } from '@playwright/test'
import { WhatsAppLocators } from '../locators/whatsapp.locators'

export class TenantSettingsPage {
  readonly page: Page
  readonly contactTab: Locator
  readonly whatsappInput: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.page = page
    this.contactTab = page.locator(WhatsAppLocators.settings.contactTabButton)
    this.whatsappInput = page.locator(WhatsAppLocators.settings.whatsappInput)
    this.saveButton = page.locator(WhatsAppLocators.settings.saveButton)
  }

  /**
   * Navigate to tenant settings page
   * @param tenantSlug - Tenant slug (e.g., 'demo_galeria')
   * @param locale - Locale (default: 'es')
   */
  async goto(tenantSlug: string, locale: string = 'es') {
    await this.page.goto(`/${locale}/${tenantSlug}/dashboard/settings`)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Click contact tab to reveal WhatsApp configuration
   */
  async clickContactTab() {
    await this.contactTab.click()
    // Wait for tab content to be visible
    await this.whatsappInput.waitFor({ state: 'visible', timeout: 5000 })
  }

  /**
   * Fill WhatsApp number
   * @param phoneNumber - Phone number (format: +55 11 9 8765-4321 or similar)
   */
  async fillWhatsappNumber(phoneNumber: string) {
    await this.whatsappInput.clear()
    await this.whatsappInput.fill(phoneNumber)
  }

  /**
   * Get current WhatsApp input value
   */
  async getWhatsappValue(): Promise<string> {
    return await this.whatsappInput.inputValue()
  }

  /**
   * Clear WhatsApp number
   */
  async clearWhatsappNumber() {
    await this.whatsappInput.clear()
  }

  /**
   * Click save button
   */
  async clickSave() {
    await this.saveButton.click()
  }

  /**
   * Save WhatsApp number and wait for success
   * @param phoneNumber - Phone number to save
   */
  async saveWhatsappNumber(phoneNumber: string) {
    await this.fillWhatsappNumber(phoneNumber)
    await this.clickSave()
    // Wait for save spinner to appear and disappear
    const savingSpinner = this.page.locator(WhatsAppLocators.settings.savingSpinner)
    await savingSpinner.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {
      // Spinner might not appear if request is very fast
    })
    await savingSpinner.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
      // Fallback: wait for input to be enabled again
    })
  }

  /**
   * Verify success message appears
   */
  async verifySuccessMessage() {
    const successMessage = this.page.locator(WhatsAppLocators.settings.successMessage)
    await expect(successMessage).toBeVisible({ timeout: 5000 })
  }

  /**
   * Verify error message appears
   */
  async verifyErrorMessage() {
    const errorMessage = this.page.locator(WhatsAppLocators.settings.errorMessage)
    await expect(errorMessage).toBeVisible({ timeout: 5000 })
  }

  /**
   * Get error text from error element
   */
  async getErrorText(): Promise<string> {
    const errorElement = this.page.locator(WhatsAppLocators.settings.whatsappError)
    return await errorElement.textContent().catch(() => '')
  }

  /**
   * Check if input is required (has required attribute)
   */
  async isWhatsappInputRequired(): Promise<boolean> {
    return await this.whatsappInput.evaluate((el) =>
      (el as HTMLInputElement).hasAttribute('required'),
    )
  }

  /**
   * Get input placeholder
   */
  async getWhatsappPlaceholder(): Promise<string | null> {
    return await this.whatsappInput.getAttribute('placeholder')
  }

  /**
   * Verify input is focused
   */
  async isWhatsappInputFocused(): Promise<boolean> {
    return await this.whatsappInput.evaluate((el) => el === document.activeElement)
  }
}
