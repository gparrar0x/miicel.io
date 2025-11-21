# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Common Changelog](https://common-changelog.org/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Restaurant Template v0 Integration (SKY-42.5)**: Modern collapsible menu with dynamic tenant theming
  - **Collapsible Categories**: Accordion-based navigation (Radix UI)
    - All categories expanded by default
    - Chevron rotation animation
    - Product count per category
    - Smooth expand/collapse transitions
  - **Dynamic Theming**: Full CSS variables integration
    - Uses `--color-primary` from tenant config (via ThemeProvider)
    - `color-mix()` for automatic shade generation (lighter/darker variants)
    - Applies to: header, footer, buttons, prices, borders, hover states
    - Zero hardcoded colors - fully themeable per tenant
  - **Enhanced Components**:
    - `RestaurantHeader`: Tenant banner/logo/name/subtitle/location with dynamic gradients
    - `RestaurantFooter`: Business hours (today highlighted) + contact (WhatsApp, Instagram, location)
    - `ProductCardRestaurant`: Dynamic primary color for price and "Agregar" button
    - `FloatingCartButton`: Gradient with primary color + dynamic shadow
    - `CartSheet`: Primary color accents throughout (icons, prices, buttons, summary)
  - **UI/UX Improvements**:
    - Full-width accordion (removed container constraints)
    - Compact spacing (reduced padding/gaps)
    - No bottom white space (removed pb-32)
    - Fixed placeholder images (404s eliminated)
    - Smooth hover effects with color transitions
  - **Cart Fixes**:
    - Stock fallback to 999 for restaurants (no strict inventory tracking)
    - Explicit quantity:1 on addItem
    - Reactive totalItems/totalPrice calculations
    - Fixed visibility of "Ver Pedido" button
    - Price casting to Number() to prevent 0 display
  - **Dependencies**: `@radix-ui/react-accordion` installed
  - **Files Modified**: 7 components + RestaurantLayout
  - **Ready for**: Multi-tenant restaurant deployment with custom brand colors

### Changed

- **Project Structure Reorganization**: Consolidated related files for better maintainability
  - **Database**: Created `/db/` directory with scripts and Supabase migrations
    - Moved `supabase/` migrations to `db/supabase/migrations/`
    - Moved database scripts (`clean-db.sh`, `reset-db.sql`, `clean-test-data.sql`) to `db/scripts/`
  - **Testing**: Consolidated all test artifacts under `/tests/`
    - Moved Playwright reports to `tests/reports/`
    - Moved test output files to `tests/` (test-output.log, test-results.json, junit.xml)
    - Moved test assets from `public/test-assets/` to `tests/assets/`
  - **Documentation**: Reorganized docs with subdirectories
    - New `docs/guides/` for user guides (QUICKSTART_E2E.md)
    - New `docs/testing/` for test documentation
  - **Environment**: Renamed `.env.local` to `.env` for consistency
  - Updated 20+ file references across codebase and documentation

### Added

- **SKY-12: Settings Page UI**: Admin interface for tenant configuration management
  - **Settings Page**: `/[tenantId]/dashboard/settings` with tabbed interface
  - **General Tab**: Business name, logo upload with preview, primary/secondary color pickers
  - **Payment Tab**: MercadoPago access token with show/hide toggle
  - **Contact Tab**: WhatsApp number, email, business hours (7 days/week)
  - **API Integration**: Full CRUD with `/api/settings` (GET/PATCH) + `/api/settings/upload-logo` (POST)
  - **Logo Upload**: File picker, preview, auto-upload on save
  - **Form State**: useState hooks per tab, fetch on mount, save per tab
  - **UX**: Loading states, success/error toasts, disabled states
  - **Data Testids**: E2E test coverage with `data-testid` attributes

- **SKY-11: Settings API**: Backend endpoints for tenant configuration management
  - **GET /api/settings**: Fetch complete tenant settings (public + private config, decrypted MP token)
  - **PATCH /api/settings**: Update tenant config, secure_config, mp_access_token (auto-encrypted)
  - **POST /api/settings/upload-logo**: Logo upload to Supabase Storage with auto config update
  - **Security**: AES-256-GCM encryption for payment tokens, ownership verification, RLS policies
  - **Encryption**: Reuses `lib/encryption.ts` (encryptToken/decryptToken)
  - **Validation**: File type/size checks (10MB max, PNG/JPEG/WEBP/SVG only)
  - **Storage**: Assets bucket integration with public URLs

