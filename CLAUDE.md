# CLAUDE.md

> micelio.skyw.app — AaaS Product-Led Platform (multi-tenant e-commerce + AI agents)
> Updated: 2026-04-12

---

## Multi-Agent System

Ver `../../CLAUDE.md` para metodologia completa, agentes disponibles y `subagent_type`.

### Backlog (este proyecto)

- `docs/backlog/active/` — Task files por agente
- `docs/backlog/done/` — Completados
- `/backlog/` — Issue specs (YAML frontmatter para Linear sync)

---

## Project Overview

Multi-tenant e-commerce SaaS (micelio.skyw.app). Merchants create customizable storefronts with templates (Gallery, Restaurant/Gastronomy). Products, orders, payments (MercadoPago), consignment tracking, AI agents, and social publishing.

**Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, Supabase (PostgreSQL), Vercel.

## Commands

```bash
# Development
pnpm dev                      # Start dev server (localhost:3000)
pnpm build                    # Production build
pnpm biome:check              # Lint + format check (Biome)
pnpm biome:fix                # Auto-fix lint + format

# Testing
pnpm test                     # Vitest unit tests
pnpm test:watch               # Vitest watch mode
pnpm test:e2e                 # Playwright E2E (headless)
pnpm test:e2e:ui              # UI mode (recommended for debugging)
pnpm test:e2e:headed          # Visible browser
pnpm test:e2e:local           # Against localhost:3000
pnpm test:e2e:prod            # Against production

# Run single test
npx playwright test tests/e2e/specs/checkout-flow.spec.ts
npx playwright test -g "should successfully create tenant"

# Database
pnpm db:reset                 # Clean & reset database

# Docs (Docusaurus)
pnpm docs:dev                 # localhost:3001
```

## Architecture

### Multi-Tenant Routing
```
app/[locale]/[tenantId]/...   # Tenant-scoped routes
```
- Tenant lookup by numeric ID or slug
- Tenant-specific themes stored in DB (config JSONB + theme_overrides)
- RLS enforces data isolation per tenant

### Key Directories
```
app/                          # Next.js App Router
  [locale]/[tenantId]/        # Storefront pages (products, cart, checkout)
  [locale]/[tenantId]/dashboard/  # Admin dashboard (products, orders, settings, consignments)
  api/                        # API routes (checkout, webhooks, orders, products, settings)
components/                   # React components (commerce, admin, dashboard, gallery-v2, restaurant, storefront)
lib/                          # Utilities (auth, supabase clients, stores, schemas)
  stores/cartStore.ts         # Zustand cart (localStorage)
  schemas/                    # Zod validation schemas
services/                     # Business logic layer
  repositories/               # DB queries (tenant, product, order, customer repos)
  checkout.service.ts         # Checkout orchestration
db/supabase/migrations/       # SQL migrations (051 total)
tests/e2e/                    # Playwright E2E (30 specs, 3-tier pattern)
types/                        # TypeScript types (database.types.ts auto-generated)
styles/                       # Design tokens (tokens.css)
i18n/                         # Internationalization
scripts/                      # CLI utilities (clean-db, create-admin, bulk-products)
```

### Database Layer (Supabase/PostgreSQL)

**Core tables:**
| Table | Purpose |
|-------|---------|
| `tenants` | Stores/shops — slug, template, config (JSONB), theme, MP token (encrypted) |
| `products` | Items — name, price, category, image, metadata (badges), display_order |
| `orders` | Order lifecycle — items (JSONB), status, payment, discounts |
| `customers` | Buyer profiles — upserted by email during checkout |
| `payments` | MercadoPago transaction records — separate from orders for audit |
| `users` | Staff/admin accounts — role-based (platform_admin, tenant_admin, staff, owner) |

**Feature tables:**
| Table | Purpose |
|-------|---------|
| `modifier_groups` / `modifier_options` | Product customizations (extras, add-ons) with price deltas |
| `discounts` | Fixed/percentage discounts, order/item scope, date-bounded |
| `consignment_locations` | Physical locations for artwork placement (gallery template) |
| `artwork_consignments` | Track artwork across locations (assigned/returned/sold) |
| `authors` / `author_landings` | Artist profiles and public landing pages |
| `feature_flags` | DB-driven flags with tenant/user targeting, 1-min server cache |
| `whatsapp_messages` | WhatsApp Business message log |
| `agent_*` tables | AI agent configurations and execution logs |
| `content_generation` / `social_media` | AI content and social publishing |

