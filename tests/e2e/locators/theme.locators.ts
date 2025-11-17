/**
 * Theme Editor & Settings Locators
 *
 * Defines all selectors for admin appearance settings page.
 * Uses data-testid attributes following {feature}-{element}-{type} convention.
 *
 * Coverage:
 * - Template selector (gallery, detail, minimal)
 * - Theme field editor (colors, spacing, grid, variant, aspect)
 * - Save/reset buttons
 * - Live preview
 * - Success/error toasts
 */

export const ThemeLocators = {
  // ============================================================================
  // PAGE CONTAINER
  // ============================================================================
  page: {
    container: '[data-testid="appearance-settings-page"]',
    pageTitle: '[data-testid="appearance-page-title"]',
    pageDescription: '[data-testid="appearance-page-description"]',
  },

  // ============================================================================
  // TEMPLATE SELECTOR SECTION
  // ============================================================================
  templateSelector: {
    section: '[data-testid="template-selector-section"]',
    sectionTitle: '[data-testid="template-selector-title"]',

    // Template options
    galleryOption: '[data-testid="template-selector-gallery"]',
    detailOption: '[data-testid="template-selector-detail"]',
    minimalOption: '[data-testid="template-selector-minimal"]',

    // Radio inputs
    galleryRadio: '[data-testid="template-radio-gallery"]',
    detailRadio: '[data-testid="template-radio-detail"]',
    minimalRadio: '[data-testid="template-radio-minimal"]',
  },

  // ============================================================================
  // THEME FIELDS EDITOR SECTION
  // ============================================================================
  themeFields: {
    section: '[data-testid="theme-fields-section"]',
    sectionTitle: '[data-testid="theme-fields-title"]',

    // Grid columns field
    gridColsLabel: '[data-testid="theme-grid-cols-label"]',
    gridColsInput: '[data-testid="theme-grid-cols-input"]',
    gridColsError: '[data-testid="theme-grid-cols-error"]',

    // Image aspect ratio field
    imageAspectLabel: '[data-testid="theme-image-aspect-label"]',
    imageAspectInput: '[data-testid="theme-image-aspect-input"]',
    imageAspectError: '[data-testid="theme-image-aspect-error"]',

    // Card variant field
    cardVariantLabel: '[data-testid="theme-card-variant-label"]',
    cardVariantSelect: '[data-testid="theme-card-variant-select"]',
    cardVariantError: '[data-testid="theme-card-variant-error"]',

    // Spacing field
    spacingLabel: '[data-testid="theme-spacing-label"]',
    spacingSelect: '[data-testid="theme-spacing-select"]',
    spacingError: '[data-testid="theme-spacing-error"]',

    // Primary color field
    primaryColorLabel: '[data-testid="theme-primary-color-label"]',
    primaryColorInput: '[data-testid="theme-primary-color-input"]',
    primaryColorError: '[data-testid="theme-primary-color-error"]',

    // Accent color field
    accentColorLabel: '[data-testid="theme-accent-color-label"]',
    accentColorInput: '[data-testid="theme-accent-color-input"]',
    accentColorError: '[data-testid="theme-accent-color-error"]',
  },

  // ============================================================================
  // FORM SUBMISSION
  // ============================================================================
  form: {
    container: '[data-testid="theme-editor-form"]',
  },

  buttons: {
    save: '[data-testid="theme-save-button"]',
    reset: '[data-testid="theme-reset-button"]',
    savingSpinner: '[data-testid="theme-save-spinner"]',
  },

  // ============================================================================
  // LIVE PREVIEW SECTION
  // ============================================================================
  preview: {
    container: '[data-testid="theme-preview-container"]',
    title: '[data-testid="theme-preview-title"]',
    content: '[data-testid="theme-preview-content"]',
    productGrid: '[data-testid="theme-preview-product-grid"]',
    productCard: '[data-testid="theme-preview-product-card"]',
  },

  // ============================================================================
  // TOAST NOTIFICATIONS
  // ============================================================================
  toast: {
    successMessage: '[data-testid="toast-success"]',
    errorMessage: '[data-testid="toast-error"]',
    infoMessage: '[data-testid="toast-info"]',
    description: '[data-testid="toast-description"]',
    closeButton: '[data-testid="toast-close"]',
  },

  // ============================================================================
  // VALIDATION STATES
  // ============================================================================
  validation: {
    fieldError: '[data-testid*="-error"]', // Matches all error messages
    validIcon: '[data-testid*="-valid-icon"]',
    invalidIcon: '[data-testid*="-invalid-icon"]',
  },
} as const
