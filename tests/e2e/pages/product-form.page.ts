import { Page, Locator, expect } from '@playwright/test'

/**
 * Page Object Model for ProductForm Modal
 * Encapsulates ProductForm interactions per TEST_ID_CONTRACT.md
 *
 * Data-testid contract:
 * - product-image-input: File input
 * - product-name-input: Name field
 * - product-category-input: Category field
 * - product-description-input: Description textarea
 * - product-price-input: Price field
 * - product-display-order-input: Display order
 * - product-active-checkbox: Active status
 * - product-form-submit-btn: Submit button
 * - product-form-cancel-btn: Cancel button
 */
export class ProductFormPage {
  readonly page: Page

  // Form inputs
  readonly imageInput: Locator
  readonly nameInput: Locator
  readonly categoryInput: Locator
  readonly descriptionInput: Locator
  readonly priceInput: Locator
  readonly displayOrderInput: Locator
  readonly activeCheckbox: Locator

  // Buttons
  readonly submitBtn: Locator
  readonly cancelBtn: Locator

  // Modal container
  readonly modalOverlay: Locator
  readonly modalContent: Locator

  // Image preview
  readonly imagePreview: Locator

  constructor(page: Page) {
    this.page = page
    this.imageInput = page.getByTestId('product-image-input')
    this.nameInput = page.getByTestId('product-name-input')
    this.categoryInput = page.getByTestId('product-category-input')
    this.descriptionInput = page.getByTestId('product-description-input')
    this.priceInput = page.getByTestId('product-price-input')
    this.displayOrderInput = page.getByTestId('product-display-order-input')
    this.activeCheckbox = page.getByTestId('product-active-checkbox')
    this.submitBtn = page.getByTestId('product-form-submit-btn')
    this.cancelBtn = page.getByTestId('product-form-cancel-btn')
    this.modalOverlay = page.locator('div[class*="fixed"][class*="inset-0"]')
    this.modalContent = page.locator('div[class*="max-w-2xl"]')
    this.imagePreview = page.locator('div[class*="border-dashed"] img')
  }

  /**
   * Fill product name
   */
  async fillName(name: string) {
    await this.nameInput.fill(name)
  }

  /**
   * Fill product category
   */
  async fillCategory(category: string) {
    await this.categoryInput.fill(category)
  }

  /**
   * Fill product description
   */
  async fillDescription(description: string) {
    await this.descriptionInput.fill(description)
  }

  /**
   * Fill product price
   */
  async fillPrice(price: string | number) {
    await this.priceInput.fill(String(price))
  }

  /**
   * Fill display order
   */
  async fillDisplayOrder(order: number) {
    await this.displayOrderInput.fill(String(order))
  }

  /**
   * Set active status
   */
  async setActive(active: boolean) {
    const isChecked = await this.activeCheckbox.isChecked()
    if (isChecked !== active) {
      await this.activeCheckbox.click()
    }
  }

  /**
   * Upload image file
   */
  async uploadImage(filePath: string) {
    await this.imageInput.setInputFiles(filePath)
  }

  /**
   * Fill complete product form
   */
  async fillForm(data: {
    name: string
    category: string
    description?: string
    price: number
    displayOrder?: number
    active?: boolean
    imageFile?: string
  }) {
    await this.fillName(data.name)
    await this.fillCategory(data.category)
    if (data.description) {
      await this.fillDescription(data.description)
    }
    await this.fillPrice(data.price)
    if (data.displayOrder !== undefined) {
      await this.fillDisplayOrder(data.displayOrder)
    }
    if (data.active !== undefined) {
      await this.setActive(data.active)
    }
    if (data.imageFile) {
      await this.uploadImage(data.imageFile)
    }
  }

  /**
   * Submit form
   */
  async submit() {
    await this.submitBtn.click()
  }

  /**
   * Cancel form
   */
  async cancel() {
    await this.cancelBtn.click()
  }

  /**
   * Check if image preview is visible
   */
  async hasImagePreview(): Promise<boolean> {
    try {
      await expect(this.imagePreview).toBeVisible({ timeout: 2000 })
      return true
    } catch {
      return false
    }
  }

  /**
   * Wait for form to be visible
   */
  async waitForForm(timeout = 5000) {
    await expect(this.modalContent).toBeVisible({ timeout })
    await expect(this.nameInput).toBeVisible({ timeout })
  }

  /**
   * Wait for form to close
   */
  async waitForFormClosed(timeout = 5000) {
    await expect(this.modalContent).not.toBeVisible({ timeout })
  }

  /**
   * Get error message for a field
   */
  async getFieldError(field: 'name' | 'category' | 'price'): Promise<string | null> {
    const input = field === 'name' ? this.nameInput : field === 'category' ? this.categoryInput : this.priceInput
    const errorLocator = input.locator('+ p')

    try {
      await expect(errorLocator).toBeVisible({ timeout: 1000 })
      return await errorLocator.textContent()
    } catch {
      return null
    }
  }

  /**
   * Check if form has loading state
   */
  async isLoading(): Promise<boolean> {
    return await this.submitBtn.isDisabled()
  }

  /**
   * Wait for submit button to be enabled
   */
  async waitForSubmitEnabled(timeout = 5000) {
    await expect(this.submitBtn).not.toBeDisabled({ timeout })
  }
}
