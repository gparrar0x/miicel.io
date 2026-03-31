# Author Landings E2E Testing

## Overview

E2E test coverage for author landing page feature — dashboard generation flow + public landing rendering.

## Files Created

### Locators (Single Source of Truth)
- `/tests/e2e/locators/author-landings.locators.ts`
  - All `data-testid` selectors for dashboard + public landing
  - Organized by section: dashboard, preview, public, common

### Page Objects (Reusable Methods)
- `/tests/e2e/pages/author-landings.page.ts`
  - `AuthorLandingsPage` class with typed interactions
  - Dashboard methods: `selectAuthor()`, `uploadAuthorImage()`, `setCustomPrompt()`, `clickGenerate()`, `clickPublish()`, etc.
  - Public page methods: `navigateToPublicLanding()`, `verifyHeroHeadline()`, `verifyBioText()`, `verifyCTAHref()`, etc.

### Fixtures (Mock Data)
- `/tests/e2e/fixtures/author-landing-content.json`
  - Realistic mock content matching `AuthorLandingContent` Zod schema
  - Used for API response mocking via `page.route()`

### Test Suites

#### Dashboard Tests
**File:** `/tests/e2e/specs/author-landings-dashboard.spec.ts`

Tests complete generation + publication flow:
- ✅ Render dashboard with form fields
- ✅ Select author from dropdown
- ✅ Upload author image
- ✅ Set custom prompt
- ✅ Generate landing → verify preview appears
- ✅ Regenerate → verify preview updates
- ✅ Publish → verify status changes to published
- ✅ Clear prompt
- ✅ Button states (disabled when no author)
- ✅ Loading states during generation

**Runtime:** ~45s per test suite (mocked API)

#### Public Landing Tests
**File:** `/tests/e2e/specs/author-landings-public.spec.ts`

Tests rendering + SEO + accessibility:
- ✅ Hero section (headline + subheadline)
- ✅ Author image visible + has src
- ✅ Bio section (title + text)
- ✅ CTA button (text + href to storefront)
- ✅ Meta tags (title + description)
- ✅ Accessible structure (landmarks, heading hierarchy, keyboard nav)
- ✅ Responsive layout (mobile viewport)
- ✅ 404 for unpublished landing
- ✅ Section ordering (visual verification)
- ✅ Neo-brutalist styling (borders, shadows, colors)

**Runtime:** ~30s per test suite (no API calls)

## data-testid Contract

### Dashboard Editor
```
author-select-dropdown          # Dropdown trigger
author-image-upload             # File input wrapper
author-image-preview            # Image preview
author-prompt-textarea          # Custom prompt field
author-generate-btn             # Generate button
author-regenerate-btn           # Regenerate button
author-publish-btn              # Publish button
author-status-badge             # Status indicator (draft/published)
author-generating-spinner       # Loading state
author-publishing-spinner       # Publishing state
```

### Preview
```
author-preview-container        # Live preview area
author-preview-heading          # Preview title
author-preview-empty-state      # No content state
```

### Public Landing
```
author-landing-hero             # Hero section container
author-landing-image            # Author image wrapper
author-landing-bio              # Bio section
author-landing-cta              # CTA button wrapper
```

**Important:** These selectors MUST match between components and tests exactly. Flag missing `data-testid` to Pixel immediately if components don't have them.

## Running Tests

### All author landing tests
```bash
npx playwright test tests/e2e/specs/author-landings-*.spec.ts
```

### Dashboard tests only
```bash
npx playwright test tests/e2e/specs/author-landings-dashboard.spec.ts
```

### Public tests only
```bash
npx playwright test tests/e2e/specs/author-landings-public.spec.ts
```

### Single test (by name)
```bash
npx playwright test -g "should generate landing and show preview"
```

### UI mode (for debugging)
```bash
npm run test:e2e:ui -- tests/e2e/specs/author-landings-dashboard.spec.ts
```

### Headed mode (visible browser)
```bash
npx playwright test tests/e2e/specs/author-landings-dashboard.spec.ts --headed
```

### Against production
```bash
npm run test:e2e:prod -- tests/e2e/specs/author-landings-public.spec.ts
```

## Architecture Pattern

### 3-Tier Structure
```
specs/author-landings-*.spec.ts
  ↓ imports
pages/author-landings.page.ts
  ↓ uses
locators/author-landings.locators.ts
  ↓ references (single source of truth)
[data-testid] in components
```

### Mocking Strategy

**Claude API Response:**
```typescript
// In test beforeEach:
await page.route('**/api/authors/*/generate-landing', async (route) => {
  if (route.request().method() === 'POST') {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockContent.landing.content),
    })
  }
})
```

**Benefits:**
- Deterministic (no external API calls)
- Fast (instant response)
- Safe (no token usage)
- Replicable (tests pass on CI/CD)

## Seeding Strategy

