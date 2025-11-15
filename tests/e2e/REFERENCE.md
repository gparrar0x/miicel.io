# E2E Test Reference Guide

Quick reference for commonly used page object methods and selectors.

## Page Object Methods

### SignupPage

#### Navigation
```typescript
await signupPage.navigate()                    // Go to /signup
await signupPage.verifyPageLoaded()           // Assert all fields visible
```

#### Form Filling
```typescript
await signupPage.fillEmail(email)             // Fill email field
await signupPage.fillPassword(password)       // Fill password field
await signupPage.fillBusinessName(name)       // Fill business name
await signupPage.fillSlug(slug, expectAvailable) // Fill slug (waits for validation)
await signupPage.fillForm(data, expectAvailable) // Fill entire form
```

#### Form Submission
```typescript
await signupPage.clickSubmit()                // Click submit button
await signupPage.submitAndWaitForOnboarding() // Submit and wait for redirect
await signupPage.submitAndExpectError(text)   // Submit and expect error
```

#### Form State Queries
```typescript
await signupPage.isSubmitButtonEnabled()      // Is submit enabled?
await signupPage.isSubmitButtonDisabled()     // Is submit disabled?
await signupPage.isPasswordVisible()          // Is password shown?
await signupPage.getSlugAvailabilityStatus()  // 'available' | 'taken' | 'checking'
```

#### Validation Checks
```typescript
await signupPage.getFieldErrorMessage(field)  // Get error for field
await signupPage.hasValidationError(field, msg) // Check if error contains text
```

#### Password
```typescript
await signupPage.togglePasswordVisibility()   // Toggle password show/hide
```

#### Notifications
```typescript
await signupPage.waitForToast(message, 'success') // Wait for success toast
```

#### URL
```typescript
signupPage.getCurrentUrl()                    // Get current page URL
```

### OnboardingPage

```typescript
await onboardingPage.waitForPageLoad()        // Assert page loaded
onboardingPage.getSlugFromUrl()               // Extract slug from URL
```

## Test Data Helpers

### Generate Test Data
```typescript
// Generate unique test data
const testData = generateTestData()
// {
//   email: 'e2e-test-1700000000000@example.com',
//   password: 'TestPassword123!',
//   businessName: 'Test Business 1700000000000',
//   slug: 'store-1700000000000',
//   timestamp: 1700000000000
// }

// Generate with custom base slug
const testData = generateTestData('my-custom-slug')

// Generate with overrides
const testData = generateTestDataWithOverrides({
  email: 'custom@example.com',
  slug: 'custom-slug'
})
```

### Validate Test Data
```typescript
const validation = validateTestData(testData)
if (!validation.valid) {
  console.error(validation.errors) // Array of error messages
}
```

### Invalid Test Data Examples
```typescript
// Invalid emails to test
InvalidTestData.invalidEmails
// ['notanemail', 'missing@domain', '@nodomain.com', ...]

// Weak passwords to test
InvalidTestData.weakPasswords
// ['short', 'nouppercase123', 'NOLOWERCASE123', ...]

// Invalid slugs to test
InvalidTestData.invalidSlugs
// ['ab', 'UPPERCASE', 'slug_underscore', ...]

// Invalid business names
InvalidTestData.invalidBusinessNames
// ['', 'a']
```

## Locators Reference

### Email Field
```typescript
SignupLocators.emailField.input          // id=email
SignupLocators.emailField.label          // text=Email
```

### Password Field
```typescript
SignupLocators.passwordField.input       // id=password
SignupLocators.passwordField.label       // text=Contrasena
SignupLocators.passwordField.toggleButton // Eye/EyeOff button
```

### Business Name Field
```typescript
SignupLocators.businessNameField.input   // id=businessName
SignupLocators.businessNameField.label   // text=Nombre del Negocio
```

### Slug Field
```typescript
SignupLocators.slugField.input           // id=slug
SignupLocators.slugField.label           // text=URL de tu tienda
SignupLocators.slugField.checkIcon       // Green checkmark
SignupLocators.slugField.xIcon           // Red X
SignupLocators.slugField.loadingSpinner  // Spinning loader
SignupLocators.slugField.unavailableMessage // Unavailable text
```

