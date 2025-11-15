# E2E Test Architecture

## Design Principles

This test suite follows **architectural best practices** for maintainability, scalability, and reliability.

### 1. Separation of Concerns

Three distinct layers with clear responsibilities:

```
┌─────────────────────────────────────────────────┐
│ Layer 1: TESTS (Specification Layer)            │
│ What to test, not how to test                   │
│ Business-focused, readable, intent-driven       │
└────────────────────┬────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────┐
│ Layer 2: PAGE OBJECTS (Interaction Layer)       │
│ How to interact with pages                      │
│ Encapsulate all UI interactions                 │
│ Built-in waits and error handling               │
└────────────────────┬────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────┐
│ Layer 3: LOCATORS (Definition Layer)            │
│ Where are elements on the page                  │
│ Centralized, reusable selectors                 │
│ Single source of truth for UI elements         │
└─────────────────────────────────────────────────┘
```

### 2. Maintainability Over Cleverness

```typescript
// BAD: Clever but fragile
const emailInput = page.locator('[class*="px-4"][class*="py-3"]')

// GOOD: Simple and stable
const emailInput = page.locator('id=email')
```

**Principle**: Simple, explicit, boring code is better than clever code.

### 3. Stability Over Speed

```typescript
// BAD: Fast but flaky
await page.click('button')
// (No wait - might click before button appears)

// GOOD: Slightly slower but stable
await expect(button).toBeVisible()
await button.click()
```

**Principle**: A test that passes 99% of the time is worthless. All tests must be reliable.

### 4. Reusability Over Duplication

```typescript
// BAD: Duplicated code across tests
test('test 1', () => {
  const email = page.locator('id=email')
  await email.fill('test@example.com')
  // ... more interactions
})

test('test 2', () => {
  const email = page.locator('id=email')
  await email.fill('test@example.com')
  // ... duplicated code
})

// GOOD: Reusable method in page object
await signupPage.fillEmail('test@example.com')
```

**Principle**: Extract common patterns into reusable methods.

### 5. User Perspective Over Technical Accuracy

```typescript
// BAD: Technical perspective
const passwordInput = page.locator('input[type="password"]')
const submitButton = page.locator('[class*="bg-blue"]')

// GOOD: User perspective
const signupPage = new SignupPage(page)
await signupPage.fillPassword('SecurePassword123')
await signupPage.submitForm()
```

**Principle**: Tests should read like user stories, not technical specifications.

## File Organization

```
tests/e2e/
├── locators/
│   └── signup.locators.ts
│       - SignupLocators: All selectors for signup page
│       - SlugValidationWaits: Wait strategies for async operations
│
├── pages/
│   └── signup.page.ts
│       - SignupPage: Encapsulates all signup interactions
│       - OnboardingPage: Represents post-signup page
│
├── fixtures/
│   ├── database.fixture.ts
│   │   - Database cleanup fixture
│   │   - Helper functions for DB assertions
│   │
│   └── api.fixture.ts
│       - API helper fixture
│       - Extends database fixture
│
├── helpers/
│   ├── test-data.helper.ts
│   │   - Unique test data generation
│   │   - Data validation
│   │   - Invalid data examples
│   │
│   └── api.helper.ts
│       - API call utilities
│       - Slug validation helpers
│       - Signup API helpers
│
├── specs/
│   └── tenant-creation.spec.ts
│       - Test scenarios (50+ tests)
│       - Organized by test category
│
├── snapshots/
│   └── [Visual regression snapshots]
│
├── playwright.config.ts
│   - Playwright configuration
│   - Browser engines, timeouts, reporters
│
└── tsconfig.json
    - TypeScript configuration for tests
```

## Layer Details

### Layer 1: Tests (Specification)

Tests are **specifications of user behavior**. They should:
- Be readable by non-technical stakeholders
- Focus on "what" not "how"
- Use business language
- Be organized by feature

```typescript
test.describe('Tenant Creation', () => {
  test('should successfully create tenant with valid data', async ({ page, dbCleanup }) => {
    // ARRANGE: Set up test data
    const testData = generateTestData()

    // ACT: Perform user actions
    const signupPage = new SignupPage(page)
    await signupPage.navigate()
    await signupPage.fillForm(testData)
    const onboardingPage = await signupPage.submitAndWaitForOnboarding()

    // ASSERT: Verify expected outcome
    expect(onboardingPage.getSlugFromUrl()).toBe(testData.slug)

    // CLEANUP: Clean up test data
    await dbCleanup({ tenantSlug: testData.slug })
  })
})
```

**Benefits:**
- Self-documenting
- Can serve as requirements
- Easy to understand intent
- Simple to maintain

### Layer 2: Page Objects (Interaction)

Page objects encapsulate **all interactions with a page**.

