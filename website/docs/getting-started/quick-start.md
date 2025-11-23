---
sidebar_position: 1
title: Quick Start
---

# Quick Start

Get started with Vendio in 5 minutes.

## Prerequisites

- Node.js 16+
- Supabase account (or local instance)
- Environment variables in `.env`

## Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.e2e.example .env

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Setup

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
│   ├── guides/             # User guides
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

## Next Steps

- Read the [Deployment Guide](/getting-started/deployment) to deploy to production
- Check out the [Architecture Overview](/architecture/overview) to understand the system
- Explore [User Guides](/guides/admin-theme-editor) for specific features

