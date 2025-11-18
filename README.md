# SkyWalking Commerce SaaS

Multi-tenant e-commerce platform with dynamic template system (Gallery, Restaurant) and Supabase backend.

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
├── docs/                   # Documentation
│   ├── guides/             # User guides (QUICKSTART_E2E.md)
│   ├── testing/            # Test documentation
│   └── backlog/            # Project delivery docs
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

See [`docs/DEPLOYMENT_QUICK_START.md`](docs/DEPLOYMENT_QUICK_START.md)

Deploy to Vercel:
```bash
vercel --prod
```

## Documentation

- [`docs/guides/QUICKSTART_E2E.md`](docs/guides/QUICKSTART_E2E.md) - E2E testing quick start
- [`docs/ADMIN_THEME_EDITOR.md`](docs/ADMIN_THEME_EDITOR.md) - Theme editor documentation
- [`tests/e2e/README.md`](tests/e2e/README.md) - E2E test suite guide
- [`CHANGELOG.md`](CHANGELOG.md) - Version history

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
