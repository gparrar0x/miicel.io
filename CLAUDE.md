# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-tenant e-commerce SaaS platform (miicel.io) with customizable templates (Gallery, Restaurant). Built with Next.js 16, React 19, Supabase, and TypeScript.

## Commands

```bash
# Development
npm run dev                    # Start dev server (localhost:3000)
npm run build                  # Production build
npm run lint                   # ESLint

# Testing
npm run test:e2e              # Run all E2E tests (headless)
npm run test:e2e:ui           # UI mode (recommended for debugging)
npm run test:e2e:headed       # Visible browser
npm run test:e2e:local        # Against localhost:3000
npm run test:e2e:prod         # Against production (miicelio.vercel.app)

# Run single test
npx playwright test tests/e2e/specs/checkout-flow.spec.ts
npx playwright test -g "should successfully create tenant"

# Database
npm run db:reset              # Clean & reset database

# Docs (Docusaurus)
npm run docs:dev              # localhost:3001
```

## Architecture

### Multi-Tenant Routing
```
app/[locale]/[tenantId]/...   # Tenant-scoped routes
```
- Tenant lookup by numeric ID or slug
- Tenant-specific themes stored in DB
- RLS enforces data isolation

### Key Directories
- `app/` - Next.js App Router (API routes in `app/api/`)
- `components/` - React components (commerce, admin, dashboard, gallery-v2, restaurant, storefront)
- `lib/` - Utilities (auth, supabase clients, stores, schemas)
- `db/supabase/migrations/` - SQL migrations (034 total)
- `tests/e2e/` - Playwright tests with 3-tier pattern

### Database Layer (Supabase/PostgreSQL)
Key tables: `tenants`, `products`, `orders`, `customers`, `users`, `payments`

User roles: `platform_admin`, `tenant_admin`, `staff`, `owner`

### Testing Architecture (3-tier)
```
specs/*.spec.ts     → Business scenarios ("what to test")
pages/*.page.ts     → Page objects with reusable methods
locators/*.locators.ts → Selector definitions (single source of truth)
```
- Use `data-testid` for selectors
- Use `generateTestData()` for unique test data
- Always call `dbCleanup()` after tenant/user creation tests

## Code Conventions

- TypeScript strict mode
- 2-space indent, ESLint enforced
- Components: PascalCase (`ProductCard.tsx`)
- Hooks: `useHookName`
- Routes: kebab-case
- Zod schemas: `xxxSchema`

## Styling

- Tailwind CSS v4 with design tokens in `styles/tokens.css`
- CSS variables for theming (dark mode via `.dark` class)
- shadcn/ui components in `components/ui/`
- Neo-brutalist aesthetic: monochrome base + gold accents

## Payments

MercadoPago webhooks in `app/api/webhooks/mercadopago/`. Sandbox testing requires `MERCADOPAGO_TEST_ACCESS_TOKEN` env var.

## Environment Variables

Required in `.env`:
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # Bypasses RLS for cleanup
ENCRYPTION_KEY=                 # AES-256-GCM for tokens
```

## Deployment

Production: https://miicel.io (Vercel)
Staging: https://miicelio.vercel.app
