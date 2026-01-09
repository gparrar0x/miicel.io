# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Common Changelog](https://common-changelog.org/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **Login redirect loop for tenant owners**: Fixed infinite redirect when tenant_admin/owner users logged in
  - Changed `/api/auth/login-redirect` to use tenant slug instead of numeric tenant_id in redirect URL
  - Route `/en/3/dashboard` returned 307 → login loop; now correctly uses `/en/artmonkeys/dashboard`

### Changed

- **Superadmin tenant list redesign**: Unified `/en` page with platform design system
  - Replaced legacy `mii-*` custom classes with shadcn/ui components (`Card`, `Button`)
  - Added icons: `LayoutDashboard` for dashboard, `Store` for tienda, `LogOut` for sign out
  - Uses semantic tokens (`bg-background`, `text-foreground`, `border-border`)
  - Consistent with dashboard and login page aesthetics

- **Superadmin access to all tenant dashboards**: Platform admins can now access any tenant dashboard
  - Added `is_superadmin` RPC check in dashboard layout auth guard
  - Superadmins bypass tenant ownership verification

### Fixed

- **Login redirect for 'owner' role users**: Users with `role='owner'` in `public.users` now correctly redirect to their tenant dashboard
  - Added 'owner' to allowed roles in `/api/auth/login` redirect logic
  - Changed `.single()` to `.maybeSingle()` in root page to prevent 406 error when no tenant found
  - Fixed root page post-login redirect to check `users.tenant_id` before legacy `tenants.owner_id`

### Changed

- **Login page redesign with dashboard design system**: Unified login UI with shadcn/ui components
  - Replaced legacy `mii-*` tokens with CSS variables (`bg-background`, `border-border`, etc.)
  - Uses `Card`, `Button`, `Input`, `Label` components from shadcn/ui
  - Added i18n translations for Login (ES: "Iniciar Sesión", "Entrar" / EN: "Sign In")
  - Updated both `/[locale]/login` and `/[locale]` (root) login forms for consistency
  - Form supports Enter key submission

- **Dashboard auth protection with returnUrl**: Added server-side auth guard to dashboard layout
  - Redirects unauthenticated users to `/login?returnUrl=...`
  - After login, users return to their original destination
  - Verifies tenant ownership before rendering dashboard

### Changed

- **Unified owner management in public.users table**: Tenant owners now stored in `public.users` with role='owner' for consistency
  - Migration `035_add_owner_role_and_sync.sql`: Adds 'owner' to role constraint + syncs existing owners
  - Updated `signup/route.ts`: Creates owner record in `public.users` on tenant creation
  - Updated RLS policy to recognize owners for tenant user management
  - Changed unique constraint from `UNIQUE(email)` to `UNIQUE(email, tenant_id)` to allow same user as owner of multiple tenants
  - **Why**: Single source of truth for all tenant users (owner/admin/staff) instead of split between `tenants.owner_id` and `public.users`

- **Owner email editable from dashboard**: Added owner email field to Settings > General tab
  - New field in `SettingsClient.tsx` to display and edit owner email
  - API `/api/settings` PATCH now accepts `owner_email` and syncs to `public.users`
  - i18n translations added (ES: "Email del Administrador", EN: "Owner Email")

- **Enhanced ProductForm with missing fields**: Added display_order and metadata.badges
  - `display_order`: Control product sort order (lower = first)
  - `metadata.badges`: Toggle chips for Popular/New/Sale tags
  - i18n translations for new fields in ES/EN

- **Product sizes/variants for Gallery template**: Added `metadata.sizes` editor in ProductEditModal
  - Conditional UI: Only shows when tenant template === 'gallery'
  - Size fields: label, dimensions, price, stock per variant
  - Add/remove size buttons with dynamic form
  - Template prop passed from page → AdminProductsClient → ProductEditModal
  - i18n translations for sizes section (ES/EN)

### Added

- **components.json for shadcn/ui**: Added configuration file for shadcn CLI (new-york style, RSC enabled)

- **MercadoPago Sandbox E2E Test Suite**: Complete real integration tests with MP sandbox
  - New `mercadopago.helper.ts`: Handles iframe field detection, installment selection, payment completion, and redirect handling
  - New `complete-purchase-flow-mercadopago-sandbox.spec.ts`: Full purchase flow with real MP sandbox (catalog → cart → checkout → MP payment → redirect)
  - Uses official MP test cards (Mastercard `5031755734530604`, cardholder `APRO`, DNI `12345678`)
  - Handles secure iframes via `fill()` strategy with proper waiting mechanisms
  - Added `mercadopago-sandbox` Playwright project with network permissions and extended timeouts
  - **Note**: Test automation works correctly; MP sandbox may reject payments due to Access Token configuration

