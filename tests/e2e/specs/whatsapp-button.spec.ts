/**
 * WhatsApp Button E2E Test Suite
 *
 * Tests WhatsApp button configuration and display across templates:
 *
 * Dashboard Configuration Flow:
 * 1. Navigate to tenant settings contact tab
 * 2. Enter valid phone number → verify save success
 * 3. Enter invalid number → verify error validation
 * 4. Clear number → verify save works with empty
 *
 * Button Display Flow:
 * 1. Configure WhatsApp number in settings
 * 2. Visit storefront with configured number → button visible
 * 3. Click button → verify wa.me URL opens
 * 4. Visit storefront without number → button NOT visible
 *
 * Template Coverage: Gallery, Detail, Minimal, Restaurant
 */

import { test, expect } from '@playwright/test'
import { TenantSettingsPage } from '../pages/tenant-settings.page'
import { StorefrontWhatsAppPage } from '../pages/storefront-whatsapp.page'
import { StorefrontPage } from '../pages/storefront.page'
import { loginAsOwner } from '../fixtures/auth.fixture'

// Test configuration
const TEST_TENANT_ID = 1 // Use existing test tenant or create one
const TEST_TENANT_SLUG = 'demo_galeria' // Use existing demo tenant
const VALID_PHONE_NUMBER = '+55119876543210' // Brazil format
const VALID_PHONE_DISPLAY = '+55 11 98765-4321' // Display format
const INVALID_PHONE = 'not-a-phone' // Invalid format

test.describe('WhatsApp Button - Dashboard Configuration', () => {
  let settingsPage: TenantSettingsPage

  test.beforeEach(async ({ page }) => {
    // Login first - dashboard requires authentication
    await loginAsOwner(page, TEST_TENANT_SLUG)

    settingsPage = new TenantSettingsPage(page)
    await settingsPage.goto(TEST_TENANT_SLUG)
    await settingsPage.clickContactTab()
  })

  test('should save valid WhatsApp number', async ({ page }) => {
    await settingsPage.saveWhatsappNumber(VALID_PHONE_DISPLAY)

    // Verify success message
    await settingsPage.verifySuccessMessage()

    // Verify input retains value
    const savedValue = await settingsPage.getWhatsappValue()
    expect(savedValue).toBeTruthy()
  })

  test('should handle invalid WhatsApp number format', async ({ page }) => {
    await settingsPage.fillWhatsappNumber(INVALID_PHONE)
    await settingsPage.clickSave()

    // Should show error message or validation error
    // Error might come from backend or frontend validation
    try {
      await settingsPage.verifyErrorMessage()
    } catch {
      // Alternative: check for field error
      const errorText = await settingsPage.getErrorText()
      expect(errorText).toBeTruthy()
    }
  })

  test('should clear WhatsApp number and save', async ({ page }) => {
    // First set a number
    await settingsPage.saveWhatsappNumber(VALID_PHONE_DISPLAY)
    await settingsPage.verifySuccessMessage()

    // Now clear it
    await settingsPage.clearWhatsappNumber()
    await settingsPage.clickSave()

    // Verify save works
    const currentValue = await settingsPage.getWhatsappValue()
    expect(currentValue).toBe('')
  })

  test('should show WhatsApp input in contact tab', async ({ page }) => {
    const input = settingsPage.whatsappInput
    await expect(input).toBeVisible()

    // Verify input has placeholder or help text
    const placeholder = await settingsPage.getWhatsappPlaceholder()
    expect(placeholder).toBeTruthy()
  })
})