```typescript
export class SignupPage {
  constructor(private page: Page) {}

  // User actions
  async fillEmail(email: string) { /* ... */ }
  async fillPassword(password: string) { /* ... */ }
  async submitForm() { /* ... */ }

  // Queries
  async getFieldError(field: string) { /* ... */ }
  async isSubmitEnabled() { /* ... */ }

  // Navigation
  async navigate() { /* ... */ }
}
```

**Key Characteristics:**
1. **Encapsulation**: Page logic stays in page object
2. **Reusability**: Methods used across multiple tests
3. **Maintainability**: Single place to update when UI changes
4. **Built-in Waits**: Methods include appropriate wait strategies
5. **Error Handling**: Methods handle edge cases internally

**Anti-Patterns:**
```typescript
// AVOID: Directly querying in tests
const email = page.locator('id=email')
await email.fill('test@example.com')

// DO: Use page object methods
await signupPage.fillEmail('test@example.com')
```

### Layer 3: Locators (Definition)

Locators define **where elements are** on the page.

```typescript
export const SignupLocators = {
  emailField: {
    input: 'id=email',
    label: 'text=Email',
    errorMessage: (selector) => `${selector} ~ p[class*="text-red"]`,
  },
  // ... more selectors
} as const
```

**Selector Hierarchy (Best to Worst):**

1. **data-testid** (Most stable, explicit intent)
   ```typescript
   // Component should have: <input data-testid="email-input" />
   locator: 'data-testid=email-input'
   ```

2. **Role-based selectors** (Semantic, accessible)
   ```typescript
   // Accessible to assistive technology
   locator: 'role=textbox[name="Email"]'
   ```

3. **CSS selectors** (Less stable but acceptable)
   ```typescript
   locator: 'input[id="email"]'
   ```

4. **XPath** (Avoid unless absolutely necessary)
   ```typescript
   // AVOID: Too brittle
   locator: '//div[1]/form/input[1]'
   ```

## Design Patterns

### 1. Method Chaining

Page object methods return `this` for fluent API:

```typescript
// Chainable
await signupPage
  .fillEmail('test@example.com')
  .fillPassword('SecurePassword123')
  .fillBusinessName('My Store')
  .fillSlug('my-store')

// Also works individually
await signupPage.fillEmail('test@example.com')
```

### 2. Assertion-Free Page Objects

Page objects should not assert. Tests assert.

```typescript
// BAD: Page object with assertion
async fillEmail(email: string) {
  await this.page.locator('id=email').fill(email)
  await expect(this.page.locator('id=email')).toHaveValue(email)  // NO!
}

// GOOD: Page object without assertion
async fillEmail(email: string) {
  const emailInput = this.page.locator('id=email')
  await emailInput.fill(email)
  return this
}

// Test handles assertion
const value = await emailInput.inputValue()
expect(value).toBe(email)
```

### 3. Explicit Wait Strategies

Page object methods include appropriate waits:

```typescript
// Includes wait for slug validation (debounce + API call)
async fillSlug(slug: string) {
  await this.page.locator('id=slug').fill(slug)
  // Wait for debounce
  await this.page.waitForTimeout(600)
  // Wait for loading spinner to disappear
  await this.page.locator('[class*="animate-spin"]').waitFor({ state: 'hidden' })
  return this
}

// Test doesn't need to know about waits
await signupPage.fillSlug('my-store')  // Wait handled internally
```

### 4. Error Boundary Methods

Page object methods handle errors gracefully:

```typescript
// Handles error gracefully, doesn't throw
async getFieldError(field: string): Promise<string | null> {
  const errorElement = this.page.locator(`${field} ~ p[class*="text-red"]`)
  const isVisible = await errorElement.isVisible().catch(() => false)

  if (isVisible) {
    return await errorElement.textContent()
  }

  return null
}

// Test uses it safely
const error = await signupPage.getFieldError('email')
if (error) {
  // Handle error
}
```

## Test Data Management

### Strategy

1. **Generate unique data per test** (no collisions)
2. **Use timestamps** (guaranteed uniqueness)
3. **Clean up after each test** (prevent orphaned data)

```typescript
// Each test gets unique data
const testData = generateTestData()
// {
//   email: 'e2e-test-1700000000000@example.com',
//   slug: 'store-1700000000000',
//   ...
// }
```

### Benefits

- **Parallel Safe**: Tests can run simultaneously
- **Deterministic**: Same data format every time
- **Traceable**: Timestamp identifies test run
- **Cleanup**: Easy to find and delete test data

## Fixture Architecture

### Database Fixture

Provides automatic cleanup of test data:

```typescript
test('my test', async ({ page, dbCleanup }) => {
  const testData = generateTestData()

  // Test runs
  // ...

  // Queue cleanup
  await dbCleanup({ tenantSlug: testData.slug })
  // Cleanup runs after test completes
})
```

