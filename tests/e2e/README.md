# E2E Testing - sw_commerce_saas

Complete end-to-end test suite for tenant creation flow using Playwright.

## Architecture Overview

This test suite follows a **strict 3-tier separation of concerns**:

```
┌─────────────────────────────────────────────────────────────┐
│  TESTS (specs/*.spec.ts)                                    │
│  High-level test scenarios, business-focused                │
│  "What to test" - not "how to test"                         │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  PAGE OBJECTS (pages/*.page.ts)                             │
│  Encapsulates all page interactions                         │
│  Reusable methods for user actions                          │
│  Built-in wait strategies and validations                  │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  LOCATORS (locators/*.locators.ts)                          │
│  Centralized selector definitions                          │
│  Single source of truth for UI elements                    │
│  Easy to update when UI changes                            │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
tests/e2e/
├── locators/
│   └── signup.locators.ts          # Signup page element selectors
├── pages/
│   └── signup.page.ts              # Signup page object with methods
├── fixtures/
│   └── database.fixture.ts         # Database cleanup fixture
├── helpers/
│   └── test-data.helper.ts         # Test data generation utilities
├── specs/
│   └── tenant-creation.spec.ts     # Test scenarios (50+ tests)
├── snapshots/                      # Visual regression snapshots
├── playwright.config.ts            # Playwright configuration
└── README.md                       # This file
```

## Test Coverage

**Total Tests: 50+**

### Happy Path (4 tests)
- Successful tenant creation with valid data
- Slug availability validation in real-time
- Correct redirect to onboarding
- Automatic user sign-in

### Email Validation (2 tests)
- Invalid email format rejection
- Parameterized tests for multiple invalid emails

### Password Validation (5 tests)
- Too short password rejection
- Missing uppercase letter rejection
- Missing lowercase letter rejection
- Missing number rejection
- Password visibility toggle

### Slug Validation (6 tests)
- Too short slug rejection
- Uppercase letters rejection
- Invalid characters rejection
- Slug already taken indication
- Parameterized tests for multiple invalid slugs
- Real-time availability check

### Business Name Validation (1 test)
- Too short business name rejection

### Error Handling (2 tests)
- Network error during slug validation
- API error on signup submission

### Integration Tests (2 tests)
- Complete signup flow with all valid data
- Success message display

### Database Cleanup (1 test)
- Proper cleanup of test data after completion

## Setup

### Prerequisites

- Node.js 18+
- Supabase project (local or cloud)
- Next.js 16 development server

### Environment Variables

Required environment variables in `.env.local`:

```bash
# Playwright Test Configuration
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000

# Supabase (same as app)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Installation

```bash
# Install Playwright and dependencies
npm install

# Install Playwright browsers
npx playwright install

# (Optional) Install only Chromium for faster setup
npx playwright install chromium
```

## Running Tests

### Run All Tests
```bash
npm run test:e2e
```

### Run Tests in UI Mode (Recommended for Development)
```bash
npm run test:e2e:ui
```

The UI mode provides:
- Visual test execution
- Step-by-step debugging
- Locator picker tool
- Screenshots and videos
- Test timeline

### Run Tests Headed (See Browser)
```bash
npm run test:e2e:headed
```

### Run Specific Test File
```bash
npx playwright test tests/e2e/specs/tenant-creation.spec.ts
```

### Run Specific Test Pattern
```bash
npx playwright test -g "should successfully create tenant"
```

### Run Single Test
```bash
npx playwright test tests/e2e/specs/tenant-creation.spec.ts -g "should successfully create tenant with valid data"
```

### Run in Debug Mode
```bash
npx playwright test --debug
```

### Run in Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Database Cleanup Strategy

**CRITICAL**: Each test automatically cleans up its database records to prevent orphaned data.

### How It Works

1. **Fixture-based cleanup**: Tests use the `dbCleanup` fixture
   ```typescript
   test('my test', async ({ page, dbCleanup }) => {
     // Test runs
     await dbCleanup({ tenantSlug: 'store-123', userEmail: 'test@example.com' })
   })
   ```

2. **Automatic execution**: Cleanup runs after test completes (even if it fails)

3. **Cascade deletion**:
   - Deletes tenant by slug
   - Cascade deletes related records from PostgreSQL
   - Deletes auth user from Supabase Auth

4. **Service role bypass**: Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass Row Level Security

### Manual Cleanup (If Needed)

If tests leave orphaned records:

```bash
# Full database reset (use carefully!)
npm run db:reset

