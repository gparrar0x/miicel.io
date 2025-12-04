/**
 * Cross-Tenant Isolation - Security Tests
 *
 * Verifies RLS policies prevent data leakage between tenants:
 * 1. Tenant A cannot see Tenant B's products in catalog
 * 2. Tenant A admin cannot access Tenant B's admin panel
 *
 * Tests critical security boundaries
 */

import { test, expect } from '@playwright/test'
import { loginAsOwner } from '../../fixtures/auth.fixture'

test.describe('Cross-Tenant Isolation - Security', () => {
  const TENANT_A = 'demo_galeria'    // Demo tenant ID 1
  const TENANT_B = 'demo_restaurant' // Demo tenant ID 2

  test('should prevent catalog data leakage between tenants', async ({ page }) => {
    // Navigate to tenant A catalog
    await page.goto(`http://localhost:3000/es/${TENANT_A}`)
    await page.waitForLoadState('networkidle')

    // Get product count and names from tenant A
    const productsA = await page.getByTestId('product-card').count()
    expect(productsA).toBeGreaterThan(0)

    const productNamesA = []
    for (let i = 0; i < Math.min(productsA, 3); i++) {
      const name = await page
        .locator('[data-testid="product-card"]')
        .nth(i)
        .getByTestId('product-name')
        .textContent()
      if (name) productNamesA.push(name)
    }

    // Navigate to tenant B catalog
    await page.goto(`http://localhost:3000/es/${TENANT_B}`)
    await page.waitForLoadState('networkidle')

    // Get product count from tenant B
    const productsB = await page.getByTestId('product-card').count()
    expect(productsB).toBeGreaterThan(0)

    // Verify tenant A products are NOT visible in tenant B
    for (const productName of productNamesA) {
      const elements = await page.getByText(productName).count()
      expect(elements).toBe(0)
    }
  })

  test('should prevent admin panel access across tenants', async ({ page }) => {
    // Login as tenant A admin
    await loginAsOwner(page, TENANT_A)

    // Verify logged into tenant A admin
    await page.goto(`http://localhost:3000/es/${TENANT_A}/dashboard/products`)
    await expect(page.getByTestId('product-table')).toBeVisible()

    // Try to access tenant B admin panel
    await page.goto(`http://localhost:3000/es/${TENANT_B}/dashboard/products`, {
      waitUntil: 'domcontentloaded'
    })

    // Should be redirected away or show access denied
    const url = page.url()
    const isRedirected = !url.includes(TENANT_B)
    const showsAccessDenied = await page
      .getByText(/access denied|not authorized|forbidden/i)
      .count()

    expect(isRedirected || showsAccessDenied > 0).toBeTruthy()
  })
})
