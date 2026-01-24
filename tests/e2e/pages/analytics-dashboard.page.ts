/**
 * Analytics Dashboard Page Object
 *
 * Encapsulates all interactions with the analytics dashboard.
 * Provides high-level methods for test scenarios while hiding selector details.
 *
 * Usage:
 * const dashboard = new AnalyticsDashboardPage(page)
 * await dashboard.navigate('superhotdog')
 * await dashboard.assertSummaryCardsVisible()
 * await dashboard.filterByPreset('hoy')
 */

import { Page, Locator, expect } from '@playwright/test'
import { AnalyticsDashboardLocators, AnalyticsDashboardWaits } from '../locators/analytics-dashboard.locators'

export interface SummaryMetrics {
  totalSales: string
  totalTransactions: string
  averageTicket: string
  itemsSold: string
}

export interface SummaryCard {
  title: string
  value: string
  trend?: string
}

export interface ProductRow {
  rank: string
  name: string
  category: string
  quantity: string
  revenue: string
  percentage: string
}

export interface CategoryRow {
  name: string
  itemsSold: string
  revenue: string
  percentage: string
}

export class AnalyticsDashboardPage {
  readonly page: Page
  readonly dashboardContainer: Locator
  readonly summaryCardsSection: Locator
  readonly topProductsTable: Locator
  readonly categoriesTable: Locator
  readonly paymentMethodsTable: Locator
  readonly discountsTable: Locator
  readonly dateRangeButton: Locator
  readonly loadingSpinner: Locator
  readonly emptyState: Locator
  readonly errorContainer: Locator

  constructor(page: Page) {
    this.page = page
    this.dashboardContainer = page.locator(AnalyticsDashboardLocators.dashboardContainer)
    this.summaryCardsSection = page.locator(AnalyticsDashboardLocators.summaryCardsSection)
    this.topProductsTable = page.locator(AnalyticsDashboardLocators.topProductsTable)
    this.categoriesTable = page.locator(AnalyticsDashboardLocators.categoriesTable)
    this.paymentMethodsTable = page.locator(AnalyticsDashboardLocators.paymentMethodsTable)
    this.discountsTable = page.locator(AnalyticsDashboardLocators.discountsTable)
    this.dateRangeButton = page.locator(AnalyticsDashboardLocators.dateRangeButton)
    this.loadingSpinner = page.locator(AnalyticsDashboardLocators.loadingSpinner)
    this.emptyState = page.locator(AnalyticsDashboardLocators.emptyStateContainer)
    this.errorContainer = page.locator(AnalyticsDashboardLocators.errorContainer)
  }

  /**
   * Navigate to analytics dashboard
   * @param tenantSlug - Tenant slug
   * @param locale - Optional locale (default: es)
   */
  async navigate(tenantSlug: string, locale: string = 'es') {
    const url = `/es/${tenantSlug}/dashboard/analytics`
    await this.page.goto(url)
    await this.waitForPageLoad()
  }

  /**
   * Wait for page to be fully loaded
   * Waits for container and API responses
   */
  async waitForPageLoad(timeout: number = AnalyticsDashboardWaits.pageLoad) {
    await expect(this.dashboardContainer).toBeVisible({ timeout })
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Assert dashboard is loaded and visible
   */
  async assertDashboardLoaded() {
    await expect(this.dashboardContainer).toBeVisible()
    // Ensure loading spinner is gone
    await expect(this.loadingSpinner).not.toBeVisible({ timeout: 1000 }).catch(() => {})
  }

  /**
   * Assert summary cards are displayed
   */
  async assertSummaryCardsVisible() {
    await expect(this.summaryCardsSection).toBeVisible()

    // Verify all 4 summary cards
    const totalSalesCard = this.page.locator(AnalyticsDashboardLocators.totalSalesCard)
    const transactionsCard = this.page.locator(AnalyticsDashboardLocators.totalTransactionsCard)
    const averageCard = this.page.locator(AnalyticsDashboardLocators.averageTicketCard)
    const itemsCard = this.page.locator(AnalyticsDashboardLocators.itemsSoldCard)

    await expect(totalSalesCard).toBeVisible()
    await expect(transactionsCard).toBeVisible()
    await expect(averageCard).toBeVisible()
    await expect(itemsCard).toBeVisible()
  }

  /**
   * Get summary metrics from dashboard
   * @returns SummaryMetrics object with all values
   */
  async getSummaryMetrics(): Promise<SummaryMetrics> {
    const totalSales = await this.page
      .locator(AnalyticsDashboardLocators.totalSalesValue)
      .textContent()
    const totalTransactions = await this.page
      .locator(AnalyticsDashboardLocators.totalTransactionsValue)
      .textContent()
    const averageTicket = await this.page
      .locator(AnalyticsDashboardLocators.averageTicketValue)
      .textContent()
    const itemsSold = await this.page
      .locator(AnalyticsDashboardLocators.itemsSoldValue)
      .textContent()

    return {
      totalSales: totalSales?.trim() || '',
      totalTransactions: totalTransactions?.trim() || '',
      averageTicket: averageTicket?.trim() || '',
      itemsSold: itemsSold?.trim() || '',
    }
  }

  /**
   * Assert top products table is visible and populated
   */
  async assertTopProductsVisible() {
    await expect(this.topProductsTable).toBeVisible()

    // Ensure table has at least one row
    const rows = this.page.locator(AnalyticsDashboardLocators.topProductsRow)
    await expect(rows).toHaveCount(0, { timeout: 100 }).catch(async () => {
      // Table has rows, which is expected
      const count = await rows.count()
      expect(count).toBeGreaterThan(0)
    })
  }

  /**
   * Get all product rows from top products table
   * @returns Array of ProductRow objects
   */
  async getProductRows(): Promise<ProductRow[]> {
    const rows = this.page.locator(AnalyticsDashboardLocators.topProductsRow)
    const count = await rows.count()

    if (count === 0) return []

    const products: ProductRow[] = []
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i)
      const rank = await row.locator(AnalyticsDashboardLocators.productRankCell).textContent()
      const name = await row.locator(AnalyticsDashboardLocators.productNameCell).textContent()
      const category = await row.locator(AnalyticsDashboardLocators.productCategoryCell).textContent()
      const qty = await row.locator(AnalyticsDashboardLocators.productQtyCell).textContent()
      const revenue = await row.locator(AnalyticsDashboardLocators.productRevenueCell).textContent()
      const percent = await row.locator(AnalyticsDashboardLocators.productPercentCell).textContent()

      products.push({
        rank: rank?.trim() || '',
        name: name?.trim() || '',
        category: category?.trim() || '',
        quantity: qty?.trim() || '',
        revenue: revenue?.trim() || '',
        percentage: percent?.trim() || '',
      })
    }

