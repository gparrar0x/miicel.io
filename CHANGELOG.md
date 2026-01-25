# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Common Changelog](https://common-changelog.org/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
