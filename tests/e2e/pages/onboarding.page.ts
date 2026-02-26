/**
 * Onboarding Wizard Page Object
 *
 * Encapsulates the complete 5-step onboarding flow.
 * Each method represents a user action in the wizard.
 */

import { expect, type Page } from '@playwright/test'
import { OnboardingLocators, OnboardingWaits } from '../locators/onboarding.locators'

export interface ProductData {
  name: string
  price: number
  category: string
  stock: number
}

/**
 * Represents the admin dashboard page after activation
 */
export class StorefrontPage {
  constructor(private page: Page) {}

  async waitForPageLoad() {
    // Wait for dashboard to load (/{slug}/dashboard with optional query params)
    await this.page.waitForURL(/\/[a-z0-9-]+\/dashboard(\?.*)?$/, {
      timeout: OnboardingWaits.redirect,
    })
    return this
  }

  getSlugFromUrl(): string {
    const url = this.page.url()
    // Extract slug from /{slug}/dashboard (with optional query params)
    const match = url.match(/\/([a-z0-9-]+)\/dashboard/)
    return match ? match[1] : ''
  }

  async verifyStorefrontLoaded() {
    // Wait for main content to be visible
    await this.page.waitForLoadState('networkidle')
    return this
  }
}

export class OnboardingWizardPage {
  constructor(private page: Page) {}

  /**
   * Wait for onboarding page to load
   */
  async waitForPageLoad() {
    await this.page.waitForURL(/\/signup\/.*\/onboarding/)
    await expect(this.page).toHaveURL(/\/signup\/.*\/onboarding/)
    return this
  }

  /**
   * Get current step number from progress indicator
   */
  async getCurrentStep(): Promise<number> {
    const text = await this.page
      .locator(OnboardingLocators.header.stepIndicator)
      .first()
      .textContent()
    const match = text?.match(/Step (\d) of 5/)
    return match ? parseInt(match[1], 10) : 1
  }

  // ============================================================================
  // STEP 1: LOGO UPLOAD
  // ============================================================================

  /**
   * Upload logo file in Step 1
   * @param filePath - Absolute path to logo file
   */
  async uploadLogo(filePath: string) {
    // Wait for step 1 to be visible
    await expect(this.page.locator(OnboardingLocators.step1.title)).toBeVisible()

    // Find file input and upload
    const fileInput = this.page.locator(OnboardingLocators.step1.fileInput)
    await fileInput.setInputFiles(filePath)

    // Wait for preview to appear
    await expect(this.page.locator(OnboardingLocators.step1.logoPreview)).toBeVisible({
      timeout: OnboardingWaits.fileUpload,
    })

    return this
  }

  /**
   * Click Continue button to go to next step
   */
  async clickContinue() {
    const continueButton = this.page.locator(OnboardingLocators.header.continueButton)
    await expect(continueButton).toBeEnabled()
    await continueButton.click()

    // Wait for navigation to next step
    await this.page.waitForTimeout(500)
    return this
  }

  /**
   * Click Back button to go to previous step
   */
  async clickBack() {
    const backButton = this.page.locator(OnboardingLocators.header.backButton)
    await expect(backButton).toBeEnabled()
    await backButton.click()
    await this.page.waitForTimeout(500)
    return this
  }

  // ============================================================================
  // STEP 2: COLORS
  // ============================================================================

  /**
   * Select a preset color in Step 2
   * @param index - Index of preset color (0-based)
   */
  async selectPresetColor(index: number) {
    await expect(this.page.locator(OnboardingLocators.step2.title)).toBeVisible()

    const presetColor = this.page.locator(OnboardingLocators.step2.presetColor(index))
    await presetColor.click()

    await this.page.waitForTimeout(OnboardingWaits.colorChange)
    return this
  }

  /**
   * Set custom color using color picker
   * @param color - Hex color code (e.g., '#FF0000')
   */
  async setCustomColor(color: string, isPrimary: boolean = true) {
    await expect(this.page.locator(OnboardingLocators.step2.title)).toBeVisible()

    const colorInput = isPrimary
      ? this.page.locator(OnboardingLocators.step2.primaryColorInput)
      : this.page.locator(OnboardingLocators.step2.secondaryColorInput)

    await colorInput.fill(color)
    await this.page.waitForTimeout(OnboardingWaits.colorChange)
    return this
  }

