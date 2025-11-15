---
"sw_commerce_saas": minor
---

## Onboarding Flow Complete & Database Management

### ✨ Features

**Onboarding & Dashboard**
- Made logo upload optional in onboarding flow - stores can activate without logo
- Created admin dashboard at `/{tenant}/dashboard` with stats and quick actions
- Added post-onboarding redirect to dashboard after store activation
- Fixed Next.js 16 compatibility - updated params handling with `React.use()`

**Database Management**
- Created `npm run db:reset` script to clean test data from remote database
- Script removes all tenants except #1, plus related products, orders, customers
- Automated auth user cleanup via Supabase Admin API
- Added database reset options for both local and remote environments

**Testing Infrastructure**
- Configured Playwright to load `.env.local` via dotenv
- Fixed E2E test compatibility with router-based redirects
- Updated test page objects to handle query params in URLs
- E2E test "onboarding without logo" now passes successfully

### 🐛 Bug Fixes

**Onboarding**
- Fixed logo validation - changed from required to optional
- Fixed null vs undefined handling in Zod schema validation
- Updated summary display to show "Opcional" when no logo uploaded
- Fixed redirect mechanism from `window.location.replace()` to `router.push()` for Playwright compatibility

**Middleware**
- Added smart cache TTL (5s for recently activated tenants, 60s for stable)
- Implemented query param `_t` to bypass cache on activation redirect
- Fixed cache invalidation for newly activated stores

**Dashboard**
- Fixed React async params error - migrated to `React.use()` pattern
- Updated all `params.tenant` references to use unwrapped `tenant` variable
- Fixed TypeScript type mismatches (Product.id, tenant config)

**Build & Dev**
- Excluded tests directory from Next.js TypeScript compilation
- Fixed Product interface types (id: number, nullable fields)
- Fixed API fixture context parameter type

### 🔧 Technical Improvements

**Configuration**
- Added dotenv to project dependencies
- Configured playwright.config.ts to load .env.local automatically
- Updated package.json with `db:reset` and `db:reset:local` scripts

**Scripts**
- Created `scripts/clean-db.js` - Node.js script for database cleanup
- Created `scripts/clean-db.sh` - Bash alternative (legacy)
- Created `scripts/clean-test-data.sql` - SQL-only cleanup option

**Middleware**
- Enhanced tenant caching with time-based invalidation
- Added support for header-based and query param-based cache bypass
- Improved activation flow reliability

### 📝 Files Changed

**New Files**
- `app/(public)/[tenant]/dashboard/page.tsx` - Admin dashboard
- `scripts/clean-db.js` - Database cleanup script
- `scripts/clean-db.sh` - Bash cleanup script
- `scripts/clean-test-data.sql` - SQL cleanup queries

**Modified Files**
- `app/signup/[slug]/onboarding/page.tsx` - Logo optional, redirect fix
- `middleware.ts` - Cache bypass logic
- `lib/schemas/order.ts` - Logo schema validation
- `app/(public)/[tenant]/page.tsx` - Product type fixes
- `playwright.config.ts` - Dotenv integration
- `package.json` - Database reset scripts
- `tsconfig.json` - Exclude tests directory
- `tests/e2e/pages/onboarding.page.ts` - Query param support
- `tests/e2e/fixtures/api.fixture.ts` - Context type fix

### 🎯 Impact

- **Complete onboarding flow** - Users can now create stores with or without logo
- **Successful redirect** - New stores land on functional dashboard
- **Clean test data** - Developers can reset database with single command
- **E2E tests passing** - Full onboarding flow validated automatically
- **Next.js 16 compatible** - No console errors or warnings
