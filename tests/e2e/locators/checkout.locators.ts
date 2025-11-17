/**
 * Checkout Flow Locators
 *
 * Defines all selectors for checkout modal, forms, payment methods, and result pages.
 * Uses data-testid attributes following {feature}-{element}-{type} convention.
 *
 * Coverage:
 * - Checkout modal (header, form, close button)
 * - Customer form fields (email, name, phone, address)
 * - Payment method selector (MercadoPago, card, etc.)
 * - Inline validation errors
 * - Success/failure page indicators
 */

export const CheckoutLocators = {
  // ============================================================================
  // MODAL CONTAINER & HEADER
  // ============================================================================
  modal: {
    backdrop: '[data-testid="checkout-modal-backdrop"]',
    container: '[data-testid="checkout-modal-container"]',
    header: '[data-testid="checkout-modal-header"]',
    closeButton: '[data-testid="checkout-modal-close-button"]',
    title: '[data-testid="checkout-modal-title"]',
  },

  // ============================================================================
  // FORM & CUSTOMER INFO
  // ============================================================================
  form: {
    container: '[data-testid="checkout-form"]',
    customerSection: '[data-testid="checkout-customer-section"]',
  },

  // ============================================================================
  // CUSTOMER FORM FIELDS
  // ============================================================================
  customerForm: {
    // Email field
    emailInput: '[data-testid="checkout-email-input"]',
    emailError: '[data-testid="checkout-email-error"]',

    // Full name field
    nameInput: '[data-testid="checkout-name-input"]',
    nameError: '[data-testid="checkout-name-error"]',

    // Phone field (optional)
    phoneInput: '[data-testid="checkout-phone-input"]',
    phoneError: '[data-testid="checkout-phone-error"]',

    // Address fields
    addressInput: '[data-testid="checkout-address-input"]',
    addressError: '[data-testid="checkout-address-error"]',

    cityInput: '[data-testid="checkout-city-input"]',
    cityError: '[data-testid="checkout-city-error"]',

    zipInput: '[data-testid="checkout-zip-input"]',
    zipError: '[data-testid="checkout-zip-error"]',

    countrySelect: '[data-testid="checkout-country-select"]',
    countryError: '[data-testid="checkout-country-error"]',
  },

  // ============================================================================
  // PAYMENT METHOD SELECTOR
  // ============================================================================
  paymentMethod: {
    section: '[data-testid="checkout-payment-method-section"]',
    title: '[data-testid="checkout-payment-method-title"]',

    // MercadoPago option
    mercadopagoRadio: '[data-testid="checkout-payment-mercadopago-radio"]',
    mercadopagoLabel: '[data-testid="checkout-payment-mercadopago-label"]',

    // Credit card option
    cardRadio: '[data-testid="checkout-payment-card-radio"]',
    cardLabel: '[data-testid="checkout-payment-card-label"]',

    // PayPal option
    paypalRadio: '[data-testid="checkout-payment-paypal-radio"]',
    paypalLabel: '[data-testid="checkout-payment-paypal-label"]',

    // Selected indicator
    selectedBorder: '[data-testid="checkout-payment-selected-border"]',
  },

  // ============================================================================
  // ORDER SUMMARY
  // ============================================================================
  summary: {
    container: '[data-testid="checkout-summary-container"]',
    itemsCount: '[data-testid="checkout-summary-items-count"]',
    subtotal: '[data-testid="checkout-summary-subtotal"]',
    tax: '[data-testid="checkout-summary-tax"]',
    shipping: '[data-testid="checkout-summary-shipping"]',
    total: '[data-testid="checkout-summary-total"]',
  },

  // ============================================================================
  // FORM SUBMISSION
  // ============================================================================
  submit: {
    button: '[data-testid="checkout-submit-button"]',
    loadingSpinner: '[data-testid="checkout-submit-loading-spinner"]',
    loadingText: '[data-testid="checkout-submit-loading-text"]',
    disabledOverlay: '[data-testid="checkout-submit-disabled-overlay"]',
  },

  // ============================================================================
  // SUCCESS PAGE
  // ============================================================================
  successPage: {
    container: '[data-testid="checkout-success-container"]',
    header: '[data-testid="checkout-success-header"]',
    title: '[data-testid="checkout-success-title"]',
    message: '[data-testid="checkout-success-message"]',
    orderId: '[data-testid="checkout-success-order-id"]',
    orderNumber: '[data-testid="checkout-success-order-number"]',
    icon: '[data-testid="checkout-success-icon"]',
    continueButton: '[data-testid="checkout-success-continue-button"]',
  },

  // ============================================================================
  // FAILURE PAGE
  // ============================================================================
  failurePage: {
    container: '[data-testid="checkout-failure-container"]',
    header: '[data-testid="checkout-failure-header"]',
    title: '[data-testid="checkout-failure-title"]',
    message: '[data-testid="checkout-failure-message"]',
    errorReason: '[data-testid="checkout-failure-error-reason"]',
    icon: '[data-testid="checkout-failure-icon"]',
    retryButton: '[data-testid="checkout-failure-retry-button"]',
    homeButton: '[data-testid="checkout-failure-home-button"]',
  },

  // ============================================================================
  // INLINE VALIDATION STATES
  // ============================================================================
  validation: {
    fieldError: '[data-testid*="-error"]', // Matches all error messages
    fieldValid: '[data-testid*="-valid-icon"]', // Matches all valid indicators
    fieldInvalid: '[data-testid*="-invalid-icon"]', // Matches all invalid indicators
  },

  // ============================================================================
  // API MOCK HELPERS (for Playwright route interception)
  // ============================================================================
  api: {
    createPreferenceEndpoint: '**/api/checkout/create-preference',
    submitCheckoutEndpoint: '**/api/checkout/submit',
    validateEmailEndpoint: '**/api/checkout/validate-email',
  },
} as const
