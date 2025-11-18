# E2E Testing - Quick Start Guide

Get started with E2E tests in 5 minutes.

## Prerequisites

- Node.js 18+
- Supabase project running (local or cloud)
- Next.js dev server working (`npm run dev`)

## 1. Install Playwright (1 minute)

```bash
npm install
npx playwright install chromium  # Install only Chromium (faster)
```

## 2. Configure Environment (2 minutes)

Copy example and fill in your Supabase credentials:

```bash
cp .env.e2e.example .env.local
```

Edit `.env.local`:
```bash
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get credentials from Supabase dashboard:
- URL: Project Settings > API
- Keys: Project Settings > API > Key

## 3. Run Tests (2 minutes)

```bash
# Make sure dev server is running
npm run dev

# In a new terminal, run tests
npm run test:e2e:ui  # Recommended: visual UI mode
```

The Playwright Inspector UI will open. Click on tests to run them.

## Available Commands

```bash
# Run all tests (headless)
npm run test:e2e

# Run with visual UI (recommended for development)
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# Debug mode (step through code)
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

## Quick Examples

### Run Specific Test

```bash
npx playwright test tenant-creation -g "should successfully create"
```

### Run Single Browser

```bash
npx playwright test --project=chromium
```

### Run with Slow Motion (See What's Happening)

```bash
npx playwright test --headed --slow-mo=1000
```

## Troubleshooting

### Can't Connect to Dev Server

Make sure dev server is running:
```bash
npm run dev
# Should be running on http://localhost:3000
```

### Missing Environment Variables

Check `.env` has all required variables:
```bash
cat .env
# Should show:
# PLAYWRIGHT_TEST_BASE_URL=...
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
```

### Tests Hang or Timeout

1. Check dev server is running
2. Check network connectivity to Supabase
3. Increase timeout: Edit `playwright.config.ts` line 12
   ```typescript
   timeout: 30 * 1000 // 30 seconds instead of 20
   ```

### "Slug already taken" Error

Tests left orphaned data. Reset database:
```bash
npm run db:reset
```

## Test Structure

All tests are in `/tests/e2e/specs/tenant-creation.spec.ts`

Tests organized by category:
- Happy Path (successful signup)
- Email Validation
- Password Validation
- Slug Validation
- Error Handling
- Integration Tests

Each test:
1. Generates unique test data
2. Runs test scenario
3. Automatically cleans up database

## Key Test Methods

```typescript
const signupPage = new SignupPage(page)

// Navigation
await signupPage.navigate()

// Fill form
await signupPage.fillEmail('test@example.com')
await signupPage.fillPassword('SecurePassword123')
await signupPage.fillBusinessName('My Store')
await signupPage.fillSlug('my-store')

// Check state
await signupPage.getFieldErrorMessage('email')
await signupPage.isSubmitButtonEnabled()
await signupPage.getSlugAvailabilityStatus()

// Submit
await signupPage.submitAndWaitForOnboarding()
```

## Adding New Tests

1. Open `/tests/e2e/specs/tenant-creation.spec.ts`
2. Add new test at end of file:

```typescript
test('my new test scenario', async ({ page, dbCleanup }) => {
  // Generate unique test data
  const testData = generateTestData()

  // Navigate and interact
  const signupPage = new SignupPage(page)
  await signupPage.navigate()
  await signupPage.fillEmail(testData.email)

  // Verify something
  expect(await signupPage.isSubmitButtonEnabled()).toBe(true)

  // Clean up
  await dbCleanup({ tenantSlug: testData.slug })
})
```

3. Run test:
```bash
npm run test:e2e:ui
```

## Documentation

For more details, see:

- **README.md**: Complete usage guide
- **ARCHITECTURE.md**: Design patterns and principles
- **DATABASE_STRATEGY.md**: Cleanup strategy
- **E2E_TEST_SUMMARY.md**: Implementation summary

## Next Steps

1. Run tests with `npm run test:e2e:ui`
2. Click on a test to see it execute
3. Add your own test following the pattern
4. Check README.md for advanced usage

## Getting Help

1. Check inline test comments (heavily documented)
2. Review page object methods in `/tests/e2e/pages/signup.page.ts`
3. Read ARCHITECTURE.md for design patterns
4. Check README.md troubleshooting section

## Performance Tips

- Use UI mode during development (faster feedback)
- Use headless mode in CI/CD
- Run tests in parallel by default (4 workers)
- Tests typically complete in 2-3 minutes

## What's Tested

✅ Email validation
✅ Password validation
✅ Slug availability validation (real-time)
✅ Business name validation
✅ Successful signup and redirect
✅ Error handling
✅ Database cleanup

---

**That's it! You're ready to write and run E2E tests.**

Start with `npm run test:e2e:ui` and explore from there.
