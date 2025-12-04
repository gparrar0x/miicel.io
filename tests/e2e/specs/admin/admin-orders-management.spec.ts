/**
 * Admin Orders Management - Happy Path
 *
 * Tests order management flows:
 * 1. List orders in table
 * 2. View order detail
 * 3. Update order status
 *
 * Uses loginAsOwner fixture for auth
 * Tests read-only operations (no data creation needed)
 */

import { test, expect } from '@playwright/test'
import { loginAsOwner } from '../../fixtures/auth.fixture'

test.describe('Admin Orders Management - Happy Path', () => {
  const TEST_TENANT = 'demo_galeria' // Use demo tenant ID 1
  const BASE_URL = `http://localhost:3000/es/${TEST_TENANT}/dashboard/orders`

  test.beforeEach(async ({ page }) => {
    // Login as owner
    await loginAsOwner(page, TEST_TENANT)

    // Navigate to orders dashboard
    await page.goto(BASE_URL)
    await page.waitForURL(BASE_URL)
  })

  test('should list orders in table', async ({ page }) => {
    // Wait for orders table
    await expect(page.getByTestId('order-table')).toBeVisible()

    // Verify at least one order row exists
    const rows = await page.getByTestId('order-table-row').count()
    expect(rows).toBeGreaterThan(0)

    // Verify table headers
    await expect(page.getByTestId('order-table-header-id')).toBeVisible()
    await expect(page.getByTestId('order-table-header-customer')).toBeVisible()
    await expect(page.getByTestId('order-table-header-total')).toBeVisible()
    await expect(page.getByTestId('order-table-header-status')).toBeVisible()
  })

  test('should view order detail', async ({ page }) => {
    // Wait for table
    await expect(page.getByTestId('order-table')).toBeVisible()

    // Click first order row
    const firstRow = page.locator('[data-testid="order-table-row"]').first()
    await firstRow.click()

    // Wait for detail modal or page
    await expect(page.getByTestId('order-detail-modal')).toBeVisible()

    // Verify order details are displayed
    await expect(page.getByText(/order/i)).toBeVisible()
    await expect(page.getByTestId('order-detail-customer')).toBeVisible()
    await expect(page.getByTestId('order-detail-total')).toBeVisible()
    await expect(page.getByTestId('order-detail-items')).toBeVisible()
  })

  test('should update order status successfully', async ({ page }) => {
    // Wait for table
    await expect(page.getByTestId('order-table')).toBeVisible()

    // Click first order row
    const firstRow = page.locator('[data-testid="order-table-row"]').first()
    await firstRow.click()

    // Wait for detail modal
    await expect(page.getByTestId('order-detail-modal')).toBeVisible()

    // Select new status
    await page.getByTestId('status-dropdown').selectOption('preparing')

    // Click save button
    await page.getByTestId('save-status-button').click()

    // Verify success message
    await expect(page.getByText(/order updated|success/i)).toBeVisible()

    // Verify status changed in detail view
    await expect(page.locator('[data-testid="status-dropdown"]')).toHaveValue('preparing')
  })
})
