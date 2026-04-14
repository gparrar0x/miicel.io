/**
 * Nequi Locators
 *
 * Single source of truth for every Nequi-related data-testid in Micelio.
 * Mirrors the contract documented in docs/TEST_ID_CONTRACT.md (Nequi section).
 *
 * Coverage:
 * - Settings form (admin/dashboard/settings/nequi)
 * - Checkout option + buyer phone input
 * - Pending state (push prompt + countdown + deeplink)
 * - Terminal states (approved / rejected / canceled / expired)
 *
 * Issue: SKY-274
 */

export const NequiLocators = {
  // ============================================================================
  // ADMIN — SETTINGS FORM
  // ============================================================================
  settings: {
    form: '[data-testid="nequi-settings-form"]',
    clientIdInput: '[data-testid="nequi-settings-client-id-input"]',
    apiKeyInput: '[data-testid="nequi-settings-api-key-input"]',
    appSecretInput: '[data-testid="nequi-settings-app-secret-input"]',
    phoneInput: '[data-testid="nequi-settings-phone-input"]',
    saveButton: '[data-testid="nequi-settings-save-button"]',
    successToast: '[data-testid="nequi-settings-success-toast"]',
    errorToast: '[data-testid="nequi-settings-error-toast"]',
    statusBadge: '[data-testid="nequi-settings-status-badge"]',
    currencyWarning: '[data-testid="nequi-settings-currency-warning"]',
  },

  // ============================================================================
  // CHECKOUT — PAYMENT OPTION + BUYER PHONE
  // ============================================================================
  checkout: {
    paymentOption: '[data-testid="nequi-payment-option"]',
    phoneInput: '[data-testid="nequi-phone-input"]',
    phoneError: '[data-testid="nequi-phone-error"]',
    submitButton: '[data-testid="nequi-submit-button"]',
  },

  // ============================================================================
  // CHECKOUT — PENDING STATE (push prompt + countdown + deeplink)
  // ============================================================================
  pending: {
    container: '[data-testid="nequi-pending-state"]',
    icon: '[data-testid="nequi-pending-icon"]',
    countdownTimer: '[data-testid="nequi-countdown-timer"]',
    deeplinkButton: '[data-testid="nequi-deeplink-button"]',
    storeFallbackLink: '[data-testid="nequi-store-fallback-link"]',
    statusPollIndicator: '[data-testid="nequi-status-poll-indicator"]',
  },

  // ============================================================================
  // CHECKOUT — TERMINAL STATES
  // ============================================================================
  terminal: {
    approved: '[data-testid="nequi-payment-approved"]',
    rejected: '[data-testid="nequi-payment-rejected"]',
    canceled: '[data-testid="nequi-payment-canceled"]',
    expired: '[data-testid="nequi-payment-expired"]',
    retryButton: '[data-testid="nequi-retry-button"]',
  },

  // ============================================================================
  // API ROUTE PATTERNS — for Playwright route interception
  // ============================================================================
  api: {
    createPreference: '**/api/checkout/create-preference',
    nequiStatusPolling: '**/api/orders/*/nequi-status',
    nequiWebhook: '**/api/webhooks/nequi',
    settings: '**/api/settings**',
  },
} as const
