# E2E Test Suite: Template System - Happy Path Only

**Issue:** #7 - Template System MVP
**Focus:** Happy path only (successful user flows)
**Tests:** 9
**Runtime:** ~2-3 minutes

---

## Test File

`/tests/e2e/specs/template-switching-happy-path.spec.ts`

---

## Test Cases

### 1. Admin Template Editor Happy Path (1 test)
**Flow:** Select template → customize fields → save → reload → persists

```typescript
test('admin selects gallery template, customizes, saves, and changes persist')
```

Steps:
1. Login as OWNER
2. Go to /demo/dashboard/settings/appearance
3. Select gallery template
4. Set gridCols=3, spacing=relaxed, primaryColor=#FF0000
5. Click save → toast shows success
6. Reload page
7. Verify: template=gallery, gridCols=3, spacing=relaxed, color=#FF0000

**Pass Criteria:** All fields match after reload

---

### 2. Template Switching (1 test)
**Flow:** Switch between gallery/detail/minimal → each saves independently

```typescript
test('admin switches between all 3 templates, each saves independently')
```

Steps:
1. Set gallery with color #FF0000 → save
2. Set detail with color #00FF00 → save
3. Set minimal with color #0000FF → save
4. Reload → minimal is selected (last one)

**Pass Criteria:** Each template saved with correct color

---

### 3. Storefront: Gallery Template (1 test)
**Flow:** Admin sets gallery → public user sees gallery render with products

```typescript
test('storefront renders gallery template with saved theme')
```

Steps:
1. Admin: Select gallery, set primaryColor=#FF1493, save
2. Public user: Go to /demo (no cookies)
3. Verify: Template=gallery, products load, theme provider active

**Pass Criteria:** 3+ products visible, template matches

---

### 4. Storefront: Detail Template (1 test)
**Flow:** Detail template renders in 2-column layout with products

```typescript
test('storefront displays detail template with correct layout')
```

Steps:
1. Admin: Select detail, set gridCols=2, save
2. Public: Go to /demo
3. Verify: Template=detail, columns>=2, products>0

**Pass Criteria:** Products render in expected layout

---

### 5. Storefront: Minimal Template (1 test)
**Flow:** Minimal template renders in 4-column compact layout

```typescript
test('storefront displays minimal template with many columns')
```

Steps:
1. Admin: Select minimal, set gridCols=4, spacing=compact, save
2. Public: Go to /demo
3. Verify: Template=minimal, 4+ products visible

**Pass Criteria:** Compact layout with many cards

---

### 6. Theme Persistence (1 test)
**Flow:** Theme persists across reloads in storefront

```typescript
test('theme persists across page reloads in storefront')
```

Steps:
1. Admin: Set detail template + primaryColor=#123456, save
2. Public: Go to /demo
3. Reload page
4. Verify: Template still=detail on reload

**Pass Criteria:** Same template after reload

---

### 7. Multi-Tenant Isolation (1 test)
**Flow:** Each tenant maintains independent theme

```typescript
test('multi-tenant: each tenant maintains independent theme')
```

Steps:
1. Admin: Set /demo → gallery, save
2. Admin: Set /superhotdog → minimal, save
3. Admin: Check /demo → still gallery
4. Admin: Check /superhotdog → still minimal

**Pass Criteria:** Each tenant independent

---

### 8. Responsive: All Viewports (1 test)
**Flow:** Gallery renders on desktop, tablet, mobile with products

```typescript
test('responsive: gallery displays correctly on desktop, tablet, mobile')
```

Steps:
1. Admin: Select gallery, save
2. Public (Desktop): Load → template=gallery, cards>0
3. Public (Tablet): Reload → template=gallery, cards>0
4. Public (Mobile): Reload → template=gallery, cards>0

**Pass Criteria:** Template renders on all viewports, products visible

---

### 9. Color Change Propagation (1 test)
**Flow:** Admin changes color → storefront reflects change

```typescript
test('admin edits color and storefront reflects change')
```

Steps:
1. Admin: Set primaryColor=#FF0000, save
2. Public: Go to /demo → theme provider active
3. Admin: Change primaryColor=#00FF00, save
4. Public: Go to /demo → theme provider still active

**Pass Criteria:** Theme accessible in both states

---

## Running Tests

```bash
# Run all 9 happy path tests
npx playwright test template-switching-happy-path

# Run specific test
npx playwright test template-switching-happy-path -g "gallery template"

# Run with UI
npm run test:e2e:ui

# Debug
npx playwright test template-switching-happy-path --debug
```

---

## Test Data

**Tenants:** /demo, /superhotdog, /minimal-demo (seeded by Kokoro)
**Admin:** owner@test.com / testpass123 (OWNER role)
**Products:** Pre-seeded in each tenant (6+ products)

---

## Requirements

- [x] Kokoro seed data (3 test tenants, owner user)
- [x] Pixel data-testid attributes in components
- [ ] Theme API routes (GET/PATCH /api/tenants/[slug]/theme)
- [x] Existing auth fixtures

---

## Expected Duration

- Local run: 2-3 minutes
- CI run: 3-5 minutes (with 2 browser engines)

---

## Success Criteria

- All 9 tests PASS
- No timeouts
- Theme persists across reloads
- All 3 templates render correctly
- Multi-tenant isolation verified
- Responsive works on all viewports

---

**Status:** Ready for Testing
**Owner:** Sentinela
**Issue:** #7
