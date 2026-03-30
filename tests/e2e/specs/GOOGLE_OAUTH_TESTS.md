# Google OAuth Login E2E Tests

## Test Files Created

- `tests/e2e/specs/google-oauth-login.spec.ts` — Main test suite (13 tests)
- `tests/e2e/pages/login.page.ts` — Page object for login interactions
- `tests/e2e/locators/login.locators.ts` — Selector definitions

## Test Coverage

### 1. UI Presence (3 tests)
- Google Sign-In button visible on login page
- "Or" divider visible between email form and OAuth button
- Button has correct text

### 2. Error Handling (4 tests)
- `?error=no_account` displays error message
- `?error=auth_failed` displays error message
- `?error=missing_code` displays error message
- No error when no params present

### 3. Click Behavior (1 test)
- Button becomes disabled during loading state

### 4. Callback Route API (2 tests)
- GET `/api/auth/callback` without `code` → redirects to `?error=missing_code`
- GET `/api/auth/callback` with invalid `code` → redirects to `?error=auth_failed`

### 5. Layout & Form Integration (2 tests)
- Email form positioned above Google button
- Button maintains form width

### 6. Accessibility (2 tests)
- Button has proper role and is keyboard-focusable
- Error message has `role="alert"`

## Running Tests Locally

```bash
# Run against local dev server
npm run test:e2e:local -- tests/e2e/specs/google-oauth-login.spec.ts

# With UI mode (interactive browser)
npm run test:e2e:ui -- tests/e2e/specs/google-oauth-login.spec.ts

# Visible browser (headed mode)
npm run test:e2e:headed -- tests/e2e/specs/google-oauth-login.spec.ts

# Single test by name
npx playwright test -g "should display Google Sign-In button"

# Debug mode (step through)
npx playwright test --debug tests/e2e/specs/google-oauth-login.spec.ts
```

## Running in CI

```bash
# Full headless run
CI=true npm run test:e2e -- tests/e2e/specs/google-oauth-login.spec.ts

# Against production (only runs on deployed feature)
npm run test:e2e -- tests/e2e/specs/google-oauth-login.spec.ts --project=production
```

## Architecture

### 3-Tier Pattern

```
specs/google-oauth-login.spec.ts
  ↓ uses
pages/login.page.ts (LoginPage)
  ↓ uses
locators/login.locators.ts (LoginLocators)
  ↓ references
<html data-testid="...">
```

### Key Methods (LoginPage)

- `navigate(queryParams?)` — Go to /login with optional query params
- `verifyPageLoaded()` — Assert form is ready
- `verifyGoogleButtonVisible()` — Assert button visible
- `verifyOrDividerVisible()` — Assert divider visible
- `verifyOAuthError(message)` — Assert error message displayed
- `clickGoogleSignIn()` — Click button (won't complete real OAuth)
- `isGoogleButtonDisabled()` — Check loading state

## Notes

- Real Google OAuth flow cannot be completed in E2E (requires Google interaction)
- Tests focus on what can be validated: UI, error handling, API redirects
- data-testid contract matches Pixel's implementation
- All selectors use `data-testid` (no brittle CSS selectors)
- Database fixtures use `dbCleanup()` for tenant cleanup (not needed for login tests)

## Test Results

Running against local dev server: ✓ All tests pass
Running against production: ✗ Feature not deployed yet (expected, safe to skip)

## Debugging Failed Tests

If tests fail:

1. **Check Locators** — verify `data-testid` values match implementation
2. **Check i18n** — error messages depend on translation keys
3. **Check baseURL** — ensure correct environment is being tested
4. **Check Supabase** — auth config must be present in env vars

Example: If `login-error-no-account` not found, check that the data-testid exists in `app/[locale]/login/page.tsx`

## Next Steps

1. Verify tests pass against staging environment once deployed
2. Add to CI pipeline for continuous validation
3. Consider adding a test for actual Google OAuth callback (requires mocked Google OAuth provider)
