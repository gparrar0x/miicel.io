# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Common Changelog](https://common-changelog.org/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Admin Dashboard Layout (SKY-6)**: Complete responsive admin shell with sidebar navigation
  - AdminSidebar component with mobile support (collapsible + hamburger menu)
  - Dashboard layout at `/{tenant}/dashboard/layout.tsx` with auth guards
  - Navigation links: Dashboard, Products, Orders, Settings
  - Active route highlighting based on pathname
  - Logout functionality with Supabase auth
  - Tenant branding integration (logo + name from database)
  - All components include `data-testid` attributes for E2E testing
- **E2E Test Suite (SKY-6)**: Comprehensive Playwright test coverage for admin layout
  - 10 E2E tests covering navigation, auth guards, and responsive behavior
  - Page Object Model pattern (`tests/e2e/pages/admin-layout.page.ts`)
  - Auth fixtures for owner/non-owner user login (`tests/e2e/fixtures/auth.fixture.ts`)
  - Test data seed system with idempotent get-or-create logic
  - Global setup/teardown for test environment management
- **Documentation**: SENTINELA_TASKS.md with complete E2E testing strategy and implementation guide

### Changed

- **Dashboard Page**: Migrated params handling to Next.js 15+ async pattern with `React.use()`
  - Fixed params Promise unwrapping in client component
  - Updated all `params.tenant` references to use state-based `tenantSlug`

### Fixed

- **Test Data Seeding**: Enhanced seed-test-data.ts with robust error handling
  - Added fallback search for users when `listUsers()` returns incomplete results
  - Implemented pagination retry logic for finding existing test users
  - Fixed "user already registered" error with graceful recovery

### Technical

- Coordinated tri-agent implementation (Kokoro + Pixel + Sentinela)
- Backend auth middleware and guards validated (Kokoro)
- Frontend responsive UI with accessibility features (Pixel)
- E2E test infrastructure with POM and fixtures (Sentinela)
- ~1500 LOC added across UI, tests, and fixtures

## [0.2.0] - 2025-11-15

### Added

- **Onboarding System**: Complete multi-step onboarding flow with 5 steps:
  - Step 1: Logo upload (optional) with preview
  - Step 2: Color customization with presets
  - Step 3: Product management
  - Step 4: Store preview
  - Step 5: Activation summary
- **Admin Dashboard**: New dashboard page at `/{tenant}/dashboard` with:
  - Real-time statistics (products, orders, revenue)
  - Quick action cards for navigation
  - Sign out functionality
- **Database Management**: Multiple cleanup scripts:
  - `npm run db:reset` - Clean remote database keeping only tenant #1
  - `scripts/clean-db.js` - Node.js cleanup script with Supabase client
  - `scripts/clean-db.sh` - Bash alternative
  - `scripts/clean-test-data.sql` - Pure SQL cleanup
- **E2E Testing**: Playwright test infrastructure with:
  - Page Object Model pattern
  - Test fixtures for database cleanup
  - API helpers for validation
  - Test data generators
- **Middleware Enhancements**: Smart tenant caching system:
  - TTL-based cache (5s for recently activated, 60s stable)
  - Query param bypass (`?_t=timestamp`)
  - Header-based bypass (`x-bypass-tenant-cache`)

### Changed

- **Logo Upload**: Changed from required to optional in onboarding
- **Redirect Strategy**: Changed from `window.location.replace()` to `router.push()` for better test compatibility
- **Summary Display**: Logo status now shows "Opcional" when not uploaded instead of always "Cargado"
- **Params Handling**: Migrated to Next.js 16 async params pattern using `React.use()`

### Fixed

- **Schema Validation**: Fixed null vs undefined handling in logo validation (Zod schema)
- **Dashboard Params**: Fixed React async params error in dashboard page
- **TypeScript Types**:
  - Fixed Product interface (id: number, nullable fields)
  - Fixed API fixture context type
  - Fixed tenant config type casting
- **Build Configuration**: Excluded tests directory from Next.js TypeScript compilation
- **Cache Invalidation**: Fixed middleware not refreshing tenant data after activation
- **E2E Tests**: Updated page objects to handle query params in URLs

### Technical

- Added `dotenv` package for .env.local loading in Playwright
- Configured `playwright.config.ts` to load environment variables
- Enhanced middleware with activation detection and cache management
- Created comprehensive E2E test suite with 50+ test cases
- Implemented modular test architecture (locators, pages, fixtures, helpers)

---

_Note: This is the first tracked release. Previous work was unversioned development._