# Alternative: Manual cleanup via Supabase CLI
supabase db execute "DELETE FROM tenants WHERE slug LIKE 'store-%'"
```

## Understanding the Page Object Pattern

### Example: Filling Signup Form

**Bad (no page object):**
```typescript
// Too much implementation detail in test
const emailInput = page.locator('id=email')
await emailInput.fill('test@example.com')
await emailInput.blur()

const passwordInput = page.locator('id=password')
await passwordInput.fill('TestPassword123!')
await passwordInput.blur()

// ... repeat for 20+ interactions
```

**Good (with page object):**
```typescript
// Clean, readable, maintainable
const signupPage = new SignupPage(page)
await signupPage.fillEmail('test@example.com')
await signupPage.fillPassword('TestPassword123!')
```

### Benefits

1. **Reusability**: Methods used across many tests
2. **Maintainability**: Change UI? Only update page object
3. **Reliability**: Built-in waits and error handling
4. **Readability**: Tests focus on what, not how
5. **Scalability**: Easy to add new methods

## Common Patterns

### Filling and Submitting a Form

```typescript
test('create tenant', async ({ page, dbCleanup }) => {
  const testData = generateTestData()

  const signupPage = new SignupPage(page)
  await signupPage.navigate()
  await signupPage.fillForm(testData)

  const onboardingPage = await signupPage.submitAndWaitForOnboarding()

  expect(onboardingPage.getSlugFromUrl()).toBe(testData.slug)

  await dbCleanup({ tenantSlug: testData.slug, userEmail: testData.email })
})
```

### Testing Field Validation

```typescript
test('reject invalid email', async ({ page }) => {
  const signupPage = new SignupPage(page)
  await signupPage.navigate()
  await signupPage.fillEmail('not-an-email')

  // Option 1: Check error message
  const hasError = await signupPage.hasValidationError('email', 'Email invalido')
  expect(hasError).toBe(true)

  // Option 2: Check button disabled
  expect(await signupPage.isSubmitButtonDisabled()).toBe(true)
})
```

### Testing Real-time Validation

```typescript
test('validate slug availability', async ({ page }) => {
  const testData = generateTestData()

  const signupPage = new SignupPage(page)
  await signupPage.navigate()

  // fillSlug waits for validation to complete
  await signupPage.fillSlug(testData.slug, true) // true = expect available

  const status = await signupPage.getSlugAvailabilityStatus()
  expect(status).toBe('available')
})
```

## Debugging Tests

### View Test Execution

```bash
# UI mode - visual debugging
npm run test:e2e:ui

# Headed mode - see browser
npm run test:e2e:headed

