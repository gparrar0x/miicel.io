/**
 * Signup Page Locators
 *
 * Uses data-testid attributes added by Pixel for stable selectors.
 * All locators follow the {feature}-{element}-{type} naming convention.
 */

export const SignupLocators = {
  // Form container
  form: '[data-testid="signup-form"]',

  // Email field
  emailInput: '[data-testid="signup-email-input"]',
  emailError: '[data-testid="signup-email-error"]',

  // Password field
  passwordInput: '[data-testid="signup-password-input"]',
  passwordError: '[data-testid="signup-password-error"]',
  togglePasswordButton: '[data-testid="signup-toggle-password-button"]',

  // Business name field
  businessNameInput: '[data-testid="signup-businessname-input"]',
  businessNameError: '[data-testid="signup-businessname-error"]',

  // Slug field with validation states
  slugInput: '[data-testid="signup-slug-input"]',
  slugLoadingSpinner: '[data-testid="signup-slug-loading-spinner"]',
  slugAvailableIcon: '[data-testid="signup-slug-available-icon"]',
  slugUnavailableIcon: '[data-testid="signup-slug-unavailable-icon"]',
  slugError: '[data-testid="signup-slug-error"]',

  // Submit button
  submitButton: '[data-testid="signup-submit-button"]',
  submitLoadingSpinner: '[data-testid="signup-submit-loading-spinner"]',

  // Login link
  loginLink: '[data-testid="signup-login-link"]',
} as const

/**
 * Wait strategies for slug validation
 */
export const SlugValidationWaits = {
  debounce: 600, // 500ms debounce + 100ms buffer
  validation: 5000, // Max time to wait for validation
} as const
