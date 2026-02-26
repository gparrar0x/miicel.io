/**
 * QR Product Generation - E2E Tests
 *
 * Tests complete QR code generation flow:
 * 1. Open QR modal from products table
 * 2. Verify modal content (product name, QR code, URL)
 * 3. Close modal (via button and Escape key)
 * 4. Verify URL correctness by navigating to it
 * 5. Download QR code image
 * 6. Print functionality (smoke test - can't fully test window.print)
 *
 * Uses loginAsOwner fixture for auth
 */

import { expect, test } from '@playwright/test'
import { loginAsOwner } from '../../fixtures/auth.fixture'
import { QRModalPage } from '../../pages/qr-modal.page'

test.describe('QR Product Generation', () => {
  const TEST_TENANT = 'demo_galeria'

  // Helper function to get base URL
  function getProductsDashboardUrl(page: any): string {
    const baseURL = page.context().baseURL || 'http://localhost:3000'
    return `${baseURL}/es/${TEST_TENANT}/dashboard/products`
  }

  test.beforeEach(async ({ page }) => {
    // Login as owner
    await loginAsOwner(page, TEST_TENANT)

    // Navigate to products dashboard
    const url = getProductsDashboardUrl(page)
    await page.goto(url)
    await page.waitForURL(url)

    // Wait for products table to load
    await expect(page.getByTestId('product-table')).toBeVisible({ timeout: 10000 })
  })

  test('should open QR modal and display product information', async ({ page }) => {
    const qrModal = new QRModalPage(page)

    // Get first product row
    const firstRow = page.locator('[data-testid="product-table-row"]').first()
    await expect(firstRow).toBeVisible()

    // Extract product ID from the first row's QR button
    const qrButton = firstRow.locator('[data-testid^="product-row-qr-button-"]')
    const qrButtonTestId = await qrButton.getAttribute('data-testid')
    expect(qrButtonTestId).toBeTruthy()

    // Extract product ID from testId (format: "product-row-qr-button-{productId}")
    const productId = qrButtonTestId?.replace('product-row-qr-button-', '')

    // Get product name from table
    const productName = await firstRow.locator('.font-medium').first().textContent()
    expect(productName).toBeTruthy()

    // Click QR button
    await qrModal.clickQrButton(productId)

    // Verify modal opens
    expect(await qrModal.isModalOpen()).toBe(true)

    // Verify product name is displayed
    const displayedName = await qrModal.getProductName()
    expect(displayedName?.trim()).toBe(productName?.trim())

    // Verify URL preview contains correct path
    expect(await qrModal.verifyUrlFormat(TEST_TENANT, productId)).toBe(true)

    // Verify QR code is visible
    expect(await qrModal.isQrCodeVisible(productId)).toBe(true)
  })

  test('should close QR modal via close button', async ({ page }) => {
    const qrModal = new QRModalPage(page)

    // Open first product's QR modal
    const firstRow = page.locator('[data-testid="product-table-row"]').first()
    const qrButton = firstRow.locator('[data-testid^="product-row-qr-button-"]')
    const qrButtonTestId = await qrButton.getAttribute('data-testid')
    const productId = qrButtonTestId?.replace('product-row-qr-button-', '')

    await qrModal.clickQrButton(productId)
    expect(await qrModal.isModalOpen()).toBe(true)

    // Close via close button
    await qrModal.closeViaButton()

    // Verify modal is closed
    expect(await qrModal.isModalClosed()).toBe(true)
  })

  test('should close QR modal via Escape key', async ({ page }) => {
    const qrModal = new QRModalPage(page)

    // Open first product's QR modal
    const firstRow = page.locator('[data-testid="product-table-row"]').first()
    const qrButton = firstRow.locator('[data-testid^="product-row-qr-button-"]')
    const qrButtonTestId = await qrButton.getAttribute('data-testid')
    const productId = qrButtonTestId?.replace('product-row-qr-button-', '')

    await qrModal.clickQrButton(productId)
    expect(await qrModal.isModalOpen()).toBe(true)

    // Close via Escape key
    await qrModal.closeViaEscape()

    // Verify modal is closed
    expect(await qrModal.isModalClosed()).toBe(true)
  })

  test('should verify URL in QR modal navigates to correct product detail page', async ({
    page,
    context,
  }) => {
    const qrModal = new QRModalPage(page)

    // Open first product's QR modal
    const firstRow = page.locator('[data-testid="product-table-row"]').first()
    const qrButton = firstRow.locator('[data-testid^="product-row-qr-button-"]')
    const qrButtonTestId = await qrButton.getAttribute('data-testid')
    const productId = qrButtonTestId?.replace('product-row-qr-button-', '')

    // Get product name for verification
    const _productName = await firstRow.locator('.font-medium').first().textContent()

    await qrModal.clickQrButton(productId)
    expect(await qrModal.isModalOpen()).toBe(true)

    // Get URL from preview
    const url = await qrModal.getUrlPreview()
    expect(url).toBeTruthy()
    expect(url).toContain(`/${TEST_TENANT}/p/${productId}`)

    // Create new page to visit the URL (to avoid disrupting current session)
    const newPage = await context.newPage()

    try {
      // Navigate to the URL
      await newPage.goto(url!)
      await newPage.waitForLoadState('networkidle', { timeout: 10000 })

      // Verify product detail page loaded
      // The page should contain the product name or have content loaded
      const bodyText = await newPage.locator('body').textContent()
      expect(bodyText).toBeTruthy()

      // Verify we're on a product page (URL contains /p/)
      expect(newPage.url()).toContain(`/p/${productId}`)
    } finally {
      await newPage.close()
    }
  })

  test('should trigger file download when clicking download button', async ({ page }) => {
    const qrModal = new QRModalPage(page)

    // Open first product's QR modal
    const firstRow = page.locator('[data-testid="product-table-row"]').first()
    const qrButton = firstRow.locator('[data-testid^="product-row-qr-button-"]')
    const qrButtonTestId = await qrButton.getAttribute('data-testid')
    const productId = qrButtonTestId?.replace('product-row-qr-button-', '')

    // Get product name
    const _productName = await firstRow.locator('.font-medium').first().textContent()

    await qrModal.clickQrButton(productId)
    expect(await qrModal.isModalOpen()).toBe(true)

    // Click download and capture filename
    const filename = await qrModal.clickDownloadButton()

    // Verify filename matches expected pattern
    expect(filename).toMatch(/^qr-.*-\d+\.png$/)

    // Verify filename contains product ID
    expect(filename).toContain(productId)
  })

  test('should verify print button is enabled and clickable', async ({ page }) => {
    const qrModal = new QRModalPage(page)

    // Open first product's QR modal
    const firstRow = page.locator('[data-testid="product-table-row"]').first()
    const qrButton = firstRow.locator('[data-testid^="product-row-qr-button-"]')
    const qrButtonTestId = await qrButton.getAttribute('data-testid')
    const productId = qrButtonTestId?.replace('product-row-qr-button-', '')

    await qrModal.clickQrButton(productId)
    expect(await qrModal.isModalOpen()).toBe(true)

    // Verify print button is enabled
    expect(await qrModal.isPrintButtonEnabled()).toBe(true)

    // Mock window.print to avoid actual print dialog
    await page.evaluate(() => {
      window.print = () => {
        // Mock implementation
      }
    })

    // Click print button (should not throw)
    await qrModal.clickPrintButton()

    // Verify modal is still open
    expect(await qrModal.isModalOpen()).toBe(true)
  })

  test('should handle opening multiple QR modals sequentially', async ({ page }) => {
    const qrModal = new QRModalPage(page)

    // Get all product rows
    const rows = page.locator('[data-testid="product-table-row"]')
    const rowCount = await rows.count()

    expect(rowCount).toBeGreaterThan(0)

    // Open first product
    const firstRow = rows.nth(0)
    const firstQrButton = firstRow.locator('[data-testid^="product-row-qr-button-"]')
    const firstProductId = (await firstQrButton.getAttribute('data-testid'))?.replace(
      'product-row-qr-button-',
      '',
    )

    await qrModal.clickQrButton(firstProductId)
    expect(await qrModal.isModalOpen()).toBe(true)

    // Close it
    await qrModal.closeViaButton()
    expect(await qrModal.isModalClosed()).toBe(true)

    // Open second product (if available)
    if (rowCount > 1) {
      const secondRow = rows.nth(1)
      const secondQrButton = secondRow.locator('[data-testid^="product-row-qr-button-"]')
      const secondProductId = (await secondQrButton.getAttribute('data-testid'))?.replace(
        'product-row-qr-button-',
        '',
      )

      await qrModal.clickQrButton(secondProductId)
      expect(await qrModal.isModalOpen()).toBe(true)

      // Verify content changed for second product
      const secondProductName = await secondRow.locator('.font-medium').first().textContent()
      const displayedName = await qrModal.getProductName()
      expect(displayedName?.trim()).toBe(secondProductName?.trim())

      // Close it
      await qrModal.closeViaButton()
      expect(await qrModal.isModalClosed()).toBe(true)
    }
  })

  test('should verify all action buttons are visible when modal is open', async ({ page }) => {
    const qrModal = new QRModalPage(page)

    // Open first product's QR modal
    const firstRow = page.locator('[data-testid="product-table-row"]').first()
    const qrButton = firstRow.locator('[data-testid^="product-row-qr-button-"]')
    const qrButtonTestId = await qrButton.getAttribute('data-testid')
    const productId = qrButtonTestId?.replace('product-row-qr-button-', '')

    await qrModal.clickQrButton(productId)
    expect(await qrModal.isModalOpen()).toBe(true)

    // Verify all buttons are enabled
    expect(await qrModal.isPrintButtonEnabled()).toBe(true)
    expect(await qrModal.isDownloadButtonEnabled()).toBe(true)

    // Verify close button is visible
    const closeBtn = page.locator('[data-testid="qr-modal-close-button"]')
    await expect(closeBtn).toBeVisible()
  })
})
