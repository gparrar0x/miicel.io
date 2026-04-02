# tests/e2e/CLAUDE.md

> E2E testing conventions (Playwright)
> Updated: 2026-04-01

---

## 3-Tier Architecture

```
specs/*.spec.ts        → Business scenarios ("what to test")
pages/*.page.ts        → Page objects with user actions
locators/*.locators.ts → Selector definitions (single source of truth)
```

**Strict separation**: Specs never reference selectors directly. Pages never define selectors. Locators never contain logic.

## Tier Rules

### Specs
- Business-focused language, no raw selectors
- Use `test.describe()` for feature grouping
- Call `generateTestData()` for parallel-safe unique data
- **Mandatory**: `dbCleanup({ tenantSlug, userEmail })` after tenant/user creation tests

### Page Objects
- Methods named after user actions: `fillEmail()`, `clickSubmit()` (not `verifySuccess()`)
- Return `this` for chaining or return new page object for navigation
- Built-in waits inside methods
- Example: `SignupPage.submitAndWaitForOnboarding()` returns `OnboardingPage`

### Locators
- Pure data-testid selectors
- Wildcard matching: `'[data-testid^="product-size-"]'` for dynamic IDs
- Flat objects with nested namespaces: `CheckoutLocators.modal.container`
- Include API route patterns: `api.createPreferenceEndpoint: '**/api/checkout/create-preference'`

## Fixtures & Helpers

- `database.fixture.ts` — Extends Playwright test with `dbCleanup`. Uses service role (bypasses RLS). Cleanup runs AFTER test even on failure. Cascade: delete tenant → related records auto-deleted via FK.
- `test-data.helper.ts` — `generateTestData(baseSlug)` creates unique email/slug/password using `Date.now()`. `validateTestData()` checks password requirements.

## Playwright Config

| Setting | Local | CI |
|---------|-------|----|
| Workers | 4 | 1 (serial) |
| Retries | 0 | 2 |
| Test timeout | 60s | 60s |
| Action timeout | 15s | 15s |

Projects: `local` (localhost:3001), `production` (micelio.vercel.app), `mercadopago-sandbox`

## Gotchas

- **Slug validation wait**: 600ms (500ms debounce + 100ms buffer) before checking visual state
- **PGRST116**: Service role cleanup returns this code when record already deleted — it's expected
- **Conditional visibility**: Check optional fields before interacting:
  ```typescript
  if (await input.isVisible({ timeout: 2000 }).catch(() => false)) { ... }
  ```
- **Artifacts**: Screenshots/videos/traces captured only on failure

## Naming

- Spec: `{feature}-{scenario}.spec.ts` (e.g., `checkout-flow.spec.ts`)
- Page: `{feature}.page.ts`
- Locators: `{feature}.locators.ts`