# Debug mode - step through code
npx playwright test --debug
```

### Check Artifacts on Failure

After test failure, check:

```
playwright-report/        # HTML report with videos/screenshots
test-results.json         # JSON results for CI/CD
junit.xml                 # JUnit format for CI/CD
```

### View Test Report

```bash
npx playwright show-report
```

### Debug Network Requests

Tests automatically capture network requests. View in report:

```bash
npx playwright show-report
# Click failing test > Network tab
```

### Use Locator Picker in UI Mode

```bash
npm run test:e2e:ui
# Click "Pick locator" button
# Click element on page to see selector
```

## Maintenance Guide

### When UI Changes

1. **Locator breaks?** Update `tests/e2e/locators/signup.locators.ts`
2. **Method breaks?** Update `tests/e2e/pages/signup.page.ts`
3. **Tests auto-pass?** Check page object returned correct state

### Adding New Tests

1. Create test in `tests/e2e/specs/tenant-creation.spec.ts`
2. Use existing page object methods
3. Always use `generateTestData()` for unique data
4. Always call `dbCleanup()` for tenant/user cleanup

```typescript
test('my new test scenario', async ({ page, dbCleanup }) => {
  const testData = generateTestData()

  const signupPage = new SignupPage(page)
  await signupPage.navigate()
  // ... test steps ...

  await dbCleanup({ tenantSlug: testData.slug, userEmail: testData.email })
})
```

### Adding New Page Methods

1. Update `tests/e2e/pages/signup.page.ts`
2. Extract locators to `tests/e2e/locators/signup.locators.ts` (don't hardcode selectors)
3. Include proper waits and error handling
4. Document method with JSDoc

```typescript
/**
 * Description of what this method does
 *
 * @param param1 - Description
 * @returns Description of return value
 */
async myNewMethod(param1: string) {
  // Implementation
  return this // for method chaining
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres
        env:
          POSTGRES_PASSWORD: postgres

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - run: npm ci
      - run: npx playwright install --with-deps

      - run: npm run dev &
      - run: npx wait-on http://localhost:3000

      - run: npm run test:e2e

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Performance Tips

### Optimize Test Execution

1. **Run in parallel** (default - 4 workers)
   ```bash
   npx playwright test --workers=4
   ```

2. **Run single browser** (faster setup)
   ```bash
   npx playwright test --project=chromium
   ```

3. **Use headed=false** (headless is faster)
   ```bash
   npm run test:e2e  # Default is headless
   ```

### Optimize CI/CD

1. **Reuse servers**: `reuseExistingServer: true` in config
2. **No retries locally**: Disable retries for dev (`retries: 0`)
3. **Retries only in CI**: Enable retries for flakiness in CI

## Troubleshooting

### Tests Timeout

**Problem**: Tests timing out on slow network

**Solution**:
```typescript
// Increase timeout in playwright.config.ts
timeout: 30 * 1000, // 30 seconds instead of 20
```

### Database Not Cleaning Up

**Problem**: Tests fail with "slug already taken"

**Solution**:
```bash
# Reset database (careful!)
npm run db:reset

# Or manually delete orphaned records
# Check database for leftover tenants
```

### Port Already in Use

**Problem**: "Cannot start dev server on port 3000"

**Solution**:
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or specify different port
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3001 npm run test:e2e
```

### Flaky Tests (Intermittent Failures)

**Problem**: Tests pass sometimes, fail other times

**Solution**: Add explicit waits to page object:
```typescript
// Instead of relying on implicit waits
await this.page.waitForLoadState('networkidle')
await expect(element).toBeVisible({ timeout: 5000 })
```

## Best Practices

1. **Use page objects**: Never query selectors directly in tests
2. **Use locators layer**: Never hardcode selectors in page objects
3. **Generate unique data**: Always use `generateTestData()` for parallel safety
4. **Cleanup after tests**: Always call `dbCleanup()`
5. **Focus on user perspective**: Write tests like a user, not a developer
6. **Add proper waits**: Don't use arbitrary `waitForTimeout()`
7. **Document complex flows**: Use JSDoc comments
8. **Keep tests focused**: One scenario per test
9. **Use meaningful assertions**: Make failure messages clear
10. **Review flaky tests**: Investigate and fix, don't just retry

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [Page Objects Pattern](https://playwright.dev/docs/pom)
- [Fixtures](https://playwright.dev/docs/test-fixtures)

## Questions?

For issues or questions about the E2E test suite:

1. Check the test comments (tests are heavily documented)
2. Review the page object methods and their JSDoc
3. Check the Playwright documentation
4. Review test results in `playwright-report/`
