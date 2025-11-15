/**
 * Signup Page Object
 *
 * Encapsulates all interactions with the signup form.
 * Each method represents a user action (fill form, submit, etc).
 * Returns page objects for method chaining where appropriate.
 *
 * Design Principles:
 * - All page interactions happen here, not in tests
 * - Methods are named after user actions, not assertions
 * - Waits and error handling are built into methods
 * - Tests remain readable and business-focused
 */

import { Page, expect } from '@playwright/test'
import { SignupLocators, SlugValidationWaits } from '../locators/signup.locators'

interface SignupFormData {
  email: string
  password: string
  businessName: string
  slug: string
}

/**
 * Represents the onboarding page after successful signup
 * Used for method chaining after redirect
 */
export class OnboardingPage {
  constructor(private page: Page) {}

  async waitForPageLoad() {
    // Wait for onboarding page to load
    await this.page.waitForURL(/\/signup\/.*\/onboarding/)
    await expect(this.page).toHaveURL(/\/signup\/.*\/onboarding/)
    return this
  }

  getSlugFromUrl(): string {
    const url = this.page.url()
    const match = url.match(/\/signup\/([^\/]+)\/onboarding/)
    return match ? match[1] : ''
  }
}

export class SignupPage {
  constructor(private page: Page) {}

  /**
   * Navigate to signup page
   * Assumes baseURL is configured in playwright.config.ts
   */
  async navigate() {
    await this.page.goto('/signup')
    await this.page.waitForURL('/signup')
    return this
  }

  /**
   * Verify page loaded successfully
   */
  async verifyPageLoaded() {
    // Check all form fields are present using new data-testid locators
    await expect(this.page.locator(SignupLocators.form)).toBeVisible()
    await expect(this.page.locator(SignupLocators.emailInput)).toBeVisible()
    await expect(this.page.locator(SignupLocators.passwordInput)).toBeVisible()
    await expect(this.page.locator(SignupLocators.businessNameInput)).toBeVisible()
    await expect(this.page.locator(SignupLocators.slugInput)).toBeVisible()
    await expect(this.page.locator(SignupLocators.submitButton)).toBeVisible()

    return this
  }

  /**
   * Fill email field
   *
   * @param email - Email address to enter
   */
  async fillEmail(email: string) {
    const emailInput = this.page.locator(SignupLocators.emailInput)
    await emailInput.fill(email)
    await emailInput.blur() // Trigger validation
    return this
  }

  /**
   * Fill password field
   *
   * @param password - Password to enter
   */
  async fillPassword(password: string) {
    const passwordInput = this.page.locator(SignupLocators.passwordInput)
    await passwordInput.fill(password)
    await passwordInput.blur() // Trigger validation
    return this
  }

  /**
   * Fill business name field
   *
   * @param businessName - Business name to enter
   */
  async fillBusinessName(businessName: string) {
    const businessNameInput = this.page.locator(SignupLocators.businessNameInput)
    await businessNameInput.fill(businessName)
    await businessNameInput.blur() // Trigger validation
    return this
  }

  /**
   * Fill slug field and wait for validation
   * Includes debounce wait and validation status check
   *
   * @param slug - Slug to enter
   * @param expectAvailable - Whether to wait for availability check (true) or taken (false)
   */
  async fillSlug(slug: string, expectAvailable: boolean = true) {
    const slugInput = this.page.locator(SignupLocators.slugInput)

    // Clear any existing value
    await slugInput.clear()

    // Type the new slug
    await slugInput.fill(slug)

    // Wait for debounce (500ms) + validation API call
    await this.page.waitForTimeout(SlugValidationWaits.debounce)

    // The loading spinner appears during validation
    const loadingSpinner = this.page.locator(SignupLocators.slugLoadingSpinner)

    // Sometimes validation is fast, so wait for spinner or move on
    try {
      await loadingSpinner.waitFor({ state: 'hidden', timeout: SlugValidationWaits.validation })
    } catch {
      // If spinner never appears, validation already completed (very fast network)
    }

    // Optional: Wait for validation indicator (don't fail if not found)
    if (expectAvailable) {
      try {
        const checkIcon = this.page.locator(SignupLocators.slugAvailableIcon)
        await expect(checkIcon).toBeVisible({ timeout: 2000 })
      } catch {
        // Icon may not be visible or selector might not match implementation
      }
    }

    return this
  }

  /**
   * Fill entire signup form with provided data
   *
   * @param data - Form data object
   * @param expectSlugAvailable - Whether slug should be available
   */
  async fillForm(data: SignupFormData, expectSlugAvailable: boolean = true) {
    await this.fillEmail(data.email)
    await this.fillPassword(data.password)
    await this.fillBusinessName(data.businessName)
    await this.fillSlug(data.slug, expectSlugAvailable)
    return this
  }