**RLS pattern** (performance-critical):
```sql
-- Wrap auth.uid() with (select ...) — evaluated once, not per row
USING (tenant_id IN (SELECT id FROM tenants WHERE owner_id = (select auth.uid())))
```

### Template System
```
gallery      → Art galleries, marketplace (QR-based ordering)
restaurant   → Food delivery, QSR
gastronomy   → Extended restaurant with modifiers/discounts
detail       → Rich product descriptions (digital products)
minimal      → Lean storefront
```

### Demo Tenants

| Slug | Template | Currency | Purpose |
|------|----------|----------|---------|
| `demo_galeria` | gallery | ARS | Cloned from artmonkeys |
| `demo_restaurant` | restaurant | ARS | Cloned from mangobajito |
| `sazon-criollo` | restaurant | COP | Colombia showcase (Bogota) |

### Checkout Flow
```
Cart (Zustand/localStorage)
  → POST /api/checkout/create-preference
    → Resolve prices from DB (never trust client)
    → Upsert customer by email
    → Create order (status: pending)
    → If cash: return orderId
    → If MercadoPago: create preference → return redirect URL
      → Customer pays on MP
      → Webhook: POST /api/webhooks/mercadopago
        → Validate signature → update order status → log payment
```

### Testing Architecture (3-tier)
```
specs/*.spec.ts        → Business scenarios ("what to test")
pages/*.page.ts        → Page objects with reusable methods
locators/*.locators.ts → Selector definitions (single source of truth)
```
- 30 E2E specs covering: checkout, admin CRUD, consignments, gastronomy (modifiers/discounts), OAuth, content, social
- Use `data-testid` for selectors
- Use `generateTestData()` for unique test data
- Always call `dbCleanup()` after tenant/user creation tests

## Code Conventions

- TypeScript strict mode
- Biome for linting + formatting (not ESLint)
- 2-space indent, tabs for Biome config
- Components: PascalCase (`ProductCard.tsx`)
- Hooks: `useHookName`
- Routes: kebab-case
- Zod schemas: `xxxSchema`
- Pre-commit: Lefthook runs Biome check

## Styling

- Tailwind CSS v4 with design tokens in `styles/tokens.css`
- CSS variables for theming (dark mode via `.dark` class)
- shadcn/ui components in `components/ui/`
- Neo-brutalist aesthetic: monochrome base + gold accents

## Payments

MercadoPago webhooks in `app/api/webhooks/mercadopago/`. MP access tokens stored AES-256-GCM encrypted in `tenants.secure_config`.

Sandbox testing requires `MERCADOPAGO_TEST_ACCESS_TOKEN` env var.

### MercadoPago Sandbox E2E Tests

**Status:** Test automation complete | MP sandbox approval pending

**What works:**
- Full E2E flow: catalog → cart → checkout → MP redirect → form fill → payment submit
- Secure iframe handling for card number, expiration, CVV fields
- Helper: `tests/e2e/helpers/mercadopago.helper.ts`

**To run MP sandbox tests:**
```bash
npx playwright test tests/e2e/specs/complete-purchase-flow-mercadopago-sandbox.spec.ts \
  --project=mercadopago-sandbox --headed --timeout=120000
```

## Environment Variables

Required in `.env`:
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # Bypasses RLS for cleanup
ENCRYPTION_KEY=                 # AES-256-GCM for MP tokens
MERCADOPAGO_TEST_ACCESS_TOKEN= # For E2E sandbox tests
SLACK_BOT_TOKEN=               # Health alerts to #micelio-alerts
CRON_SECRET=                   # Vercel cron auth (auto-set by Vercel)
```

## Health Monitoring

- `/api/health` — DB connectivity check, returns 200/503
- `/api/cron/health-check` — Vercel cron every 5 min, alerts `#micelio-alerts` (Slack `C0AQNLALT2N`) on failure
- Incident policy: rollback first, diagnose second (see `../../CLAUDE.md`)

## Deployment

- **Production:** https://micelio.skyw.app (Vercel)
- **Staging:** https://micelio.vercel.app
- **CI:** GitHub Actions — Biome check, tsc, vitest gates
- **Rate limiting:** Upstash (3 tiers)
- **Error tracking:** Sentry (client, server, edge configs)
