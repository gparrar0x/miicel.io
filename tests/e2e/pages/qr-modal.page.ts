/**
 * Page Object Model for QR Product Modal
 * Encapsulates all QR modal interactions including opening, closing, and downloads
 */

import { Page, Locator, expect } from '@playwright/test'
import { QRModalLocators, QRModalWaits } from '../locators/qr-modal.locators'

export class QRModalPage {
  readonly page: Page
  private readonly locators = QRModalLocators
  private readonly waits = QRModalWaits

  constructor(page: Page) {
    this.page = page
  }

  // ============================================================================
  // MODAL MANAGEMENT
  // ============================================================================

  /**
   * Click QR button for a specific product
   */
  async clickQrButton(productId: string) {
    const button = this.page.locator(this.locators.table.qrButton(productId))
    await expect(button).toBeVisible({ timeout: this.waits.contentVisible })
    await button.click()
  }

  /**
   * Verify modal is open
   */
  async isModalOpen(): Promise<boolean> {
    return await this.page
      .locator(this.locators.modal.container)
      .isVisible({ timeout: this.waits.modalOpen })
      .catch(() => false)
  }

  /**
   * Verify modal is closed
   */
  async isModalClosed(): Promise<boolean> {
    return await this.page
      .locator(this.locators.modal.container)
      .isHidden({ timeout: this.waits.modalOpen })
      .catch(() => false)
  }

  /**
   * Close modal via close button
   */
  async closeViaButton() {
    const closeBtn = this.page.locator(this.locators.actions.closeButton)
    await expect(closeBtn).toBeVisible({ timeout: this.waits.contentVisible })
    await closeBtn.click()
    await expect(this.page.locator(this.locators.modal.container)).toBeHidden({
      timeout: this.waits.modalOpen,
    })
  }

  /**
   * Close modal via Escape key
   */
  async closeViaEscape() {
    await this.page.keyboard.press('Escape')
    await expect(this.page.locator(this.locators.modal.container)).toBeHidden({
      timeout: this.waits.modalOpen,
    })
  }

  // ============================================================================
  // CONTENT VERIFICATION
  // ============================================================================

  /**
   * Get product name displayed in modal
   */
  async getProductName(): Promise<string | null> {
    const nameElement = this.page.locator(this.locators.content.productName)
    if (await nameElement.isVisible({ timeout: this.waits.contentVisible }).catch(() => false)) {
      return await nameElement.textContent()
    }
    return null
  }

  /**
   * Verify product name is displayed
   */
  async isProductNameVisible(expectedName?: string): Promise<boolean> {
    const nameElement = this.page.locator(this.locators.content.productName)
    if (!(await nameElement.isVisible({ timeout: this.waits.contentVisible }).catch(() => false))) {
      return false
    }

    if (expectedName) {
      const actualName = await nameElement.textContent()
      return actualName?.trim() === expectedName
    }

    return true
  }

  /**
   * Get URL preview from modal
   */
  async getUrlPreview(): Promise<string | null> {
    const urlElement = this.page.locator(this.locators.content.urlPreview)
    if (await urlElement.isVisible({ timeout: this.waits.contentVisible }).catch(() => false)) {
      return await urlElement.textContent()
    }
    return null
  }

  /**
   * Verify URL preview contains expected path pattern
   */
  async verifyUrlFormat(tenantId: string, productId: string): Promise<boolean> {
    const url = await this.getUrlPreview()
    if (!url) return false

    // Expected pattern: /{locale}/{tenantId}/p/{productId}
    const pattern = new RegExp(`/${tenantId}/p/${productId}$`)
    return pattern.test(url)
  }

  /**
   * Verify QR code canvas is visible
   */
  async isQrCodeVisible(productId: string): Promise<boolean> {
    const qrCode = this.page.locator(this.locators.content.qrCode(productId))
    return await qrCode.isVisible({ timeout: this.waits.contentVisible }).catch(() => false)
  }

  // ============================================================================
  // ACTION BUTTONS
  // ============================================================================

  /**
   * Verify print button is visible and enabled
   */
  async isPrintButtonEnabled(): Promise<boolean> {
    const printBtn = this.page.locator(this.locators.actions.printButton)
    if (!(await printBtn.isVisible({ timeout: this.waits.contentVisible }).catch(() => false))) {
      return false
    }
    return !await printBtn.isDisabled()
  }

  /**
   * Verify download button is visible and enabled
   */
  async isDownloadButtonEnabled(): Promise<boolean> {
    const downloadBtn = this.page.locator(this.locators.actions.downloadButton)
    if (!(await downloadBtn.isVisible({ timeout: this.waits.contentVisible }).catch(() => false))) {
      return false
    }
    return !await downloadBtn.isDisabled()
  }

  /**
   * Click print button
   */
  async clickPrintButton() {
    const printBtn = this.page.locator(this.locators.actions.printButton)
    await expect(printBtn).toBeVisible({ timeout: this.waits.contentVisible })
    await printBtn.click()
  }

  /**
   * Click download button and verify file download is triggered
   */
  async clickDownloadButton(): Promise<string> {
    const downloadBtn = this.page.locator(this.locators.actions.downloadButton)
    await expect(downloadBtn).toBeVisible({ timeout: this.waits.contentVisible })

    // Listen for download
    const downloadPromise = this.page.waitForEvent('download', { timeout: this.waits.download })

    // Click button
    await downloadBtn.click()

    // Wait for download
    const download = await downloadPromise
    return download.suggestedFilename()
  }

  // ============================================================================
  // FULL SCENARIOS
  // ============================================================================

  /**
   * Open modal and verify content loads
   */
  async openAndVerifyContent(
    productId: string,
    productName: string,
    tenantId: string
  ): Promise<boolean> {
    // Click QR button
    await this.clickQrButton(productId)

    // Verify modal opens
    if (!(await this.isModalOpen())) {
      return false
    }

    // Verify content
    const nameMatch = await this.isProductNameVisible(productName)
    const urlMatch = await this.verifyUrlFormat(tenantId, productId)
    const qrVisible = await this.isQrCodeVisible(productId)

    return nameMatch && urlMatch && qrVisible
  }
}
