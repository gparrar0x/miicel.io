# Miicel.io

This is the **Miicel.io** project (formerly Commerce SaaS), a multi-tenant e-commerce platform built with Next.js 15, Supabase, and Tailwind CSS.


## Quick Start

### Prerequisites
- Node.js 16+
- Supabase account (or local instance)
- Environment variables in `.env`

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.e2e.example .env

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Setup

```bash
# Required variables (.env)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## Project Structure

```
├── app/                    # Next.js app router
├── components/             # React components (shared, commerce, restaurant, gallery)
├── db/                     # Database layer
│   ├── scripts/            # DB management scripts
│   └── supabase/           # Migrations and Supabase config
├── docs/                   # Legacy documentation (being migrated)
│   ├── guides/             # User guides (QUICKSTART_E2E.md)
│   ├── testing/            # Test documentation
│   └── backlog/            # Project delivery docs
├── website/                # Docusaurus documentation site
│   ├── docs/               # Migrated documentation
│   └── src/                # Docusaurus source files
├── lib/                    # Utilities (auth, Supabase clients, stores, schemas)
├── public/                 # Static assets
├── scripts/                # CLI utilities (check-products, create-superadmin, etc)
├── tests/                  # E2E tests and test assets
│   ├── e2e/                # Playwright specs
│   ├── assets/             # Test resources
│   └── reports/            # Test results
├── types/                  # TypeScript types
└── styles/                 # Global styles and design tokens
```

## Key Features

- **Multi-Tenant**: Each tenant has isolated data, custom themes, and independent inventory
- **Template System**: Gallery (QR-based) and Restaurant templates with swappable layouts
- **Theme Editor**: Admin interface to customize colors, typography, and layout
- **Product Management**: CRUD operations with images, variants, and metadata
- **Orders**: Full order lifecycle with status tracking and webhooks (MercadoPago)
- **E2E Tests**: 50+ Playwright tests with comprehensive coverage

## Development

```bash
# Start dev server
npm run dev

# Run E2E tests
npm run test:e2e

# Run E2E tests (UI mode)
npm run test:e2e:ui

# Database
npm run db:reset              # Clean database
npm run db:seed               # Seed sample data

# Code quality
npm run lint
npm run format
```

## Deployment

**Production:** https://sw-commerce-vendio.vercel.app

See deployment guides:
- [`docs/VERCEL_DEPLOYMENT_GUIDE.md`](docs/VERCEL_DEPLOYMENT_GUIDE.md) - Complete setup instructions
- [`docs/VERCEL_DEPLOYMENT_SUMMARY.md`](docs/VERCEL_DEPLOYMENT_SUMMARY.md) - Quick reference

Deploy to Vercel:
```bash
vercel --prod
```

## Documentation

**📚 Full Documentation:** Visit the [Docusaurus documentation site](./website) or run `npm run docs:dev` to view locally.

**Quick Links:**
- [Getting Started Guide](./website/docs/getting-started/quick-start.md) - Setup in 5 minutes
- [Deployment Guide](./website/docs/getting-started/deployment.md) - Deploy to Vercel
- [Architecture Overview](./website/docs/architecture/overview.md) - System design and architecture
- [API Reference](./website/docs/api/orders.md) - Orders API documentation
- [User Flows](./website/docs/guides/user-flows.md) - User journey documentation

**Legacy Docs (in `/docs` folder):**
- [`docs/guides/QUICKSTART_E2E.md`](docs/guides/QUICKSTART_E2E.md) - E2E testing quick start
- [`docs/ADMIN_THEME_EDITOR.md`](docs/ADMIN_THEME_EDITOR.md) - Theme editor documentation
- [`tests/e2e/README.md`](tests/e2e/README.md) - E2E test suite guide
- [`CHANGELOG.md`](CHANGELOG.md) - Version history

**Documentation Development:**
```bash
npm run docs:dev    # Start Docusaurus dev server (port 3001)
npm run docs:build  # Build documentation for production
npm run docs:serve  # Serve built documentation locally
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL), API routes
- **Testing**: Playwright, TypeScript
- **Payments**: MercadoPago webhooks
- **Deployment**: Vercel, GitHub Actions

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Playwright Documentation](https://playwright.dev)
