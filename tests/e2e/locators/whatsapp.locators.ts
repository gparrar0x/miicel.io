/**
 * WhatsApp Button Locators
 *
 * Defines selectors for:
 * - Dashboard WhatsApp configuration (tenant settings)
 * - Storefront WhatsApp button display
 * - Button interaction targets
 */

export const WhatsAppLocators = {
  // ============================================================================
  // DASHBOARD / SETTINGS
  // ============================================================================
  settings: {
    // Contact tab
    contactTabButton: '[data-testid="tab-contact"]',

    // WhatsApp input field
    whatsappInput: '[data-testid="whatsapp-number-input"]',
    whatsappError: '[data-testid="whatsapp-number-error"]',
    whatsappHelp: '[data-testid="whatsapp-number-help"]',

    // Save button
    saveButton: '[data-testid="btn-save-settings"]',
    savingSpinner: '[data-testid="settings-saving-spinner"]',

    // Success/error messages (toast notifications)
    successMessage: '[data-sonner-toast][data-type="success"]',
    errorMessage: '[data-sonner-toast][data-type="error"]',
  },

  // ============================================================================
  // STOREFRONT / DISPLAY
  // ============================================================================
  storefront: {
    // WhatsApp button (visible when configured)
    whatsappButton: '[data-testid="whatsapp-button"]',

    // Button text/label
    whatsappButtonText: '[data-testid="whatsapp-button-text"]',

    // Button container (for styling tests)
    whatsappButtonContainer: '[data-testid="whatsapp-button-container"]',

    // Button icon
    whatsappButtonIcon: '[data-testid="whatsapp-button-icon"]',
  },

  // ============================================================================
  // GALLERY TEMPLATE
  // ============================================================================
  gallery: {
    template: '[data-testid="product-grid-gallery"]',
    card: '[data-testid="product-card-gallery"]',
  },

  // ============================================================================
  // DETAIL TEMPLATE
  // ============================================================================
  detail: {
    template: '[data-testid="product-grid-detail"]',
    card: '[data-testid="product-card-detail"]',
  },

  // ============================================================================
  // MINIMAL TEMPLATE
  // ============================================================================
  minimal: {
    template: '[data-testid="product-grid-minimal"]',
    card: '[data-testid="product-card-minimal"]',
  },

  // ============================================================================
  // GASTRONOMY TEMPLATE
  // ============================================================================
  gastronomy: {
    template: '[data-testid="product-grid-gastronomy"]',
    card: '[data-testid="product-card-gastronomy"]',
  },
} as const
