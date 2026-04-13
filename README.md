# Micelio

Multi-tenant e-commerce platform for merchants. Customizable storefronts with templates (Gallery, Restaurant), product management, payments (MercadoPago), consignment tracking, and AI-powered content.

**Production:** https://micelio.skyw.app

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- Supabase account (or local instance)

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Setup

```bash
# Required (.env)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ENCRYPTION_KEY=your-encryption-key          # AES-256-GCM for payment tokens
```

## Project Structure

```
app/                        # Next.js App Router
  [locale]/[tenantId]/      # Storefront (products, cart, checkout)
  [locale]/[tenantId]/dashboard/  # Admin (products, orders, settings, consignments)
  api/                      # API routes (checkout, webhooks, orders)
components/                 # React components (commerce, admin, gallery, restaurant)
services/                   # Business logic + repository pattern
  repositories/             # DB queries (tenant, product, order, customer)
  checkout.service.ts       # Checkout orchestration
db/supabase/migrations/     # SQL migrations (51 total)
lib/                        # Utilities (auth, Supabase clients, stores, schemas)
tests/e2e/                  # Playwright E2E tests (30 specs)
types/                      # TypeScript types
styles/                     # Global styles and design tokens
i18n/                       # Internationalization
scripts/                    # CLI utilities
website/                    # Docusaurus documentation site
```

## Key Features

- **Multi-Tenant**: Isolated data, custom themes, independent inventory per store
- **Template System**: Gallery (art/QR), Restaurant, Gastronomy, Detail, Minimal
- **Theme Editor**: Admin interface for colors, typography, and layout
- **Product Management**: CRUD with images, categories, badges, modifiers (add-ons)
- **Orders**: Full lifecycle with status tracking (pending → paid → preparing → delivered)
- **Payments**: MercadoPago webhooks with encrypted token storage
- **Discounts**: Fixed/percentage, order/item scope, date-bounded
- **Consignments**: Artwork location tracking for galleries
- **Authors**: Artist profiles with public landing pages
- **AI Agents**: Content generation and social media publishing
- **Feature Flags**: DB-driven with tenant/user targeting
- **Dark Mode**: CSS token system with `.dark` class
- **Google Sign-In**: OAuth for existing users
- **Health Monitoring**: Cron check + Slack alerts

## Demo Stores

| Store | Slug | Template | Currency | URL |
|-------|------|----------|----------|-----|
| Demo Galeria | `demo_galeria` | Gallery | ARS | [/es/demo_galeria](https://micelio.skyw.app/es/demo_galeria) |
| Demo Restaurant | `demo_restaurant` | Restaurant | ARS | [/es/demo_restaurant](https://micelio.skyw.app/es/demo_restaurant) |
| Sazon Criollo | `sazon-criollo` | Restaurant | COP | [/es/sazon-criollo](https://micelio.skyw.app/es/sazon-criollo) |

## Development

```bash
# Dev server
pnpm dev

# Lint + format
pnpm biome:check              # Check
pnpm biome:fix                # Auto-fix

# Unit tests (Vitest)
pnpm test
pnpm test:watch

# E2E tests (Playwright)
pnpm test:e2e                 # Headless
pnpm test:e2e:ui              # UI mode (recommended)
pnpm test:e2e:local           # Against localhost
pnpm test:e2e:prod            # Against production

# Database
pnpm db:reset                 # Clean database

# Docs (Docusaurus)
pnpm docs:dev                 # localhost:3001
```

## Deployment

**Production:** https://micelio.skyw.app (Vercel)
**Staging:** https://micelio.vercel.app

```bash
vercel --prod
```

**CI:** GitHub Actions — Biome check, tsc, vitest gates.

See [`docs/VERCEL_DEPLOYMENT_GUIDE.md`](docs/VERCEL_DEPLOYMENT_GUIDE.md) for full setup.

## Documentation

Run `pnpm docs:dev` to view the [Docusaurus site](./website) locally.

- [Getting Started](./website/docs/getting-started/quick-start.md)
- [Architecture](./website/docs/architecture/overview.md)
- [API Reference](./website/docs/api/orders.md)
- [E2E Testing Guide](./tests/e2e/README.md)
- [Changelog](./CHANGELOG.md)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL), API routes, RLS
- **Payments**: MercadoPago webhooks
- **Testing**: Playwright (E2E), Vitest (unit)
- **Code Quality**: Biome (lint + format), Lefthook (pre-commit)
- **Deployment**: Vercel, GitHub Actions
- **Monitoring**: Sentry (error tracking), Upstash (rate limiting)