### Changed

- **Unified admin pages with dashboard design pattern**: Products, Orders, Settings pages now inherit shared layout (Sidebar + Header) from dashboard
  - Removed duplicate `AdminSidebar` component - all pages use `components/dashboard/sidebar.tsx`
  - Migrated client components to content-only (no layout wrappers)
  - Unified table headers: `bg-secondary` + `text-xs font-semibold uppercase tracking-wider text-muted-foreground`
  - Settings page refactored to use shadcn `Tabs`, `Card`, `Button` components
  - All hardcoded colors (`gray-*`, `black`, `blue-*`) replaced with CSS variables for dark mode support
  - Added `data-testid` attributes to sidebar navigation for E2E testing
  - Fixed tenant lookup to support both numeric IDs and slugs in URL params
  - Files: `AdminProductsClient.tsx`, `AdminOrdersClient.tsx`, `SettingsClient.tsx`, `OrdersTable.tsx`, `ProductsTable.tsx`, `sidebar.tsx`, page files

### Fixed

- **Vercel build failures**: Added missing deps (`@radix-ui/react-avatar`, `@radix-ui/react-dropdown-menu`, `recharts`) + upgraded Next.js 16.0.1→16.1.0 to fix critical CVEs (RCE, Server Actions exposure, DoS). Files: `package.json`

### Changed

- **Dashboard sync with design-system (MIIC-7)**: Aligned dashboard layout and components with design-system source of truth
  - Copied dashboard components from DS: Sidebar, Header, StatCard, ChartCard, DataTable
  - Updated Sidebar to accept configurable `brand` + `navItems` props for multi-tenant support
  - Dashboard page now matches DS exactly: 4 StatCards + 2 charts (50/50) + orders table
  - Fixed CSS variable mapping: `--color-secondary` now points to Shadcn `--secondary` (light gray) instead of `--color-ink` (black)
  - Added `.dark` class support for Header theme toggle
  - Added i18n keys: navDashboard, navProducts, navOrders, navSettings, etc.
  - Files: `components/dashboard/*`, `components/ui/*`, `app/globals.css`, `messages/*.json`

### Added

- **Complete Purchase Flow E2E Test (SKY-13)**: New test covering full buyer journey - catalog → product → cart → checkout → MercadoPago → success → WhatsApp
  - `complete-purchase-flow.spec.ts`: 3 tests validating end-to-end purchase with MP payment simulation
  - Tests verify WhatsApp button visibility based on payment status (`paid` vs `pending`)
  - Fixed `checkout-mercadopago.spec.ts` tenant from `demo_restaurant` to `demo_galeria`
  - **Result**: 9/9 checkout-related tests passing

### Fixed

- **Dashboard redirect loop with numeric tenant IDs (MII-6)**: Auth proxy now resolves tenants by ID or slug and preserves locale-aware redirects to break loops after login. Roles checked against `users` table (platform_admin, tenant_admin, staff, owner) before allowing dashboard access. Files: `proxy.ts`

### Changed

