/**
 * Onboarding Wizard Locators
 *
 * Uses data-testid attributes added by Pixel for stable selectors.
 * All locators follow the {feature}-{element}-{type} naming convention.
 */

export const OnboardingLocators = {
  // Main container
  container: '[data-testid="onboarding-container"]',

  // Common elements across all steps
  header: {
    container: '[data-testid="onboarding-header"]',
    stepIndicator: '[data-testid="onboarding-step-indicator"]',
    progressBar: '[data-testid="onboarding-progress-bar"]',
    backButton: '[data-testid="onboarding-back-button"]',
    continueButton: '[data-testid="onboarding-continue-button"]',
  },

  // Navigation buttons (also available at top level for convenience)
  continueButton: '[data-testid="onboarding-continue-button"]',
  backButton: '[data-testid="onboarding-back-button"]',

  // Step 1: Logo Upload
  step1: {
    container: '[data-testid="onboarding-step1-container"]',
    title: '[data-testid="onboarding-step1-title"]',
    description: '[data-testid="onboarding-step1-description"]',
    fileInput: '[data-testid="onboarding-logo-input"]',
    logoInput: '[data-testid="onboarding-logo-input"]', // Alias for fileInput
    logoPreview: '[data-testid="onboarding-logo-preview"]',
  },

  // Step 2: Colors
  step2: {
    container: '[data-testid="onboarding-step2-container"]',
    title: '[data-testid="onboarding-step2-title"]',
    description: '[data-testid="onboarding-step2-description"]',
    presetColor: (index: number) => `[data-testid="onboarding-preset-color-${index}"]`,
    primaryColorInput: '[data-testid="onboarding-primary-color-input"]',
    secondaryColorInput: '[data-testid="onboarding-secondary-color-input"]',
    colorPreview: '[data-testid="onboarding-color-preview"]',
  },

  // Step 3: Products
  step3: {
    container: '[data-testid="onboarding-step3-container"]',
    title: '[data-testid="onboarding-step3-title"]',
    description: '[data-testid="onboarding-step3-description"]',

    // Product form
    productNameInput: '[data-testid="onboarding-product-name-input"]',
    productPriceInput: '[data-testid="onboarding-product-price-input"]',
    productCategoryInput: '[data-testid="onboarding-product-category-input"]',
    productStockInput: '[data-testid="onboarding-product-stock-input"]',
    addButton: '[data-testid="onboarding-product-add-button"]',

    // Product list
    productList: '[data-testid="onboarding-product-list"]',
    productItem: (index: number) => `[data-testid="onboarding-product-item-${index}"]`,
    productName: (index: number) => `[data-testid="onboarding-product-name-${index}"]`,
    editButton: (index: number) => `[data-testid="onboarding-product-edit-button-${index}"]`,
    deleteButton: (index: number) => `[data-testid="onboarding-product-delete-button-${index}"]`,
  },

  // Step 4: Preview
  step4: {
    container: '[data-testid="onboarding-step4-container"]',
    title: '[data-testid="onboarding-step4-title"]',
    description: '[data-testid="onboarding-step4-description"]',
    previewHeader: '[data-testid="onboarding-preview-header"]',
    previewLogo: '[data-testid="onboarding-preview-logo"]',
    previewProducts: '[data-testid="onboarding-preview-products"]',
    previewProduct: (index: number) => `[data-testid="onboarding-preview-product-${index}"]`,
    previewProductImage: (index: number) =>
      `[data-testid="onboarding-preview-product-image-${index}"]`,
    previewProductName: (index: number) =>
      `[data-testid="onboarding-preview-product-name-${index}"]`,
    previewProductAddButton: (index: number) =>
      `[data-testid="onboarding-preview-product-add-button-${index}"]`,
  },

  // Step 5: Activation
  step5: {
    container: '[data-testid="onboarding-step5-container"]',
    title: '[data-testid="onboarding-step5-title"]',
    description: '[data-testid="onboarding-step5-description"]',
    summary: '[data-testid="onboarding-summary"]',
    summaryLogo: '[data-testid="onboarding-summary-logo"]',
    summaryColors: '[data-testid="onboarding-summary-colors"]',
    summaryPrimaryColor: '[data-testid="onboarding-summary-primary-color"]',
    summarySecondaryColor: '[data-testid="onboarding-summary-secondary-color"]',
    summaryProductCount: '[data-testid="onboarding-summary-product-count"]',
    summaryUrl: '[data-testid="onboarding-summary-url"]',
    activateButton: '[data-testid="onboarding-activate-button"]',
    activateLoadingSpinner: '[data-testid="onboarding-activate-loading-spinner"]',
  },
} as const

/**
 * Wait times for onboarding interactions
 */
export const OnboardingWaits = {
  fileUpload: 3000,
  colorChange: 500,
  productAdd: 1000,
  activation: 10000, // Logo upload + API save
  redirect: 5000,
} as const
