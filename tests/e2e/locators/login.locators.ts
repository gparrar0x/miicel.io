/**
 * Login Page Locators
 *
 * Uses data-testid attributes for stable selectors.
 * Covers email/password form and Google OAuth button.
 */

export const LoginLocators = {
  // Form container
  form: '[data-testid="login-form"]',

  // Email field
  emailInput: '[data-testid="login-email-input"]',

  // Password field
  passwordInput: '[data-testid="login-password-input"]',

  // Submit button (email/password form)
  submitButton: '[data-testid="login-submit-button"]',
  loadingState: '[data-testid="login-loading-state"]',

  // Error messages
  errorMessage: '[data-testid="login-error-message"]',
  oauthError: '[data-testid="login-error-no-account"]',

  // OAuth divider
  orDivider: '[data-testid="auth-or-divider"]',

  // Google Sign-In button
  googleSignInButton: '[data-testid="google-signin-button"]',
} as const
