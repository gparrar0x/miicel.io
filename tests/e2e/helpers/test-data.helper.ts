/**
 * Test Data Helper
 *
 * Generates unique test data to ensure tests can run in parallel
 * without conflicts. Each test gets its own isolated dataset.
 *
 * Usage:
 * const testData = generateTestData()
 * // testData.email = "test-1234567890@example.com"
 * // testData.slug = "store-1234567890"
 */

interface TestData {
  email: string
  password: string
  businessName: string
  slug: string
  timestamp: number
}

/**
 * Generate unique test data using timestamp
 * Ensures parallel tests don't create conflicts
 *
 * @param baseSlug - Optional base slug to use instead of 'store'
 * @returns Unique test data object
 */
export function generateTestData(baseSlug: string = 'store'): TestData {
  const timestamp = Date.now()

  return {
    email: `e2e-test-${timestamp}@example.com`,
    password: 'TestPassword123!',
    businessName: `Test Business ${timestamp}`,
    slug: `${baseSlug}-${timestamp}`,
    timestamp,
  }
}

/**
 * Generate test data with custom values
 * Useful for specific test scenarios
 *
 * @param overrides - Partial test data to override defaults
 * @returns Test data with overrides applied
 */
export function generateTestDataWithOverrides(overrides: Partial<TestData>): TestData {
  const defaults = generateTestData()
  return { ...defaults, ...overrides }
}

/**
 * Validate test data before using in tests
 * Ensures data meets requirements
 */
export function validateTestData(data: TestData): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Email validation
  if (!data.email.includes('@')) {
    errors.push('Invalid email format')
  }

  // Password validation (8+ chars, 1 upper, 1 lower, 1 number)
  if (data.password.length < 8) {
    errors.push('Password too short')
  }
  if (!/[A-Z]/.test(data.password)) {
    errors.push('Password missing uppercase letter')
  }
  if (!/[a-z]/.test(data.password)) {
    errors.push('Password missing lowercase letter')
  }
  if (!/[0-9]/.test(data.password)) {
    errors.push('Password missing number')
  }

  // Business name validation
  if (data.businessName.length < 2) {
    errors.push('Business name too short')
  }

  // Slug validation (3-30 chars, lowercase alphanumeric with hyphens)
  if (data.slug.length < 3 || data.slug.length > 30) {
    errors.push('Slug length invalid')
  }
  if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Slug contains invalid characters')
  }
  if (/^-|-$/.test(data.slug)) {
    errors.push('Slug cannot start or end with hyphen')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Intentionally invalid data for negative test cases
 */
export const InvalidTestData = {
  // Invalid emails
  invalidEmails: ['notanemail', 'missing@domain', '@nodomain.com', 'spaces in@email.com'],

  // Weak passwords
  weakPasswords: [
    'short', // too short
    'nouppercase123', // no uppercase
    'NOLOWERCASE123', // no lowercase
    'NoNumber', // no number
  ],

  // Invalid slugs
  invalidSlugs: [
    'ab', // too short
    'a'.repeat(31), // too long
    'UPPERCASE', // uppercase not allowed
    'slug_underscore', // underscore not allowed
    '-leadinghyphen', // leading hyphen
    'trailing-', // trailing hyphen
    'double--hyphen', // consecutive hyphens
    'spaces in slug', // spaces not allowed
  ],

  // Short/empty business names
  invalidBusinessNames: [
    '', // empty
    'a', // too short (min 2)
  ],
}

/**
 * Password requirements from the schema
 * Used for documenting test expectations
 */
export const PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: false,
}

/**
 * Slug requirements from the schema
 * Used for documenting test expectations
 */
export const SlugRequirements = {
  minLength: 3,
  maxLength: 30,
  allowedCharacters: 'lowercase letters, numbers, hyphens',
  restrictions: [
    'No leading/trailing hyphens',
    'No consecutive hyphens',
    'No uppercase letters',
    'No spaces or special characters',
  ],
}
