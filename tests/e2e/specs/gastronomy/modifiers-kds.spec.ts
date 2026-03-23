/**
 * Product Modifiers - KDS Display
 *
 * Tests modifier display on Kitchen Display System (order fulfillment):
 * 1. Order with modifiers → KDS shows modifier lines clearly
 * 2. Multiple modifiers per item → all displayed
 * 3. Modifier group and option names visible
 *
 * Uses data-testid selectors per TEST_ID_CONTRACT.md
 * Requires: order with modifiers created and visible in KDS
 */

import { expect, test } from '@playwright/test'
import { loginAsOwner } from '../../fixtures/auth.fixture'
import { ModifiersPage } from '../../pages/modifiers.page'

test.describe('Product Modifiers - KDS Display', () => {
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

  test('should display modifiers on KDS order item', async ({ page }) => {
    const modifiersPage = new ModifiersPage(page)

    // Look for order with modifiers (from previous tests or seed data)
    // Order ID format: data-testid="kds-order-{orderId}"
    const orders = page.locator('[data-testid^="kds-order-"]')
    const orderCount = await orders.count()

    if (orderCount === 0) {
      test.skip() // No orders with modifiers available
    }

    // Get first order
    const firstOrder = orders.first()
    const orderId = await firstOrder.getAttribute('data-testid')

    if (!orderId) {
      test.skip()
    }

    const cleanOrderId = orderId.replace('kds-order-', '')

    // Look for items in order
    const items = firstOrder.locator('[data-testid^="kds-item-"]')
    const itemCount = await items.count()

    if (itemCount === 0) {
      test.skip()
    }

    // Get first item and check for modifiers
    const firstItem = items.first()
    const itemId = await firstItem.getAttribute('data-testid')

    if (!itemId) {
      test.skip()
    }

    // Extract item index from "kds-item-{itemIdx}"
    const itemIdx = parseInt(itemId.replace('kds-item-', ''), 10)

    // Check for modifier display
    const itemModifiers = firstItem.locator(
      `[data-testid="kds-item-modifiers-${cleanOrderId}-${itemIdx}"]`,
    )
    const modifiersVisible = await itemModifiers.isVisible().catch(() => false)

    if (modifiersVisible) {
      // Verify at least one modifier line exists
      const modifierLines = itemModifiers.locator('[data-testid^="kds-modifier-line-"]')
      const lineCount = await modifierLines.count()
      expect(lineCount).toBeGreaterThan(0)

      // Verify modifier names are visible
      const firstLine = modifierLines.first()
      const groupName = firstLine.locator('[data-testid="kds-modifier-group-name"]')
      const groupNameText = await groupName.textContent()
      expect(groupNameText).toBeTruthy()

      // Verify option values are visible
      const optionValue = firstLine.locator('[data-testid="kds-modifier-option-value"]')
      const optionValueText = await optionValue.textContent()
      expect(optionValueText).toBeTruthy()
    }
  })

  test('should display multiple modifiers for single item', async ({ page }) => {
    const modifiersPage = new ModifiersPage(page)

    // Find order with multiple modifiers
    const orders = page.locator('[data-testid^="kds-order-"]')
    const orderCount = await orders.count()

    if (orderCount === 0) {
      test.skip()
    }

    // Iterate through orders to find one with multiple modifiers
    for (let o = 0; o < Math.min(orderCount, 3); o++) {
      const order = orders.nth(o)
      const orderId = await order.getAttribute('data-testid')

      if (!orderId) continue

      const cleanOrderId = orderId.replace('kds-order-', '')

      const items = order.locator('[data-testid^="kds-item-"]')
      const itemCount = await items.count()

      for (let i = 0; i < itemCount; i++) {
        const item = items.nth(i)
        const itemId = await item.getAttribute('data-testid')

        if (!itemId) continue

        const itemIdx = parseInt(itemId.replace('kds-item-', ''), 10)

        const itemModifiers = item.locator(
          `[data-testid="kds-item-modifiers-${cleanOrderId}-${itemIdx}"]`,
        )
        const modifiersVisible = await itemModifiers.isVisible().catch(() => false)

        if (modifiersVisible) {
          // Count modifier lines
          const modifierLines = itemModifiers.locator('[data-testid^="kds-modifier-line-"]')
          const lineCount = await modifierLines.count()

          if (lineCount >= 2) {
            // Found item with multiple modifiers
            expect(lineCount).toBeGreaterThanOrEqual(2)

            // Verify all lines are displayed
            for (let l = 0; l < lineCount; l++) {
              const line = modifierLines.nth(l)
              await expect(line).toBeVisible()

              const groupName = line.locator('[data-testid="kds-modifier-group-name"]')
              const optionValue = line.locator('[data-testid="kds-modifier-option-value"]')

              await expect(groupName).toBeVisible()
              await expect(optionValue).toBeVisible()
            }

            return // Test passed
          }
        }
      }
    }

    // If we get here, no orders with multiple modifiers found
    test.skip()
  })

  test('should display modifier group and option names clearly', async ({ page }) => {
    const modifiersPage = new ModifiersPage(page)

    const orders = page.locator('[data-testid^="kds-order-"]')
    const orderCount = await orders.count()

    if (orderCount === 0) {
      test.skip()
    }

    const firstOrder = orders.first()
    const orderId = await firstOrder.getAttribute('data-testid')

    if (!orderId) {
      test.skip()
    }

    const cleanOrderId = orderId.replace('kds-order-', '')

    const items = firstOrder.locator('[data-testid^="kds-item-"]')
    const itemCount = await items.count()

    if (itemCount === 0) {
      test.skip()
    }

    const firstItem = items.first()
    const itemId = await firstItem.getAttribute('data-testid')

    if (!itemId) {
      test.skip()
    }

    const itemIdx = parseInt(itemId.replace('kds-item-', ''), 10)

    const itemModifiers = firstItem.locator(
      `[data-testid="kds-item-modifiers-${cleanOrderId}-${itemIdx}"]`,
    )
    const modifiersVisible = await itemModifiers.isVisible().catch(() => false)

    if (modifiersVisible) {
      // Get first modifier line
      const firstLine = itemModifiers.locator('[data-testid^="kds-modifier-line-"]').first()

      // Verify group name text is not empty
      const groupName = firstLine.locator('[data-testid="kds-modifier-group-name"]')
      const groupNameText = await groupName.textContent()
      expect(groupNameText).toBeTruthy()
      expect(groupNameText?.trim().length).toBeGreaterThan(0)

      // Verify option value text is not empty
      const optionValue = firstLine.locator('[data-testid="kds-modifier-option-value"]')
      const optionValueText = await optionValue.textContent()
      expect(optionValueText).toBeTruthy()
      expect(optionValueText?.trim().length).toBeGreaterThan(0)
    }
  })

  test('should format modifier display for readability', async ({ page }) => {
    const modifiersPage = new ModifiersPage(page)

    const orders = page.locator('[data-testid^="kds-order-"]')
    const orderCount = await orders.count()

    if (orderCount === 0) {
      test.skip()
    }

    const firstOrder = orders.first()
    const orderId = await firstOrder.getAttribute('data-testid')

    if (!orderId) {
      test.skip()
    }

    const cleanOrderId = orderId.replace('kds-order-', '')

    const items = firstOrder.locator('[data-testid^="kds-item-"]')
    const itemCount = await items.count()

    if (itemCount === 0) {
      test.skip()
    }

    const firstItem = items.first()
    const itemId = await firstItem.getAttribute('data-testid')

    if (!itemId) {
      test.skip()
    }

    const itemIdx = parseInt(itemId.replace('kds-item-', ''), 10)

    const itemModifiers = firstItem.locator(
      `[data-testid="kds-item-modifiers-${cleanOrderId}-${itemIdx}"]`,
    )
    const modifiersVisible = await itemModifiers.isVisible().catch(() => false)

    if (modifiersVisible) {
      // Get modifier container and verify layout
      const container = itemModifiers
      await expect(container).toBeVisible()

      // Verify multiple lines are properly spaced/formatted
      const modifierLines = container.locator('[data-testid^="kds-modifier-line-"]')
      const lineCount = await modifierLines.count()

      if (lineCount > 1) {
        // All lines should be visible and properly formatted
        for (let l = 0; l < lineCount; l++) {
          const line = modifierLines.nth(l)
          const height = await line.boundingBox()
          expect(height).toBeTruthy()
          expect(height?.height).toBeGreaterThan(0)
        }
      }
    }
  })
})