### API Fixture

Extends database fixture with API helpers:

```typescript
test('my test', async ({ page, apiHelper, dbCleanup }) => {
  // Can call API directly
  const isAvailable = await apiHelper.isSlugAvailable('my-store')

  // Can also cleanup like before
  await dbCleanup({ tenantSlug: 'my-store' })
})
```

## Error Handling

### Page Object Error Handling

```typescript
// Silent failure (returns null)
async getFieldError(field: string): Promise<string | null> {
  try {
    const errorElement = this.page.locator(selector)
    if (await errorElement.isVisible().catch(() => false)) {
      return await errorElement.textContent()
    }
  } catch (error) {
    console.warn('Error reading field error:', error)
  }
  return null
}

// Test decides what to do
const error = await signupPage.getFieldError('email')
if (error) {
  expect(error).toContain('invalid')
}
```

### Test Error Handling

```typescript
// Tests catch and handle API errors
test('handle signup error', async ({ page }) => {
  // Intercept API and fail it
  await page.route('**/api/signup', route => route.abort())

  const signupPage = new SignupPage(page)
  await signupPage.navigate()
  await signupPage.fillForm(testData)
  await signupPage.clickSubmit()

  // Should remain on signup page (not redirect)
  expect(page.url()).toContain('/signup')
})
```

## Performance Optimization

### 1. Efficient Selectors

```typescript
// FAST: Direct ID selector
locator: 'id=email'

// SLOW: Complex CSS path
locator: 'div.form > div:nth-child(1) > div > input'
```

### 2. Parallel Execution

```bash
# Run tests in parallel (4 workers)
npm run test:e2e

# Configure in playwright.config.ts
workers: process.env.CI ? 1 : 4
```

### 3. Reuse Browser Context

Playwright reuses browser contexts across tests:
- Faster than creating new browser per test
- Tests still isolated by default
- Shared resources (localStorage, cookies) cleared automatically

## Maintenance

### When UI Changes

1. **Identify affected locator**: Check which selector broke
2. **Update locator file**: Change selector in `signup.locators.ts`
3. **Verify page object methods**: Ensure methods still work
4. **Re-run tests**: Tests should pass with minimal changes

**Example:**
```typescript
// In signup.locators.ts: Change selector
export const SignupLocators = {
  emailField: {
    input: '[data-testid="email-input"]', // Updated selector
  },
}

// Page object and tests don't change!
await signupPage.fillEmail('test@example.com')  // Still works
```

### When Behavior Changes

1. **Update page object method**: Change interaction logic
2. **Update test expectations**: Adjust assertions
3. **Add new tests**: If new behavior added

**Example:**
```typescript
// Page object: Add new method for new feature
async uploadLogo(filePath: string) {
  await this.page.locator('input[type="file"]').setInputFiles(filePath)
  return this
}

// Test: Use new method
await signupPage.uploadLogo('/path/to/logo.png')
```

## Testing Best Practices

### 1. Arrange-Act-Assert Pattern

```typescript
test('test name', async ({ page, dbCleanup }) => {
  // ARRANGE: Set up test data
  const testData = generateTestData()

  // ACT: Perform user actions
  const signupPage = new SignupPage(page)
  await signupPage.navigate()
  await signupPage.fillForm(testData)

  // ASSERT: Verify expected outcome
  expect(await signupPage.isSubmitEnabled()).toBe(true)

  // CLEANUP: Clean up test data
  await dbCleanup({ tenantSlug: testData.slug })
})
```

### 2. One Scenario Per Test

```typescript
// GOOD: Single, focused scenario
test('should reject invalid email', async ({ page }) => {
  // Only tests email validation
})

// BAD: Multiple scenarios in one test
test('should validate form', async ({ page }) => {
  // Tests email, password, slug, business name...
  // If one fails, you don't know which
  // Can't rerun just one scenario
})
```

### 3. Meaningful Assertions

```typescript
// BAD: Vague assertion
expect(await signupPage.isSubmitEnabled()).toBe(false)

// GOOD: Clear expectation
expect(await signupPage.hasValidationError('email', 'Email invalido')).toBe(true)
// Clearly shows what should happen and why
```

### 4. Use Fixtures for Setup

```typescript
// Good: Fixture provides cleanup
test('my test', async ({ page, dbCleanup }) => {
  // Cleanup automatically provided
})

// Bad: Manual setup/teardown
test('my test', async ({ page }) => {
  // Have to remember to cleanup manually
})
```

## References

- [Page Object Model - Playwright](https://playwright.dev/docs/pom)
- [Test Fixtures - Playwright](https://playwright.dev/docs/test-fixtures)
- [Best Practices - Playwright](https://playwright.dev/docs/best-practices)
- [Locator Best Practices - Playwright](https://playwright.dev/docs/locators)
