# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Common Changelog](https://common-changelog.org/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Vitest + service layer** [2026-02-25] (SKY-120)
  - Vitest configured with jsdom + RTL
  - Extracted service layer: checkout, order, product services + repositories
  - 32 unit tests with mocked repos
  - API routes refactored to <50 LOC each
- **Sentry error tracking** [2026-02-25] (SKY-122)
  - @sentry/nextjs with client/server/edge configs
  - global-error.tsx error boundary
  - tracesSampleRate 0.1 in production
- **GitHub Actions CI** [2026-02-25] (SKY-121)
  - Biome check + tsc + vitest gates on PR/push to main
- **Rate limiting** [2026-02-22] (SKY-111)
  - Upstash-based rate limiting on checkout, orders, signup, webhooks
  - 3 tiers: strict (10/10s), signup (5/60s), light (20/10s)
- **RLS optimization migration** [2026-02-22] (SKY-110)
  - `039_optimize_rls_auth_uid.sql`: 18 policies wrapped with `(select auth.uid())`

### Changed

- **@skywalking/core migration** [2026-02-25] (SKY-117)
  - Supabase clients, auth guards, encryption, utils → thin re-export shims from @skywalking/core
- **Biome + Lefthook** [2026-02-22] (SKY-113)
  - Biome 2.4.4 replaces ESLint+Prettier for formatting/linting
  - Lefthook pre-commit hook for biome check
- **pnpm migration** [2026-02-22] (SKY-114)
  - Switched from npm to pnpm@10.28.0

- **Analytics page route** [2025-01-27] (SKY-44)
  - `app/[locale]/[tenantId]/dashboard/analytics/page.tsx`: Created route for AnalyticsDashboard component
  - Matches pattern of other dashboard pages (products, orders)
  - Includes SEO metadata with noindex for dashboard

### Fixed

