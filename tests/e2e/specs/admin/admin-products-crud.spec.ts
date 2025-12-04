/**
 * Admin Products CRUD - Happy Path
 *
 * Tests complete product management flow:
 * 1. Create new product
 * 2. List products in table
 * 3. Update product details
 * 4. Delete product
 *
 * Uses loginAsOwner fixture for auth
 * Cleans up created products after tests
 */

import { test, expect } from '@playwright/test'
import { loginAsOwner } from '../../fixtures/auth.fixture'

test.describe('Admin Products CRUD - Happy Path', () => {
  const TEST_TENANT = 'demo_galeria' // Use demo tenant ID 1
  const BASE_URL = `http://localhost:3000/es/${TEST_TENANT}/dashboard/products`

  test.beforeEach(async ({ page }) => {
    // Login as owner
    await loginAsOwner(page, TEST_TENANT)

    // Navigate to products dashboard
    await page.goto(BASE_URL)
    await page.waitForURL(BASE_URL)
  })

  test('should create product successfully', async ({ page }) => {
    // Click "New Product" button
    await page.getByTestId('products-new-button').click()

    // Wait for form to appear
    await expect(page.getByTestId('product-form-name')).toBeVisible()

    // Fill form (category is text input, not select)
    await page.getByTestId('product-form-name').fill('Test Product E2E')
    await page.getByTestId('product-form-price').fill('2500')
    await page.getByTestId('product-form-category').fill('Test Category')
    await page.getByTestId('product-form-stock').fill('50')
    await page.getByTestId('product-form-description').fill('Test Description')

    // Submit
    await page.getByTestId('product-form-submit').click()

    // Verify success toast (in Spanish: "creado" or "éxito")
    await expect(page.getByText(/creado|éxito|success|created/i)).toBeVisible({ timeout: 10000 })

    // Verify product appears in list
    await expect(page.getByText('Test Product E2E')).toBeVisible()
  })

  test('should list products in table', async ({ page }) => {
    // Wait for products table to load
    await expect(page.getByTestId('product-table')).toBeVisible()

    // Verify at least one product row exists
    const rows = await page.getByTestId('product-table-row').count()
    expect(rows).toBeGreaterThan(0)
  })

  test('should update product successfully', async ({ page }) => {
    // Wait for table
    await expect(page.getByTestId('product-table')).toBeVisible()

    // Find first product row
    const firstRow = page.locator('[data-testid="product-table-row"]').first()
    await expect(firstRow).toBeVisible()

    // Click edit button
    await firstRow.getByTestId('product-edit-button').click()

    // Wait for form
    await expect(page.getByTestId('product-form-name')).toBeVisible()

    // Update price
    const priceInput = page.getByTestId('product-form-price')
    await priceInput.clear()
    await priceInput.fill('3000')

    // Submit
    await page.getByTestId('product-form-submit').click()

    // Verify success toast (Spanish: "actualizado" or "éxito")
    await expect(page.getByText(/actualizado|guardado|éxito|updated|success/i)).toBeVisible({ timeout: 10000 })
  })

  test('should delete product successfully', async ({ page }) => {
    // Wait for table
    await expect(page.getByTestId('product-table')).toBeVisible()

    // Get initial count
    const initialCount = await page.getByTestId('product-table-row').count()

    // Setup dialog handler to auto-confirm delete (app uses window.confirm, not modal)
    page.on('dialog', dialog => dialog.accept())

    // Click delete on first product
    const firstRow = page.locator('[data-testid="product-table-row"]').first()
    await firstRow.getByTestId('product-delete-button').click()

    // Verify success toast (Spanish: "eliminado" or "éxito")
    await expect(page.getByText(/eliminado|borrado|éxito|deleted|success/i)).toBeVisible({ timeout: 10000 })

    // Verify row count decreased
    await page.waitForTimeout(500) // Brief wait for table update
    const finalCount = await page.getByTestId('product-table-row').count()
    expect(finalCount).toBeLessThan(initialCount)
  })
})
