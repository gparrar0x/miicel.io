/**
 * MercadoPago Sandbox Helper for E2E Tests
 *
 * Provides utility functions for interacting with MercadoPago sandbox
 * during E2E tests. Handles form filling, payment completion, and redirects.
 *
 * Usage:
 * const mpHelper = new MercadoPagoHelper(page)
 * await mpHelper.fillPaymentForm(cardData)
 * await mpHelper.completePayment()
 */

import { Page, expect } from '@playwright/test'

export interface MercadoPagoCardData {
  cardNumber: string
  cardholder: string
  expirationMonth: string
  expirationYear: string
  cvv: string
  installments?: number
  dni?: string // Document number (required in Argentina)
}

export class MercadoPagoHelper {
  constructor(private page: Page) {}

  /**
   * Wait for MercadoPago page to load
   * Verifies we're on a MercadoPago domain
   * Uses domcontentloaded instead of networkidle because MP has continuous network requests
   */
  async waitForMercadoPagoPage(): Promise<void> {
    // Wait for navigation to MP domain
    await this.page.waitForURL(/mercadopago\.com|sandbox\.mercadopago\.com/, {
      timeout: 30000,
    })

    // Log the URL we're on for debugging
    const currentUrl = this.page.url()
    const pageTitle = await this.page.title()
    console.log(`📍 MercadoPago page loaded: ${currentUrl}`)
    console.log(`📄 Page title: ${pageTitle}`)

    // Wait for DOM to be ready (more reliable than networkidle for MP)
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 })

    // Quick check for form elements (don't wait too long since user says they're visible)
    try {
      // Look for common MP form elements
      await this.page.waitForSelector(
        'input[type="text"], input[type="tel"], input[name*="card"], form, iframe, button',
        { timeout: 2000, state: 'visible' }
      )
      console.log('✓ Found form elements on MP page')
    } catch {
      // If no form found, continue anyway - MP might load forms dynamically
      console.log('⚠️  MP form elements not immediately visible, continuing...')
    }
  }

  /**
   * Select payment method on MP checkout (if needed)
   * MP shows "¿Cómo querés pagar?" page first, need to select card option
   */
  async selectPaymentMethod(): Promise<void> {
    console.log('🔍 Checking if payment method selection is needed...')

    let pageTitle = ''
    let pageUrl = ''

    // Wait for page to be stable and check if we need to select payment method
    try {
      // Wait for page to load completely
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 })

      // Give MP a moment to render its dynamic content
      await this.page.waitForTimeout(2000)

      // Check current page state
      pageTitle = await this.page.title()
      pageUrl = this.page.url()

      console.log(`📍 Current MP page: ${pageUrl}`)
      console.log(`📄 Page title: ${pageTitle}`)
    } catch (error: any) {
      if (error.message.includes('closed') || error.message.includes('Target page')) {
        throw new Error(
          'Page was closed while trying to select payment method. ' +
          'Please keep the browser window open during test execution. ' +
          'If running in headed mode, do not manually close the browser.'
        )
      }
      console.log('⚠️  Error checking page state, continuing:', error.message)
      return // Exit early if we can't even check the page state
    }

    // Check if we're on the payment method selection page
    if (pageTitle.includes('Cómo querés pagar') || pageUrl.includes('payment-option-form')) {
      console.log('📍 On payment method selection page, selecting card option...')

      // Try multiple selectors for card payment option with better error handling
      const cardOptionSelectors = [
        'button:has-text("Tarjeta de crédito")',
        'button:has-text("Tarjeta de débito")',
        'button:has-text("Tarjeta")',
        'a:has-text("Tarjeta")',
        'button:has-text("Crédito")',
        'button:has-text("Débito")',
        'div:has-text("Tarjeta"):has(button)',
        'div:has-text("Crédito"):has(button)',
        '[data-testid*="card"]',
        '[data-testid*="credit"]',
        '[data-testid*="tarjeta"]',
        'button[aria-label*="tarjeta"]',
        'button[aria-label*="card"]',
        'button[aria-label*="crédito"]',
        'button[aria-label*="credito"]',
        '.payment-option-card',
        '#card-option',
        // More generic selectors
        'button[class*="card"]',
        'button[class*="tarjeta"]',
        'a[class*="card"]',
        'a[class*="tarjeta"]',
      ]

        let selected = false
        for (const selector of cardOptionSelectors) {
          try {
            const option = this.page.locator(selector).first()
            // Check if element exists and is visible
            if (await option.isVisible({ timeout: 1000 })) {
              console.log(`🎯 Trying to click card option with selector: ${selector}`)
              await option.click({ timeout: 3000 })
              await this.page.waitForTimeout(1500) // Wait for navigation/form to load
              selected = true
              console.log(`✓ Selected payment method with selector: ${selector}`)
              break
            }
          } catch (error) {
            console.log(`⚠️  Selector ${selector} failed: ${error.message}`)
            continue
          }
        }

        if (!selected) {
          // Try clicking on any button/link that might be a card option
          try {
            const allButtons = this.page.locator('button, a').filter({ hasText: /tarjeta|card|crédito|débito|credito/i })
            const count = await allButtons.count()
            console.log(`🔍 Found ${count} potential card buttons/links`)
            if (count > 0) {
              // Log what we found for debugging
              for (let i = 0; i < Math.min(count, 3); i++) {
                const text = await allButtons.nth(i).textContent()
                console.log(`  Option ${i}: "${text}"`)
              }
              await allButtons.first().click()
              await this.page.waitForTimeout(1500)
              console.log('✓ Clicked on first card option button')
              selected = true
            }
          } catch (error) {
            console.log(`⚠️  Error clicking fallback card option: ${error.message}`)
          }
        }

        if (!selected) {
          // Take screenshot for debugging
          await this.takeDebugScreenshot('payment-method-not-found')
          console.log('❌ Could not find card payment option. Screenshot saved as mp-debug-payment-method-not-found-*.png')

          // Log available buttons for debugging
          try {
            const allButtons = await this.page.locator('button').all()
            console.log(`Found ${allButtons.length} total buttons on page:`)
            for (let i = 0; i < Math.min(allButtons.length, 5); i++) {
              const text = await allButtons[i].textContent()
              console.log(`  Button ${i}: "${text?.trim()}"`)
            }
          } catch (e) {
            console.log('Could not analyze buttons')
          }
        }

        // Wait for form to load after selection (reduced timeout)
        await this.page.waitForTimeout(500)
    } else {
      console.log('ℹ️  Not on payment method selection page, skipping selection')
    }
  }

  /**
   * Fill MercadoPago payment form with card data
   * Handles different MP UI variations and form structures, including iframes
   */
  async fillPaymentForm(cardData: MercadoPagoCardData): Promise<void> {
    console.log('💳 Starting to fill MercadoPago payment form...')

    // Wait for MP page
    await this.waitForMercadoPagoPage()

    // Select payment method first (if needed)
    await this.selectPaymentMethod()

    // After selecting payment method, wait for navigation to card form
    console.log('⏳ Waiting for card form page to load...')
    try {
      // Wait specifically for card-form URL which appears after selecting payment method
      await this.page.waitForURL(/card-form/, { timeout: 15000 })
      console.log('✓ Navigated to card form page')
    } catch {
      console.log('⚠️  Card form URL not detected, checking if we\'re already on the right page...')
      const currentUrl = this.page.url()
      if (currentUrl.includes('card-form') || currentUrl.includes('payment-form')) {
        console.log('✓ Already on card form page')
      } else {
        console.log(`⚠️  Current URL: ${currentUrl}`)
      }
    }

    // Give MP time to render the form and load iframes
    console.log('⏳ Giving MP time to render card form and iframes...')
    await this.page.waitForTimeout(2000)
    
    // Wait for iframes to be present
    try {
      await this.page.waitForSelector('iframe', { timeout: 5000 })
      console.log('✓ Iframes detected on page')
    } catch {
      console.log('⚠️ No iframes found, continuing anyway...')
    }

    // Take screenshot before trying to fill form (quick)
    console.log('📸 Taking screenshot before filling form...')
    await this.takeDebugScreenshot('before-fill-form')
    console.log('✅ Screenshot taken, proceeding with form filling...')

    console.log('🔍 Looking for card number field...')

    // Helper to find field in iframes using frameLocator
    const findFieldInIframes = async (selectors: string[], fieldName: string) => {
      const allIframes = this.page.locator('iframe')
      const iframeCount = await allIframes.count()
      console.log(`🔍 Searching ${iframeCount} iframes for ${fieldName}...`)
      
      for (let i = 0; i < iframeCount; i++) {
        try {
          const frameLocator = this.page.frameLocator(`iframe >> nth=${i}`)
          
          for (const selector of selectors) {
            try {
              const field = frameLocator.locator(selector).first()
              if (await field.isVisible({ timeout: 300 })) {
                console.log(`✓ Found ${fieldName} in iframe ${i} with selector: ${selector}`)
                return field
              }
            } catch {
              continue
            }
          }
        } catch {
          continue
        }
      }
      return null
    }

    // Helper to find field in main page
    const findFieldInMainPage = async (selectors: string[], fieldName: string) => {
      for (const selector of selectors) {
        try {
          const field = this.page.locator(selector).first()
          if (await field.isVisible({ timeout: 300 })) {
            console.log(`✓ Found ${fieldName} in main page with selector: ${selector}`)
            return field
          }
        } catch {
          continue
        }
      }
      return null
    }

    // Helper to fill a field - works for both iframe and main page locators
    const fillField = async (field: any, value: string, fieldName: string, isInIframe = false) => {
      console.log(`📝 Filling ${fieldName} (iframe: ${isInIframe})...`)
      
      // Strategy 1: Try fill() first - this should work for Playwright locators
      try {
        await field.fill(value, { timeout: 3000 })
        await this.page.waitForTimeout(200)
        const displayValue = fieldName.includes('CVV') ? '***' : value
        console.log(`✓ ${fieldName} filled via fill(): ${displayValue}`)
        return value
      } catch (e) {
        console.log(`⚠️  fill() failed for ${fieldName}, trying pressSequentially...`)
      }
      
      // Strategy 2: Click and use pressSequentially on the element
      try {
        await field.click({ timeout: 2000, force: true })
        await this.page.waitForTimeout(200)
        await field.pressSequentially(value, { delay: 60 })
        await this.page.waitForTimeout(200)
        const displayValue = fieldName.includes('CVV') ? '***' : value
        console.log(`✓ ${fieldName} filled via pressSequentially: ${displayValue}`)
        return value
      } catch (e) {
        console.log(`⚠️  pressSequentially failed for ${fieldName}, trying type...`)
      }
      
      // Strategy 3: Focus and type character by character
      try {
        await field.focus({ timeout: 2000 })
        await this.page.waitForTimeout(200)
        for (const char of value) {
          await field.type(char)
          await this.page.waitForTimeout(30)
        }
        const displayValue = fieldName.includes('CVV') ? '***' : value
        console.log(`✓ ${fieldName} filled via type: ${displayValue}`)
        return value
      } catch (e) {
        console.log(`❌ All fill strategies failed for ${fieldName}: ${e}`)
        throw e
      }
    }

    // Card number selectors - MercadoPago uses input[name="cardNumber"] in iframe
    const cardNumberSelectors = [
      'input[name="cardNumber"]',
      'input[id="cardNumber"]',
      'input[placeholder*="1234"]',
      'input[aria-label*="Número de tarjeta"]',
    ]

    // Find card number field (always in iframe for MP)
    let cardNumberField = await findFieldInIframes(cardNumberSelectors, 'card number')
    
    if (!cardNumberField) {
      cardNumberField = await findFieldInMainPage(cardNumberSelectors, 'card number')
    }

    if (!cardNumberField) {
      await this.takeDebugScreenshot('card-field-not-found')
      throw new Error('Could not find MercadoPago card number field')
    }

    // Fill card number (in iframe)
    const cleanCardNumber = cardData.cardNumber.replace(/\s/g, '')
    console.log(`💳 Filling card number: **** **** **** ${cleanCardNumber.slice(-4)}`)
    await fillField(cardNumberField, cleanCardNumber, 'card number', true)

    // Fill cardholder name (in main page for MP)
    const cardholderSelectors = [
      'input[name="cardholderName"]',
      'input[id="cardholderName"]',
      'input[placeholder*="María López"]',
      'input[placeholder*="titular"]',
      'input[aria-label*="titular"]',
      'input[aria-label*="Nombre del titular"]',
    ]

    console.log('👤 Looking for cardholder name field...')
    
    // Cardholder is in main page for MercadoPago
    let cardholderField = await findFieldInMainPage(cardholderSelectors, 'cardholder')
    
    if (!cardholderField) {
      cardholderField = await findFieldInIframes(cardholderSelectors, 'cardholder')
    }
    
    if (cardholderField) {
      await fillField(cardholderField, cardData.cardholder, 'cardholder', false)
    } else {
      console.log('⚠️  Cardholder field not found')
    }


    // Fill expiration date (in iframe for MP)
    const expirationSelectors = [
      'input[placeholder="MM/AA"]',
      'input[aria-label="Vencimiento"]',
      'input[name="expirationDate"]',
      'input[placeholder*="MM"]',
    ]

    console.log('📅 Looking for expiration date field...')
    const expiration = `${cardData.expirationMonth}/${cardData.expirationYear}`
    
    let expirationField = await findFieldInIframes(expirationSelectors, 'expiration')
    
    if (!expirationField) {
      expirationField = await findFieldInMainPage(expirationSelectors, 'expiration')
    }
    
    if (expirationField) {
      await fillField(expirationField, expiration, 'expiration', true)
    } else {
      console.log('⚠️  Expiration field not found')
    }

    // Fill CVV (in iframe for MP) - use specific selectors, avoid generic ones
    const cvvSelectors = [
      'input[name="securityCode"]',
      'input[name="cvv"]',
      'input[name="cvc"]',
      'input[aria-label="Código de seguridad"]',
      'input[id*="securityCode"]',
      'input[id*="cvv"]',
      'input[data-checkout="securityCode"]',
    ]

    console.log('🔒 Looking for CVV field...')
    
    let cvvField = await findFieldInIframes(cvvSelectors, 'CVV')
    
    if (!cvvField) {
      cvvField = await findFieldInMainPage(cvvSelectors, 'CVV')
    }
    
    if (cvvField) {
      await fillField(cvvField, cardData.cvv, 'CVV', true)
    } else {
      console.log('⚠️  CVV field not found')
    }

    // Fill cardholder document (DNI) - required in Argentina (in main page for MP)
    const documentNumberSelectors = [
      'input[placeholder="99.999.999"]',
      'input[aria-label*="Documento del titular"]',
      'input[name="identificationNumber"]',
      'input[placeholder*="documento"]',
      'input[placeholder*="DNI"]',
    ]

    console.log('🆔 Looking for document field...')
    
    // Document field is in main page for MercadoPago
    let documentField = await findFieldInMainPage(documentNumberSelectors, 'document')
    
    if (!documentField) {
      documentField = await findFieldInIframes(documentNumberSelectors, 'document')
    }
    
    if (documentField) {
      const dniNumber = cardData.dni || '12345678'
      await fillField(documentField, dniNumber, 'document', false)
    } else {
      console.log('⚠️  Document field not found (may not be required)')
    }

    // Take screenshot after filling form
    await this.takeDebugScreenshot('after-fill-form')
    console.log('✅ MercadoPago payment form filling completed')
  }

  /**
   * Complete payment by clicking submit/confirm button
   * Handles different button texts and locations
   */
  async completePayment(): Promise<void> {
    console.log('✅ Completing MercadoPago payment...')

    // Wait a bit for form validation
    await this.page.waitForTimeout(1000)

    // Check if we're on the installments selection page
    const pageTitle = await this.page.title()
    const pageUrl = this.page.url()
    console.log(`📄 Page title: ${pageTitle}`)
    console.log(`📍 Page URL: ${pageUrl}`)

    // If on installments page, select first option (1 cuota)
    const installmentsSelectors = [
      'button:has-text("1x")',
      'button:has-text("$ 8")', // First option usually has the full price
      'div:has-text("1x") >> visible=true',
      '[class*="installment"]:first-child',
      'li:first-child button',
      'button >> nth=0', // First button on the installments page
    ]

    for (const selector of installmentsSelectors) {
      try {
        const option = this.page.locator(selector).first()
        if (await option.isVisible({ timeout: 1000 })) {
          console.log(`💳 Selecting installment option: ${selector}`)
          await option.click()
          console.log('✓ Installment selected')
          await this.page.waitForTimeout(2000)
          break
        }
      } catch {
        continue
      }
    }

    // Try multiple button selectors
    const buttonSelectors = [
      'button[type="submit"]',
      'button:has-text("Pagar")',
      'button:has-text("Confirmar")',
      'button:has-text("Continuar")',
      'button:has-text("Pay")',
      'button:has-text("Confirm")',
      'a:has-text("Pagar")',
      '[data-testid*="submit"]',
      '[data-testid*="pay"]',
    ]

    let buttonClicked = false
    for (const selector of buttonSelectors) {
      try {
        const button = this.page.locator(selector).first()
        if (await button.isVisible({ timeout: 2000 }) && await button.isEnabled()) {
          console.log(`🔘 Clicking payment button: ${selector}`)
          await button.click()
          buttonClicked = true
          console.log('✓ Payment button clicked successfully')
          await this.page.waitForTimeout(2000)
          break
        }
      } catch (error) {
        console.log(`⚠️  Button ${selector} not clickable:`, error.message)
        continue
      }
    }

    if (!buttonClicked) {
      // Take screenshot for debugging
      await this.takeDebugScreenshot('button-not-found')
      console.error('❌ Could not find MercadoPago submit button')
      throw new Error('Could not find MercadoPago submit button. Screenshot saved as mp-debug-button-not-found-*.png.')
    }
  }

  /**
   * Wait for redirect back to our platform after payment
   * Verifies we're back on our domain with success parameters
   * Handles MP confirmation pages and manual redirect buttons
   */
  async waitForRedirectToSuccess(
    expectedBaseUrl: string,
    timeout: number = 90000
  ): Promise<void> {
    console.log('⏳ Waiting for redirect back to platform...')

    // First, check if we're already on our domain
    const currentUrl = this.page.url()
    if (currentUrl.includes('localhost') || currentUrl.includes('miicelio') || currentUrl.includes('/checkout/success')) {
      console.log('✓ Already on platform domain')
      await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 })
      return
    }

    console.log(`📍 Current URL: ${currentUrl}`)
    console.log(`⏰ Timeout: ${timeout}ms`)

    // MP might show a confirmation page - look for "Volver al sitio" or similar button
    try {
      console.log('🔍 Looking for redirect buttons...')
      const redirectButtonSelectors = [
        'button:has-text("Volver al sitio")',
        'button:has-text("Continuar")',
        'a:has-text("Volver")',
        'button:has-text("Return")',
        '[data-testid*="continue"]',
        '[data-testid*="return"]',
      ]

      for (const selector of redirectButtonSelectors) {
        try {
          const button = this.page.locator(selector).first()
          if (await button.isVisible({ timeout: 5000 })) {
            console.log(`✓ Found redirect button: ${selector}`)
            await button.click()
            console.log('✓ Clicked redirect button')
            await this.page.waitForTimeout(2000)
            break
          }
        } catch (error) {
          console.log(`⚠️  Could not click ${selector}:`, error.message)
          continue
        }
      }
    } catch (error) {
      console.log('⚠️  Error looking for redirect buttons:', error.message)
    }

    // Wait for redirect to our domain (with longer timeout)
    try {
      console.log('⏳ Waiting for URL change to our domain...')
      await this.page.waitForURL(
        (url) => {
          const isOurDomain =
            url.hostname.includes('localhost') ||
            url.hostname.includes('miicelio') ||
            url.pathname.includes('/checkout/success')

          if (isOurDomain) {
            console.log(`✓ Redirected to: ${url.href}`)
          }

          return isOurDomain
        },
        { timeout }
      )
    } catch (error) {
      // Log current URL for debugging
      const finalUrl = this.page.url()
      const finalTitle = await this.page.title()
      console.error(`❌ Timeout waiting for redirect. Current URL: ${finalUrl}`)
      console.error(`Page title: ${finalTitle}`)
      await this.takeDebugScreenshot('redirect-timeout')

      // Check if MercadoPago returned an error page
      const isMPErrorPage = finalUrl.includes('/congrats/recover/error') || 
                           finalUrl.includes('/error') ||
                           finalTitle.toLowerCase().includes('algo salió mal') ||
                           finalTitle.toLowerCase().includes('error')

      // Additional debugging info
      let errorDetails = ''
      try {
        const pageContent = await this.page.content()
        const hasError = pageContent.includes('error') || pageContent.includes('Error')
        console.log(`Page contains error text: ${hasError}`)
        
        // Try to extract error message from page
        const errorTextElement = await this.page.locator('text=/no pudimos|algo salió|error/i').first()
        if (await errorTextElement.isVisible({ timeout: 1000 }).catch(() => false)) {
          errorDetails = await errorTextElement.textContent() || ''
          console.log(`Error message on page: ${errorDetails}`)
        }
      } catch (e) {
        console.log('Could not check page content for errors')
      }

      // Provide specific guidance based on error type
      if (isMPErrorPage) {
        throw new Error(
          `MercadoPago SANDBOX rejected the payment. ` +
          `This is a MercadoPago issue, NOT a test automation problem. ` +
          `The test successfully filled all form fields and submitted the payment. ` +
          `URL: ${finalUrl}. ` +
          `Title: ${finalTitle}. ` +
          `${errorDetails ? `MP Error: ${errorDetails}. ` : ''}` +
          `Possible causes: 1) Invalid/expired Access Token, 2) Sandbox account not properly configured, ` +
          `3) Test card not enabled for this merchant, 4) Payment amount out of sandbox limits. ` +
          `Verify your MERCADOPAGO_TEST_ACCESS_TOKEN and sandbox configuration.`
        )
      }

      throw new Error(
        `Timeout waiting for redirect from MercadoPago. ` +
        `Current URL: ${finalUrl}. ` +
        `Page title: ${finalTitle}. ` +
        `Screenshot saved as mp-debug-redirect-timeout-*.png. ` +
        `MP might require manual confirmation or the redirect URL might be incorrect.`
      )
    }

    // Verify success page loaded
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 })
    console.log('✓ Successfully redirected back to platform')
  }

  /**
   * Complete full payment flow: fill form + submit
   * Convenience method that combines fillPaymentForm and completePayment
   */
  async completeFullPaymentFlow(cardData: MercadoPagoCardData): Promise<void> {
    await this.fillPaymentForm(cardData)
    await this.completePayment()
  }

  /**
   * Handle potential captcha or verification steps
   * MP sandbox might show additional verification
   */
  async handleVerificationSteps(): Promise<void> {
    // Wait a bit for any verification modals/forms
    await this.page.waitForTimeout(2000)

    // Look for common verification elements
    const verificationSelectors = [
      'button:has-text("Verificar")',
      'button:has-text("Continuar")',
      'input[type="text"]',
      '[data-testid*="verify"]',
    ]

    for (const selector of verificationSelectors) {
      try {
        const element = this.page.locator(selector).first()
        if (await element.isVisible({ timeout: 2000 })) {
          // If it's a button, click it
          if (await element.evaluate((el) => el.tagName === 'BUTTON')) {
            await element.click()
            await this.page.waitForTimeout(2000)
          }
        }
      } catch {
        continue
      }
    }
  }

  /**
   * Take screenshot for debugging MP interactions
   */
  async takeDebugScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `mp-debug-${name}-${Date.now()}.png`,
      fullPage: true,
    })
  }
}

