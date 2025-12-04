import { Page, expect } from '@playwright/test'

/**
 * Auth fixture helpers for E2E tests
 * Provides login utilities for owner and non-owner users
 */

const TEST_USERS = {
  owner: {
    email: 'owner@test.com',
    password: 'testpass123',
  },
  nonOwner: {
    email: 'nonowner@test.com',
    password: 'testpass123',
  },
}

/**
 * Login as owner user
 * Uses real login flow via /api/auth/login to set cookies properly
 *
 * @param page - Playwright page object
 * @param tenantSlug - Tenant slug for redirect (default: demo_galeria)
 */
export async function loginAsOwner(page: Page, tenantSlug: string = 'demo_galeria') {
  // Navigate to login page
  await page.goto('http://localhost:3000/es/login')

  // Fill login form
  await page.getByTestId('login-email-input').fill(TEST_USERS.owner.email)
  await page.getByTestId('login-password-input').fill(TEST_USERS.owner.password)

  // Submit form and wait for successful redirect (login redirects to dashboard)
  await page.getByTestId('login-submit-button').click()

  // Wait for redirect away from /login (successful login redirects to tenant dashboard or root)
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 })

  // Wait for page to stabilize
  await page.waitForLoadState('networkidle')
}

/**
 * Login as non-owner user
 * Uses real login flow via /api/auth/login to set cookies properly
 *
 * @param page - Playwright page object
 * @param tenantSlug - Tenant slug for redirect (default: demo_galeria)
 */
export async function loginAsNonOwner(page: Page, tenantSlug: string = 'demo_galeria') {
  // Navigate to login page
  await page.goto('http://localhost:3000/es/login')

  // Fill login form
  await page.getByTestId('login-email-input').fill(TEST_USERS.nonOwner.email)
  await page.getByTestId('login-password-input').fill(TEST_USERS.nonOwner.password)

  // Submit form and wait for successful redirect
  await page.getByTestId('login-submit-button').click()

  // Wait for redirect away from /login
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 })

  // Wait for page to stabilize
  await page.waitForLoadState('networkidle')
}

/**
 * Logout current user
 * Uses /api/auth/logout to clear server-side session
 *
 * @param page - Playwright page object
 */
export async function logout(page: Page) {
  // Call logout API endpoint
  await page.request.post('http://localhost:3000/api/auth/logout')

  // Clear client-side storage
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  // Wait for any redirects to complete
  await page.waitForLoadState('networkidle')
}

/**
 * Get current authenticated user
 * NOTE: This requires app-side implementation to expose user data
 *
 * @param page - Playwright page object
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(page: Page) {
  // Check if user is authenticated by looking for auth cookies
  const cookies = await page.context().cookies()
  const hasAuthCookie = cookies.some(c => c.name.includes('sb-') && c.name.includes('auth-token'))

  return hasAuthCookie ? { authenticated: true } : null
}