  // ============================================================================
  // STEP 3: PRODUCTS
  // ============================================================================

  /**
   * Add a product in Step 3
   */
  async addProduct(product: ProductData) {
    await expect(this.page.locator(OnboardingLocators.step3.title)).toBeVisible()

    // Fill product form
    await this.page.locator(OnboardingLocators.step3.productNameInput).fill(product.name)
    await this.page
      .locator(OnboardingLocators.step3.productPriceInput)
      .fill(product.price.toString())
    await this.page.locator(OnboardingLocators.step3.productCategoryInput).fill(product.category)
    await this.page
      .locator(OnboardingLocators.step3.productStockInput)
      .fill(product.stock.toString())

    // Click add button
    await this.page.locator(OnboardingLocators.step3.addButton).click()

    // Wait for product to appear in list
    await this.page.waitForTimeout(OnboardingWaits.productAdd)
    return this
  }

  /**
   * Add multiple products at once
   */
  async addProducts(products: ProductData[]) {
    for (const product of products) {
      await this.addProduct(product)
    }
    return this
  }

  /**
   * Get count of added products
   */
  async getProductCount(): Promise<number> {
    const products = this.page.locator(OnboardingLocators.step3.productItem)
    return await products.count()
  }

  // ============================================================================
  // STEP 4: PREVIEW
  // ============================================================================

  /**
   * Verify preview shows logo
   */
  async verifyPreviewHasLogo() {
    await expect(this.page.locator(OnboardingLocators.step4.title)).toBeVisible()
    await expect(this.page.locator(OnboardingLocators.step4.previewLogo)).toBeVisible()
    return this
  }

  /**
   * Verify preview shows products
   */
  async verifyPreviewHasProducts() {
    await expect(this.page.locator(OnboardingLocators.step4.title)).toBeVisible()
    const firstProduct = this.page.locator(OnboardingLocators.step4.previewProduct(0))
    await expect(firstProduct).toBeVisible()
    return this
  }

  /**
   * Get product count in preview
   */
  async getPreviewProductCount(): Promise<number> {
    const products = this.page.locator(OnboardingLocators.step4.previewProducts)
    return await products.count()
  }

  // ============================================================================
  // STEP 5: ACTIVATION
  // ============================================================================

  /**
   * Verify activation summary displays all information
   */
  async verifySummary() {
    await expect(this.page.locator(OnboardingLocators.step5.title)).toBeVisible()

    // Check summary elements are present (don't assert specific text)
    await expect(this.page.locator(OnboardingLocators.step5.summary)).toBeVisible()

    return this
  }

  /**
   * Click Activate button and wait for storefront redirect
   */
  async activateStore(): Promise<StorefrontPage> {
    await expect(this.page.locator(OnboardingLocators.step5.title)).toBeVisible()

    const activateButton = this.page.locator(OnboardingLocators.step5.activateButton)
    await expect(activateButton).toBeEnabled()
    await activateButton.click()

    // Wait for activation to complete and redirect to storefront
    // The URL pattern should be /{slug} (tenant storefront)
    await this.page.waitForURL(/\/[a-z0-9-]+$/, {
      timeout: OnboardingWaits.activation,
    })

    return new StorefrontPage(this.page)
  }

  // ============================================================================
  // COMPLETE FLOW HELPERS
  // ============================================================================

  /**
   * Complete all 5 steps of onboarding with test data
   * This is the main happy path method
   */
  async completeOnboarding(options: {
    logoPath?: string
    products?: ProductData[]
  }): Promise<StorefrontPage> {
    // Step 1: Upload logo (optional)
    if (options.logoPath) {
      await this.uploadLogo(options.logoPath)
    }
    await this.clickContinue()

    // Step 2: Colors (use defaults)
    await expect(this.page.locator(OnboardingLocators.step2.title)).toBeVisible()
    await this.clickContinue()

    // Step 3: Add products
    if (options.products && options.products.length > 0) {
      await this.addProducts(options.products)
    }
    await this.clickContinue()

    // Step 4: Preview
    await expect(this.page.locator(OnboardingLocators.step4.title)).toBeVisible()
    if (options.logoPath) {
      await this.verifyPreviewHasLogo()
    }
    if (options.products && options.products.length > 0) {
      await this.verifyPreviewHasProducts()
    }
    await this.clickContinue()

    // Step 5: Activate
    await this.verifySummary()
    return await this.activateStore()
  }
}
