/**
 * Page Object Model for Theme Editor
 * Admin appearance settings page at /{tenant}/dashboard/settings/appearance
 *
 * Encapsulates:
 * - Template selection (gallery/detail/minimal)
 * - Theme field editing (colors, spacing, grid, etc.)
 * - Save/reset actions
 * - Live preview updates
 * - Auth guard verification
 */

import { expect, type Locator, type Page } from '@playwright/test'
import { ThemeLocators } from '../locators/theme.locators'

type TenantTemplate = 'gallery' | 'detail' | 'minimal'
type CardVariant = 'flat' | 'elevated' | 'outlined'
type Spacing = 'compact' | 'normal' | 'relaxed'

interface ThemeEditorData {
  template: TenantTemplate
  gridCols: number
  imageAspect: string
  cardVariant: CardVariant
  spacing: Spacing
  primaryColor: string
  accentColor: string
}

export class ThemeEditorPage {
  readonly page: Page
  readonly form: Locator
  readonly saveButton: Locator
  readonly resetButton: Locator
  readonly previewContainer: Locator

  // Template selector locators
  readonly galleryOption: Locator
  readonly detailOption: Locator
  readonly minimalOption: Locator
  readonly galleryRadio: Locator
  readonly detailRadio: Locator
  readonly minimalRadio: Locator

  // Theme field locators
  readonly gridColsInput: Locator
  readonly imageAspectInput: Locator
  readonly cardVariantSelect: Locator
  readonly spacingSelect: Locator
  readonly primaryColorInput: Locator
  readonly accentColorInput: Locator

  constructor(page: Page) {
    this.page = page
    this.form = page.locator(ThemeLocators.form.container)
    this.saveButton = page.locator(ThemeLocators.buttons.save)
    this.resetButton = page.locator(ThemeLocators.buttons.reset)
    this.previewContainer = page.locator(ThemeLocators.preview.container)

    // Template selectors
    this.galleryOption = page.locator(ThemeLocators.templateSelector.galleryOption)
    this.detailOption = page.locator(ThemeLocators.templateSelector.detailOption)
    this.minimalOption = page.locator(ThemeLocators.templateSelector.minimalOption)
    this.galleryRadio = page.locator(ThemeLocators.templateSelector.galleryRadio)
    this.detailRadio = page.locator(ThemeLocators.templateSelector.detailRadio)
    this.minimalRadio = page.locator(ThemeLocators.templateSelector.minimalRadio)

    // Theme fields
    this.gridColsInput = page.locator(ThemeLocators.themeFields.gridColsInput)
    this.imageAspectInput = page.locator(ThemeLocators.themeFields.imageAspectInput)
    this.cardVariantSelect = page.locator(ThemeLocators.themeFields.cardVariantSelect)
    this.spacingSelect = page.locator(ThemeLocators.themeFields.spacingSelect)
    this.primaryColorInput = page.locator(ThemeLocators.themeFields.primaryColorInput)
    this.accentColorInput = page.locator(ThemeLocators.themeFields.accentColorInput)
  }

