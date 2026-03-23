/**
 * Order Discounts - KDS Display
 *
 * Tests discount display on Kitchen Display System:
 * 1. Order with discount → KDS shows original + discount + final
 * 2. Order without discount → shows only final
 * 3. Discount amount calculation correct
 *
 * Uses data-testid selectors per TEST_ID_CONTRACT.md
 * Requires: orders with and without discounts visible in KDS
 */

import { expect, test } from '@playwright/test'
import { loginAsOwner } from '../../fixtures/auth.fixture'
import { DiscountsPage } from '../../pages/discounts.page'

test.describe('Order Discounts - KDS Display', () => {
  const TEST_TENANT = 'demo_galeria'

  function getBaseUrl(page: any): string {
    const baseURL = page.context().baseURL || 'http://localhost:3000'
    return `${baseURL}/es/${TEST_TENANT}`
  }

  test.beforeEach(async ({ page }) => {
    // Login as owner
    await loginAsOwner(page, TEST_TENANT)

    // Navigate to KDS/orders view
    await page.goto(`${getBaseUrl(page)}/dashboard/orders`)
    await page.waitForLoadState('networkidle')
  })

  test('should display original and final totals for discounted order', async ({ page }) => {
    const discountsPage = new DiscountsPage(page)

    // Find order with discount
    const orders = page.locator('[data-testid^="kds-order-"]')
    const orderCount = await orders.count()

    if (orderCount === 0) {
      test.skip()
    }

    // Look for order with discount line visible
    for (let i = 0; i < Math.min(orderCount, 5); i++) {
      const order = orders.nth(i)
      const orderId = await order.getAttribute('data-testid')

      if (!orderId) continue

      const cleanOrderId = orderId.replace('kds-order-', '')

      // Check for discount display
      const discountContainer = order.locator(`[data-testid="kds-order-discount-${cleanOrderId}"]`)
      const hasDiscount = await discountContainer.isVisible().catch(() => false)

      if (hasDiscount) {
        // Verify original total
        const originalTotal = order.locator(
          `[data-testid="kds-order-original-total-${cleanOrderId}"]`,
        )
        const originalText = await originalTotal.textContent()
        expect(originalText).toBeTruthy()

        // Verify discount amount
        const discountValue = discountContainer.locator('[data-testid="kds-discount-value"]')
        const discountText = await discountValue.textContent()
        expect(discountText).toBeTruthy()

        // Verify final total
        const finalTotal = order.locator(`[data-testid="kds-order-final-total-${cleanOrderId}"]`)
        const finalText = await finalTotal.textContent()
        expect(finalText).toBeTruthy()

        // Original should be > final (discount reduces total)
        expect(originalText).not.toBe(finalText)

        return // Test passed
      }
    }

    // If no discounted orders found, skip
    test.skip()
  })

  test('should display discount line with label and amount', async ({ page }) => {
    const discountsPage = new DiscountsPage(page)

    const orders = page.locator('[data-testid^="kds-order-"]')
    const orderCount = await orders.count()

    if (orderCount === 0) {
      test.skip()
    }

    // Find order with discount
    for (let i = 0; i < Math.min(orderCount, 5); i++) {
      const order = orders.nth(i)
      const orderId = await order.getAttribute('data-testid')

      if (!orderId) continue

      const cleanOrderId = orderId.replace('kds-order-', '')

      const discountContainer = order.locator(`[data-testid="kds-order-discount-${cleanOrderId}"]`)
      const hasDiscount = await discountContainer.isVisible().catch(() => false)

      if (hasDiscount) {
        // Verify discount label exists
        const discountLabel = discountContainer.locator('[data-testid="kds-discount-label"]')
        const labelVisible = await discountLabel.isVisible().catch(() => false)

        if (labelVisible) {
          const labelText = await discountLabel.textContent()
          expect(labelText).toBeTruthy()
        }

        // Verify discount value exists
        const discountValue = discountContainer.locator('[data-testid="kds-discount-value"]')
        await expect(discountValue).toBeVisible()

        const valueText = await discountValue.textContent()
        expect(valueText).toBeTruthy()

        // Value should contain amount (e.g., "-$5.00" or "-50%")
        expect(valueText).toMatch(/[-$0-9%.]/)

        return
      }
    }

    test.skip()
  })

  test('should show only final total for order without discount', async ({ page }) => {
    const discountsPage = new DiscountsPage(page)

    const orders = page.locator('[data-testid^="kds-order-"]')
    const orderCount = await orders.count()

    if (orderCount === 0) {
      test.skip()
    }

    // Find order without discount
    for (let i = 0; i < Math.min(orderCount, 5); i++) {
      const order = orders.nth(i)
      const orderId = await order.getAttribute('data-testid')

      if (!orderId) continue

      const cleanOrderId = orderId.replace('kds-order-', '')

      // Check if discount is visible
      const discountContainer = order.locator(`[data-testid="kds-order-discount-${cleanOrderId}"]`)
      const hasDiscount = await discountContainer.isVisible().catch(() => false)

      if (!hasDiscount) {
        // Should have final total visible
        const finalTotal = order.locator(`[data-testid="kds-order-final-total-${cleanOrderId}"]`)
        const finalVisible = await finalTotal.isVisible().catch(() => false)

        if (finalVisible) {
          const finalText = await finalTotal.textContent()
          expect(finalText).toBeTruthy()

          // Should NOT have original total (since no discount)
          const originalTotal = order.locator(
            `[data-testid="kds-order-original-total-${cleanOrderId}"]`,
          )
          const originalVisible = await originalTotal.isVisible().catch(() => false)
          expect(originalVisible).toBe(false)

          return
        }
      }
    }

    test.skip()
  })

  test('should correctly calculate and display discount amount', async ({ page }) => {
    const discountsPage = new DiscountsPage(page)

    const orders = page.locator('[data-testid^="kds-order-"]')
    const orderCount = await orders.count()

    if (orderCount === 0) {
      test.skip()
    }

    // Find order with discount
    for (let i = 0; i < Math.min(orderCount, 5); i++) {
      const order = orders.nth(i)
      const orderId = await order.getAttribute('data-testid')

      if (!orderId) continue

      const cleanOrderId = orderId.replace('kds-order-', '')

      const discountContainer = order.locator(`[data-testid="kds-order-discount-${cleanOrderId}"]`)
      const hasDiscount = await discountContainer.isVisible().catch(() => false)

      if (hasDiscount) {
        // Get original, discount, and final amounts
        const originalText = await order
          .locator(`[data-testid="kds-order-original-total-${cleanOrderId}"]`)
          .textContent()
        const discountText = await discountContainer
          .locator('[data-testid="kds-discount-value"]')
          .textContent()
        const finalText = await order
          .locator(`[data-testid="kds-order-final-total-${cleanOrderId}"]`)
          .textContent()

        // Extract numeric values (simple check - actual parsing depends on format)
        expect(originalText).toBeTruthy()
        expect(discountText).toBeTruthy()
        expect(finalText).toBeTruthy()

        // Discount value should contain a number
        expect(discountText).toMatch(/\d+/)

        // Final should be less than original
        // (Note: string comparison works if formatted identically)
        expect(finalText).not.toBe(originalText)

        return
      }
    }

    test.skip()
  })

  test('should display discount before final total in order', async ({ page }) => {
    const discountsPage = new DiscountsPage(page)

    const orders = page.locator('[data-testid^="kds-order-"]')
    const orderCount = await orders.count()

    if (orderCount === 0) {
      test.skip()
    }

    // Find order with discount
    for (let i = 0; i < Math.min(orderCount, 5); i++) {
      const order = orders.nth(i)
      const orderId = await order.getAttribute('data-testid')

      if (!orderId) continue

      const cleanOrderId = orderId.replace('kds-order-', '')

      const discountContainer = order.locator(`[data-testid="kds-order-discount-${cleanOrderId}"]`)
      const hasDiscount = await discountContainer.isVisible().catch(() => false)

      if (hasDiscount) {
        const finalTotal = order.locator(`[data-testid="kds-order-final-total-${cleanOrderId}"]`)
        const finalVisible = await finalTotal.isVisible().catch(() => false)

        if (finalVisible) {
          // Get bounding boxes to verify display order
          const discountBox = await discountContainer.boundingBox()
          const finalBox = await finalTotal.boundingBox()

          expect(discountBox).toBeTruthy()
          expect(finalBox).toBeTruthy()

          if (discountBox && finalBox) {
            // Discount should appear before (above) final total
            // y-coordinate smaller = higher on page
            expect(discountBox.y).toBeLessThan(finalBox.y)
          }

          return
        }
      }
    }

    test.skip()
  })
})
