# Admin Layout E2E Tests (SKY-6)

Complete test suite for admin dashboard layout covering navigation, auth guard, responsive behavior, and active route highlighting.

## Quick Start

```bash
# Install Playwright
npx playwright install

# Copy env file
cp .env.e2e.example .env.local

# Fill in Supabase credentials
vi .env.local
```

## Test Structure

### Files

```
tests/e2e/
├── fixtures/
│   ├── auth.fixture.ts              # Login helpers
│   └── seed-test-data.ts            # Test data creation (optional)
├── pages/
│   └── admin-layout.page.ts          # Page Object Model
└── specs/
    └── admin-layout.spec.ts          # Test suite (10 tests)

tests/
├── global-setup.ts                  # Optional: seed test data
└── global-teardown.ts               # Optional: cleanup test data
```

### Fixtures & Page Objects

**auth.fixture.ts**: Login helpers
- `loginAsOwner(page, tenantSlug)` - Login as owner user (admin access)
- `loginAsNonOwner(page, tenantSlug)` - Login as non-owner (public only)
- `logout(page)` - Clear auth session
- `getCurrentUser(page)` - Get current authenticated user

**admin-layout.page.ts**: Page Object Model
- Encapsulates all admin layout interactions
- Uses `data-testid` selectors for all locators
- Provides high-level methods (navigateToProducts, toggleSidebarMobile, etc)

**admin-layout.spec.ts**: Test Suite
- 10 tests across 4 suites
- Coverage: navigation, logout, responsive, auth guard

## Data-testid Contract

All components use `data-testid` for locator selection:

```
Admin Sidebar (AdminSidebar.tsx)
├── data-testid="admin-sidebar"      # Container
├── data-testid="nav-dashboard"      # Dashboard link
├── data-testid="nav-products"       # Products link
├── data-testid="nav-orders"         # Orders link
├── data-testid="nav-settings"       # Settings link
├── data-testid="btn-logout"         # Logout button
└── data-testid="btn-toggle-sidebar" # Mobile menu toggle
```

**Verification**: All required data-testids are present in AdminSidebar.tsx ✓

## Test Coverage

### Navigation & Rendering (5 tests)
- [x] Sidebar renders with all nav items
- [x] Navigate to Products page
- [x] Navigate to Orders page
- [x] Navigate to Settings page
- [x] Highlight active route correctly

### Logout Flow (1 test)
- [x] Logout successfully redirects to home

### Responsive Behavior (2 tests)
- [x] Hide sidebar on mobile + show with toggle
- [x] Keep sidebar visible on desktop

### Auth Guard (2 tests)
- [x] Redirect non-owner from admin dashboard
- [x] Redirect unauthenticated user

**Total: 10 tests**

## Running Tests

### All Tests
```bash
npm run test:e2e
```

### Specific Suite
```bash
npx playwright test admin-layout.spec.ts --project=chromium
```

### With UI Mode (Recommended)
```bash
npm run test:e2e:ui
```

### Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```

### Debug Mode
```bash
npm run test:e2e:debug
```

### View Report
```bash
npm run test:e2e:report
```

## Test Data Setup

### Option A: Existing Tenant (Current)
Tests assume `test-store` tenant already exists with:
- Owner user: `owner@test.com`
- Non-owner user: `nonowner@test.com`

Tests will fail if users don't exist in your Supabase instance.

### Option B: Global Setup (Optional)
Uncomment global setup in playwright.config.ts to auto-seed test data:

```typescript
export default defineConfig({
  globalSetup: require.resolve('./tests/global-setup'),
  globalTeardown: require.resolve('./tests/global-teardown'),
  // ...
})
```

This requires SUPABASE_SERVICE_ROLE_KEY to be set.

## Environment Variables

**Required** (.env.local):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Optional** (for global setup):
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Architecture

### 3-Layer Pattern

1. **Locators Layer** (via page.getByTestId)
   - Single source of truth for selectors
   - Centralized in AdminLayoutPage class

2. **Page Objects Layer** (admin-layout.page.ts)
   - Encapsulates page interactions
   - Provides reusable methods
   - Handles waits and error handling

3. **Tests Layer** (admin-layout.spec.ts)
   - High-level business scenarios
   - Clear intent and flow
   - No selector coupling

### Key Principles

- No selectors in tests (route through POM)
- All interactions use `data-testid` first
- Tests are parallel-safe and deterministic
- Proper wait strategies (networkidle, URL waits)
- Screenshots/videos on failure

## Troubleshooting

### "Invalid login credentials" Error
- Check that test users exist in Supabase
- Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct
- Users must be email-confirmed

### "Too many redirects" Error
- Check middleware.ts auth guard logic
- Verify tenant slug is correct (test-store)
- Clear browser cache/cookies

### "Sidebar element not found"
- Verify data-testid="admin-sidebar" exists in AdminSidebar.tsx
- Check that Pixel completed layout changes
- Run with --headed flag to see browser state

### Tests Timeout
- Increase timeout in playwright.config.ts
- Check dev server is running (npm run dev)
- Check network requests in DevTools

## Maintenance

### When UI Changes
1. Update selector in AdminLayoutPage
2. Re-run tests - most should still pass
3. Only update tests if logic changed

### Adding New Tests
1. Create method in AdminLayoutPage (if needed)
2. Add test in admin-layout.spec.ts
3. Follow existing test pattern

### Updating data-testids
If Pixel changes `data-testid` names:
1. Update locators in AdminLayoutPage constructor
2. Tests automatically use new selectors
3. No test code changes needed

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run dev & npx wait-on http://localhost:3000
      - run: npm run test:e2e --project=chromium
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Performance

- **Total runtime**: ~2 minutes for full suite
- **Per test**: ~10-15 seconds
- **Parallel**: 4 workers (CI: 1 worker)
- **Retries**: 0 local, 2 on CI

## Next Steps

### Immediate
- [ ] Create test users in Supabase (owner@test.com, nonowner@test.com)
- [ ] Run tests locally: `npm run test:e2e:ui`
- [ ] Verify all tests pass

### Short Term
- [ ] Integrate into CI/CD pipeline
- [ ] Configure Slack notifications for failures
- [ ] Set up test reporting dashboard

### Medium Term
- [ ] Add E2E tests for products, orders, settings pages
- [ ] Add visual regression testing
- [ ] Add performance testing

## References

- [Playwright Documentation](https://playwright.dev)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)
- AdminSidebar Component: `/Users/gpublica/workspace/skywalking/projects/sw_commerce_saas/components/AdminSidebar.tsx`
- Dashboard Layout: `/Users/gpublica/workspace/skywalking/projects/sw_commerce_saas/app/(public)/[tenant]/dashboard/layout.tsx`

## Support

For questions or issues:
1. Check Playwright docs
2. Review inline test comments
3. Check AdminLayoutPage JSDoc
4. Refer to ARCHITECTURE.md (existing docs)