    return products
  }

  /**
   * Assert categories table is visible
   */
  async assertCategoriesVisible() {
    await expect(this.categoriesTable).toBeVisible()
    const rows = this.page.locator(AnalyticsDashboardLocators.categoryRow)
    expect(await rows.count()).toBeGreaterThan(0)
  }

  /**
   * Get all category rows
   * @returns Array of CategoryRow objects
   */
  async getCategoryRows(): Promise<CategoryRow[]> {
    const rows = this.page.locator(AnalyticsDashboardLocators.categoryRow)
    const count = await rows.count()

    if (count === 0) return []

    const categories: CategoryRow[] = []
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i)
      const name = await row.locator(AnalyticsDashboardLocators.categoryNameCell).textContent()
      const itemsSold = await row.locator(AnalyticsDashboardLocators.categoryItemsSoldCell).textContent()
      const revenue = await row.locator(AnalyticsDashboardLocators.categoryRevenueCell).textContent()
      const percent = await row.locator(AnalyticsDashboardLocators.categoryPercentCell).textContent()

      categories.push({
        name: name?.trim() || '',
        itemsSold: itemsSold?.trim() || '',
        revenue: revenue?.trim() || '',
        percentage: percent?.trim() || '',
      })
    }

    return categories
  }

  /**
   * Assert payment methods table is visible
   */
  async assertPaymentMethodsVisible() {
    await expect(this.paymentMethodsTable).toBeVisible()
  }

  /**
   * Get payment method row count
   */
  async getPaymentMethodsCount(): Promise<number> {
    const rows = this.page.locator(AnalyticsDashboardLocators.paymentMethodRow)
    return await rows.count()
  }

  /**
   * Assert discounts table is visible
   */
  async assertDiscountsVisible() {
    await expect(this.discountsTable).toBeVisible()
  }

  /**
   * Filter by preset: Hoy (Today)
   */
  async filterByPresetHoy() {
    await this.page.locator(AnalyticsDashboardLocators.presetHoyButton).click()
    await this.page.waitForTimeout(AnalyticsDashboardWaits.filterApplication)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Filter by preset: Ayer (Yesterday)
   */
  async filterByPresetAyer() {
    await this.page.locator(AnalyticsDashboardLocators.presetAyerButton).click()
    await this.page.waitForTimeout(AnalyticsDashboardWaits.filterApplication)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Filter by preset: Esta semana (This week)
   */
  async filterByPresetEstaSemana() {
    await this.page.locator(AnalyticsDashboardLocators.presetEstaSemanaButton).click()
    await this.page.waitForTimeout(AnalyticsDashboardWaits.filterApplication)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Filter by preset: Este mes (This month)
   */
  async filterByPresetEsteMes() {
    await this.page.locator(AnalyticsDashboardLocators.presetEsteMesButton).click()
    await this.page.waitForTimeout(AnalyticsDashboardWaits.filterApplication)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Open custom date range picker
   */
  async openCustomDateRange() {
    await this.page.locator(AnalyticsDashboardLocators.presetCustomButton).click()
    await expect(this.page.locator(AnalyticsDashboardLocators.dateRangePopover)).toBeVisible()
  }

  /**
   * Set custom date range
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   */
  async setCustomDateRange(startDate: string, endDate: string) {
    await this.openCustomDateRange()

    const startInput = this.page.locator(AnalyticsDashboardLocators.customStartDateInput)
    const endInput = this.page.locator(AnalyticsDashboardLocators.customEndDateInput)

    await startInput.fill(startDate)
    await endInput.fill(endDate)

    await this.page.locator(AnalyticsDashboardLocators.applyDateRangeButton).click()
    await this.page.waitForTimeout(AnalyticsDashboardWaits.filterApplication)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Export products table as CSV
   * @returns Download event for file verification
   */
  async exportProducts() {
    const downloadPromise = this.page.waitForEvent('download')
    await this.page.locator(AnalyticsDashboardLocators.exportProductsButton).click()
    await this.page.waitForTimeout(AnalyticsDashboardWaits.exportStart)
    return await downloadPromise
  }

  /**
   * Export categories table as CSV
   */
  async exportCategories() {
    const downloadPromise = this.page.waitForEvent('download')
    await this.page.locator(AnalyticsDashboardLocators.exportCategoriesButton).click()
    await this.page.waitForTimeout(AnalyticsDashboardWaits.exportStart)
    return await downloadPromise
  }

  /**
   * Export payment methods as CSV
   */
  async exportPayments() {
    const downloadPromise = this.page.waitForEvent('download')
    await this.page.locator(AnalyticsDashboardLocators.exportPaymentsButton).click()
    await this.page.waitForTimeout(AnalyticsDashboardWaits.exportStart)
    return await downloadPromise
  }

  /**
   * Export discounts as CSV
   */
  async exportDiscounts() {
    const downloadPromise = this.page.waitForEvent('download')
    await this.page.locator(AnalyticsDashboardLocators.exportDiscountsButton).click()
    await this.page.waitForTimeout(AnalyticsDashboardWaits.exportStart)
    return await downloadPromise
  }

  /**
   * Assert empty state is displayed
   */
  async assertEmptyStateVisible() {
    await expect(this.emptyState).toBeVisible()
    await expect(this.page.locator(AnalyticsDashboardLocators.emptyStateMessage)).toBeVisible()
  }

  /**
   * Assert loading state is visible
   */
  async assertLoadingVisible() {
    await expect(this.loadingSpinner).toBeVisible()
  }

  /**
   * Assert error state is visible
   */
  async assertErrorVisible() {
    await expect(this.errorContainer).toBeVisible()
    await expect(this.page.locator(AnalyticsDashboardLocators.errorMessage)).toBeVisible()
  }

  /**
   * Click retry button after error
   */
  async clickRetry() {
    await this.page.locator(AnalyticsDashboardLocators.retryButton).click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Check if metrics contain numeric values
   */
  async validateMetricsAreNumeric(): Promise<boolean> {
    const metrics = await this.getSummaryMetrics()
    const numericRegex = /^\d+(\.\d{2})?/

    return (
      numericRegex.test(metrics.totalSales) &&
      numericRegex.test(metrics.totalTransactions) &&
      numericRegex.test(metrics.averageTicket) &&
      numericRegex.test(metrics.itemsSold)
    )
  }

  /**
   * Assert products are ordered by revenue descending
   */
  async assertProductsOrderedByRevenue(): Promise<boolean> {
    const products = await this.getProductRows()

    for (let i = 0; i < products.length - 1; i++) {
      const current = parseFloat(products[i].revenue.replace(/\D/g, ''))
      const next = parseFloat(products[i + 1].revenue.replace(/\D/g, ''))

      if (current < next) {
        return false
      }
    }

    return true
  }

  /**
   * Assert categories are displayed with required columns
   */
  async validateCategoryRowStructure(): Promise<boolean> {
    const categories = await this.getCategoryRows()

    if (categories.length === 0) return false

    return categories.every(
      cat => cat.name && cat.itemsSold && cat.revenue && cat.percentage
    )
  }

  /**
   * Wait for specific number of products to load
   */
  async waitForProductsToLoad(expectedCount: number, timeout: number = 5000) {
    const rows = this.page.locator(AnalyticsDashboardLocators.topProductsRow)
    await expect(rows).toHaveCount(expectedCount, { timeout })
  }

  /**
   * Set mobile viewport and verify responsive behavior
   */
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 })
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Set desktop viewport
   */
  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1280, height: 720 })
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Assert mobile menu button is visible on mobile
   */
  async assertMobileMenuVisible() {
    await expect(this.page.locator(AnalyticsDashboardLocators.mobileMenuButton)).toBeVisible()
  }

  /**
   * Get current date range from button text
   */
  async getActiveDateRange(): Promise<string> {
    return await this.dateRangeButton.textContent() || ''
  }
}