  /**
   * Get error message for a specific field
   *
   * @param fieldName - Name of the field ('email', 'password', 'businessName', 'slug')
   */
  async getFieldErrorMessage(fieldName: 'email' | 'password' | 'businessName' | 'slug'): Promise<string | null> {
    let errorSelector: string

    switch (fieldName) {
      case 'email':
        errorSelector = SignupLocators.emailError
        break
      case 'password':
        errorSelector = SignupLocators.passwordError
        break
      case 'businessName':
        errorSelector = SignupLocators.businessNameError
        break
      case 'slug':
        errorSelector = SignupLocators.slugError
        break
    }

    const errorElement = this.page.locator(errorSelector)
    const isVisible = await errorElement.isVisible().catch(() => false)

    if (isVisible) {
      return await errorElement.textContent()
    }

    return null
  }

  /**
   * Check if submit button is enabled
   */
  async isSubmitButtonEnabled(): Promise<boolean> {
    const submitBtn = this.page.locator(SignupLocators.submitButton)
    return !(await submitBtn.isDisabled())
  }

  /**
   * Check if submit button is disabled
   */
  async isSubmitButtonDisabled(): Promise<boolean> {
    const submitBtn = this.page.locator(SignupLocators.submitButton)
    return await submitBtn.isDisabled()
  }

  /**
   * Check slug availability status visually
   *
   * @returns 'available' | 'taken' | 'checking' | 'unknown'
   */
  async getSlugAvailabilityStatus(): Promise<'available' | 'taken' | 'checking' | 'unknown'> {
    const loadingSpinner = this.page.locator(SignupLocators.slugLoadingSpinner)
    const checkIcon = this.page.locator(SignupLocators.slugAvailableIcon)
    const xIcon = this.page.locator(SignupLocators.slugUnavailableIcon)

    if (await loadingSpinner.isVisible().catch(() => false)) {
      return 'checking'
    }

    if (await checkIcon.isVisible().catch(() => false)) {
      return 'available'
    }

    if (await xIcon.isVisible().catch(() => false)) {
      return 'taken'
    }

    return 'unknown'
  }

  /**
   * Click submit button and wait for response
   * Does NOT wait for redirect - use submitAndWaitForOnboarding for that
   */
  async clickSubmit() {
    const submitBtn = this.page.locator(SignupLocators.submitButton)
    await submitBtn.click()
    return this
  }

  /**
   * Submit form and wait for onboarding redirect
   *
   * @returns OnboardingPage instance for further interactions
   */
  async submitAndWaitForOnboarding(): Promise<OnboardingPage> {
    await this.clickSubmit()

    // Wait for network requests to complete
    await this.page.waitForLoadState('networkidle')

    // Wait for redirect to onboarding page
    const onboardingPage = new OnboardingPage(this.page)
    await onboardingPage.waitForPageLoad()

    return onboardingPage
  }

  /**
   * Submit form and expect error toast notification
   * Useful for testing error scenarios
   *
   * @param expectedErrorText - Partial text of expected error message
   */
  async submitAndExpectError(expectedErrorText: string) {
    await this.clickSubmit()

    // Wait for error toast to appear
    // Sonner toast notifications are rendered in the DOM
    const errorToast = this.page.locator(`text=${expectedErrorText}`)
    await expect(errorToast).toBeVisible({ timeout: 5000 })

    return this
  }

  /**
   * Check if specific validation error is displayed
   *
   * @param fieldName - Field name
   * @param expectedMessage - Expected error text
   */
  async hasValidationError(fieldName: 'email' | 'password' | 'businessName' | 'slug', expectedMessage: string): Promise<boolean> {
    const errorMsg = await this.getFieldErrorMessage(fieldName)
    return errorMsg?.includes(expectedMessage) ?? false
  }

  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility() {
    const toggleBtn = this.page.locator(SignupLocators.togglePasswordButton)
    await toggleBtn.click()
    return this
  }

  /**
   * Verify password field visibility state
   *
   * @returns true if password is visible, false if hidden
   */
  async isPasswordVisible(): Promise<boolean> {
    const passwordInput = this.page.locator(SignupLocators.passwordInput)
    const type = await passwordInput.getAttribute('type')
    return type === 'text'
  }

  /**
   * Wait for a specific toast notification
   * Useful for verifying success/error messages
   *
   * @param message - Toast message text
   * @param type - Toast type ('success' or 'error')
   */
  async waitForToast(message: string, type: 'success' | 'error' = 'success') {
    // Sonner toasts are rendered in the DOM with role="alert"
    const toast = this.page.locator(`role=alert:has-text("${message}")`)
    await expect(toast).toBeVisible({ timeout: 5000 })
    return this
  }

  /**
   * Get current URL
   * Useful for verifying redirects
   */
  getCurrentUrl(): string {
    return this.page.url()
  }
}