- **MercadoPago checkout flow (MIIC-6)**: Persist `checkout_id` (preference_id) en órdenes, webhook valida firma con secreto por tenant (fallback global) y usa token MP del tenant (fallback global), success page muestra CTA de WhatsApp solo con pagos `paid`, y los specs de checkout permiten configurar slug/base URL por env.
- **Gallery Identity Rebrand (MIIC-5)**: Adopted gallery template visual identity across platform areas (landing, login, dashboard)
  - **Design tokens**:
    - Extended Tailwind config with gallery colors (`gallery-gold: #B8860B`, `gallery-black: #1A1A1A`), brutal shadows, Cinzel/Inter fonts
    - Updated shadcn variables: `--accent` and `--ring` now use gallery gold (#B8860B)
    - Updated platform defaults: `--color-primary` → black, `--color-accent` → gold
  - **Platform pages updated**:
    - **Landing (`app/[locale]/page.tsx`)**: Orange → gold (logo, buttons, hover), brutal shadows on tenant cards, Cinzel headings, noise overlay
    - **Login (`app/[locale]/login/page.tsx`)**: Gold focus rings, brutal shadows on card, rounded-none, Cinzel heading, noise bg
    - **Dashboard (`app/[locale]/[tenantId]/dashboard/page.tsx`)**: Blue gradient → black header, gold stat icons, brutal shadows on cards
    - **AdminSidebar**: Gold active nav states, gold user avatar, gold Store icon, brutal shadow on container
  - **Typography**: All platform headings now use `font-display` (Cinzel serif)
  - **Visual effects**: Brutal shadows (4px 4px 0px black), noise overlays on backgrounds
  - **Scope**: Platform areas only - tenant storefronts maintain custom theming
  - **Build**: Successful, no breaking changes
  - Files: `tailwind.config.ts`, `app/globals.css`, `app/[locale]/page.tsx`, `app/[locale]/login/page.tsx`, `app/[locale]/[tenantId]/dashboard/page.tsx`, `components/AdminSidebar.tsx`

### Added

- **User System Architecture (MII-4)**: Implemented separate tables for customers and staff/admin users
  - **Database schema**:
    - Enhanced `customers` table with `loyalty_points`, `total_orders`, `total_spent`, `last_order_at` (auto-updated via trigger)
    - Created `users` table for staff/tenant_admin/platform_admin with RLS policies
    - Trigger `update_customer_stats()` auto-updates customer analytics on order status changes
  - **Auth integration**:
    - Login redirect logic updated to support `users` table roles (tenant_admin → dashboard, platform_admin → tenant list)
    - Backward compatible with existing `tenants.owner_id` auth flow
    - Created auth user + linked to `users` table via `auth_user_id` column
  - **Seeded users**:
    - Platform admin: `admin@skywalking.dev`
    - ArtMonkeys tenant admin: `info@artmonkeys.store` (tenant_id=3)
  - **Migrations**: 031-034 (enhance_customers, create_users, customer_update_functions, seed_platform_admin)
  - **Impact**: Foundation for multi-role auth, customer loyalty programs, and tenant-scoped admin access
  - Files: `db/supabase/migrations/031-034`, `app/api/auth/login/route.ts`

### Fixed

- **E2E Tests Gallery Template Support (SKY-13)**: Fixed checkout tests for gallery template with proper product flow
  - **Pixel fixes**: Added missing testids to gallery components
    - `product-card` in GalleryGrid (product listing)
    - `product-add-to-cart` in ArtworkDetail (add button)
    - `product-size-{id}` in ArtworkDetail (size selection)
    - `cart-checkout-button` in GalleryGrid (floating cart)
    - `cart-item-count` in GalleryGrid (cart counter)
  - **Sentinela fixes**: Updated test logic to add products before checkout
    - `checkout-flow.spec.ts`: Tests now click product → select size → add to cart → checkout
    - `checkout-mercadopago.spec.ts`: Fully rewritten with proper product add flow
  - **Bug fix**: Trimmed `demo_galeria` slug (had trailing space causing redirect loops)
  - **Test results**: 5/22 passing (gallery checkout working, admin/signup tests still failing)
  - Files: `components/gallery-v2/*.tsx`, `tests/e2e/specs/checkout-*.spec.ts`

### Changed

- **E2E Tests Now Use Demo Tenants (Test Infrastructure)**: Updated all E2E tests to use production demo tenants instead of creating test data
  - **Test tenants**: Now use `demo_galeria` (ID 1) and `demo_restaurant` (ID 2)
  - **Fixtures updated**: `seed-test-data.ts` uses existing demos, updates owner to test user
  - **Auth fixtures**: Default tenant changed from `test-store` → `demo_galeria`
  - **Specs updated**: 5 test files updated with new tenant slugs and locale paths
    - `checkout-flow.spec.ts`: Uses `/es/demo_galeria`
    - `admin-products-crud.spec.ts`: Uses `demo_galeria`
    - `admin-orders-management.spec.ts`: Uses `demo_galeria`
    - `product-image-upload.spec.ts`: Uses `demo_galeria`
    - `cross-tenant-isolation.spec.ts`: Uses `demo_galeria` (tenant A) + `demo_restaurant` (tenant B)
  - **No test data creation**: Tests reuse existing demo products/config
  - **Owner assignment**: Test user (`owner@test.com`) temporarily assigned as demo tenant owner during tests
  - **Impact**: Faster test execution, no DB cleanup needed, tests run against real demo environment
  - Files: `tests/e2e/fixtures/*.ts`, `tests/e2e/specs/**/*.spec.ts`

- **Tenants Renumbered to Sequential IDs 1-5 (DB Maintenance)**: Renumbered all tenants to consecutive IDs without breaking references
  - **ID mapping**:
    - ID 1: demo_galeria (unchanged, 3 products)
    - ID 36 → ID 2: demo_restaurant (13 products)
    - ID 38 → ID 3: artmonkeys (3 products, 19 orders, 22 customers)
    - ID 39 → ID 4: superhotdog (25 products)
    - ID 40 → ID 5: mangobajito (13 products, 4 orders, 2 customers)
  - **Foreign keys preserved**: All products, orders, customers, payments updated to new tenant_ids
  - **Sequence reset**: tenants_id_new_seq → 6 (next tenant will be ID 6)
  - **Zero data loss**: All references maintained, no broken foreign keys
  - **Impact**: Clean sequential tenant IDs for better database organization
  - Migration: `030_renumber_tenants_1_to_5.sql`

- **Demo Tenants Reset & Clone (DB Maintenance)**: Cleaned and populated demo tenants with production data
  - **Deleted test tenants**: Removed IDs 43-45 (empty, no references)
  - **demo_galeria (ID 1)**: Cloned from artmonkeys (ID 38)
    - Config: template=gallery, all branding/colors/settings copied
    - Products: 3 products cloned (gallery template showcase)
  - **demo_restaurant (ID 36)**: Cloned from mangobajito (ID 40)
    - Config: template=restaurant, all branding/colors/settings copied
    - Products: 13 products cloned (Venezuelan food menu)
  - **Sequence reset**: tenants_id_new_seq → 50 (next tenant will be ID 50)
  - **Source tenants preserved**: artmonkeys (38) and mangobajito (40) unchanged
  - **Impact**: Clean demo environments with real production data for testing/demos
  - Migration: `029_reset_tenants_and_clone_demos.sql`

## [0.3.0] - 2025-11-26

### Fixed

- **Restaurant Template Dark Mode Support (MII-14)**: Fixed text contrast issues in restaurant template when OS dark mode is enabled
  - **Root cause**: Tailwind `dark:*` classes require either `class` strategy + `<html class="dark">` or `media` strategy to detect OS preference
  - **Solution**:
    1. Added `dark:*` variant classes to all restaurant components (titles, descriptions, backgrounds, borders)
    2. Created `tailwind.config.ts` with `darkMode: 'media'` to auto-detect OS dark mode
  - **Components fixed**: ProductCardRestaurant, CartSheet (23 elements), RestaurantLayout, ProductGridRestaurant, CartSummary
  - **Impact**: All restaurant components now readable in both light and OS dark mode with proper contrast
  - Files: `tailwind.config.ts` (new), `components/restaurant/**/*.tsx` (5 files, 31 dark mode classes)

### Changed

- **Branding Migration: Vendio → Miicel.io**: Complete rebranding across entire codebase and documentation
  - **Service name**: Changed from "sw_commerce_saas"/"sw_commerce_vendio"/"Vendio" to "Miicel.io"
  - **Production URL**: Updated from `vendio.vercel.app` → `miicel.io`
  - **Documentation**: Rebranded all user-facing docs (README, deployment guides, API docs)
  - **Configuration**: Updated service name in health endpoint, Playwright config, Docusaurus site
  - **Website**: Updated Docusaurus title, navbar, and all documentation references
  - **Deployment guides**: Updated all URLs, domain examples, and deployment instructions
  - **Product docs**: Updated product overview, roadmap, and vision documents
  - **Environment files**: Updated `.env` comments and Vercel production URL
  - **Backlog**: Updated all ticket documentation and implementation notes
  - **Impact**: Consistent "Miicel.io" branding across 24+ files including docs, tests, and configs
  - Files: `CHANGELOG.md`, `README.md`, `app/api/health/route.ts`, `playwright.config.ts`, `website/docusaurus.config.ts`, `docs/**/*.md`, `website/docs/**/*.md`, `tests/**/*.md`, `.env`, and more

### Fixed

- **Dashboard Metrics - Tenant Isolation & Monthly Scope**: Fixed dashboard showing aggregated data from all tenants instead of current tenant
  - **Root cause**: Queries missing `tenant_id` filter and using non-existent order status
  - **Product count**: Added `.eq('tenant_id', tenantData.id)` filter (was showing all active products)
  - **Order status**: Changed from `'completed'` (non-existent) to `.in('status', ['paid', 'preparing', 'ready', 'delivered'])`
    - Valid order statuses: `pending`, `paid`, `preparing`, `ready`, `delivered`, `cancelled`
    - Dashboard now counts orders with revenue (excludes pending/cancelled)
  - **Monthly filter**: Added `firstDayOfMonth` filter to show only current month orders/revenue
    - Orders: `.gte('created_at', firstDayOfMonth)`
    - Revenue: Calculated only from current month orders
  - **Translations updated**: Changed labels to reflect monthly scope
    - ES: "Pedidos Completados" → "Pedidos del Mes", "Ingresos Totales" → "Ingresos del Mes"
    - EN: "Completed Orders" → "Orders This Month", "Total Revenue" → "Revenue This Month"
  - **Impact**: Dashboard now shows accurate per-tenant, current-month metrics instead of system-wide all-time data
  - Files: `app/[locale]/[tenantId]/dashboard/page.tsx`, `messages/es.json`, `messages/en.json`

### Added

- **Superadmin Tenant List Dashboard**: Complete tenant management interface for superadmins
  - Auto-detects user role on root page (`/`) after login
  - Superadmins see tenant list grid with all active tenants
  - Tenant owners redirect to their dashboard (`/es/{slug}/dashboard`)
  - Non-authenticated users see login form
  - Tenant cards display: logo (or initial), name, slug
  - Dual action buttons per tenant: "Dashboard" (admin panel) + "Tienda" (storefront)
  - Sign Out button in header
  - Responsive grid: 1 col mobile → 2 cols tablet → 3 cols desktop
  - Uses `/api/tenants/list` endpoint for tenant data
  - Client-side auth detection with `@supabase/ssr` browser client
  - File: `app/[locale]/page.tsx`

### Changed

- **Next.js 16 Migration**: Migrated from `middleware.ts` to `proxy.ts` following Next.js 16 deprecation
  - Renamed file: `middleware.ts` → `proxy.ts`
  - Renamed exported function: `middleware()` → `proxy()`
  - Runtime changed from Edge to Node.js (more compatible with Supabase SSR)
  - Added `turbopack.root` config to `next.config.ts` to resolve workspace root inference
  - Eliminates deprecation warning: "The 'middleware' file convention is deprecated"
  - Files: `proxy.ts`, `next.config.ts`
  - Reference: [Next.js Proxy Migration Guide](https://nextjs.org/docs/messages/middleware-to-proxy)

### Fixed

- **Environment Variables**: Synchronized Supabase API keys between `.env` and `.env.local`
  - Updated `NEXT_PUBLIC_SUPABASE_ANON_KEY` to latest key (iat:1762744938)
  - Replaced placeholder `SUPABASE_SERVICE_ROLE_KEY` with actual service role key
  - Added missing `ENCRYPTION_KEY` to `.env.local`
  - Resolves "Invalid API key" error on localhost:3000
  - Files: `.env.local`

### Fixed

- **Restaurant Template - MercadoPago Redirect**: Fixed checkout button showing alert instead of redirecting
  - Removed `alert('Redirigiendo a la página de pago...')` placeholder
  - Integrated with `/api/checkout/create-preference` endpoint
  - Direct redirect to MercadoPago without user notification
  - Added loading overlay during payment processing
  - Button shows "Procesando..." state with spinner
  - Form fields disabled during submission
  - Toast error notifications on failure
  - File: `components/restaurant/organisms/CartSheet.tsx`

### Added

- **Smart Login Redirect**: Enhanced login flow with role-based redirects
  - **Superadmin redirect**: Superadmins redirect to root (tenant list) after login
  - **Tenant owner redirect**: Tenant owners redirect to their store dashboard (`/es/{tenantSlug}/dashboard`)
  - **API enhancement**: Login endpoint (`/api/auth/login`) now returns `redirectTo` field based on user role
  - **Role detection**: Uses `is_superadmin()` RPC function to determine user type
  - **Tenant lookup**: Non-superadmins have their tenant slug fetched from database
  - **Frontend integration**: Login pages use `redirectTo` from API response as fallback
  - Files: `app/api/auth/login/route.ts`, `app/[locale]/login/page.tsx`, `app/[locale]/page.tsx`

- **Branding Update**: Rebranded from "Miceliio" to "Miicel.io"
  - **Page title**: Updated metadata title to "Miicel.io" with description "Red de comercios descentralizada"
  - **Login header**: Changed branding text from "Miceliio" to "Miicel.io"
  - **Seed data**: Updated demo tenant name from "Demo Store" to "Demo Store - Miicel"
  - **Metadata**: Added page metadata to locale layout for SEO
  - Files: `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`, `db/supabase/migrations/013_seed_tenant_theme_config.sql`

- **Build Configuration**: Excluded website directory from TypeScript compilation
  - Added `website` to `tsconfig.json` exclude list to prevent build errors
  - File: `tsconfig.json`

- **Docusaurus Documentation Site**: Complete documentation system with structured navigation and search
  - **Installation**: Docusaurus 3.9.2 installed in `/website` subfolder with TypeScript classic template
  - **Configuration**: Customized `docusaurus.config.ts` with Miicel.io branding, navbar, and footer
  - **Documentation structure**: Organized docs into logical categories:
    - `getting-started/`: Quick start, deployment guide, environment variables
    - `guides/`: Admin theme editor, product management, user flows, quick wins
    - `architecture/`: Overview, database schema, templates, product roadmap
    - `api/`: Orders API reference
  - **Sidebar navigation**: Custom sidebar with hierarchical structure for easy navigation
  - **Landing page**: Custom homepage with hero section, feature cards, and quick links
  - **Scripts**: Added `docs:dev`, `docs:build`, and `docs:serve` commands to root `package.json`
  - **Migration**: Migrated 15+ existing documentation files with proper frontmatter
  - **Build**: Production build successful, all MDX compilation errors resolved
  - **Integration**: Updated README with documentation links and development commands
  - Files: `website/`, `package.json`, `README.md`

- **Login Page as Main Landing**: Converted main page (`/[locale]/page.tsx`) to login page
  - **Header**: Simple header with logo placeholder (circular "M" badge) and "Miceliio" branding
  - **Login Form**: Centered login form with email/password fields, error handling, and loading states
  - **Integration**: Reuses existing `/api/auth/login` endpoint for authentication
  - **UX**: Responsive design, accessibility features (data-testid attributes), consistent styling with existing design system
  - **Redirect**: After successful login, redirects to returnUrl query param or root path
  - File: `app/[locale]/page.tsx`

- **Vercel Deployment Infrastructure (SKY-15)**: Complete production deployment configuration
  - **Build config**: `vercel.json` with optimized settings (iad1 region, cache headers, Next.js 16 framework)
  - **Health endpoint**: `/api/health` for uptime monitoring (edge runtime, returns status + timestamp)
  - **Analytics**: Integrated `@vercel/analytics` and `@vercel/speed-insights` in main layout for Core Web Vitals tracking
  - **Dependencies**: Added missing Radix UI packages required by shadcn components:
    - `@radix-ui/react-separator` (Separator component)
    - `@radix-ui/react-dialog` (Sheet component)
    - `@radix-ui/react-label` (Label component)
  - **Build optimization**: 
    - `.vercelignore` excludes backup folders (`app_backup`, prototypes) from deployment
    - `tsconfig.json` updated to exclude legacy code from compilation
    - Build output: 197MB (well under 250MB Vercel Free tier limit)
    - Zero TypeScript errors, 22 routes, 40 API endpoints compiled successfully
  - **Deployment guides**:
    - `VERCEL_DEPLOYMENT_GUIDE.md`: Complete step-by-step instructions (domain, SSL, webhooks, monitoring)
    - `VERCEL_DEPLOYMENT_SUMMARY.md`: Quick reference for 30min deployment
    - Updated README with production URL and deployment links
  - **Bug fixes**:
    - Webhook route: Commented out `payments` table upsert (table not yet migrated) to unblock deployment
    - Fixed optional chaining in `KitchenDisplayOrders.tsx` causing TypeScript error
  - Files: `vercel.json`, `.vercelignore`, `app/api/health/route.ts`, `app/[locale]/layout.tsx`, `tsconfig.json`, `package.json`, `docs/VERCEL_DEPLOYMENT_*.md`

- **Tenant Hero Branding (Settings + Onboarding)**: Unified configuration for storefront hero card (logo, name, hero text, location, hours)
  - **Storefront hero**: Restaurant header now shows `[LOGO] Nombre`, hero tagline, `📍 Ubicación` y `🕒 Horario de hoy` usando `config.subtitle`, `config.location` y `config.hours`
  - **Settings → General / Contacto y Horarios**: Nuevos campos para frase principal y ubicación, horas por día guardadas en `tenants.config`
  - **Onboarding Steps 1–2**: Permite definir logo, banner, colores, frase hero, ubicación y un horario base que se replica a los 7 días

- **Bidirectional Store ↔ Dashboard Navigation**: Quick access between admin and storefront views
  - **Dashboard → Store**: Added "View Store" link in sidebar (below main navigation)
  - **Store → Dashboard**: Added `DashboardAccessButton` floating button on all storefront templates
    - Only visible to superadmins and tenant owners (auth check via `/api/auth/check-superadmin`)
    - Positioned below cart button with matching brutalist design
    - Works across all templates (gallery, restaurant, default)
  - Files: `components/AdminSidebar.tsx`, `components/DashboardAccessButton.tsx`, `lib/auth/permissions.ts`, `app/api/auth/check-superadmin/route.ts`

- **MercadoPago Payment Tracking**: Complete payment transaction tracking system
  - **Database schema:**
    - Added `checkout_id` field to `orders` table to store MercadoPago preference_id
    - Created `payments` table with comprehensive payment data:
      - `id`: Internal PK (auto-increment, not exposed externally)
      - `order_id`: Foreign key to orders
      - `payment_id`: MercadoPago payment ID (unique, external reference)
      - `status`, `status_detail`: Payment status tracking
      - `payment_type`, `payment_method_id`: Payment method information
      - `amount`, `currency`: Transaction amount details
      - `payer_email`, `payer_name`: Payer information
      - `metadata`: Additional MP data (merchant_order_id, transaction_details, card_info)
    - RLS policies for tenant access control
  - **Data model rationale:**
    - `orders.payment_id` maintained for fast queries without JOINs (dashboard, list views)
    - `payments` table provides complete audit trail with full transaction metadata
    - Relationship: `orders.payment_id = payments.payment_id` (both reference MP payment ID)
    - Lifecycle: `orders.checkout_id` (created on checkout) → `orders.payment_id` (set on payment completion)
  - **Checkout flow improvements:**
    - Updated back_urls to redirect to proper checkout pages with locale (`/es/{tenantId}/checkout/success`, `/checkout/failure`, `/checkout/pending`)
    - **Fixed:** Added missing locale segment to MP redirect URLs (was `/{tenantId}/...`, now `/es/{tenantId}/...`)
    - **Fixed:** MP redirect now works in localhost using `window.location.origin` strategy (inspired by mangobajito)
      - Client sends actual browser URL (`returnUrl`) instead of server reading env var
      - Handles `127.0.0.1` vs `localhost` mismatches automatically
      - `auto_return='approved'` now enabled in all environments (MP decides if it works)
      - "Volver al sitio" button appears reliably even in localhost
    - Create-preference endpoint now saves `checkout_id` to order
    - Success page captures and displays MP query params (payment_id, status, payment_type)
  - **Webhook enhancements:**
    - Webhook now creates/updates payment record in `payments` table
    - Upserts payment data to handle duplicate webhook calls
    - Stores comprehensive payment details including payer info, card details, transaction data
  - Migration: `028_add_checkout_and_payments_table.sql`
  - Files modified: `app/api/checkout/create-preference/route.ts`, `app/api/webhooks/mercadopago/route.ts`, `app/[locale]/[tenantId]/checkout/success/page.tsx`

- **Tenant Banner Upload (Settings + Onboarding)**: Allow owners to upload and update storefront hero banner
  - **Settings → General**: New banner picker with preview; uploads to Supabase `assets` bucket via `POST /api/settings/upload-banner`
  - **Onboarding Step 1**: Extended to optionally upload banner alongside logo; persisted as `config.banner` and used by restaurant header

### Fixed

- **Checkout Flow Deduplication**: Unified order creation to prevent duplicate orders
  - Removed duplicate call to `/api/orders/create` from CheckoutModal
  - Now uses single endpoint `/api/checkout/create-preference` that creates order + MP preference
  - Added `sizeId` support to checkout preference schema
  - Prevents: Creating 2 separate orders (one with size_id, one without)
  - Fixes: "Checkout preference creation failed: {}" error

- **Stock Decrement Timing**: Stock now only decrements when payment is confirmed, not on order creation
  - Migration `fix_stock_decrement_only_on_paid`: Changed trigger from AFTER INSERT to AFTER UPDATE
  - Stock only decrements when order status changes from any status → 'paid'
  - Prevents stock loss from abandoned carts or unpaid orders
  - Webhook `/api/webhooks/mercadopago` updates status to 'paid' when payment approved
  - Flow: Create order (pending) → Pay → Webhook confirms → Status = 'paid' → Stock decrements
  - Previous behavior: Stock decremented immediately on order creation (incorrect)

- **Database Stock Triggers for Size Variants**: Updated stock validation and decrement triggers
  - Migration `update_stock_triggers_for_sizes`: Triggers now support `metadata.sizes[]` stock
  - `validate_stock_on_order()`: Validates size-specific stock when `size_id` provided in order items
  - `decrement_stock_on_order()`: Decrements size-specific stock in `metadata.sizes[]`
  - Falls back to general `products.stock` when no `size_id` provided
  - Respects restaurant template (skips stock validation/decrement)
  - Order items now include `size_id` field for proper stock tracking
  - Fixes: "Insufficient stock for product: Toro (P0001)" error when ordering products with size variants

- **Supabase Types Update**: Regenerated TypeScript types to include `metadata` column in products table
  - Fixed missing `metadata: Json | null` field in `products.Row` type
  - Resolves order creation failures when validating size-specific stock
  - Types now match database schema after migration 021

### Added

- **Stock Validation for Product Size Selection**: Complete size-based stock management
  - **Frontend validation:**
    - Size selector buttons automatically disable when out of stock
    - "Add to Cart" button validates stock before allowing addition
    - Visual feedback: disabled state with opacity and "Sin stock" label
    - Prevents cart additions for unavailable sizes
    - Products without `metadata.sizes` in DB have all sizes disabled (stock: 0)
    - Forces explicit size configuration per product in metadata
    - Applied to: `ArtworkDetail` component and page loaders (`page.tsx`, `product/[id]/page.tsx`)
  - **Backend validation:**
    - Order creation endpoint now validates size-specific stock from `metadata.sizes[]`
    - CheckoutModal sends `sizeId` to order endpoint for proper validation
    - Returns detailed error messages: "Insufficient stock for Product (Size). Available: X"
    - Falls back to general `product.stock` if no size selected
    - Applied to: `/api/orders/create/route.ts`, `CheckoutModal.tsx`

- **Gallery Template V2 Integration (v0 Design)**: Complete frontend implementation of the modern "Gallery" template
  - **New Components**:
    - `GalleryGrid`: Responsive artwork grid with collection filtering tabs
    - `ArtworkDetail`: Immersive product detail view with size selection and "Add to Cart" animation
    - `GalleryHeader`: Minimalist sticky header with cart drawer integration
    - `CartSheet`: Slide-over cart with updated styling
  - **UI Library**: Added `ScrollArea`, `Tabs`, and `ShadcnBadge` to `components/ui/`
  - **Styling**:
    - Unified Shadcn/OKLCH CSS variables in `globals.css`
    - Forced monochrome light theme for all gallery template pages
    - Updated typography and spacing to match "Art Gallery" aesthetic
  - **Pages**: Integrated new components into `app/[locale]/[tenantId]/page.tsx` and `product/[id]/page.tsx`

### Security

- **Security Audit & Performance Review (SKY-14)**: Production-ready security hardening
  - **FIXED (HIGH)**: Recreated 3 views with `security_invoker=true` to eliminate SECURITY DEFINER warnings
    - `tenants_public`, `daily_sales`, `top_products` now use caller permissions
  - **FIXED (MEDIUM)**: Added explicit `search_path` to 3 functions to prevent SQL injection
    - `validate_theme_overrides()`, `get_product_badges()`, `is_superadmin()` now use `SET search_path = public, pg_temp`
  - **OPTIMIZED**: RLS policies now use `(select auth.uid())` subselects to prevent per-row re-evaluation
    - Applied to 9 policies across `tenants`, `products`, `orders` tables
  - **OPTIMIZED**: Consolidated 38 permissive policies into 16 unified policies using OR logic
    - Reduced policy evaluation overhead by ~58%
  - **CLEANED**: Removed 19 unused indexes to improve write performance
    - Products: 3 indexes, Orders: 5 indexes, Tenants: 5 indexes, Customers: 2 indexes
  - **TODO (Manual)**: Enable leaked password protection in Supabase Dashboard
    - Navigate to: Authentication > Settings > Password Security
    - Enable: "Check for breached passwords (HaveIBeenPwned)"
    - Reference: https://supabase.com/docs/guides/auth/password-security
  - **Result**: 0 HIGH issues, all WARN issues addressed or documented
  - **Migrations**: `fix_security_definer_views`, `fix_function_search_path_secure`, `optimize_rls_auth_subselects`, `consolidate_permissive_policies`, `remove_unused_indexes`, `final_policy_consolidation`

### Added

- **Product Image Upload E2E Tests (SKY-44)**: Complete test coverage for image upload flow
  - Test suite: `tests/e2e/specs/products/product-image-upload.spec.ts` (4 test cases)
  - Page Objects: `ProductFormPage`, `ProductsDashboardPage` for modular architecture
  - Tests: Upload new product with image, Replace image on edit, Create without image, Invalid file type validation
  - DB verification: Supabase admin client checks, image URL accessibility tests
  - Execution: <30s total, parallel-safe, screenshots on failure
  - Fixture: `tests/e2e/fixtures/images/test-product.png`

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
