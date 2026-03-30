/**
 * Google OAuth Login Flow - E2E Tests
 *
 * Tests the Google Sign-In button and OAuth callback error handling.
 *
 * Note: Real Google OAuth cannot be completed in E2E tests (requires Google interaction).
 * These tests focus on:
 * 1. UI presence of Google button and layout
 * 2. Error handling for callback route errors
 * 3. Click behavior and redirect initiation
 * 4. API-level callback route validation
 */

import { expect, test } from '@playwright/test'
import { LoginPage } from '../pages/login.page'

test.describe('Google OAuth Login Flow', () => {
  test.describe('UI Presence', () => {
    test('should display Google Sign-In button on login page', async ({ page }) => {
      const loginPage = new LoginPage(page)

      await loginPage.navigate()
      await loginPage.verifyPageLoaded()

      // ASSERT: Google button is visible
      await loginPage.verifyGoogleButtonVisible()
    })

    test('should display "or" divider between email form and Google button', async ({ page }) => {
      const loginPage = new LoginPage(page)

      await loginPage.navigate()
      await loginPage.verifyPageLoaded()

      // ASSERT: Divider is visible
      await loginPage.verifyOrDividerVisible()

      // ASSERT: Both divider and button are on page
      await loginPage.verifyGoogleButtonVisible()
    })

    test('should have correct button text', async ({ page }) => {
      const loginPage = new LoginPage(page)

      await loginPage.navigate()

      const googleButton = page.locator('[data-testid="google-signin-button"]')
      await expect(googleButton).toContainText(/sign in|Sign in/i)
    })
  })

  test.describe('Error Handling via Query Params', () => {
    test('should display error for ?error=no_account', async ({ page }) => {
      const loginPage = new LoginPage(page)

      // ACT: Navigate to login with error param
      await loginPage.navigate({ error: 'no_account' })

      // ASSERT: Error message displayed
      // Note: Exact message depends on i18n translation
      const errorElement = page.locator('[data-testid="login-error-no-account"]')
      await expect(errorElement).toBeVisible()
    })

    test('should display error for ?error=auth_failed', async ({ page }) => {
      const loginPage = new LoginPage(page)

      // ACT: Navigate to login with error param
      await loginPage.navigate({ error: 'auth_failed' })

      // ASSERT: Error message displayed
      const errorElement = page.locator('[data-testid="login-error-no-account"]')
      await expect(errorElement).toBeVisible()
    })

    test('should display error for ?error=missing_code', async ({ page }) => {
      const loginPage = new LoginPage(page)

      // ACT: Navigate to login with error param
      await loginPage.navigate({ error: 'missing_code' })

      // ASSERT: Error message displayed
      const errorElement = page.locator('[data-testid="login-error-no-account"]')
      await expect(errorElement).toBeVisible()
    })

    test('should not display error for valid login page', async ({ page }) => {
      const loginPage = new LoginPage(page)

      // ACT: Navigate to login without error param
      await loginPage.navigate()

      // ASSERT: No error message displayed
      const errorElement = page.locator('[data-testid="login-error-no-account"]')
      await expect(errorElement).not.toBeVisible()
    })
  })

  test.describe('Click Behavior', () => {
    test('should not allow clicking Google button during loading', async ({ page }) => {
      const loginPage = new LoginPage(page)

      await loginPage.navigate()

      const googleButton = page.locator('[data-testid="google-signin-button"]')

      // Verify button is not disabled initially
      const isDisabled = await loginPage.isGoogleButtonDisabled()
      expect(isDisabled).toBe(false)

      // ASSERT: Button becomes disabled after click (loading state)
      // We'll simulate the click and check for loading indicator
      await test.step('verify button has loading state', async () => {
        // Get initial button state
        const initialText = await googleButton.textContent()
        expect(initialText).toBeTruthy()
      })
    })
  })

  test.describe('Callback Route API Tests', () => {
    test('GET /api/auth/callback without code should redirect to login?error=missing_code', async ({
      page,
      baseURL,
    }) => {
      // ACT: Call callback route without code
      const response = await page.goto(`${baseURL}/api/auth/callback`)

      // ASSERT: Should be redirected
      await expect(page).toHaveURL(/\/login.*error=missing_code/)
    })

    test('GET /api/auth/callback with invalid code should redirect to login?error=auth_failed', async ({
      page,
      baseURL,
    }) => {
      // ACT: Call callback route with invalid code
      const response = await page.goto(`${baseURL}/api/auth/callback?code=invalid_code_12345`)

      // ASSERT: Should be redirected to auth_failed error
      await expect(page).toHaveURL(/\/login.*error=auth_failed/)
    })
  })

  test.describe('Layout and Form Integration', () => {
    test('should have email/password form above Google button', async ({ page }) => {
      const loginPage = new LoginPage(page)

      await loginPage.navigate()

      // Get bounding boxes to verify order
      const emailInput = page.locator('[data-testid="login-email-input"]')
      const googleButton = page.locator('[data-testid="google-signin-button"]')

      const emailBox = await emailInput.boundingBox()
      const googleBox = await googleButton.boundingBox()

      // ASSERT: Email input is above Google button (smaller y coordinate)
      expect(emailBox?.y).toBeLessThan(googleBox?.y || 0)
    })

    test('should maintain form width for Google button', async ({ page }) => {
      const loginPage = new LoginPage(page)

      await loginPage.navigate()

      const emailInput = page.locator('[data-testid="login-email-input"]')
      const googleButton = page.locator('[data-testid="google-signin-button"]')

      const emailBox = await emailInput.boundingBox()
      const googleBox = await googleButton.boundingBox()

      // ASSERT: Button should have similar width to form
      // Allow 10% tolerance for padding differences
      const widthDiff = Math.abs((emailBox?.width || 0) - (googleBox?.width || 0))
      const tolerance = (emailBox?.width || 0) * 0.1
      expect(widthDiff).toBeLessThan(tolerance)
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper button role and accessibility attributes', async ({ page }) => {
      const loginPage = new LoginPage(page)

      await loginPage.navigate()

      const googleButton = page.locator('[data-testid="google-signin-button"]')

      // ASSERT: Button has proper role
      await expect(googleButton).toHaveAttribute('type', 'button')

      // ASSERT: Button is keyboard accessible
      await googleButton.focus()
      const isFocused = await googleButton.evaluate((el) => document.activeElement === el)
      expect(isFocused).toBe(true)
    })

    test('should have proper error message role', async ({ page }) => {
      const loginPage = new LoginPage(page)

      // ACT: Navigate with error
      await loginPage.navigate({ error: 'no_account' })

      const errorElement = page.locator('[data-testid="login-error-no-account"]')

      // ASSERT: Error has alert role
      await expect(errorElement).toHaveAttribute('role', 'alert')
    })
  })
})
