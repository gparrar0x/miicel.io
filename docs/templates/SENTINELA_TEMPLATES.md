# SENTINELA: Multi-Tenant Template QA

**Sprint:** Template System MVP
**Owner:** Sentinela
**Updated:** 2025-01-18

---

## Overview

E2E tests + visual regression for 3 template variants.

---

## Tasks

### 1. E2E: Template Switching (Issue #6) - P1

**Goal:** Verify admin can switch templates + changes persist.

**Acceptance Criteria:**
- [ ] Test: admin selects gallery → preview updates → save → reload shows gallery
- [ ] Test: repeat for detail, minimal
- [ ] Test: unauthorized user cannot access theme editor (403)
- [ ] All interactions use `data-testid` selectors

**Technical:**
- Fixtures: 3 demo tenants (from Kokoro seed)
- Files: `/tests/e2e/template-switching.spec.ts`

**Dependencies:** Pixel Issue #4 (admin UI), Kokoro Issue #5 (API)

**Estimate:** 4h

---

### 2. E2E: Theme Overrides

**Goal:** Verify color/spacing overrides appear in storefront.

**Acceptance Criteria:**
- [ ] Test: admin changes primary color → storefront CSS var updates
- [ ] Test: admin changes spacing → grid gaps reflect override
- [ ] Test: override persists after logout/login

**Technical:**
- Use `page.evaluate()` to read CSS vars
- Files: `/tests/e2e/theme-overrides.spec.ts`

**Estimate:** 3h

---

### 3. Visual Regression

**Goal:** Catch unintended UI changes across templates.

**Acceptance Criteria:**
- [ ] Snapshots: 3 templates × mobile (375px) / desktop (1280px)
- [ ] Compare: ProductGrid filled state (12 products)
- [ ] Compare: ProductCard hover state
- [ ] CI fails on >2% pixel diff

**Technical:**
- Use `page.screenshot()` + Percy or Chromatic
- Seed consistent product data for snapshots
- Files: `/tests/visual/templates.spec.ts`

**Estimate:** 3h

---

### 4. Component Integration Tests

**Goal:** Unit-level checks for ProductCard/Grid.

**Acceptance Criteria:**
- [ ] Test: ProductCard renders variant classes correctly
- [ ] Test: ProductGrid columns collapse responsively
- [ ] Test: ThemeProvider injects CSS vars
- [ ] Test: Loading state shows skeleton

**Technical:**
- Vitest + Testing Library
- Files: `/components/storefront/__tests__/ProductCard.test.tsx`, etc.

**Estimate:** 3h

---

### 5. Data-testid Coverage Audit

**Goal:** Ensure all interactive elements testable.

**Acceptance Criteria:**
- [ ] Checklist: ProductCard, ProductGrid, ThemeEditor, TemplateSwitcher
- [ ] Report missing testids to Pixel
- [ ] Document testid conventions in `/docs/templates/DEV_GUIDE.md`

**Estimate:** 1h

---

## Total Estimate: 14h (~2 days)

## Blockers

- All tasks blocked until Pixel + Kokoro complete Issues #2-5

## Handoff

Once tests pass:
- Flag Mentat for docs review (Issue #7)
- Share visual regression baseline screenshots
- Update QA checklist in main README
