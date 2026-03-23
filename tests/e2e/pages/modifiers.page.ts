import { expect, type Locator, type Page } from '@playwright/test'
import { ModifiersLocators } from '../locators/modifiers.locators'

/**
 * Page Object Model for Product Modifiers
 *
 * Encapsulates modifier sheet interactions (customer flow) and admin CRUD.
 * Uses ModifiersLocators for all selector definitions.
 */
export class ModifiersPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  // ============================================================================
  // CUSTOMER: MODIFIER SHEET INTERACTIONS
  // ============================================================================

  /**
   * Wait for modifier sheet to be visible
   */
  async waitForSheetVisible(timeout = 5000) {
    await expect(this.page.locator(ModifiersLocators.sheet.root)).toBeVisible({
      timeout,
    })
  }

  /**
   * Wait for modifier sheet to close
   */
  async waitForSheetClosed(timeout = 5000) {
    await expect(this.page.locator(ModifiersLocators.sheet.root)).not.toBeVisible({
      timeout,
    })
  }

  /**
   * Close modifier sheet
   */
  async closeSheet() {
    await this.page.locator(ModifiersLocators.sheet.close).click()
    await this.waitForSheetClosed()
  }

  /**
   * Get current quantity from qty display
   */
  async getQuantity(): Promise<number> {
    const qtyText = await this.page.locator(ModifiersLocators.sheet.qtyValue).textContent()
    return parseInt(qtyText || '1', 10)
  }

  /**
   * Increment quantity
   */
  async incrementQty() {
    await this.page.locator(ModifiersLocators.sheet.qtyInc).click()
    await this.page.waitForTimeout(200) // Brief wait for subtotal update
  }

  /**
   * Decrement quantity
   */
  async decrementQty() {
    await this.page.locator(ModifiersLocators.sheet.qtyDec).click()
    await this.page.waitForTimeout(200)
  }

  /**
   * Set quantity to specific value
   */
  async setQty(qty: number) {
    const current = await this.getQuantity()
    if (current < qty) {
      for (let i = current; i < qty; i++) {
        await this.incrementQty()
      }
    } else if (current > qty) {
      for (let i = current; i > qty; i--) {
        await this.decrementQty()
      }
    }
  }

  /**
   * Get current subtotal text (e.g., "$100.00")
   */
  async getSubtotal(): Promise<string> {
    const subtotalText = await this.page.locator(ModifiersLocators.sheet.subtotal).textContent()
    return subtotalText || ''
  }

  /**
   * Select a modifier option by optionId
   */
  async selectModifierOption(optionId: string) {
    const input = this.page.locator(ModifiersLocators.option.input(optionId))
    const type = await input.getAttribute('type')

    if (type === 'radio') {
      // For radio, clicking label or input both work
      await input.click()
    } else if (type === 'checkbox') {
      // For checkbox, click the input
      await input.click()
    }

    // Brief wait for subtotal update
    await this.page.waitForTimeout(200)
  }

  /**
   * Check if modifier option is selected
   */
  async isModifierOptionSelected(optionId: string): Promise<boolean> {
    const input = this.page.locator(ModifiersLocators.option.input(optionId))
    return await input.isChecked()
  }

  /**
   * Get price delta for an option (e.g., "+$10.00")
   */
  async getModifierOptionPrice(optionId: string): Promise<string> {
    const priceText = await this.page
      .locator(ModifiersLocators.option.price(optionId))
      .textContent()
    return priceText || ''
  }

  /**
   * Check if modifier option is unavailable
   */
  async isModifierOptionUnavailable(optionId: string): Promise<boolean> {
    try {
      await expect(this.page.locator(ModifiersLocators.option.unavailable(optionId))).toBeVisible({
        timeout: 500,
      })
      return true
    } catch {
      return false
    }
  }

  /**
   * Get error message for a modifier group
   */
  async getGroupError(groupId: string): Promise<string | null> {
    try {
      const errorText = await this.page
        .locator(ModifiersLocators.group.error(groupId))
        .textContent()
      return errorText || null
    } catch {
      return null
    }
  }

  /**
   * Confirm and add to cart
   */
  async confirmAndAddToCart() {
    await this.page.locator(ModifiersLocators.sheet.confirm).click()
    // Wait for loading to complete and sheet to close
    await this.waitForSheetClosed()
  }

  /**
   * Check if confirm button is disabled
   */
  async isConfirmButtonDisabled(): Promise<boolean> {
    return await this.page.locator(ModifiersLocators.sheet.confirm).isDisabled()
  }

  // ============================================================================
  // ADMIN: MODIFIER GROUP LIST
  // ============================================================================

  /**
   * Navigate to modifier management page
   */
  async navigateToModifierManagement(baseUrl: string, tenantId: string) {
    await this.page.goto(`${baseUrl}/es/${tenantId}/dashboard/modifiers`)
  }

  /**
   * Click add new modifier group button
   */
  async clickAddModifierGroup() {
    await this.page.locator(ModifiersLocators.adminGroupList.addBtn).click()
    await this.page.waitForTimeout(300) // Wait for modal to open
  }

  /**
   * Get count of modifier groups in list
   */
  async getModifierGroupCount(): Promise<number> {
    const rows = await this.page
      .locator(ModifiersLocators.adminGroupList.container)
      .locator('[data-testid^="admin-modifier-group-item-"]')
      .count()
    return rows
  }

  /**
   * Click edit on a modifier group
   */
  async editModifierGroup(groupId: string) {
    await this.page.locator(ModifiersLocators.adminGroupRow.editBtn(groupId)).click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Click delete on a modifier group
   */
  async deleteModifierGroup(groupId: string) {
    await this.page.locator(ModifiersLocators.adminGroupRow.deleteBtn(groupId)).click()
    // Confirm delete dialog
    await this.page.on('dialog', (dialog) => dialog.accept())
    await this.page.waitForTimeout(500)
  }

  // ============================================================================
  // ADMIN: MODIFIER GROUP FORM
  // ============================================================================

  /**
   * Wait for modifier form to be visible
   */
  async waitForFormVisible(timeout = 5000) {
    await expect(this.page.locator(ModifiersLocators.adminForm.modal)).toBeVisible({ timeout })
  }

  /**
   * Wait for modifier form to close
   */
  async waitForFormClosed(timeout = 5000) {
    await expect(this.page.locator(ModifiersLocators.adminForm.modal)).not.toBeVisible({ timeout })
  }

  /**
   * Fill modifier group form
   */
  async fillModifierForm(data: {
    name: string
    description?: string
    min?: number
    max?: number
    required?: boolean
  }) {
    await this.page.locator(ModifiersLocators.adminForm.nameInput).fill(data.name)

    if (data.description) {
      await this.page.locator(ModifiersLocators.adminForm.descriptionInput).fill(data.description)
    }

    if (data.min !== undefined) {
      await this.page.locator(ModifiersLocators.adminForm.minInput).fill(String(data.min))
    }

    if (data.max !== undefined) {
      await this.page.locator(ModifiersLocators.adminForm.maxInput).fill(String(data.max))
    }

    if (data.required !== undefined) {
      const toggle = this.page.locator(ModifiersLocators.adminForm.requiredToggle)
      const isChecked = await toggle.isChecked()
      if (isChecked !== data.required) {
        await toggle.click()
      }
    }
  }

  /**
   * Add modifier option in form
   */
  async addModifierOption(data: { label: string; price?: number; available?: boolean }) {
    // Click add option button
    await this.page.locator(ModifiersLocators.adminAddOption).click()

    // Get the index of newly added row (count current options)
    const rows = await this.page
      .locator(ModifiersLocators.adminForm.optionsSection)
      .locator('[data-testid^="admin-modifier-option-row-"]')
      .count()
    const idx = rows - 1

    // Fill label
    await this.page.locator(ModifiersLocators.adminOption.labelInput(idx)).fill(data.label)

    // Fill price if provided
    if (data.price !== undefined) {
      await this.page
        .locator(ModifiersLocators.adminOption.priceInput(idx))
        .fill(String(data.price))
    }

    // Set available if needed
    if (data.available !== undefined) {
      const toggle = this.page.locator(ModifiersLocators.adminOption.availableToggle(idx))
      const isChecked = await toggle.isChecked()
      if (isChecked !== data.available) {
        await toggle.click()
      }
    }
  }

  /**
   * Remove modifier option from form
   */
  async removeModifierOption(idx: number) {
    await this.page.locator(ModifiersLocators.adminOption.removeBtn(idx)).click()
    await this.page.waitForTimeout(200)
  }

  /**
   * Save modifier group form
   */
  async saveModifierGroup() {
    await this.page.locator(ModifiersLocators.adminForm.saveBtn).click()
    // Wait for success toast or modal close
    await this.waitForFormClosed()
  }

  /**
   * Cancel modifier form
   */
  async cancelModifierForm() {
    await this.page.locator(ModifiersLocators.adminForm.cancelBtn).click()
    await this.waitForFormClosed()
  }

  /**
   * Get name field error
   */
  async getNameError(): Promise<string | null> {
    try {
      const errorText = await this.page.locator(ModifiersLocators.adminForm.nameError).textContent()
      return errorText || null
    } catch {
      return null
    }
  }

  /**
   * Get option label field error
   */
  async getOptionLabelError(idx: number): Promise<string | null> {
    try {
      const errorText = await this.page
        .locator(ModifiersLocators.adminOption.labelError(idx))
        .textContent()
      return errorText || null
    } catch {
      return null
    }
  }

  // ============================================================================
  // CART: MODIFIER SUMMARY
  // ============================================================================

  /**
   * Get modifier summary text for a cart item
   */
  async getCartItemModifierSummary(productId: string): Promise<string> {
    const summaryText = await this.page
      .locator(ModifiersLocators.cartItem.modifierSummary(productId))
      .textContent()
    return summaryText || ''
  }

  /**
   * Check if modifier summary is visible in cart
   */
  async isCartModifierSummaryVisible(productId: string): Promise<boolean> {
    try {
      await expect(
        this.page.locator(ModifiersLocators.cartItem.modifierSummary(productId)),
      ).toBeVisible({ timeout: 1000 })
      return true
    } catch {
      return false
    }
  }
}