### Submit Button
```typescript
SignupLocators.submitButton.button       // Submit button element
SignupLocators.submitButton.loadingText  // "Creando cuenta..." text
```

### Page Level
```typescript
SignupLocators.page.heading              // "Crea tu tienda"
SignupLocators.page.subtitle             // "Comienza a vender en minutos"
```

## Database Cleanup

### Basic Cleanup
```typescript
await dbCleanup({ tenantSlug: 'store-123' })
await dbCleanup({ userEmail: 'test@example.com' })
await dbCleanup({ userId: 'uuid-here' })
```

### Multiple Cleanups
```typescript
await dbCleanup({ tenantSlug: data1.slug })
await dbCleanup({ tenantSlug: data2.slug })
// Both run after test completes
```

### Verify State
```typescript
import { verifyTenantExists, verifyTenantDeleted } from '../fixtures/database.fixture'

const exists = await verifyTenantExists('store-123')
const deleted = await verifyTenantDeleted('store-123')
```

## API Helpers

### Slug Validation
```typescript
const isAvailable = await apiHelper.isSlugAvailable('my-store')
const wasAvailable = await apiHelper.waitForSlugAvailable('my-store', 10, 500)

const result = await apiHelper.validateSlug('my-store')
// { available: boolean, suggestion?: string, error?: string }
```

### Signup
```typescript
const result = await apiHelper.signup({
  email: 'test@example.com',
  password: 'TestPassword123!',
  businessName: 'My Store',
  slug: 'my-store'
})
// { userId: string, tenantSlug: string, error?: string }
```

## Common Test Patterns

### Happy Path Test
```typescript
test('successful signup', async ({ page, dbCleanup }) => {
  const testData = generateTestData()

  const signupPage = new SignupPage(page)
  await signupPage.navigate()
  await signupPage.fillForm(testData)

  const onboardingPage = await signupPage.submitAndWaitForOnboarding()

  expect(onboardingPage.getSlugFromUrl()).toBe(testData.slug)

  await dbCleanup({ tenantSlug: testData.slug })
})
```

### Validation Test
```typescript
test('reject invalid email', async ({ page }) => {
  const signupPage = new SignupPage(page)
  await signupPage.navigate()
  await signupPage.fillEmail('invalid-email')

  expect(await signupPage.hasValidationError('email', 'Email invalido')).toBe(true)
})
```

### Real-time Validation Test
```typescript
test('check slug availability', async ({ page, dbCleanup }) => {
  const testData = generateTestData()

  const signupPage = new SignupPage(page)
  await signupPage.navigate()
  await signupPage.fillSlug(testData.slug, true)

  expect(await signupPage.getSlugAvailabilityStatus()).toBe('available')

  await dbCleanup({ tenantSlug: testData.slug })
})
```

### Error Handling Test
```typescript
test('handle API error', async ({ page }) => {
  const testData = generateTestData()

  await page.route('**/api/signup', route => route.abort())

  const signupPage = new SignupPage(page)
  await signupPage.navigate()
  await signupPage.fillForm(testData)
  await signupPage.clickSubmit()

  expect(page.url()).toContain('/signup')
})
```

### Parameterized Test
```typescript
test.each(InvalidTestData.invalidEmails)('reject email: %s', async ({ page }, email) => {
  const signupPage = new SignupPage(page)
  await signupPage.navigate()
  await signupPage.fillEmail(email)

  expect(await signupPage.isSubmitButtonDisabled()).toBe(true)
})
```

## Assertion Examples

### URL Assertions
```typescript
expect(page.url()).toContain('/signup')
expect(page.url()).toMatch(/\/signup\/.*\/onboarding/)
await expect(page).toHaveURL('http://localhost:3000/signup')
```

### Element Assertions
```typescript
await expect(element).toBeVisible()
await expect(element).toBeHidden()
await expect(element).toBeEnabled()
await expect(element).toBeDisabled()
await expect(element).toHaveValue('expected value')
await expect(element).toHaveText('expected text')
```

