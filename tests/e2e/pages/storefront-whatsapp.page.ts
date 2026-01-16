/**
 * Storefront WhatsApp Button Page Object
 *
 * Encapsulates WhatsApp button interactions on storefront:
 * - Verify button visibility based on configuration
 * - Click button and verify wa.me URL opens
 * - Test across multiple templates
 */

import { Page, Locator, expect } from '@playwright/test'
import { WhatsAppLocators } from '../locators/whatsapp.locators'

type Template = 'gallery' | 'detail' | 'minimal' | 'restaurant'

export class StorefrontWhatsAppPage {
  readonly page: Page
  readonly whatsappButton: Locator

  constructor(page: Page) {
    this.page = page
    this.whatsappButton = page.locator(WhatsAppLocators.storefront.whatsappButton)
  }

  /**
   * Navigate to storefront
   * @param tenantSlug - Tenant slug (e.g., 'test-store')
   * @param locale - Locale (default: 'en')
   */
  async goto(tenantSlug: string, locale: string = 'en') {
    await this.page.goto(`/${locale}/${tenantSlug}`)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Check if WhatsApp button is visible
   */
  async isButtonVisible(): Promise<boolean> {
    return await this.whatsappButton.isVisible({ timeout: 1000 }).catch(() => false)
  }

  /**
   * Verify button is NOT visible
   */
  async verifyButtonNotVisible() {
    await expect(this.whatsappButton).not.toBeVisible({ timeout: 1000 })
  }

  /**
   * Verify button IS visible
   */
  async verifyButtonVisible() {
    await expect(this.whatsappButton).toBeVisible({ timeout: 5000 })
  }

  /**
   * Get button text
   */
  async getButtonText(): Promise<string> {
    return await this.whatsappButton.textContent().then((text) => text?.trim() || '')
  }

  /**
   * Get button href attribute (for wa.me link)
   */
  async getButtonHref(): Promise<string | null> {
    return await this.whatsappButton.getAttribute('href')
  }

  /**
   * Verify button has wa.me URL
   */
  async verifyWaMeUrl(phoneNumber: string) {
    const href = await this.getButtonHref()
    expect(href).toBeTruthy()
    expect(href).toMatch(/^https:\/\/wa\.me\//)
    // Verify phone number is in URL (formatted without spaces/dashes)
    const cleanPhoneNumber = phoneNumber.replace(/[\s\-()]/g, '')
    expect(href).toContain(cleanPhoneNumber)
  }

  /**
   * Click WhatsApp button
   */
  async clickButton() {
    await this.whatsappButton.click()
  }

  /**
   * Click button and capture new page (for wa.me redirect)
   */
  async clickButtonAndWaitForNavigation() {
    const navigationPromise = this.page.waitForEvent('popup')
    await this.clickButton()
    const newPage = await navigationPromise
    return newPage
  }

  /**
   * Get button icon element
   */
  async getButtonIcon(): Promise<Locator> {
    return this.page.locator(WhatsAppLocators.storefront.whatsappButtonIcon)
  }

  /**
   * Verify button has icon
   */
  async verifyButtonHasIcon() {
    const icon = await this.getButtonIcon()
    await expect(icon).toBeVisible()
  }

  /**
   * Get button container for styling checks
   */
  async getButtonContainer(): Promise<Locator> {
    return this.page.locator(WhatsAppLocators.storefront.whatsappButtonContainer)
  }

  /**
   * Get computed style property
   */
  async getButtonStyle(property: string): Promise<string> {
    const container = await this.getButtonContainer()
    return await container.evaluate(
      (el, prop) => window.getComputedStyle(el).getPropertyValue(prop),
      property
    )
  }

  /**
   * Verify template is rendered
   */
  async verifyTemplate(template: Template) {
    const templateLocator = WhatsAppLocators[template as keyof typeof WhatsAppLocators]?.template
    if (templateLocator) {
      await expect(this.page.locator(templateLocator)).toBeVisible()
    }
  }

  /**
   * Check if button is floating (sticky/fixed position)
   */
  async isButtonFloating(): Promise<boolean> {
    const container = await this.getButtonContainer()
    const position = await container.evaluate(
      (el) => window.getComputedStyle(el).position
    )
    return position === 'fixed' || position === 'sticky'
  }

  /**
   * Verify button accessibility
   */
  async verifyButtonAccessibility() {
    // Check for aria-label or accessible text
    const ariaLabel = await this.whatsappButton.getAttribute('aria-label')
    const buttonText = await this.getButtonText()

    expect(ariaLabel || buttonText).toBeTruthy()
  }
}