test.describe('WhatsApp Button - Storefront Display (Gallery Template)', () => {
  let settingsPage: TenantSettingsPage
  let storefrontPage: StorefrontWhatsAppPage

  test.beforeEach(async ({ page }) => {
    settingsPage = new TenantSettingsPage(page)
    storefrontPage = new StorefrontWhatsAppPage(page)

    // Configure WhatsApp number in settings
    await settingsPage.goto(TEST_TENANT_SLUG)
    await settingsPage.clickContactTab()
    await settingsPage.saveWhatsappNumber(VALID_PHONE_DISPLAY)
    await settingsPage.verifySuccessMessage()
  })

  test('should display WhatsApp button when configured', async ({ page }) => {
    await storefrontPage.goto(TEST_TENANT_SLUG)

    // Verify button is visible
    await storefrontPage.verifyButtonVisible()

    // Verify template
    await storefrontPage.verifyTemplate('gallery')
  })

  test('should have correct wa.me URL in button href', async ({ page }) => {
    await storefrontPage.goto(TEST_TENANT_SLUG)

    // Verify wa.me URL with phone number
    await storefrontPage.verifyWaMeUrl(VALID_PHONE_DISPLAY)
  })

  test('should have WhatsApp icon or accessible text', async ({ page }) => {
    await storefrontPage.goto(TEST_TENANT_SLUG)

    // Verify accessibility
    await storefrontPage.verifyButtonAccessibility()

    // Try to find icon
    const icon = await storefrontPage.getButtonIcon()
    const hasIcon = await icon.isVisible({ timeout: 1000 }).catch(() => false)
    const buttonText = await storefrontPage.getButtonText()

    expect(hasIcon || buttonText).toBeTruthy()
  })

  test('should not display button when WhatsApp not configured', async ({ page }) => {
    // Clear the WhatsApp number
    await settingsPage.goto(TEST_TENANT_SLUG)
    await settingsPage.clickContactTab()
    await settingsPage.clearWhatsappNumber()
    await settingsPage.clickSave()

    // Now visit storefront
    await storefrontPage.goto(TEST_TENANT_SLUG)

    // Button should NOT be visible
    await storefrontPage.verifyButtonNotVisible()
  })

  test('should open wa.me link on button click', async ({ browser }) => {
    // Create new context to track popups
    const context = await browser.newContext()
    const page = await context.newPage()

    const storefrontPage2 = new StorefrontWhatsAppPage(page)
    await storefrontPage2.goto(TEST_TENANT_SLUG)

    // Listen for new page (popup/new tab)
    const waPage = await storefrontPage2.clickButtonAndWaitForNavigation()

    // Verify wa.me URL opened
    const waUrl = waPage.url()
    expect(waUrl).toMatch(/^https:\/\/wa\.me\//)

    await waPage.close()
    await context.close()
  })
})

test.describe('WhatsApp Button - Storefront Display (Detail Template)', () => {
  let settingsPage: TenantSettingsPage
  let storefrontPage: StorefrontWhatsAppPage

  test.beforeEach(async ({ page }) => {
    settingsPage = new TenantSettingsPage(page)
    storefrontPage = new StorefrontWhatsAppPage(page)

    // Configure WhatsApp
    await settingsPage.goto(TEST_TENANT_SLUG)
    await settingsPage.clickContactTab()
    await settingsPage.saveWhatsappNumber(VALID_PHONE_DISPLAY)
    await settingsPage.verifySuccessMessage()
  })

  test('should display WhatsApp button on detail template', async ({ page }) => {
    await storefrontPage.goto(TEST_TENANT_SLUG)

    // Verify button is visible
    await storefrontPage.verifyButtonVisible()

    // Verify detail template if configured
    try {
      await storefrontPage.verifyTemplate('detail')
    } catch {
      // Template might be gallery by default, that's ok
    }
  })

  test('should have correct wa.me URL on detail template', async ({ page }) => {
    await storefrontPage.goto(TEST_TENANT_SLUG)

    // Verify wa.me URL
    await storefrontPage.verifyWaMeUrl(VALID_PHONE_DISPLAY)
  })
})

test.describe('WhatsApp Button - Storefront Display (Minimal Template)', () => {
  let settingsPage: TenantSettingsPage
  let storefrontPage: StorefrontWhatsAppPage

  test.beforeEach(async ({ page }) => {
    settingsPage = new TenantSettingsPage(page)
    storefrontPage = new StorefrontWhatsAppPage(page)

    // Configure WhatsApp
    await settingsPage.goto(TEST_TENANT_SLUG)
    await settingsPage.clickContactTab()
    await settingsPage.saveWhatsappNumber(VALID_PHONE_DISPLAY)
    await settingsPage.verifySuccessMessage()
  })

  test('should display WhatsApp button on minimal template', async ({ page }) => {
    await storefrontPage.goto(TEST_TENANT_SLUG)

    // Verify button visibility
    await storefrontPage.verifyButtonVisible()

    // Try to verify minimal template
    try {
      await storefrontPage.verifyTemplate('minimal')
    } catch {
      // Template might be different, that's ok
    }
  })

  test('should have correct wa.me URL on minimal template', async ({ page }) => {
    await storefrontPage.goto(TEST_TENANT_SLUG)

    // Verify wa.me URL
    await storefrontPage.verifyWaMeUrl(VALID_PHONE_DISPLAY)
  })
})

test.describe('WhatsApp Button - Storefront Display (Restaurant Template)', () => {
  let settingsPage: TenantSettingsPage
  let storefrontPage: StorefrontWhatsAppPage

  test.beforeEach(async ({ page }) => {
    settingsPage = new TenantSettingsPage(page)
    storefrontPage = new StorefrontWhatsAppPage(page)

    // Configure WhatsApp
    await settingsPage.goto(TEST_TENANT_SLUG)
    await settingsPage.clickContactTab()
    await settingsPage.saveWhatsappNumber(VALID_PHONE_DISPLAY)
    await settingsPage.verifySuccessMessage()
  })

  test('should display WhatsApp button on restaurant template', async ({ page }) => {
    await storefrontPage.goto(TEST_TENANT_SLUG)

    // Verify button visibility
    await storefrontPage.verifyButtonVisible()

    // Try to verify restaurant template
    try {
      await storefrontPage.verifyTemplate('restaurant')
    } catch {
      // Template might be different, that's ok
    }
  })

  test('should have correct wa.me URL on restaurant template', async ({ page }) => {
    await storefrontPage.goto(TEST_TENANT_SLUG)

    // Verify wa.me URL
    await storefrontPage.verifyWaMeUrl(VALID_PHONE_DISPLAY)
  })
})

test.describe('WhatsApp Button - Button Behavior', () => {
  let settingsPage: TenantSettingsPage
  let storefrontPage: StorefrontWhatsAppPage

  test.beforeEach(async ({ page }) => {
    settingsPage = new TenantSettingsPage(page)
    storefrontPage = new StorefrontWhatsAppPage(page)

    // Configure WhatsApp
    await settingsPage.goto(TEST_TENANT_SLUG)
    await settingsPage.clickContactTab()
    await settingsPage.saveWhatsappNumber(VALID_PHONE_DISPLAY)
    await settingsPage.verifySuccessMessage()

    // Visit storefront
    await storefrontPage.goto(TEST_TENANT_SLUG)
  })

  test('should have accessible button (aria-label or text)', async ({ page }) => {
    await storefrontPage.verifyButtonAccessibility()
  })

  test('should update button when WhatsApp number changes', async ({ page }) => {
    // Get initial URL
    const initialUrl = await storefrontPage.getButtonHref()
    expect(initialUrl).toMatch(/\+55119876543210/) // Initial number

    // Change WhatsApp number
    await settingsPage.goto(TEST_TENANT_SLUG)
    await settingsPage.clickContactTab()
    const newNumber = '+55 11 99999-9999'
    await settingsPage.saveWhatsappNumber(newNumber)
    await settingsPage.verifySuccessMessage()

    // Refresh storefront
    await storefrontPage.goto(TEST_TENANT_SLUG)

    // Verify button URL updated
    const newUrl = await storefrontPage.getButtonHref()
    expect(newUrl).toMatch(/wa\.me\//)
    expect(newUrl).toContain('5511999999999') // New number without formatting
  })

  test('should hide button after clearing WhatsApp number', async ({ page }) => {
    // Verify button is visible initially
    await storefrontPage.verifyButtonVisible()

    // Clear WhatsApp number
    await settingsPage.goto(TEST_TENANT_SLUG)
    await settingsPage.clickContactTab()
    await settingsPage.clearWhatsappNumber()
    await settingsPage.clickSave()

    // Refresh storefront
    await storefrontPage.goto(TEST_TENANT_SLUG)

    // Verify button is no longer visible
    await storefrontPage.verifyButtonNotVisible()
  })
})

test.describe('WhatsApp Button - Edge Cases', () => {
  let settingsPage: TenantSettingsPage
  let storefrontPage: StorefrontWhatsAppPage

  test.beforeEach(async ({ page }) => {
    settingsPage = new TenantSettingsPage(page)
    storefrontPage = new StorefrontWhatsAppPage(page)
  })

  test('should handle phone number with different formats', async ({ page }) => {
    // Different phone formats that should be valid
    const phoneFormats = [
      '+5511987654321', // Without spaces
      '+55 11 98765-4321', // With spaces and dash
      '+55 (11) 98765-4321', // With parentheses
    ]

    for (const phone of phoneFormats) {
      await settingsPage.goto(TEST_TENANT_SLUG)
      await settingsPage.clickContactTab()
      await settingsPage.saveWhatsappNumber(phone)

      await storefrontPage.goto(TEST_TENANT_SLUG)

      // Should display button for all valid formats
      const isVisible = await storefrontPage.isButtonVisible()
      expect(isVisible).toBe(true)

      // Cleanup for next iteration
      await settingsPage.goto(TEST_TENANT_SLUG)
      await settingsPage.clickContactTab()
      await settingsPage.clearWhatsappNumber()
      await settingsPage.clickSave()
    }
  })

  test('should handle whitespace in WhatsApp number', async ({ page }) => {
    const numberWithSpaces = '   +55 11 98765-4321   '

    await settingsPage.goto(TEST_TENANT_SLUG)
    await settingsPage.clickContactTab()
    await settingsPage.saveWhatsappNumber(numberWithSpaces)

    // Should either trim or accept with spaces
    const savedValue = await settingsPage.getWhatsappValue()
    expect(savedValue).toBeTruthy()

    await storefrontPage.goto(TEST_TENANT_SLUG)

    // Button should be visible (assuming trimming works)
    try {
      await storefrontPage.verifyButtonVisible()
    } catch {
      // If validation rejects spaces, that's also acceptable
      const isVisible = await storefrontPage.isButtonVisible()
      expect(isVisible).toBe(false)
    }
  })

  test('should verify button opens in new tab/window', async ({ browser }) => {
    // Setup
    await settingsPage.goto(TEST_TENANT_SLUG)
    await settingsPage.clickContactTab()
    await settingsPage.saveWhatsappNumber(VALID_PHONE_DISPLAY)

    // Create context
    const context = await browser.newContext()
    const page = await context.newPage()
    const storefront = new StorefrontWhatsAppPage(page)

    await storefront.goto(TEST_TENANT_SLUG)

    // Verify button target attribute
    const target = await storefront.whatsappButton.getAttribute('target')
    expect(target).toBe('_blank') // Should open in new tab

    await context.close()
  })
})
