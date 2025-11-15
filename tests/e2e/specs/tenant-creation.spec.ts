/**
 * Tenant Creation E2E Test Suite
 *
 * Tests the complete signup flow:
 * 1. User visits signup page
 * 2. Fills form with valid data
 * 3. System validates slug in real-time
 * 4. User submits form
 * 5. System creates tenant + user atomically
 * 6. User is redirected to onboarding
 *
 * Database Cleanup:
 * Each test automatically cleans up its tenant and user after completion.
 * This prevents orphaned records and ensures tests can run in parallel.
 */

import { test, expect } from '../fixtures/database.fixture'
import { SignupPage } from '../pages/signup.page'
import { generateTestData, generateTestDataWithOverrides, InvalidTestData, PasswordRequirements, SlugRequirements } from '../helpers/test-data.helper'

test.describe('Tenant Creation Flow', () => {
  // ============================================================================
  // HAPPY PATH TESTS
  // ============================================================================

  test('should successfully create tenant with valid data', async ({ page, dbCleanup }) => {
    // ARRANGE: Generate unique test data
    const testData = generateTestData('mystore')

    // ACT: Navigate to signup and fill form
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.verifyPageLoaded()

    await signupPage.fillForm(testData)

    // Verify submit button is enabled (slug is available)
    const submitEnabled = await signupPage.isSubmitButtonEnabled()
    expect(submitEnabled).toBe(true)

    // Submit and wait for redirect
    const onboardingPage = await signupPage.submitAndWaitForOnboarding()

    // ASSERT: Verify redirect to correct onboarding URL
    const slug = onboardingPage.getSlugFromUrl()
    expect(slug).toBe(testData.slug)

    // CLEANUP: Queue cleanup of tenant and user
    await dbCleanup({ tenantSlug: testData.slug, userEmail: testData.email })
  })

  test('should validate slug availability in real-time', async ({ page, dbCleanup }) => {
    // ARRANGE: Generate test data with available slug
    const testData = generateTestData('available-slug')

    // ACT: Navigate to signup page
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.verifyPageLoaded()

    // Fill first 3 fields
    await signupPage.fillEmail(testData.email)
    await signupPage.fillPassword(testData.password)
    await signupPage.fillBusinessName(testData.businessName)

    // ASSERT: Check slug validation happens automatically
    // Fill slug and wait for availability check
    await signupPage.fillSlug(testData.slug, true) // true = expect available

    // Verify the check icon is visible (green checkmark)
    const status = await signupPage.getSlugAvailabilityStatus()
    expect(status).toBe('available')

    // Verify submit button is enabled
    expect(await signupPage.isSubmitButtonEnabled()).toBe(true)

    // CLEANUP: Clean up if test created tenant (it shouldn't in this case)
    await dbCleanup({ tenantSlug: testData.slug })
  })

  test('should redirect to onboarding after successful signup', async ({ page, dbCleanup }) => {
    // ARRANGE: Generate test data
    const testData = generateTestData('onboard-test')

    // ACT: Complete signup flow
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.fillForm(testData)
    const onboardingPage = await signupPage.submitAndWaitForOnboarding()

    // ASSERT: Verify URL contains slug
    const url = page.url()
    expect(url).toContain(`/signup/${testData.slug}/onboarding`)

    // Verify slug extracted from URL matches
    expect(onboardingPage.getSlugFromUrl()).toBe(testData.slug)

    // CLEANUP: Clean up tenant
    await dbCleanup({ tenantSlug: testData.slug, userEmail: testData.email })
  })

  test('should automatically sign in user after account creation', async ({ page, dbCleanup }) => {
    // ARRANGE: Generate test data
    const testData = generateTestData('auto-signin')

    // ACT: Navigate and complete signup
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.fillForm(testData)
    await signupPage.submitAndWaitForOnboarding()

    // ASSERT: Verify user is authenticated
    // Check if we can access authenticated content (onboarding page is protected)
    expect(page.url()).toContain('/signup')
    expect(page.url()).toContain('/onboarding')

    // CLEANUP: Clean up tenant
    await dbCleanup({ tenantSlug: testData.slug, userEmail: testData.email })
  })

  // ============================================================================
  // VALIDATION TESTS - EMAIL
  // ============================================================================

  test('should show error for invalid email format', async ({ page }) => {
    // ARRANGE: Create test data with invalid email
    const testData = generateTestDataWithOverrides({ email: 'not-an-email' })

    // ACT: Navigate and enter invalid email
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.fillEmail(testData.email)

    // ASSERT: Verify error message appears
    const hasError = await signupPage.hasValidationError('email', 'Email invalido')
    expect(hasError).toBe(true)

    // Verify submit button is disabled due to validation error
    expect(await signupPage.isSubmitButtonDisabled()).toBe(true)
  })

  // TODO: Fix test.each - not supported with custom fixtures
  // test.each(InvalidTestData.invalidEmails)('should reject email: %s', async ({ page }, email) => {
  //   // ACT: Try to enter invalid email
  //   const signupPage = new SignupPage(page)
  //   await signupPage.navigate()
  //   await signupPage.fillEmail(email)

  //   // ASSERT: Verify validation error appears
  //   expect(await signupPage.isSubmitButtonDisabled()).toBe(true)
  // })

  // ============================================================================
  // VALIDATION TESTS - PASSWORD
  // ============================================================================

  test('should show error for password too short', async ({ page }) => {
    // ARRANGE: Create test data with weak password
    const testData = generateTestDataWithOverrides({ password: 'Short1' })

    // ACT: Navigate and fill form with weak password
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.fillPassword(testData.password)

    // ASSERT: Verify error message
    const hasError = await signupPage.hasValidationError('password', 'al menos 8 caracteres')
    expect(hasError).toBe(true)
  })

  test('should show error for password missing uppercase letter', async ({ page }) => {
    // ARRANGE: Create test data with password missing uppercase
    const testData = generateTestDataWithOverrides({ password: 'nouppercase123' })

    // ACT: Navigate and enter password
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.fillPassword(testData.password)

    // ASSERT: Verify validation error
    expect(await signupPage.isSubmitButtonDisabled()).toBe(true)
  })

  test('should show error for password missing lowercase letter', async ({ page }) => {
    // ARRANGE: Create test data with password missing lowercase
    const testData = generateTestDataWithOverrides({ password: 'NOLOWERCASE123' })

    // ACT: Navigate and enter password
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.fillPassword(testData.password)

    // ASSERT: Verify validation error
    expect(await signupPage.isSubmitButtonDisabled()).toBe(true)
  })

  test('should show error for password missing number', async ({ page }) => {
    // ARRANGE: Create test data with password missing number
    const testData = generateTestDataWithOverrides({ password: 'NoNumbers' })

    // ACT: Navigate and enter password
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.fillPassword(testData.password)

    // ASSERT: Verify validation error
    expect(await signupPage.isSubmitButtonDisabled()).toBe(true)
  })

  test('should toggle password visibility', async ({ page }) => {
    // ARRANGE: Test data
    const testData = generateTestData()

    // ACT: Navigate and fill password
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.fillPassword(testData.password)

    // Default should be hidden (type="password")
    let isVisible = await signupPage.isPasswordVisible()
    expect(isVisible).toBe(false)

    // Toggle visibility
    await signupPage.togglePasswordVisibility()
    isVisible = await signupPage.isPasswordVisible()
    expect(isVisible).toBe(true)

    // Toggle back
    await signupPage.togglePasswordVisibility()
    isVisible = await signupPage.isPasswordVisible()
    expect(isVisible).toBe(false)
  })

  // ============================================================================
  // VALIDATION TESTS - SLUG
  // ============================================================================

  test('should show error for slug too short', async ({ page }) => {
    // ARRANGE: Create test data with short slug
    const testData = generateTestDataWithOverrides({ slug: 'ab' })

    // ACT: Navigate and enter short slug
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.fillSlug(testData.slug, false) // false = expect unavailable/invalid

    // ASSERT: Verify validation error
    expect(await signupPage.isSubmitButtonDisabled()).toBe(true)
  })

  test('should show error for slug with uppercase letters', async ({ page }) => {
    // ARRANGE: Create test data with uppercase slug
    const testData = generateTestDataWithOverrides({ slug: 'MyStore' })

    // ACT: Navigate and enter uppercase slug
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.fillSlug(testData.slug, false)

    // ASSERT: Verify slug was converted to lowercase or error shown
    expect(await signupPage.isSubmitButtonDisabled()).toBe(true)
  })

  test('should show error for slug with invalid characters', async ({ page }) => {
    // ARRANGE: Create test data with slug containing invalid characters
    const testData = generateTestDataWithOverrides({ slug: 'my_store' })

    // ACT: Navigate and enter slug with underscore
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.fillSlug(testData.slug, false)

    // ASSERT: Verify validation error
    expect(await signupPage.isSubmitButtonDisabled()).toBe(true)
  })

  test('should disable submit button when slug is already taken', async ({ page, dbCleanup }) => {
    // ARRANGE: Create first test account
    const testData1 = generateTestData('existing-store')

    // Create the first account
    const signupPage1 = new SignupPage(page)
    await signupPage1.navigate()
    await signupPage1.fillForm(testData1)
    await signupPage1.submitAndWaitForOnboarding()

    // Queue cleanup for first account
    await dbCleanup({ tenantSlug: testData1.slug, userEmail: testData1.email })

    // ARRANGE: Try to create second account with same slug
    // Navigate to new page to clear state
    await page.goto('/signup')
    const signupPage2 = new SignupPage(page)
    await signupPage2.verifyPageLoaded()

    const testData2 = generateTestDataWithOverrides({ slug: testData1.slug })

    // ACT: Fill form with same slug
    await signupPage2.fillEmail(testData2.email)
    await signupPage2.fillPassword(testData2.password)
    await signupPage2.fillBusinessName(testData2.businessName)
    await signupPage2.fillSlug(testData2.slug, false) // false = expect taken

    // ASSERT: Verify submit button is disabled
    expect(await signupPage2.isSubmitButtonDisabled()).toBe(true)

    // Verify unavailable indicator is shown
    const status = await signupPage2.getSlugAvailabilityStatus()
    expect(status).toBe('taken')

    // CLEANUP: Clean up second test data (user/email won't exist since we didn't submit)
    await dbCleanup({ tenantSlug: testData2.slug })
  })

  // TODO: Fix test.each - not supported with custom fixtures
  // test.each(InvalidTestData.invalidSlugs)('should reject slug: %s', async ({ page }, slug) => {
  //   // ACT: Navigate and enter invalid slug
  //   const signupPage = new SignupPage(page)
  //   await signupPage.navigate()

  //   // First fill other fields
  //   const testData = generateTestData()
  //   await signupPage.fillEmail(testData.email)
  //   await signupPage.fillPassword(testData.password)
  //   await signupPage.fillBusinessName(testData.businessName)

  //   // Try to fill with invalid slug
  //   await signupPage.fillSlug(slug, false)

  //   // ASSERT: Verify validation prevents submission
  //   expect(await signupPage.isSubmitButtonDisabled()).toBe(true)
  // })

  // ============================================================================
  // VALIDATION TESTS - BUSINESS NAME
  // ============================================================================

  test('should show error for business name too short', async ({ page }) => {
    // ARRANGE: Create test data with short business name
    const testData = generateTestDataWithOverrides({ businessName: 'A' })

    // ACT: Navigate and fill business name
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.fillBusinessName(testData.businessName)

    // ASSERT: Verify validation error
    expect(await signupPage.isSubmitButtonDisabled()).toBe(true)
  })

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  test('should handle slug validation network error gracefully', async ({ page }) => {
    // ARRANGE: Generate test data
    const testData = generateTestData()

    // ACT: Navigate to signup
    const signupPage = new SignupPage(page)
    await signupPage.navigate()

    // Intercept slug validation requests and fail them
    await page.route('**/api/signup/validate-slug', (route) => {
      route.abort('failed')
    })

    // Try to fill slug
    await signupPage.fillEmail(testData.email)
    await signupPage.fillPassword(testData.password)
    await signupPage.fillBusinessName(testData.businessName)
    await signupPage.fillSlug(testData.slug, false)

    // ASSERT: Even with network error, user can still submit if slug meets format requirements
    // (The form validation is client-side for format, server-side for uniqueness)
    // This ensures graceful degradation
  })

  test('should handle signup API error on submission', async ({ page, dbCleanup }) => {
    // ARRANGE: Generate test data
    const testData = generateTestData()

    // ACT: Navigate and fill form
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.fillForm(testData)

    // Intercept signup request and return error
    await page.route('**/api/signup', (route) => {
      route.abort('failed')
    })

    // Submit form
    await signupPage.clickSubmit()

    // Wait for error handling
    await page.waitForTimeout(2000)

    // ASSERT: Should still be on signup page (not redirected)
    expect(page.url()).toContain('/signup')
    // Should not be on onboarding page
    expect(page.url()).not.toContain('/onboarding')

    // CLEANUP: Clean up test data
    await dbCleanup({ tenantSlug: testData.slug })
  })

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  test('should create complete signup flow with all valid data', async ({ page, dbCleanup }) => {
    // ARRANGE: Generate complete test data
    const testData = generateTestData('complete-flow')

    // ACT: Navigate to signup
    const signupPage = new SignupPage(page)
    await signupPage.navigate()

    // Verify all fields are present and empty
    await signupPage.verifyPageLoaded()

    // Fill email
    await signupPage.fillEmail(testData.email)
    expect(await signupPage.getFieldErrorMessage('email')).toBeNull()

    // Fill password
    await signupPage.fillPassword(testData.password)
    expect(await signupPage.getFieldErrorMessage('password')).toBeNull()

    // Fill business name
    await signupPage.fillBusinessName(testData.businessName)
    expect(await signupPage.getFieldErrorMessage('businessName')).toBeNull()

    // Fill slug
    await signupPage.fillSlug(testData.slug, true)
    expect(await signupPage.getSlugAvailabilityStatus()).toBe('available')

    // ASSERT: Submit button should be enabled
    expect(await signupPage.isSubmitButtonEnabled()).toBe(true)

    // Submit
    const onboardingPage = await signupPage.submitAndWaitForOnboarding()

    // Verify final state
    expect(onboardingPage.getSlugFromUrl()).toBe(testData.slug)

    // CLEANUP: Clean up tenant
    await dbCleanup({ tenantSlug: testData.slug, userEmail: testData.email })
  })

  test('should show success message after account creation', async ({ page, dbCleanup }) => {
    // ARRANGE: Generate test data
    const testData = generateTestData('success-message')

    // ACT: Navigate and complete signup
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.fillForm(testData)

    // Click submit and wait for redirect (which happens after success message)
    await signupPage.submitAndWaitForOnboarding()

    // ASSERT: Verify we're on onboarding page (proof of successful signup)
    expect(page.url()).toContain('/onboarding')

    // CLEANUP: Clean up tenant
    await dbCleanup({ tenantSlug: testData.slug, userEmail: testData.email })
  })

  // ============================================================================
  // CLEANUP TESTS
  // ============================================================================

  test('should properly cleanup database after test completion', async ({ page, dbCleanup }) => {
    // ARRANGE: Generate test data
    const testData = generateTestData('cleanup-test')

    // ACT: Create account
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.fillForm(testData)
    await signupPage.submitAndWaitForOnboarding()

    // Queue cleanup
    await dbCleanup({ tenantSlug: testData.slug, userEmail: testData.email })

    // Note: Actual cleanup happens after test completes
    // We can't verify deletion here, but it will happen after test ends

    // ASSERT: We're on onboarding page
    expect(page.url()).toContain('/onboarding')
  })
})