  /**
   * Navigate to appearance settings page
   * @param tenantSlug - Tenant slug (e.g., 'demo', 'superhotdog')
   */
  async goto(tenantSlug: string = 'test-store') {
    await this.page.goto(`http://localhost:3000/${tenantSlug}/dashboard/settings/appearance`)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Select template by clicking radio button
   * @param template - Template type: gallery, detail, or minimal
   */
  async selectTemplate(template: TenantTemplate) {
    const radio = {
      gallery: this.galleryRadio,
      detail: this.detailRadio,
      minimal: this.minimalRadio,
    }[template]

    await radio.check()
    // Wait for form to update
    await this.page.waitForTimeout(300)
  }

  /**
   * Get currently selected template
   * @returns Template type or null if none selected
   */
  async getSelectedTemplate(): Promise<TenantTemplate | null> {
    const galleryChecked = await this.galleryRadio.isChecked()
    if (galleryChecked) return 'gallery'

    const detailChecked = await this.detailRadio.isChecked()
    if (detailChecked) return 'detail'

    const minimalChecked = await this.minimalRadio.isChecked()
    if (minimalChecked) return 'minimal'

    return null
  }

  /**
   * Edit theme field values
   * @param field - Field name
   * @param value - New value
   */
  async setThemeField(field: keyof Omit<ThemeEditorData, 'template'>, value: string | number) {
    const stringValue = String(value)

    switch (field) {
      case 'gridCols':
        await this.gridColsInput.clear()
        await this.gridColsInput.fill(stringValue)
        break
      case 'imageAspect':
        await this.imageAspectInput.clear()
        await this.imageAspectInput.fill(stringValue)
        break
      case 'cardVariant':
        await this.cardVariantSelect.selectOption(stringValue)
        break
      case 'spacing':
        await this.spacingSelect.selectOption(stringValue)
        break
      case 'primaryColor':
        await this.primaryColorInput.clear()
        await this.primaryColorInput.fill(stringValue)
        break
      case 'accentColor':
        await this.accentColorInput.clear()
        await this.accentColorInput.fill(stringValue)
        break
    }

    // Trigger change event and wait for debounced preview update
    await this.page.waitForTimeout(350)
  }

  /**
   * Get current theme field value
   * @param field - Field name
   * @returns Current value
   */
  async getThemeField(field: keyof Omit<ThemeEditorData, 'template'>): Promise<string | null> {
    const locator = {
      gridCols: this.gridColsInput,
      imageAspect: this.imageAspectInput,
      cardVariant: this.cardVariantSelect,
      spacing: this.spacingSelect,
      primaryColor: this.primaryColorInput,
      accentColor: this.accentColorInput,
    }[field]

    return await locator.inputValue()
  }

  /**
   * Fill entire theme form with data
   * @param data - Theme data object
   */
  async fillThemeForm(data: Partial<ThemeEditorData>) {
    if (data.template) {
      await this.selectTemplate(data.template)
    }

    if (data.gridCols !== undefined) {
      await this.setThemeField('gridCols', data.gridCols)
    }

    if (data.imageAspect) {
      await this.setThemeField('imageAspect', data.imageAspect)
    }

    if (data.cardVariant) {
      await this.setThemeField('cardVariant', data.cardVariant)
    }

    if (data.spacing) {
      await this.setThemeField('spacing', data.spacing)
    }

    if (data.primaryColor) {
      await this.setThemeField('primaryColor', data.primaryColor)
    }

    if (data.accentColor) {
      await this.setThemeField('accentColor', data.accentColor)
    }
  }

  /**
   * Save theme changes
   * Waits for API response and toast notification
   */
  async saveTheme() {
    await this.saveButton.click()

    // Wait for save spinner to appear and disappear
    const spinner = this.page.locator(ThemeLocators.buttons.savingSpinner)
    await this.page.waitForTimeout(100) // Let spinner appear
    await spinner.waitFor({ state: 'hidden', timeout: 5000 })

    // Wait for success toast
    await expect(this.page.locator(ThemeLocators.toast.successMessage)).toBeVisible({
      timeout: 5000,
    })
  }

  /**
   * Reset theme to template defaults
   */
  async resetTheme() {
    await this.resetButton.click()

    // Wait for reset toast notification
    await expect(this.page.locator(ThemeLocators.toast.infoMessage)).toBeVisible({ timeout: 2000 })
  }

  /**
   * Check if save button is enabled
   */
  async isSaveButtonEnabled(): Promise<boolean> {
    return !(await this.saveButton.isDisabled())
  }

  /**
   * Check if save button is disabled
   */
  async isSaveButtonDisabled(): Promise<boolean> {
    return await this.saveButton.isDisabled()
  }

  /**
   * Check if reset button is enabled
   */
  async isResetButtonEnabled(): Promise<boolean> {
    return !(await this.resetButton.isDisabled())
  }

  /**
   * Get error message for a field
   * @param field - Field name
   * @returns Error message text or null
   */
  async getFieldError(field: keyof Omit<ThemeEditorData, 'template'>): Promise<string | null> {
    const errorSelector = {
      gridCols: ThemeLocators.themeFields.gridColsError,
      imageAspect: ThemeLocators.themeFields.imageAspectError,
      cardVariant: ThemeLocators.themeFields.cardVariantError,
      spacing: ThemeLocators.themeFields.spacingError,
      primaryColor: ThemeLocators.themeFields.primaryColorError,
      accentColor: ThemeLocators.themeFields.accentColorError,
    }[field]

    const errorElement = this.page.locator(errorSelector)
    const isVisible = await errorElement.isVisible({ timeout: 1000 }).catch(() => false)

    if (isVisible) {
      return await errorElement.textContent()
    }

    return null
  }

  /**
   * Check if form has validation errors
   */
  async hasValidationErrors(): Promise<boolean> {
    const errorElements = await this.page.locator(ThemeLocators.validation.fieldError).all()
    return errorElements.length > 0
  }

  /**
   * Get toast notification message
   * @returns Toast message text or null
   */
  async getToastMessage(): Promise<string | null> {
    const successToast = this.page.locator(ThemeLocators.toast.successMessage)
    const errorToast = this.page.locator(ThemeLocators.toast.errorMessage)
    const infoToast = this.page.locator(ThemeLocators.toast.infoMessage)

    const toastElement = await Promise.race([
      successToast.waitFor({ state: 'visible', timeout: 2000 }).then(() => successToast),
      errorToast.waitFor({ state: 'visible', timeout: 2000 }).then(() => errorToast),
      infoToast.waitFor({ state: 'visible', timeout: 2000 }).then(() => infoToast),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
    ])

    if (toastElement) {
      return await toastElement.textContent()
    }

    return null
  }

  /**
   * Verify live preview is visible and contains content
   */
  async isPreviewVisible(): Promise<boolean> {
    return await this.previewContainer.isVisible({ timeout: 1000 }).catch(() => false)
  }

  /**
   * Check if preview has been updated (by verifying element presence)
   */
  async isPreviewUpdated(): Promise<boolean> {
    const productGrid = this.page.locator(ThemeLocators.preview.productGrid)
    return await productGrid.isVisible({ timeout: 1000 }).catch(() => false)
  }

  /**
   * Reload page and verify theme persistence
   */
  async reloadPage() {
    await this.page.reload()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Check if page shows 403/unauthorized error
   */
  async isUnauthorized(): Promise<boolean> {
    // Check if redirected away from settings page or shows error
    const currentPath = new URL(this.page.url()).pathname
    return !currentPath.includes('settings')
  }
}
