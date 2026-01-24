/**
 * Analytics Dashboard Locators
 *
 * Data-testid contract for analytics dashboard UI elements.
 * Single source of truth for all selectors used in tests.
 *
 * Naming convention: {page}-{section}-{element}-{type}
 */

export const AnalyticsDashboardLocators = {
  // Page container
  dashboardContainer: '[data-testid="analytics-dashboard"]',

  // Summary cards section
  summaryCardsSection: '[data-testid="summary-cards"]',
  totalSalesCard: '[data-testid="total-sales-card"]',
  totalSalesValue: '[data-testid="total-sales-value"]',
  totalTransactionsCard: '[data-testid="total-transactions-card"]',
  totalTransactionsValue: '[data-testid="total-transactions-value"]',
  averageTicketCard: '[data-testid="average-ticket-card"]',
  averageTicketValue: '[data-testid="average-ticket-value"]',
  itemsSoldCard: '[data-testid="items-sold-card"]',
  itemsSoldValue: '[data-testid="items-sold-value"]',

  // Top products section
  topProductsSection: '[data-testid="top-products"]',
  topProductsTable: '[data-testid="top-products-table"]',
  topProductsRow: '[data-testid="top-products-row"]',
  productRankCell: '[data-testid="product-rank-cell"]',
  productNameCell: '[data-testid="product-name-cell"]',
  productCategoryCell: '[data-testid="product-category-cell"]',
  productQtyCell: '[data-testid="product-qty-cell"]',
  productRevenueCell: '[data-testid="product-revenue-cell"]',
  productPercentCell: '[data-testid="product-percent-cell"]',

  // Categories section
  categoriesSection: '[data-testid="top-categories"]',
  categoriesTable: '[data-testid="categories-table"]',
  categoryRow: '[data-testid="category-row"]',
  categoryNameCell: '[data-testid="category-name-cell"]',
  categoryItemsSoldCell: '[data-testid="category-items-sold-cell"]',
  categoryRevenueCell: '[data-testid="category-revenue-cell"]',
  categoryPercentCell: '[data-testid="category-percent-cell"]',

  // Payment methods section
  paymentMethodsSection: '[data-testid="payment-methods"]',
  paymentMethodsTable: '[data-testid="payment-methods-table"]',
  paymentMethodRow: '[data-testid="payment-method-row"]',
  paymentMethodNameCell: '[data-testid="payment-method-name-cell"]',
  paymentMethodCountCell: '[data-testid="payment-method-count-cell"]',
  paymentMethodAmountCell: '[data-testid="payment-method-amount-cell"]',

  // Discounts section
  discountsSection: '[data-testid="discounts-breakdown"]',
  discountsTable: '[data-testid="discounts-table"]',
  discountRow: '[data-testid="discount-row"]',
  discountSourceCell: '[data-testid="discount-source-cell"]',
  discountCountCell: '[data-testid="discount-count-cell"]',
  discountAmountCell: '[data-testid="discount-amount-cell"]',

  // Date range filter
  dateRangePickerContainer: '[data-testid="date-range-picker"]',
  dateRangeButton: '[data-testid="date-range-button"]',
  dateRangePopover: '[data-testid="date-range-popover"]',

  // Preset buttons
  presetHoyButton: '[data-testid="preset-hoy"]',
  presetAyerButton: '[data-testid="preset-ayer"]',
  presetEstaSemanaButton: '[data-testid="preset-esta-semana"]',
  presetEsteMesButton: '[data-testid="preset-este-mes"]',
  presetCustomButton: '[data-testid="preset-custom"]',

  // Custom date inputs
  customStartDateInput: '[data-testid="custom-start-date"]',
  customEndDateInput: '[data-testid="custom-end-date"]',
  applyDateRangeButton: '[data-testid="apply-date-range"]',
  cancelDateRangeButton: '[data-testid="cancel-date-range"]',

  // Export buttons
  exportProductsButton: '[data-testid="export-btn-products"]',
  exportCategoriesButton: '[data-testid="export-btn-categories"]',
  exportPaymentsButton: '[data-testid="export-btn-payments"]',
  exportDiscountsButton: '[data-testid="export-btn-discounts"]',

  // Loading and empty states
  loadingSpinner: '[data-testid="analytics-loading"]',
  loadingOverlay: '[data-testid="analytics-loading-overlay"]',
  emptyStateContainer: '[data-testid="analytics-empty-state"]',
  emptyStateMessage: '[data-testid="analytics-empty-message"]',

  // Error state
  errorContainer: '[data-testid="analytics-error"]',
  errorMessage: '[data-testid="analytics-error-message"]',
  retryButton: '[data-testid="analytics-retry"]',

  // Responsive mobile elements
  mobileMenuButton: '[data-testid="analytics-mobile-menu"]',
  mobileFiltersButton: '[data-testid="analytics-mobile-filters"]',

  // Section headers
  sectionHeader: '[data-testid*="-section-header"]',
  sectionTitle: '[data-testid*="-section-title"]',
} as const

/**
 * Wait times for various operations
 */
export const AnalyticsDashboardWaits = {
  pageLoad: 5000,
  apiResponse: 8000,
  chartRender: 3000,
  tableRender: 3000,
  filterApplication: 2000,
  exportStart: 2000,
} as const

/**
 * Test data constants for assertions
 */
export const AnalyticsDashboardTestData = {
  minSummaryCards: 4,
  maxTopProducts: 10,
  currencySymbol: '$',
  percentSymbol: '%',
  dateFormat: /^\d{4}-\d{2}-\d{2}$/,
} as const
