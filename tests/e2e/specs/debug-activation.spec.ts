/**
 * Debug spec para capturar console logs y network durante activación
 */

import { test, expect } from '@playwright/test'
import { SignupPage } from '../pages/signup.page'
import { OnboardingWizardPage } from '../pages/onboarding.page'
import * as path from 'path'

test.describe('Debug: Activation Flow', () => {
  test('capture console and network during activation', async ({ page }) => {
    // Capture console logs
    const consoleLogs: string[] = []
    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`
      consoleLogs.push(text)
      console.log(text)
    })

    // Capture network requests
    const networkRequests: Array<{url: string, method: string, status?: number}> = []
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method()
      })
    })

    page.on('response', response => {
      const req = networkRequests.find(r => r.url === response.url() && !r.status)
      if (req) {
        req.status = response.status()
      }
      console.log(`[NETWORK] ${response.status()} ${response.request().method()} ${response.url()}`)
    })

    // Capture page errors
    page.on('pageerror', error => {
      console.error('[PAGE ERROR]', error.message)
      consoleLogs.push(`[ERROR] ${error.message}`)
    })

    // 1. Complete signup
    const testSlug = `debug-${Date.now()}`
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.fillForm({
      email: `test-${testSlug}@example.com`,
      password: 'TestPassword123!',
      businessName: 'Debug Test Store',
      slug: testSlug
    })

    const onboardingPage = await signupPage.submitAndWaitForOnboarding()

    // 2. Quick onboarding (skip logo and products for faster debugging)
    const wizard = new OnboardingWizardPage(page)

    // Step 1: Skip logo
    await wizard.clickContinue()

    // Step 2: Skip colors
    await wizard.clickContinue()

    // Step 3: Add one product
    await wizard.addProduct({
      name: 'Debug Product',
      price: 10,
      category: 'Test',
      stock: 5
    })
    await wizard.clickContinue()

    // Step 4: Preview
    await wizard.clickContinue()

    // Step 5: Activation - THIS IS WHERE IT FAILS
    console.log('\n🔍 About to click Activate button...\n')

    const activateButton = page.locator('[data-testid="onboarding-activate-button"]')
    await expect(activateButton).toBeVisible()
    await expect(activateButton).toBeEnabled()

    console.log('✅ Activate button is visible and enabled')
    console.log('📍 Current URL:', page.url())

    // Click and wait a bit to see what happens
    await activateButton.click()

    console.log('✅ Activate button clicked')
    console.log('⏳ Waiting 5 seconds to observe behavior...\n')

    await page.waitForTimeout(5000)

    console.log('📍 URL after 5s:', page.url())
    console.log('📊 Button state:', await activateButton.textContent())
    console.log('📊 Button disabled:', await activateButton.isDisabled())

    // Print all console logs
    console.log('\n=== CONSOLE LOGS ===')
    consoleLogs.forEach(log => console.log(log))

    // Print network requests to activation endpoint
    console.log('\n=== NETWORK REQUESTS (filtered) ===')
    const relevantRequests = networkRequests.filter(req =>
      req.url.includes('/api/') ||
      req.url.includes('/signup/') ||
      req.url.includes(testSlug)
    )
    relevantRequests.forEach(req => {
      console.log(`${req.method} ${req.url} → ${req.status || 'pending'}`)
    })

    // Take final screenshot
    await page.screenshot({
      path: 'tests/test-results/debug-activation-final-state.png',
      fullPage: true
    })

    console.log('\n📸 Screenshot saved to tests/test-results/debug-activation-final-state.png')
  })
})
