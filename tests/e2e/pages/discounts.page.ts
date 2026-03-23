import { expect, type Page } from '@playwright/test'
import { DiscountsLocators } from '../locators/discounts.locators'

/**
 * Page Object Model for Order Discounts
 *
 * Encapsulates discount admin panel, checkout summary, and KDS display interactions.
 * Uses DiscountsLocators for all selector definitions.
 */
export class DiscountsPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  // ============================================================================
  // ADMIN: DISCOUNT PANEL
  // ============================================================================

  /**
   * Wait for discount panel to be visible
   */
  async waitForPanelVisible(timeout = 5000) {
    await expect(this.page.locator(DiscountsLocators.adminPanel.container)).toBeVisible({ timeout })
  }

  /**
   * Select discount type: 'fixed' or 'percent'
   */
  async selectDiscountType(type: 'fixed' | 'percent') {
    const selector =
      type === 'fixed'
        ? DiscountsLocators.adminPanel.typeFixed
        : DiscountsLocators.adminPanel.typePercent
    await this.page.locator(selector).click()
    await this.page.waitForTimeout(200)
  }

  /**
   * Get selected discount type
   */
  async getSelectedDiscountType(): Promise<'fixed' | 'percent' | null> {
    const fixedChecked = await this.page.locator(DiscountsLocators.adminPanel.typeFixed).isChecked()
    const percentChecked = await this.page
      .locator(DiscountsLocators.adminPanel.typePercent)
      .isChecked()

    if (fixedChecked) return 'fixed'
    if (percentChecked) return 'percent'
    return null
  }

  /**
   * Fill discount value
   */
  async fillDiscountValue(value: number) {
    await this.page.locator(DiscountsLocators.adminPanel.valueInput).fill(String(value))
    await this.page.waitForTimeout(300) // Wait for preview update
  }

  /**
   * Get discount value from input
   */
  async getDiscountValue(): Promise<string> {
    const value = await this.page.locator(DiscountsLocators.adminPanel.valueInput).inputValue()
    return value || ''
  }

  /**
   * Select discount scope: 'order' or 'item'
   */
  async selectDiscountScope(scope: 'order' | 'item') {
    const selector =
      scope === 'order'
        ? DiscountsLocators.adminPanel.scopeOrder
        : DiscountsLocators.adminPanel.scopeItem
    await this.page.locator(selector).click()
    await this.page.waitForTimeout(200)
  }

  /**
   * Get selected discount scope
   */
  async getSelectedDiscountScope(): Promise<'order' | 'item' | null> {
    const orderChecked = await this.page
      .locator(DiscountsLocators.adminPanel.scopeOrder)
      .isChecked()
    const itemChecked = await this.page.locator(DiscountsLocators.adminPanel.scopeItem).isChecked()

    if (orderChecked) return 'order'
    if (itemChecked) return 'item'
    return null
  }

  /**
   * Select target item (for scope=item only)
   */
  async selectTargetItem(itemId: string) {
    await this.page.locator(DiscountsLocators.adminPanel.targetItem).selectOption(itemId)
    await this.page.waitForTimeout(300) // Wait for preview update
  }

  /**
   * Get target item dropdown value
   */
  async getTargetItemValue(): Promise<string> {
    const value = await this.page.locator(DiscountsLocators.adminPanel.targetItem).inputValue()
    return value || ''
  }

  /**
   * Fill discount label
   */
  async fillDiscountLabel(label: string) {
    await this.page.locator(DiscountsLocators.adminPanel.labelInput).fill(label)
  }

  /**
   * Get live preview total
   */
  async getPreviewFinal(): Promise<string> {
    const previewText = await this.page
      .locator(DiscountsLocators.adminPanel.previewFinal)
      .textContent()
    return previewText || ''
  }

  /**
   * Get preview original total
   */
  async getPreviewOriginal(): Promise<string> {
    const text = await this.page.locator(DiscountsLocators.adminPanel.previewOriginal).textContent()
    return text || ''
  }

  /**
   * Get preview discount amount
   */
  async getPreviewDiscount(): Promise<string> {
    const text = await this.page.locator(DiscountsLocators.adminPanel.previewDiscount).textContent()
    return text || ''
  }

  /**
   * Click apply discount button
   */
  async applyDiscount() {
    await this.page.locator(DiscountsLocators.adminPanel.applyBtn).click()
    await this.page.waitForTimeout(500) // Wait for apply to process
  }

  /**
   * Check if apply button is disabled
   */
  async isApplyButtonDisabled(): Promise<boolean> {
    return await this.page.locator(DiscountsLocators.adminPanel.applyBtn).isDisabled()
  }

  /**
   * Click remove discount button
   */
  async removeDiscount() {
    await this.page.locator(DiscountsLocators.adminPanel.removeBtn).click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Check if active discount badge is visible
   */
  async isActiveBadgeVisible(): Promise<boolean> {
    try {
      await expect(this.page.locator(DiscountsLocators.adminPanel.activeBadge)).toBeVisible({
        timeout: 500,
      })
      return true
    } catch {
      return false
    }
  }

  /**
   * Get value error message
   */
  async getValueError(): Promise<string | null> {
    try {
      const errorText = await this.page
        .locator(DiscountsLocators.adminPanel.valueError)
        .textContent()
      return errorText || null
    } catch {
      return null
    }
  }

  /**
   * Get target error message
   */
  async getTargetError(): Promise<string | null> {
    try {
      const errorText = await this.page
        .locator(DiscountsLocators.adminPanel.targetError)
        .textContent()
      return errorText || null
    } catch {
      return null
    }
  }

  // ============================================================================
  // CART SUMMARY: DISCOUNT DISPLAY
  // ============================================================================

  /**
   * Get original total from cart summary
   */
  async getCartOriginalTotal(): Promise<string> {
    const text = await this.page.locator(DiscountsLocators.cartSummary.originalTotal).textContent()
    return text || ''
  }

  /**
   * Get discount amount from cart summary
   */
  async getCartDiscountAmount(): Promise<string | null> {
    try {
      const text = await this.page
        .locator(DiscountsLocators.cartSummary.discountValue)
        .textContent()
      return text || null
    } catch {
      return null
    }
  }

  /**
   * Get final total from cart summary
   */
  async getCartFinalTotal(): Promise<string> {
    const text = await this.page.locator(DiscountsLocators.cartSummary.finalTotal).textContent()
    return text || ''
  }

  /**
   * Check if discount line is visible in cart
   */
  async isCartDiscountVisible(): Promise<boolean> {
    try {
      await expect(this.page.locator(DiscountsLocators.cartSummary.discountContainer)).toBeVisible({
        timeout: 1000,
      })
      return true
    } catch {
      return false
    }
  }

  // ============================================================================
  // CHECKOUT SUMMARY: DISCOUNT DISPLAY
  // ============================================================================

  /**
   * Get original total from checkout summary
   */
  async getCheckoutOriginalTotal(): Promise<string> {
    const text = await this.page
      .locator(DiscountsLocators.checkoutSummary.originalTotal)
      .textContent()
    return text || ''
  }

  /**
   * Get discount amount from checkout summary
   */
  async getCheckoutDiscountAmount(): Promise<string | null> {
    try {
      const text = await this.page
        .locator(DiscountsLocators.checkoutSummary.discountValue)
        .textContent()
      return text || null
    } catch {
      return null
    }
  }

  /**
   * Get final total from checkout summary
   */
  async getCheckoutFinalTotal(): Promise<string> {
    const text = await this.page.locator(DiscountsLocators.checkoutSummary.finalTotal).textContent()
    return text || ''
  }

  /**
   * Check if discount line is visible in checkout
   */
  async isCheckoutDiscountVisible(): Promise<boolean> {
    try {
      await expect(
        this.page.locator(DiscountsLocators.checkoutSummary.discountContainer),
      ).toBeVisible({ timeout: 1000 })
      return true
    } catch {
      return false
    }
  }

  // ============================================================================
  // KDS: DISCOUNT DISPLAY
  // ============================================================================

  /**
   * Get original total from KDS order display
   */
  async getKdsOriginalTotal(orderId: string): Promise<string> {
    const text = await this.page.locator(DiscountsLocators.kds.originalTotal(orderId)).textContent()
    return text || ''
  }

  /**
   * Get discount amount from KDS order display
   */
  async getKdsDiscountAmount(orderId: string): Promise<string | null> {
    try {
      const text = await this.page
        .locator(DiscountsLocators.kds.discountValue(orderId))
        .textContent()
      return text || null
    } catch {
      return null
    }
  }

  /**
   * Get final total from KDS order display
   */
  async getKdsFinalTotal(orderId: string): Promise<string> {
    const text = await this.page.locator(DiscountsLocators.kds.finalTotal(orderId)).textContent()
    return text || ''
  }

  /**
   * Check if discount line is visible in KDS
   */
  async isKdsDiscountVisible(orderId: string): Promise<boolean> {
    try {
      await expect(this.page.locator(DiscountsLocators.kds.discountContainer(orderId))).toBeVisible(
        { timeout: 1000 },
      )
      return true
    } catch {
      return false
    }
  }

  /**
   * Wait for KDS discount line to disappear (when discount removed)
   */
  async waitForKdsDiscountRemoved(orderId: string, timeout = 5000) {
    await expect(
      this.page.locator(DiscountsLocators.kds.discountContainer(orderId)),
    ).not.toBeVisible({ timeout })
  }
}
