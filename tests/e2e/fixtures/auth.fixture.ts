import { Page, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

/**
 * Auth fixture helpers for E2E tests
 * Provides login utilities for owner and non-owner users
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

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
 * Injects auth session into browser localStorage
 *
 * @param page - Playwright page object
 * @param tenantSlug - Tenant slug for redirect (default: test-store)
 * @returns Session data on success
 */
export async function loginAsOwner(page: Page, tenantSlug: string = 'test-store') {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_USERS.owner.email,
    password: TEST_USERS.owner.password,
  })

  if (error) {
    throw new Error(`Failed to login as owner: ${error.message}`)
  }

  // Navigate to tenant page
  await page.goto(`http://localhost:3000/${tenantSlug}`)

  // Inject session into localStorage via cookies (Supabase SSR pattern)
  // The session is already set via Supabase client, reload to pick it up
  await page.reload()

  // Wait for auth state to be ready
  await page.waitForLoadState('networkidle')

  return data.session
}

/**
 * Login as non-owner user
 * Non-owner should be redirected from admin routes
 *
 * @param page - Playwright page object
 * @param tenantSlug - Tenant slug for redirect (default: test-store)
 * @returns Session data on success
 */
export async function loginAsNonOwner(page: Page, tenantSlug: string = 'test-store') {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_USERS.nonOwner.email,
    password: TEST_USERS.nonOwner.password,
  })

  if (error) {
    throw new Error(`Failed to login as non-owner: ${error.message}`)
  }

  // Navigate to tenant page
  await page.goto(`http://localhost:3000/${tenantSlug}`)

  // Reload to pick up session
  await page.reload()

  // Wait for auth state to be ready
  await page.waitForLoadState('networkidle')

  return data.session
}

/**
 * Logout current user
 * Clears auth session and redirects to login
 *
 * @param page - Playwright page object
 */
export async function logout(page: Page) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  await supabase.auth.signOut()

  // Clear localStorage
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  // Wait for redirect to complete
  await page.waitForLoadState('networkidle')
}

/**
 * Get current authenticated user
 *
 * @param page - Playwright page object
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(page: Page) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