### Dashboard Tests
- Uses `loginAsOwner()` fixture to authenticate
- Mocks API response → no DB seeding required
- Authors must exist in test tenant for dropdown selection

### Public Tests
- Navigate directly to published landing URL
- Requires:
  - Published landing in DB (status = 'published')
  - Author with slug
  - Tenant with slug or numeric ID

**To seed test data:**
```bash
# Option 1: Use global setup (tests/global-setup.ts)
# Modify to insert test authors + landings before tests run

# Option 2: Manual seeding
npm run db:reset                # Reset to clean state
# Then insert via direct Supabase query or fixture
```

## Assertions Checklist

✅ Component renders without error
✅ User can interact with form (select, type, upload, click)
✅ API is called with correct payload
✅ Response is parsed correctly
✅ Preview updates with generated content
✅ Status badge reflects state (draft → published)
✅ Public landing displays correct content from DB
✅ CTA button navigates to storefront
✅ Unpublished landing returns 404
✅ Page is accessible (WCAG 2.1 AA)
✅ Page is responsive (mobile viewport)
✅ Page has proper metadata (SEO)

## Resilience Plan

### Flaky Dependencies
- **Claude API:** Mocked deterministically in tests
- **Image upload:** Uses in-memory PNG buffer (no file system)
- **Database queries:** Fixture seeding or global setup
- **Network:** All routes mocked where possible

### Retries
- Dashboard tests: 0 retries (deterministic)
- Public tests: 2 retries on CI (network resilience)

### Screenshots + Traces
- Captured on failure → `tests/reports/`
- Debug via Playwright Inspector or Trace Viewer:
  ```bash
  npx playwright show-trace tests/reports/trace.zip
  ```

## Observability

### Test Reports
- HTML report: `npm run test:e2e` → `tests/reports/index.html`
- JSON results: `tests/test-results.json`
- JUnit XML: `tests/junit.xml` (for CI integrations)

### Video + Screenshots
- Enabled in `playwright.config.ts`
- Only on failure to save disk space
- Located in `tests/reports/` per project

### CI/GitHub Actions
- Tests run on PR + merge to main
- Reporters post results to GitHub checks
- Artifacts uploaded for debugging

## Known Limitations

1. **Public tests require DB seeding:** Tests assume a published landing exists in DB. Either:
   - Pre-seed test data in global setup
   - Mock DB responses (not implemented)
   - Run against staging with known seed data

2. **Image upload tests:** Use in-memory PNG buffer. Large files or real uploads need file fixtures.

3. **Claude API mocking:** Fixed response for all tests. Real variation (tone, focus) requires parameterized fixtures or multiple mock responses.

4. **Mobile tests:** Only use Playwright's built-in mobile viewports. No real device testing.

## Next Steps

1. **Implement author + landing seeding:**
   - Add to `tests/global-setup.ts`
   - Create test tenants + authors before tests run
   - Use Supabase admin client with `SUPABASE_SERVICE_ROLE_KEY`

2. **Add data-testid to components if missing:**
   - Dashboard: Check all inputs + buttons have IDs
   - Public: Verify all sections have IDs
   - Flag to Pixel: any missing IDs

3. **Parameterize mock responses:**
   - Create multiple landing content fixtures
   - Rotate through tests for variety
   - Test edge cases (very long bio, special chars)

4. **Add integration tests (Vitest):**
   - Zod schema validation
   - Author CRUD operations
   - Landing status transitions
   - SEO metadata generation

5. **Performance tests:**
   - Image upload file size limits
   - Prompt length limits
   - Preview render time < 3s
   - Page load time < 2s

## Environment Variables Required

```bash
# For public tests (if not mocking DB)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  # For global setup seeding

# For running tests
BASE_URL=http://localhost:3000  # or staging URL
CI=true                        # Enables retries on GitHub Actions
```

## CI/GitHub Actions Integration

Add to `.github/workflows/e2e.yml`:
```yaml
- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: tests/reports/

- name: Publish test report
  uses: dorny/test-reporter@v1
  if: always()
  with:
    name: E2E Test Results
    path: tests/junit.xml
    reporter: java-junit
```

## FAQ

**Q: Why mock the Claude API?**
A: Tests need to be deterministic, fast, and cheap. Real API calls are slow (~10s), costly ($), and flaky.

**Q: What if the mock response doesn't match real Claude output?**
A: Use snapshot testing or property-based testing. Add a separate "integration" test suite that calls real Claude API in staging only.

**Q: How do I debug a failing test?**
A: Use `--headed` flag to watch browser, or `npm run test:e2e:ui` for interactive debugging.

**Q: Can I run tests in parallel?**
A: Yes, default is 4 workers. Tests are isolated (unique author selection, mocked API). Ensure DB seeding doesn't create conflicts.

**Q: What about mobile testing on real devices?**
A: Use BrowserStack or LambdaTest. Playwright supports remote browsers via CDP protocol.