### Text Assertions
```typescript
expect(text).toContain('substring')
expect(text).toMatch(/regex/)
expect(text).toBe('exact match')
```

### Boolean Assertions
```typescript
expect(bool).toBe(true)
expect(bool).toBe(false)
expect(array).toContain('item')
expect(array.length).toBe(5)
```

## Wait Strategies

### Wait for Element
```typescript
await expect(element).toBeVisible()
await expect(element).toBeVisible({ timeout: 5000 })
```

### Wait for Text
```typescript
await page.waitForFunction(() => {
  return page.locator('text=Success').isVisible()
})
```

### Wait for Navigation
```typescript
await page.waitForURL('/signup')
await page.waitForURL(/\/signup\/.*\/onboarding/)
```

### Wait for Network
```typescript
await page.waitForLoadState('networkidle')
await page.waitForLoadState('domcontentloaded')
```

### Wait for Timeout
```typescript
await page.waitForTimeout(1000) // Wait 1 second
```

## Debugging

### Log Information
```typescript
console.log('Page URL:', page.url())
console.log('Form data:', testData)
console.log('Element visible:', await element.isVisible())
```

### Screenshots
```typescript
await page.screenshot({ path: 'debug.png' })
```

### Inspector
```typescript
await page.pause() // Pauses test, opens inspector
```

### Trace
Tests automatically capture traces on failure (viewable in report).

## Commands Reference

```bash
# Run tests
npm run test:e2e                    # Run all tests
npm run test:e2e:ui                # Run with UI
npm run test:e2e:headed            # Run with visible browser
npm run test:e2e:debug             # Debug mode
npm run test:e2e:report            # View last report

# Run specific tests
npx playwright test -g "keyword"   # Run tests matching pattern
npx playwright test file.spec.ts   # Run specific file
npx playwright test --project=chromium  # Run specific browser

# Other
npm run db:reset                   # Reset database
npm run dev                        # Start dev server
npm run build                      # Build app
```

## Environment Variables

```bash
# Required for E2E tests
PLAYWRIGHT_TEST_BASE_URL           # Where tests connect to (default: http://localhost:3000)
NEXT_PUBLIC_SUPABASE_URL           # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY      # Supabase public key
SUPABASE_SERVICE_ROLE_KEY          # Supabase admin key for cleanup
```

## File Locations

```
playwright.config.ts               # Playwright configuration
tests/e2e/
  ├── locators/signup.locators.ts  # Selectors
  ├── pages/signup.page.ts         # Page object
  ├── fixtures/
  │   ├── database.fixture.ts      # DB cleanup fixture
  │   └── api.fixture.ts           # API fixture
  ├── helpers/
  │   ├── test-data.helper.ts      # Data generation
  │   └── api.helper.ts            # API utilities
  ├── specs/
  │   └── tenant-creation.spec.ts  # Tests (50+ cases)
  ├── README.md                    # Full documentation
  ├── ARCHITECTURE.md              # Design patterns
  ├── DATABASE_STRATEGY.md         # Cleanup strategy
  └── tsconfig.json               # TypeScript config
```

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Tests timeout | Increase `timeout` in `playwright.config.ts` |
| "Slug already taken" | Run `npm run db:reset` to cleanup orphaned data |
| Can't find element | Check locator in `signup.locators.ts` |
| Port already in use | Kill process on 3000: `lsof -i :3000 \| xargs kill -9` |
| Tests flaky | Add explicit waits: `await expect(el).toBeVisible()` |
| Module not found | Run `npm install` and ensure paths in `tsconfig.json` correct |

## Need More Help?

1. **Quick questions**: Check README.md or ARCHITECTURE.md
2. **How-to guides**: See test examples in `tenant-creation.spec.ts`
3. **Understanding cleanup**: Read DATABASE_STRATEGY.md
4. **Design patterns**: Read ARCHITECTURE.md
5. **API reference**: Check Playwright docs at https://playwright.dev

---

**Most common use case:**
```bash
npm run test:e2e:ui
# Then click on a test to see it run visually
```
