/**
 * Login Page Object
 *
 * Encapsulates all interactions with the login page.
 * Handles both email/password form and Google OAuth button.
 *
 * Design Principles:
 * - All page interactions here, not in tests
 * - Methods named after user actions
 * - Waits and error handling built into methods
 * - Tests remain readable and business-focused
 */

import { expect, type Page } from '@playwright/test'
import { LoginLocators } from '../locators/login.locators'

export class LoginPage {
  constructor(private page: Page) {}

  /**
   * Navigate to login page
   * Assumes baseURL is configured in playwright.config.ts
   */
  async navigate(queryParams?: Record<string, string>) {
    let url = '/login'
    if (queryParams) {
      const params = new URLSearchParams(queryParams)
      url += `?${params.toString()}`
    }
    await this.page.goto(url)
    await this.page.waitForURL(/\/login/)
    return this
  }

  /**
   * Verify login page loaded successfully
   */
  async verifyPageLoaded() {
    await expect(this.page.locator(LoginLocators.form)).toBeVisible()
    await expect(this.page.locator(LoginLocators.emailInput)).toBeVisible()
    await expect(this.page.locator(LoginLocators.passwordInput)).toBeVisible()
    await expect(this.page.locator(LoginLocators.submitButton)).toBeVisible()
    return this
  }

  /**
   * Verify Google Sign-In button is visible
   */
  async verifyGoogleButtonVisible() {
    await expect(this.page.locator(LoginLocators.googleSignInButton)).toBeVisible()
    return this
  }

  /**
   * Verify "Or" divider is visible
   */
  async verifyOrDividerVisible() {
    await expect(this.page.locator(LoginLocators.orDivider)).toBeVisible()
    return this
  }

  /**
   * Verify OAuth error message is displayed
   * @param message - Expected error message text
   */
  async verifyOAuthError(message: string) {
    const errorElement = this.page.locator(LoginLocators.oauthError)
    await expect(errorElement).toBeVisible()
    await expect(errorElement).toContainText(message)
    return this
  }

  /**
   * Fill email field
   */
  async fillEmail(email: string) {
    await this.page.locator(LoginLocators.emailInput).fill(email)
    return this
  }

  /**
   * Fill password field
   */
  async fillPassword(password: string) {
    await this.page.locator(LoginLocators.passwordInput).fill(password)
    return this
  }

  /**
   * Click Google Sign-In button
   * Does not wait for redirect since we can't complete real OAuth in E2E
   */
  async clickGoogleSignIn() {
    // Listen for navigation to Supabase OAuth endpoint before clicking
    const [response] = await Promise.all([
      this.page.waitForNavigation({ timeout: 5000 }).catch(() => null),
      this.page.locator(LoginLocators.googleSignInButton).click(),
    ])
    return response
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url()
  }

  /**
   * Check if button is disabled
   */
  async isGoogleButtonDisabled(): Promise<boolean> {
    return this.page.locator(LoginLocators.googleSignInButton).isDisabled()
  }
}