- **SKY-10: Orders Management Page**: Admin interface for viewing and managing customer orders
  - **Orders Page**: `/[tenantId]/dashboard/orders` with server-side data fetching
  - **OrdersTable Component**: Sortable table with filters (search, status, date range), status badges
  - **OrderDetailModal Component**: Full order details with customer info, items breakdown, payment details
  - **Status Update**: Inline status transitions (pending→paid→preparing→ready→delivered, cancel anytime)
  - **Print Invoice**: Browser-based invoice generation with order details, customer info, itemized list
  - **Integration**: Reuses existing API routes (`/api/orders/list`, `/api/orders/[id]/status`)
  - **Data Testids**: Full E2E test coverage with `data-testid` attributes throughout
  - **Mobile Responsive**: Filters collapse on mobile, table horizontal scroll, modal full-screen

- **SKY-43: Gallery Template Redesign**: Mobile-first QR gallery experience with Gallery White palette
  - **GalleryCard Component**: Art Gallery variant (1:1 images, 48x48px tap targets, Quick View button)
  - **ProductGrid Component**: Responsive grid (1 col portrait, 2 cols landscape, 3 cols desktop)
  - **QuickViewModal Component**: Full-screen mobile modal for product options
  - **Badge System**: Type badges (Digital/Physical/Both) + Status badges (New/Limited/Featured)
  - **Product Detail Page**: Gallery White redesign (ImageGallery, OptionsSelector, AddToCartSticky)
  - **Design Tokens**: Gallery White palette (gold accent #B8860B), typography scale, spacing system
  - **Performance**: <2s TTI mobile 3G, <80KB bundle target, WebP images with LQIP blur-up
  - **Accessibility**: WCAG AA compliance, 48x48px tap targets, semantic HTML, keyboard navigation
  - **GalleryGridWrapper**: Client component wrapper for server→client boundary (Next.js 13+ compatibility)
  - Test suite: 13 E2E tests (11 passed) covering component functionality, visual consistency, navigation

- **Supabase Storage System**: Assets bucket for tenant branding
  - Migration 025: Created `assets` public bucket with RLS policies
  - 10MB file size limit, supports PNG/JPEG/WEBP/SVG
  - Upload scripts for SuperHotDog and MangoBajito assets
  - Public URLs: `{supabase_url}/storage/v1/object/public/assets/{tenant}/`

- **SuperHotDog Real Products (Migration 026)**: 25 products from Google Sheets
  - PANCHOS (3): Maldito Perro Super, Maldito Perro Veggie, Pancho Callejero
  - COMBOS (2): Combo SúperHotDog, Combo Familiar
  - BEBIDAS (13): Coca-Cola variants, Sprite, Fanta, Aquarius, aguas
  - CERVEZA (7): Quilmes, Andes, Stella, Heineken, Corona variants
  - Assets uploaded: logo-circle.png, logo-text.png, banner.png
  - Tenant config updated with business info (phone +54 294 450-4520, location, hours, Instagram @superhotdog_bariloche)

- **MangoBajito Real Products**: 13 Venezuelan food products from Google Sheets
  - AREPAS (3): Reina Pepiada, Domino, Pelua
  - CACHAPAS (2): Queso de Mano, Queso + Jamón
  - CLÁSICOS (4): Patacón, Tequeños, Yuca Frita, Mandoca
  - SANDWICH (4): Pernil, Pollo, Jamón Queso, Vegetariano
  - Assets uploaded: logo-circle.png (circular tropical logo), logo-text.png (white text AI-generated via DALL-E 3), banner.png
  - Tenant config updated with business info (phone +54 294 503-2187, location Bariloche, Instagram @mangobajito_bariloche)
  - AI logo generation using OpenAI DALL-E 3 with transparent background

### Changed

- **Restaurant Template - Collapsible Categories**: Enhanced UX with accordion navigation
  - Categories now expand/collapse with chevron indicators
  - State management: all categories expanded by default
  - CSS slideDown animation (0.3s ease-out)
  - Added to `app/globals.css` with max-height transitions

- **Restaurant Template - Enhanced Header**: Match original designs with banner backgrounds
  - Header now displays: banner background + circular logo + text logo + subtitle + location
  - RestaurantLayout props extended: `tenantBanner`, `tenantLogoText`, `tenantSubtitle`, `tenantLocation`
  - Min height 200px with cover background sizing
  - Dual logo support: circular (profile) + text (branding)

- **Contextual Category Icons**: Food-specific emojis per restaurant type
  - SuperHotDog: PANCHOS 🌭, COMBOS 🍔, BEBIDAS 🥤, CERVEZA 🍺
  - MangoBajito: AREPAS 🫓, CACHAPAS 🥞, CLÁSICOS 🍴, SANDWICH 🥪
  - Generic fallbacks for future categories (pizzas 🍕, ensaladas 🥗, postres 🍰, café ☕)
  - Icon mapping function in `app/[tenantId]/page.tsx:135-156`

### Added

- **Restaurant Template System (SKY-42)**: Complete food-service template with mobile-first UX
  - **Design (Aurora)**:
    - Moodboard + 3 color palettes (Warm Appetite #E63946 red + #F4A261 orange selected)
    - 3 product card variants (Menu Item 16:9 default, Photo Hero 1:1, Compact List)
    - Wireframes mobile/tablet/desktop with visual PNG mockups (DALL-E generated)
    - Design system complete (tokens, spacing 8px grid, typography, components)
    - Icon pack SVG (8 category icons + 7 badge types + 6 UI icons)
    - Badge system: nuevo, promo, spicy-mild, spicy-hot, veggie, vegan, gluten-free, popular
    - Documentation: SKY_42_DESIGN_SPECS.md, SKY_42_WIREFRAMES.md, SKY_42_COLOR_PALETTES.md
  - **Frontend (Pixel)**:
    - Template 'restaurant' added to TenantTemplate enum + TEMPLATE_DEFAULTS (gridCols: 2, imageAspect: 16:9, cardVariant: outlined)
    - 10 new components (Atomic Design):
      - Atoms: FoodBadge, CategoryIcon, QuickAddButton (with loading/added states)
      - Molecules: ProductCardRestaurant (16:9 image + badges stack), CategoryTab, CartSummary
      - Organisms: CategoryTabsNav (horizontal scroll + scroll spy), ProductGridRestaurant (responsive 1/2/3 cols), FloatingCartButton (Framer Motion animation)
      - Layout: RestaurantLayout (header + sticky tabs + category sections + floating cart)
    - Admin integration: TemplateSelector updated with 4th option "Restaurant 🍔"
    - Responsive mobile-first: 1 col mobile → 2 tablet → 3 desktop (max-width 1280px)
    - Navigation: Category tabs sticky with IntersectionObserver scroll spy, smooth scroll to sections
    - Animations: Card hover lift, image zoom, floating cart slide-up, quick add button feedback (1s)
    - Accessibility: WCAG AA focus indicators, keyboard navigation, min 16px fonts (iOS no-zoom), 44px tap targets
    - CSS utilities: .scrollbar-hide, .pb-safe (iOS safe area), --color-primary-subtle
    - All components include data-testid attributes (Sentinela contract)
    - framer-motion installed for animations
  - **Backend (Kokoro)**:
    - Migration 020: Added `template` and `theme_overrides` to `tenants_public` view
    - Migration 021: Added `products.metadata` JSONB with `badges` array schema + validation constraint
    - Migration 022: Performance indexes on `products.category` (composite: tenant_id, category, active) + GIN index on metadata->'badges'
    - Migration 023: Seeded MangoBajito (6 products: Hot Dog Clásico/Premium/Veggie, Combo Familiar, Papas, Coca-Cola) + SuperHotdog (4 products placeholder)
    - Helper function `get_product_badges(product_id)` for extracting badge arrays
    - API `/api/tenant/[slug]/config` validated returning `template` field
    - API `/api/products` returns `metadata.badges` array for frontend display
    - Performance benchmarks: Category grouping 1.1ms (<50ms target), badge filtering 0.1ms (<100ms target), view queries 0.7ms (<10ms target)
    - Rollback script: 024_rollback_restaurant_template.sql
    - RLS policies validated (no cross-tenant leaks)
  - **Integration validated**: Local dev server tested at http://localhost:3000/mangobajito with template='restaurant', badges rendering correctly
  - **Documentation**:
    - SKY_42_AURORA_TASKS.md (design brief), SKY_42_PIXEL_TASKS.md (implementation guide), SKY_42_KOKORO_TASKS.md (backend specs)
    - SKY_42_NOTES.md (project context), SKY_42_DESIGN_SPECS.md (handoff doc), SKY_42_KOKORO_DELIVERY.md (performance report)
  - **Ready for**: E2E testing (Sentinela), A/B test MangoBajito (7 days), production rollout if +25% conversion

### Fixed

- **Checkout Flow Critical Fixes (SKY-4)**: Resolved multiple blockers preventing MercadoPago integration
  - Database triggers: Fixed type mismatch (UUID → BIGINT) in `validate_stock_on_order()` and `decrement_stock_on_order()` triggers
  - RLS policies: Added service role policies for customers table (INSERT, UPDATE, SELECT)
  - CheckoutModal: Fixed payload structure to include `paymentMethod` and `tenantId` fields
  - Checkout API: Changed from regular client to `createServiceRoleClient()` to bypass RLS
  - MercadoPago token: Encrypted with AES-256-GCM and stored in `tenants.mp_access_token` column
  - Environment: Added `NEXT_PUBLIC_BASE_URL` for production callback URLs
  - Back URLs: Changed from `/checkout/success` to `/{tenant}?payment=success` for better UX
  - Localhost support: Disabled `auto_return` for local development (MP rejects localhost URLs)
  - Error handling: Enhanced error responses with `details` and `code` fields for debugging
  - Migration: `fix_order_triggers_bigint_type.sql` to correct trigger casting
  - Migration: `add_customers_rls_policies.sql` to enable service role access

### Added

- **Tenant-level Currency (Currency Fix)**: Resolved MXN vs ARS hardcoded inconsistency
  - Added `currency` field to `tenantConfigResponseSchema` with default 'USD'
  - GET `/api/tenant/[slug]/config` now returns tenant currency from `config.currency`
  - ProductGrid component uses tenant currency instead of hardcoded 'MXN'
  - Product detail page uses tenant currency instead of hardcoded 'ARS'
  - Migration `016_add_tenant_currency.sql`: Backfills existing tenants with 'USD' default
  - All cart items now use consistent currency from tenant config

- **MercadoPago Checkout E2E Tests (SKY-4)**: Comprehensive Playwright suite for payment flow
  - T1: 17 checkout E2E test cases (`checkout-mercadopago.spec.ts`)
    - Form validation (name, phone 10-digit, email, special chars)
    - Happy path checkout with MP redirect mock
    - API error handling (500, 400, timeout, network)
    - Success/failure page rendering + retry flow
    - Modal state management (open, close, data persistence)
  - T2: 20 webhook API security tests (`webhook-mercadopago.spec.ts`)
    - HMAC-SHA256 signature validation
    - Attack vector coverage (replay, tampering, wrong secret, wrong algo)
    - Webhook payload processing (complex nested data)
    - Rate limiting + rapid fire requests
    - Malformed payload + edge case handling
  - Checkout Page Object (`checkout.page.ts`): Reusable interactions, 30+ methods
  - All tests use `data-testid` locators from `checkout.locators.ts`
  - Multi-browser: Chromium, Firefox, WebKit, Mobile Chrome, Safari (185 test runs)
  - Mocks MercadoPago sandbox (no real API calls)
  - Environment config: `MERCADOPAGO_WEBHOOK_SECRET` for signature validation

- **Tenant List API (SKY-41)**: Public endpoint for landing page tenant directory
  - GET `/api/tenants/list` - Returns all active tenants
  - Response: `{slug, name, logo, status}[]`
  - Logo extracted from `tenants.config.logo` JSONB field
  - No auth required (public endpoint)
  - Includes unit tests for response validation

- **Checkout Flow (SKY-5)**: Complete checkout system with payment integration
  - CheckoutModal component with React Hook Form + Zod validation
  - Customer form: name, phone (10 digits WhatsApp format), email, notes (optional)
  - Payment method selector: Cash on Delivery vs MercadoPago
  - Inline validation errors with field-level feedback
  - Loading states during API submission
  - Success page at `/{tenant}/checkout/success` with order summary
  - Failure page at `/{tenant}/checkout/failure` with retry functionality
  - All interactive elements have `data-testid` attributes per TEST_ID_CONTRACT.md
  - Mobile responsive design with Tailwind CSS
- **Checkout API Routes (SKY-5)**: Backend integration for order processing
  - POST `/api/checkout/create-preference` - Creates order + customer, generates MercadoPago checkout URL
  - GET `/api/orders/[id]` - Fetches order details for success/failure pages
  - Customer management: auto-create or update by email
  - MercadoPago integration scaffolded (mock implementation ready for SDK)
  - Zod validation for all request payloads
  - Tenant-scoped order creation with RLS enforcement
- **E2E Checkout Tests (SKY-5.4)**: Comprehensive Playwright test suite
  - 8 test cases covering full checkout flow
  - Form validation error scenarios
  - Cash payment submission + redirect to success page
  - MercadoPago payment flow with API mocking
  - Success page order summary verification
  - Failure page error handling + retry flow
  - Loading state tests during submission
  - API error handling with toast notifications
  - Test file: `tests/e2e/specs/checkout-flow.spec.ts`

### Added

- **Multi-Tenant Template System (Epic #1)**: Complete visual customization system with 3 template variants
  - Gallery template: large images, minimal text, hover zoom (fashion, visual products)
  - Detail template: specs grid, expanded content (tech, spec-driven products)
  - Minimal template: compact layout, clean whitespace (luxury, large catalogs)
  - User guide: `/docs/templates/USER_GUIDE.md`
  - Developer guide: `/docs/templates/DEV_GUIDE.md`
- **E2E Template Tests (Issue #7)**: Playwright test suite for template system
  - 9 happy path tests covering template switching, persistence, multi-tenant
  - Page objects: ThemeEditorPage, StorefrontPage
  - Centralized locators in `/tests/e2e/locators/theme.locators.ts`
  - Visual regression baseline screenshots
  - Test spec: `/tests/e2e/specs/template-switching-happy-path.spec.ts`
  - Documentation: `/tests/e2e/TEMPLATE_TESTS_HAPPY_PATH.md`
- **Admin Theme Editor (Issue #6)**: Complete admin UI for tenant theme customization
  - Settings page at `/{tenant}/dashboard/settings/appearance` (OWNER role only)
  - ThemeEditorClient component with real-time preview (300ms debounce)
  - TemplateSelector component with radio cards for 3 templates
  - ThemeFieldsEditor with inputs: grid columns (slider), image aspect (select), card variant (visual picker), spacing (radio), colors (hex pickers)
  - ThemePreview component with sample products using resolved theme
  - Save/Reset actions with API integration (PATCH /api/tenants/[slug]/theme)
  - Toast notifications for success/error states (Sonner)
  - Form validation with Zod + react-hook-form
  - All inputs have data-testid attributes
  - Auto-merge template defaults on template switch
  - Responsive 2-column layout (editor + preview)
- **ProductCard Variants + ProductGrid (Issue #4)**: Multi-template product display components
  - GalleryCard component (large image, minimal text, hover zoom effect)
  - DetailCard component (image + specs grid, expanded description, color swatches)
  - MinimalCard component (small image, compact layout, product name only)
  - ProductGrid component (responsive container, template-based card rendering)
  - All components consume theme CSS vars (--grid-cols, --spacing-*, --color-*, --image-aspect)
  - Loading skeleton states for all card variants
  - data-testid attributes: product-card-{variant}, product-grid-{template}
  - Next.js Image optimization with lazy loading
  - Stock indicators (out of stock, low stock badges)
  - TypeScript types integrated with Product interface from /types/commerce.ts
  - Barrel export at /components/storefront/index.ts
- **Theme Configuration API (Issue #5)**: REST endpoints for admin UI theme management
  - GET `/api/tenants/[slug]/theme` - Read tenant template + overrides (any tenant member)
  - PATCH `/api/tenants/[slug]/theme` - Update template/overrides (OWNER only)
  - Zod validation schema in `/lib/schemas/theme.ts` (matches ThemeOverrides type)
  - Role-based authorization (tenant_users membership check)
  - Partial update support (merge existing overrides)
  - DB trigger validation errors surfaced to API
- **Tenant Template Configuration Schema (Issue #2)**: Multi-template theming system
  - Database migration `015_add_tenant_template_theme.sql`
  - Added `template` column (VARCHAR, enum: gallery | detail | minimal)
  - Added `theme_overrides` column (JSONB with PL/pgSQL validation)
  - Validation trigger for gridCols, imageAspect, cardVariant, spacing, colors
  - TypeScript types in `/types/theme.ts` (TenantTemplate, ThemeOverrides, ResolvedTheme)
  - `resolveTheme()` helper function for merging defaults + overrides
  - 3 demo tenants with different templates (demo, superhotdog, minimal-demo)
  - Indexes: `idx_tenants_template`, `idx_tenants_theme_overrides` (GIN)
  - Integration guide: `/docs/PIXEL_THEME_INTEGRATION.md`
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
  - `db/scripts/clean-db.sh` - Bash cleanup script
  - `db/scripts/clean-test-data.sql` - SQL cleanup statements
  - `scripts/clean-db.js` - Node.js cleanup script with Supabase client (legacy)
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

- Added `dotenv` package for .env loading in Playwright
- Configured `playwright.config.ts` to load environment variables
- Enhanced middleware with activation detection and cache management
- Created comprehensive E2E test suite with 50+ test cases
- Implemented modular test architecture (locators, pages, fixtures, helpers)

---

_Note: This is the first tracked release. Previous work was unversioned development._