- **Dark mode support for dashboard components** [2025-01-27]
  - `tokens.css`: Added `.dark` class selector alongside `[data-theme]` for proper dark mode
  - `tokens.css`: Added `@media (prefers-color-scheme: dark)` fallback
  - `globals.css`: Changed accent colors from gold (#B8860B) to neutral transparent
  - `OrdersTable`: Fixed search bar, filters, and buttons using CSS variables
  - `OrderDetailModal`, `ProductForm`, `ProductsTable`: Theme token integration
  - Consignment modals (LocationForm, AssignArtworkModal, SelectProductModal): Now respect dark mode
  - `SummaryCards`: Changed "Items Vendidos" → "Productos Vendidos"
  - `button.tsx`: Neo-brutalist button tokens (primary/secondary with shadows)

### Added

- **styles/CLAUDE.md**: Theming guidelines to prevent future dark mode issues
  - CSS variable reference, component checklist, common mistakes table

- **Consignments E2E documentation** [2025-01-27]
  - `CONSIGNMENTS_E2E_GUIDE.md`: Test suite guide
  - `docs/CONSIGNMENTS_TEST_CODE_REVIEW.md`: Code review notes
  - `docs/CONSIGNMENTS_TEST_FIXES.md`: Fix documentation
  - `scripts/verify-consignments-tests.sh`: Verification script

### Changed

- **Dashboard page refactored** [2025-01-27]
  - `dashboard/page.tsx`: Extracted to `AnalyticsDashboard` component
  - Removed duplicate `analytics/page.tsx`

- **Consignments Module - Critical Bugs** [2026-01-26] (SKY-56)
  - `SelectProductModal`: Fixed API endpoint `/api/dashboard/products` → `/api/products`
  - `SelectProductModal`: Fixed field mapping `title` → `name` (products table uses `name`)
  - `SelectProductModal`: Changed testId to `assign-artwork-modal` per contract
  - `artworks/route.ts`: Fixed query field `title` → `name` in products join
  - `LocationDetailClient`: Added proper API response mapping for artwork assignments
  - `LocationDetailClient`: Fixed interface to use `name` instead of `title`
  - `artwork-assignment.spec.ts`: Removed silent `if/else` patterns - tests now fail when functionality is broken
  - `consignments.page.ts`: Fixed dialog handler timing (register before click)
  - `dashboard-overview.spec.ts`: Added `verifyOverviewVisible()` to beforeEach, fixed timing threshold

### Added

- **Consignments E2E Test Suite** [2025-01-25] (SKY-56)
  - 4 comprehensive test specs: locations CRUD, artwork assignment, dashboard overview, history/timeline
  - Page object layer (`ConsignmentsPage`) with 25+ reusable methods
  - Locators layer (`consignments.locators.ts`) with data-testid contract
  - 28 test scenarios covering happy paths, validation, edge cases, responsive layouts
  - Deterministic runtime <90s per suite
  - Files: `tests/e2e/specs/consignments/*`, `tests/e2e/pages/consignments.page.ts`, `tests/e2e/locators/consignments.locators.ts`

### Fixed

- **Dark mode theme toggle** [2025-01-25]
  - Header toggle now works with OS dark preference (adds `.light` class to override media query)
  - Persists theme choice in localStorage
  - Reads initial state from localStorage or falls back to OS preference

- **Feature Flags System** [2025-01-24]
  - DB-driven flags with tenant/user/template targeting and percentage rollouts
  - `lib/flags.ts`: Server-side helpers with 1-min cache
  - `lib/hooks/useFeatureFlag.ts`: Client-side hook with 30s cache
  - `/api/flags` + `/api/flags/batch`: REST endpoints
  - Migration: `feature_flags` table with RLS + seed data
  - Supports: global on/off, tenant allowlist, user allowlist, template filter, % rollout, env filter
  - Integrated flags:
    - `consignments`: Gallery-only (hides nav + protects route)
    - `kitchen_view`: Gastronomy-only (hides toggle + defaults to table view)

### Changed (Docs)

- **CLAUDE.md optimizado** [2025-01-24]
  - Referencia a `../../CLAUDE.md` para sistema multi-agente (sin duplicar)
  - Documentada estructura de backlog local

- **Renamed AGENTS.md → REPO_GUIDELINES.md** (no era registry de agentes)

- **Nuevo docs/README.md** - Índice de navegación para onboarding

### Added (Design)

- **SKY-53: Consignment Management UX/UI Specs** - Complete design system for artwork location tracking
  - `docs/specs/consignment-ux-spec.md`: Full wireframes, flows, component specs, accessibility guidelines
  - `docs/specs/consignment-design-tokens.css`: Color palette + design tokens (5 status colors)
  - `docs/specs/PIXEL_COMPONENT_GUIDE.md`: React component implementation guide
  - `lib/types/consignment.ts`: TypeScript interfaces + API contracts (300+ lines)
  - Data model: 3 new Supabase tables (locations, assignments, movements)
  - Mobile-first responsive (3 breakpoints), WCAG AA compliant, 30+ test IDs

### Added

- **QR Product Generation** (COM-5): Admins can generate, print, and download QR codes for products
  - QRProductModal component with print/download functionality
  - QR button in ProductsTable row actions
  - Print stylesheet for 6x6cm QR output (exceeds 2cm minimum)
  - E2E tests for QR modal (8 scenarios)
  - i18n support (en/es)

- **WhatsApp Integration**: Storefront WhatsApp button for direct customer contact
  - WhatsAppButton component in storefront layouts
  - Tenant settings for WhatsApp number configuration
  - Database migration for whatsapp_number field
  - E2E tests for WhatsApp button functionality

### Changed

- **Template rename: Restaurant → Gastronomy** [2025-01-24]
  - `components/restaurant/` → `components/gastronomy/` (full component tree)
  - `lib/themes/restaurant.ts` → `lib/themes/gastronomy.ts`
  - Template identifier: `'restaurant'` → `'gastronomy'` in DB + code
  - All imports/references updated across 15+ files
- Updated Playwright config for improved test stability
- Enhanced auth fixtures for E2E tests
