# PIXEL: Multi-Tenant Template Components

**Sprint:** Template System MVP
**Owner:** Pixel
**Updated:** 2025-01-18

---

## Overview

Build 3 ProductCard variants + responsive ProductGrid + ThemeProvider for multi-tenant storefront.

---

## Tasks

### 1. ThemeProvider + Token System (Issue #3) - P0

**Goal:** Context provider injecting design tokens as CSS vars per tenant.

**Acceptance Criteria:**
- [ ] `<ThemeProvider template={tenant.template} overrides={tenant.theme_overrides} />`
- [ ] Injects CSS vars: `--color-primary`, `--spacing-*`, `--grid-cols`, etc.
- [ ] Merges base tokens + overrides
- [ ] TypeScript: token schema validation
- [ ] Export `/lib/themes.ts` w/ base configs

**Technical:**
- SSR-safe (no flash)
- WCAG contrast validation in dev mode
- Files: `/lib/themes.ts`, `/components/ThemeProvider.tsx`

**Estimate:** 4h

---

### 2. ProductCard + Grid Variants (Issue #2) - P0

**Goal:** 3 ProductCard variants + responsive ProductGrid.

**Acceptance Criteria:**
- [ ] `<ProductCard variant='gallery|detail|minimal' />` w/ theme tokens
- [ ] `<ProductGrid template='...' />` handles cols/gap/aspect per variant
- [ ] All states: default, hover, loading (skeleton)
- [ ] Storybook stories: 3 variants × 3 states
- [ ] data-testid: `product-card-{variant}`, `product-grid-{template}`

**Technical:**
- Use CSS vars from ThemeProvider
- Image lazy load + blur placeholder
- Responsive: 4→2→1 cols (gallery), 2→1 (detail/minimal)
- Files: `/components/storefront/{Gallery,Detail,Minimal}Card.tsx`, `/components/storefront/ProductGrid.tsx`

**Estimate:** 8h

---

### 3. Admin Template Selector + Editor (Issue #4) - P1

**Goal:** Tenant settings page for template + theme overrides.

**Acceptance Criteria:**
- [ ] Template switcher (3 radio cards w/ preview thumb)
- [ ] Color pickers: primary, accent, bg (w/ contrast check)
- [ ] Spacing scale editor (visual slider)
- [ ] Live preview pane
- [ ] Save → `PATCH /api/tenants/:id/theme`
- [ ] Toast: success/error feedback

**Technical:**
- Use react-colorful for pickers
- Debounce preview updates (300ms)
- Validate contrast ≥4.5:1 before save
- Files: `/app/admin/settings/theme/page.tsx`, `/components/admin/ThemeEditor.tsx`

**Dependencies:** Kokoro Issue #5 (API endpoints)

**Estimate:** 10h

---

### 4. Storybook Setup

**Goal:** Visual QA for all variants.

**Deliverables:**
- [ ] Stories: ProductCard (3 variants × 3 states)
- [ ] Stories: ProductGrid (3 templates × empty/loading/filled)
- [ ] Stories: ThemeProvider (3 themes)
- [ ] Chromatic visual regression setup

**Estimate:** 3h

---

### 5. Screenshots for Docs (Issue #7)

**Goal:** Support documentation with visuals.

**Deliverables:**
- [ ] 3 template screenshots (storefront view)
- [ ] Admin UI screenshots (template selector, color picker)
- [ ] Add to `/docs/templates/images/`

**Dependencies:** Components complete

**Estimate:** 1h

---

## Total Estimate: 26h (~3 days)

## Blockers

- Issue #4 blocked by Kokoro API (Issue #5)

## Handoff to Sentinela

Once complete:
- All components have `data-testid` attributes
- Storybook deployed for visual reference
- Flag for E2E test creation (Issue #6)
