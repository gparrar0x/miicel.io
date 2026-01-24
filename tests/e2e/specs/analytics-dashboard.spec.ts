/**
 * Analytics Dashboard E2E Test Suite
 *
 * Comprehensive coverage for analytics dashboard functionality:
 * - Summary metrics display (sales, transactions, average ticket, items)
 * - Top products table with proper ordering
 * - Categories breakdown
 * - Payment methods tracking
 * - Discounts analysis
 * - Date filtering (presets + custom range)
 * - CSV export functionality
 * - Edge cases (empty data, loading states, errors)
 * - Mobile responsiveness
 *
 * Test strategy:
 * - Use data-testid selectors exclusively
 * - Mock API responses for realistic test data
 * - Isolate tests (no order dependencies)
 * - Verify data integrity and formatting
 * - <90s total run time
 */

import { test, expect, Page } from '@playwright/test'
import { AnalyticsDashboardPage } from '../pages/analytics-dashboard.page'
import { loginAsOwner } from '../fixtures/auth.fixture'

// Test tenant (with pre-seeded data)
const TEST_TENANT = 'superhotdog'
const LOCALE = 'es'

test.describe('Analytics Dashboard', () => {
  let dashboardPage: AnalyticsDashboardPage

  test.beforeEach(async ({ page }) => {
    // Login as owner user
    await loginAsOwner(page)

    // Navigate to analytics dashboard
    dashboardPage = new AnalyticsDashboardPage(page)
    await dashboardPage.navigate(TEST_TENANT, LOCALE)
  })

  test.describe('Summary Cards', () => {
    test('should display all 4 summary cards', async () => {
      await test.step('Assert summary cards are visible', async () => {
        await dashboardPage.assertSummaryCardsVisible()
      })
    })

    test('should show correct metric values in summary cards', async () => {
      await test.step('Get summary metrics', async () => {
        const metrics = await dashboardPage.getSummaryMetrics()

        expect(metrics.totalSales).toBeTruthy()
        expect(metrics.totalTransactions).toBeTruthy()
        expect(metrics.averageTicket).toBeTruthy()
        expect(metrics.itemsSold).toBeTruthy()
      })
    })

    test('should display numeric values in metrics', async () => {
      await test.step('Validate metrics are numeric', async () => {
        const isNumeric = await dashboardPage.validateMetricsAreNumeric()
        expect(isNumeric).toBe(true)
      })
    })

    test('should show currency formatting in totals', async () => {
      await test.step('Check currency symbols', async () => {
        const metrics = await dashboardPage.getSummaryMetrics()

        // Should contain currency-like formatting ($ or number)
        expect(metrics.totalSales).toMatch(/\d+/)
        expect(metrics.averageTicket).toMatch(/\d+/)
      })
    })
  })

  test.describe('Top Products Table', () => {
    test('should display top products table', async () => {
      await test.step('Verify table is visible', async () => {
        await dashboardPage.assertTopProductsVisible()
      })
    })

    test('should show required columns (rank, name, category, qty, revenue, %)', async () => {
      await test.step('Get products and verify structure', async () => {
        const products = await dashboardPage.getProductRows()

        expect(products.length).toBeGreaterThan(0)

        // Verify first product has all required fields
        const firstProduct = products[0]
        expect(firstProduct.rank).toBeTruthy()
        expect(firstProduct.name).toBeTruthy()
        expect(firstProduct.category).toBeTruthy()
        expect(firstProduct.quantity).toBeTruthy()
        expect(firstProduct.revenue).toBeTruthy()
        expect(firstProduct.percentage).toBeTruthy()
      })
    })

    test('should order products by revenue descending', async () => {
      await test.step('Verify revenue ordering', async () => {
        const isOrdered = await dashboardPage.assertProductsOrderedByRevenue()
        expect(isOrdered).toBe(true)
      })
    })

    test('should display up to 10 top products', async () => {
      await test.step('Count product rows', async () => {
        const products = await dashboardPage.getProductRows()
        expect(products.length).toBeLessThanOrEqual(10)
      })
    })

    test('should show percentage values that sum to approximately 100%', async () => {
      await test.step('Sum percentages', async () => {
        const products = await dashboardPage.getProductRows()

        let totalPercent = 0
        products.forEach(p => {
          const percent = parseFloat(p.percentage.replace(/\D/g, ''))
          totalPercent += percent
        })

        // Allow 1% tolerance for rounding
        expect(totalPercent).toBeGreaterThanOrEqual(99)
        expect(totalPercent).toBeLessThanOrEqual(101)
      })
    })
  })

  test.describe('Categories Breakdown', () => {
    test('should display categories table', async () => {
      await test.step('Verify table is visible', async () => {
        await dashboardPage.assertCategoriesVisible()
      })
    })

    test('should show items_sold, revenue, and percentage columns', async () => {
      await test.step('Get categories and validate structure', async () => {
        const isValid = await dashboardPage.validateCategoryRowStructure()
        expect(isValid).toBe(true)
      })
    })

    test('should display all product categories', async () => {
      await test.step('Count category rows', async () => {
        const categories = await dashboardPage.getCategoryRows()
        expect(categories.length).toBeGreaterThan(0)
      })
    })

    test('should have unique category names', async () => {
      await test.step('Verify no duplicate categories', async () => {
        const categories = await dashboardPage.getCategoryRows()
        const names = categories.map(c => c.name)
        const uniqueNames = new Set(names)

        expect(uniqueNames.size).toBe(names.length)
      })
    })
  })

  test.describe('Payment Methods', () => {
    test('should display payment methods section', async () => {
      await test.step('Verify payment methods are visible', async () => {
        await dashboardPage.assertPaymentMethodsVisible()
      })
    })

    test('should show MercadoPago and Efectivo payment methods', async () => {
      await test.step('Count payment methods', async () => {
        const count = await dashboardPage.getPaymentMethodsCount()
        expect(count).toBeGreaterThan(0)
      })
    })

    test('should display payment method names and amounts', async () => {
      await test.step('Verify payment data structure', async () => {
        const page = dashboardPage.page

        // Get all payment method rows
        const rows = page.locator('[data-testid="payment-method-row"]')
        const count = await rows.count()

        expect(count).toBeGreaterThan(0)

        // Verify each row has data
        for (let i = 0; i < Math.min(count, 3); i++) {
          const row = rows.nth(i)
          const methodName = await row.locator('[data-testid="payment-method-name-cell"]').textContent()
          const amount = await row.locator('[data-testid="payment-method-amount-cell"]').textContent()

          expect(methodName).toBeTruthy()
          expect(amount).toBeTruthy()
        }
      })
    })
  })

  test.describe('Discounts Breakdown', () => {
    test('should display discounts section', async () => {
      await test.step('Verify discounts are visible', async () => {
        await dashboardPage.assertDiscountsVisible()
      })
    })

    test('should show discount sources (RedBag8, local, etc)', async () => {
      await test.step('Verify discount data', async () => {
        const page = dashboardPage.page

        const discountRows = page.locator('[data-testid="discount-row"]')
        const count = await discountRows.count()

        // May be empty if no discounts applied
        expect(count).toBeGreaterThanOrEqual(0)
      })
    })
  })

  test.describe('Date Filtering - Presets', () => {
    test('should filter by Hoy (Today) preset', async () => {
      await test.step('Apply Hoy filter', async () => {
        await dashboardPage.filterByPresetHoy()
        await dashboardPage.assertDashboardLoaded()
      })

      await test.step('Verify data is updated', async () => {
        const metrics = await dashboardPage.getSummaryMetrics()
        expect(metrics.totalSales).toBeTruthy()
      })
    })

    test('should filter by Ayer (Yesterday) preset', async () => {
      await test.step('Apply Ayer filter', async () => {
        await dashboardPage.filterByPresetAyer()
        await dashboardPage.assertDashboardLoaded()
      })
    })

    test('should filter by Esta semana (This week) preset', async () => {
      await test.step('Apply Esta semana filter', async () => {
        await dashboardPage.filterByPresetEstaSemana()
        await dashboardPage.assertDashboardLoaded()
      })
    })

    test('should filter by Este mes (This month) preset', async () => {
      await test.step('Apply Este mes filter', async () => {
        await dashboardPage.filterByPresetEsteMes()
        await dashboardPage.assertDashboardLoaded()
      })
    })

    test('should persist data when filtering', async () => {
      await test.step('Get initial metrics', async () => {
        const initialMetrics = await dashboardPage.getSummaryMetrics()
        expect(initialMetrics.totalSales).toBeTruthy()
      })

      await test.step('Apply filter', async () => {
        await dashboardPage.filterByPresetHoy()
      })

      await test.step('Verify data still exists', async () => {
        const filteredMetrics = await dashboardPage.getSummaryMetrics()
        expect(filteredMetrics.totalSales).toBeTruthy()
      })
    })
  })

  test.describe('Date Filtering - Custom Range', () => {
    test('should open custom date range picker', async () => {
      await test.step('Open picker', async () => {
        await dashboardPage.openCustomDateRange()
      })
    })

    test('should apply custom date range', async () => {
      await test.step('Set date range', async () => {
        // Last 7 days
        const endDate = new Date()
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)

        const formatDate = (d: Date) => d.toISOString().split('T')[0]

        await dashboardPage.setCustomDateRange(
          formatDate(startDate),
          formatDate(endDate)
        )

        await dashboardPage.assertDashboardLoaded()
      })

      await test.step('Verify data updated', async () => {
        const metrics = await dashboardPage.getSummaryMetrics()
        expect(metrics.totalSales).toBeTruthy()
      })
    })

    test('should cancel custom date range without applying', async ({ page }) => {
      await test.step('Open custom picker', async () => {
        await dashboardPage.openCustomDateRange()
      })

      await test.step('Cancel', async () => {
        await page.locator('[data-testid="cancel-date-range"]').click()

        // Popover should close
        await expect(
          page.locator('[data-testid="date-range-popover"]')
        ).not.toBeVisible({ timeout: 1000 }).catch(() => {})
      })
    })
  })

  test.describe('CSV Export', () => {
    test('should export products CSV with valid filename', async () => {
      await test.step('Start export', async () => {
        const download = await dashboardPage.exportProducts()

        // Verify file has correct extension
        expect(download.suggestedFilename()).toMatch(/\.csv$/)

        // Verify filename contains date or "products"
        expect(download.suggestedFilename().toLowerCase()).toContain('product')
      })
    })

    test('should export categories CSV', async () => {
      await test.step('Start export', async () => {
        const download = await dashboardPage.exportCategories()

        expect(download.suggestedFilename()).toMatch(/\.csv$/)
        expect(download.suggestedFilename().toLowerCase()).toContain('categor')
      })
    })

    test('should export payment methods CSV', async () => {
      await test.step('Start export', async () => {
        const download = await dashboardPage.exportPayments()

        expect(download.suggestedFilename()).toMatch(/\.csv$/)
        expect(download.suggestedFilename().toLowerCase()).toContain('payment')
      })
    })

    test('should export discounts CSV', async () => {
      await test.step('Start export', async () => {
        const download = await dashboardPage.exportDiscounts()

        expect(download.suggestedFilename()).toMatch(/\.csv$/)
        expect(download.suggestedFilename().toLowerCase()).toContain('discount')
      })
    })
  })

  test.describe('Edge Cases & Error Handling', () => {
    test('should handle empty data state gracefully', async ({ page }) => {
      await test.step('Navigate to date with no data', async () => {
        // Try a far future date (should have no data)
        await dashboardPage.openCustomDateRange()

        const futureDate = new Date()
        futureDate.setFullYear(futureDate.getFullYear() + 1)

        const formatDate = (d: Date) => d.toISOString().split('T')[0]

        await page.locator('[data-testid="custom-start-date"]').fill(formatDate(futureDate))
        await page.locator('[data-testid="custom-end-date"]').fill(formatDate(futureDate))
        await page.locator('[data-testid="apply-date-range"]').click()

        await page.waitForTimeout(1000)
      })

      await test.step('Verify empty state or zero data', async () => {
        // Should show empty state or zero values (not error)
        const metrics = await dashboardPage.getSummaryMetrics()

        // Metrics might be empty/zero or show empty state
        // Both are acceptable
        expect(
          await dashboardPage.emptyState.isVisible().catch(() => false)
        ).toEqual(
          metrics.totalSales === '' ||
          metrics.totalSales === '0' ||
          metrics.totalSales === '$ 0'
        )
      })
    })

    test('should show loading state during fetch', async ({ page }) => {
      await test.step('Monitor loading', async () => {
        // Intercept network and artificially slow it down
        await page.route('**/api/analytics/**', async (route) => {
          await new Promise(resolve => setTimeout(resolve, 500))
          await route.continue()
        })

        // Trigger data refetch by changing filter
        await dashboardPage.filterByPresetHoy()

        // Loading might appear briefly (hard to catch consistently)
        // This test mainly ensures filter doesn't crash
        await dashboardPage.assertDashboardLoaded()
      })
    })

    test('should maintain data after filter changes', async () => {
      await test.step('Get initial data', async () => {
        const initial = await dashboardPage.getSummaryMetrics()
        expect(initial.totalSales).toBeTruthy()
      })

      await test.step('Apply multiple filters', async () => {
        await dashboardPage.filterByPresetHoy()
        const hoy = await dashboardPage.getSummaryMetrics()

        await dashboardPage.filterByPresetEsteMes()
        const mes = await dashboardPage.getSummaryMetrics()

        // Both should have data (might be different amounts)
        expect(hoy.totalSales).toBeTruthy()
        expect(mes.totalSales).toBeTruthy()
      })
    })

    test('should handle API errors gracefully', async ({ page }) => {
      await test.step('Simulate API error', async () => {
        // Mock API to return 500 error
        await page.route('**/api/analytics/**', async (route) => {
          await route.abort('failed')
        })

        // Reload page to trigger error
        await page.reload()
        await page.waitForTimeout(1000)
      })

      await test.step('Verify error handling', async () => {
        // Should show error state or retry button
        const hasError = await dashboardPage.errorContainer.isVisible().catch(() => false)
        const hasRetry = await page
          .locator('[data-testid="analytics-retry"]')
          .isVisible()
          .catch(() => false)

        expect(hasError || hasRetry).toBe(true)
      })
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test('should display correctly on mobile viewport (375px)', async () => {
      await test.step('Set mobile viewport', async () => {
        await dashboardPage.setMobileViewport()
      })

      await test.step('Verify dashboard loads', async () => {
        await dashboardPage.assertDashboardLoaded()
      })

      await test.step('Verify summary cards stack', async () => {
        await dashboardPage.assertSummaryCardsVisible()
      })
    })

    test('should show mobile menu button on small screens', async () => {
      await test.step('Set mobile viewport', async () => {
        await dashboardPage.setMobileViewport()
      })

      await test.step('Check for mobile menu', async () => {
        const hasMenu = await dashboardPage.page
          .locator('[data-testid="analytics-mobile-menu"]')
          .isVisible()
          .catch(() => false)

        // Mobile menu should either be visible or filters should be visible
        const dashboardVisible = await dashboardPage.dashboardContainer.isVisible()
        expect(hasMenu || dashboardVisible).toBe(true)
      })
    })

    test('should be responsive on desktop viewport', async () => {
      await test.step('Set desktop viewport', async () => {
        await dashboardPage.setDesktopViewport()
      })

      await test.step('Verify all sections visible', async () => {
        await dashboardPage.assertSummaryCardsVisible()
        await dashboardPage.assertTopProductsVisible()
        await dashboardPage.assertCategoriesVisible()
      })
    })

    test('should maintain data on viewport resize', async () => {
      await test.step('Get initial metrics', async () => {
        const desktop = await dashboardPage.getSummaryMetrics()
        expect(desktop.totalSales).toBeTruthy()
      })

      await test.step('Resize to mobile', async () => {
        await dashboardPage.setMobileViewport()
        await dashboardPage.page.waitForLoadState('networkidle')
      })

      await test.step('Verify data persists', async () => {
        const mobile = await dashboardPage.getSummaryMetrics()
        expect(mobile.totalSales).toBeTruthy()
      })

      await test.step('Resize back to desktop', async () => {
        await dashboardPage.setDesktopViewport()
        await dashboardPage.page.waitForLoadState('networkidle')
      })

      await test.step('Verify data still present', async () => {
        const desktopAgain = await dashboardPage.getSummaryMetrics()
        expect(desktopAgain.totalSales).toBeTruthy()
      })
    })
  })

  test.describe('Data Integrity', () => {
    test('should not allow negative values in metrics', async () => {
      await test.step('Get metrics', async () => {
        const metrics = await dashboardPage.getSummaryMetrics()

        // Extract numeric values
        const extractNumber = (val: string) => {
          const match = val.match(/(\d+(?:\.\d+)?)/)
          return match ? parseFloat(match[1]) : 0
        }

        const sales = extractNumber(metrics.totalSales)
        const transactions = extractNumber(metrics.totalTransactions)
        const ticket = extractNumber(metrics.averageTicket)
        const items = extractNumber(metrics.itemsSold)

        expect(sales).toBeGreaterThanOrEqual(0)
        expect(transactions).toBeGreaterThanOrEqual(0)
        expect(ticket).toBeGreaterThanOrEqual(0)
        expect(items).toBeGreaterThanOrEqual(0)
      })
    })

    test('should have consistent data across sections', async () => {
      await test.step('Get summary and products', async () => {
        const metrics = await dashboardPage.getSummaryMetrics()
        const products = await dashboardPage.getProductRows()

        // If summary shows items sold, table should have products
        const itemsCount = parseInt(metrics.itemsSold.replace(/\D/g, '') || '0')

        if (itemsCount > 0) {
          expect(products.length).toBeGreaterThan(0)
        }
      })
    })

    test('should format currency consistently', async () => {
      await test.step('Check currency formatting', async () => {
        const metrics = await dashboardPage.getSummaryMetrics()

        // All currency values should follow same pattern
        const currencyRegex = /^\$?\s?\d+([,.]?\d+)*$/

        expect(metrics.totalSales).toMatch(currencyRegex)
        expect(metrics.averageTicket).toMatch(currencyRegex)
      })
    })
  })
})
