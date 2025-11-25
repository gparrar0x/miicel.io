/**
 * Complete Signup & Onboarding Flow - Happy Path
 *
 * Tests the entire user journey from signup to active storefront:
 * 1. User creates account (signup)
 * 2. Redirects to onboarding wizard
 * 3. Completes all 5 onboarding steps:
 *    - Upload logo
 *    - Choose colors
 *    - Add products
 *    - Preview storefront
 *    - Activate store
 * 4. Redirects to live tenant storefront
 *
 * Database Cleanup:
 * Automatically cleans up tenant, user, products, and uploaded files after test.
 */

import { test, expect } from '../fixtures/database.fixture'
import { SignupPage } from '../pages/signup.page'
import { OnboardingWizardPage, type ProductData } from '../pages/onboarding.page'
import { generateTestData } from '../helpers/test-data.helper'
import * as path from 'path'

test.describe('Complete Signup & Onboarding Flow - Happy Path', () => {

  test('should complete full journey: signup → onboarding → active storefront', async ({ page, dbCleanup }) => {
    // ========================================================================
    // STEP 1: SIGNUP
    // ========================================================================

    // ARRANGE: Generate unique test data
    const testData = generateTestData('happy-path')
    const testLogoPath = path.join(__dirname, '../fixtures/files/test-logo.png')

    const testProducts: ProductData[] = [
      {
        name: 'Producto Test 1',
        price: 99.99,
        category: 'Electronica',
        stock: 10
      },
      {
        name: 'Producto Test 2',
        price: 49.50,
        category: 'Ropa',
        stock: 25
      },
      {
        name: 'Producto Test 3',
        price: 149.00,
        category: 'Hogar',
        stock: 5
      }
    ]

    // ACT: Navigate to signup and complete registration
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.verifyPageLoaded()

    console.log('📝 Step 1: Filling signup form...')
    await signupPage.fillForm(testData)

    // Verify submit button is enabled
    const submitEnabled = await signupPage.isSubmitButtonEnabled()
    expect(submitEnabled).toBe(true)

    // Submit and expect redirect to onboarding
    console.log('✅ Step 1: Submitting signup form...')
    const onboardingPage = await signupPage.submitAndWaitForOnboarding()

    // ASSERT: Verify we're on onboarding page
    const slug = onboardingPage.getSlugFromUrl()
    expect(slug).toBe(testData.slug)
    console.log(`✅ Signup complete! Tenant created: ${slug}`)

    // ========================================================================
    // STEP 2: ONBOARDING WIZARD
    // ========================================================================

    // Convert OnboardingPage to OnboardingWizardPage
    const wizard = new OnboardingWizardPage(page)
    await wizard.waitForPageLoad()

    console.log('🎨 Step 2: Starting onboarding wizard...')

    // Complete all 5 steps of onboarding
    const storefrontPage = await wizard.completeOnboarding({
      logoPath: testLogoPath,
      products: testProducts
    })

    console.log('✅ Onboarding complete!')

    // ========================================================================
    // STEP 3: VERIFY STOREFRONT
    // ========================================================================

    console.log('🏪 Step 3: Verifying storefront loaded...')

    // ASSERT: Verify we're on the tenant storefront
    await storefrontPage.waitForPageLoad()
    const storefrontSlug = storefrontPage.getSlugFromUrl()
    expect(storefrontSlug).toBe(testData.slug)

    console.log(`✅ Storefront is live at: /${storefrontSlug}`)

    // Verify storefront content loaded
    await storefrontPage.verifyStorefrontLoaded()

    // ========================================================================
    // CLEANUP
    // ========================================================================

    console.log('🧹 Cleaning up test data...')

    // Clean up tenant, user, and all related data
    await dbCleanup({
      tenantSlug: testData.slug,
      userEmail: testData.email
    })

    console.log('✅ Cleanup complete!')
  })

  test('should complete onboarding without logo (optional upload)', async ({ page, dbCleanup }) => {
    // ARRANGE: Generate test data
    const testData = generateTestData('no-logo')

    const testProducts: ProductData[] = [
      {
        name: 'Producto Sin Logo',
        price: 29.99,
        category: 'Test',
        stock: 100
      }
    ]

    // ACT: Signup
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.fillForm(testData)
    await signupPage.submitAndWaitForOnboarding()

    // Complete onboarding WITHOUT logo
    const wizard = new OnboardingWizardPage(page)
    await wizard.waitForPageLoad()

    // Skip Step 1 (no logo upload)
    await wizard.clickContinue()

    // Step 2: Colors (use defaults)
    await wizard.clickContinue()

    // Step 3: Add products
    await wizard.addProducts(testProducts)
    await wizard.clickContinue()

    // Step 4: Preview
    await wizard.clickContinue()

    // Step 5: Activate
    await wizard.verifySummary()
    const storefrontPage = await wizard.activateStore()

    // ASSERT: Verify storefront loaded
    await storefrontPage.waitForPageLoad()
    expect(storefrontPage.getSlugFromUrl()).toBe(testData.slug)

    // CLEANUP
    await dbCleanup({
      tenantSlug: testData.slug,
      userEmail: testData.email
    })
  })

})
