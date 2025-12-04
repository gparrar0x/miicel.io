# SKY-13: E2E Testing Baseline (UPDATED)

> **Ticket:** [SKY-13](https://linear.app/publica/issue/SKY-13)
> **Priority:** P1
> **Estimate:** 6-8 hours
> **Owner:** Sentinela (QA/E2E Specialist)
> **Project:** miicel.io
> **Updated:** 2025-11-29
> **Status:** In Progress

---

## 🎯 Objetivo (UPDATED)

**Fix existing 13 tests + add missing happy path coverage**

**Estado actual:**
- 13 tests E2E existentes (todos happy paths ✅)
- 13/13 FAILING 🔴 (100% rojos - UI issues blocking)
- Faltan tests: Admin CRUD, Orders Management, Cross-Tenant Isolation

**Target final:**
- 13 existing tests PASSING (green)
- +9 new tests (admin flows)
- Total: ~22 tests, 100% green, <5 min execution

---

## 📊 Estado Actual

### Tests Existentes: 13 tests (todos rojos)

```
✗ checkout-flow.spec.ts               3 tests
✗ checkout-mercadopago.spec.ts        3 tests
✗ complete-signup-flow.spec.ts        2 tests
✗ product-image-upload.spec.ts        3 tests
✗ webhook-mercadopago.spec.ts         2 tests
────────────────────────────────────────────
Total:                                13 tests (0% passing)
```

### Root Causes (Pixel fixing)

- Cart checkout button no existe/no abre modal
- Success pages con API errors
- Product dashboard navigation broken
- Signup flow incomplete

**Dependencia:** WAIT for Pixel to fix UI (TASK 1-6 de SKY_13_PIXEL_TASKS.md)

---

## 📋 Tasks

### **PHASE 1: Fix Existing Tests (After Pixel)** 🔥 CRITICAL

**Estimate:** 2-3 hours

**Prerequisite:** Pixel completes UI fixes (SKY_13_PIXEL_TASKS.md)

---

#### **TASK 1.1: Fix Checkout Flow Tests**
**Estimate:** 1 hour

**Files:** `tests/e2e/specs/checkout-flow.spec.ts` (3 tests)

**Problema:** Tests esperan modal pero Pixel puede hacer page route

**Pasos:**
1. WAIT for Pixel fix (TASK 1-2)
2. Review Pixel's implementation:
   - Si es modal: keep tests as-is
   - Si es page route: update locators to navigate `/checkout`
3. Update test expectations:
   - Modal: `expect(page.getByTestId('checkout-modal-overlay')).toBeVisible()`
   - Page: `await page.goto('/${TEST_TENANT}/checkout')`
4. Fix API mock if needed (create-preference endpoint)
5. Fix success page navigation assertions

**DoD:**
- [ ] 3 tests passing
- [ ] Checkout submission works (cash + MP)
- [ ] Success page displays correctly

---

#### **TASK 1.2: Fix MercadoPago Checkout Tests**
**Estimate:** 30 min

**Files:** `tests/e2e/specs/checkout-mercadopago.spec.ts` (3 tests)

**Problema:** Mismo issue que checkout-flow

**Pasos:**
1. WAIT for Pixel TASK 2-3
2. Update tests to match Pixel's implementation
3. Verify MP redirect URL mocking works
4. Verify success page testids exist

**DoD:**
- [ ] 3 tests passing
- [ ] MP form validation works
- [ ] Success page shows payment info

---

#### **TASK 1.3: Fix Signup Flow Tests**
**Estimate:** 30 min

**Files:** `tests/e2e/specs/complete-signup-flow.spec.ts` (2 tests)

**Problema:** Signup/onboarding pages navigation

**Pasos:**
1. WAIT for Pixel TASK 6
2. Update page objects if routes changed
3. Verify onboarding steps testids exist
4. Fix activation redirect expectations

**DoD:**
- [ ] 2 tests passing
- [ ] Signup → onboarding → storefront works
- [ ] Optional logo upload tested

---

#### **TASK 1.4: Fix Product Image Upload Tests**
**Estimate:** 1 hour

**Files:** `tests/e2e/specs/products/product-image-upload.spec.ts` (3 tests)

**Problema:** Dashboard navigation + auth

**Pasos:**
1. WAIT for Pixel TASK 4
2. Create auth fixture if doesn't exist:
   ```typescript
   export const adminAuth = async (page) => {
     await page.goto('/login')
     await page.fill('[data-testid="login-email"]', 'owner@test.com')
     await page.fill('[data-testid="login-password"]', 'password')
     await page.click('[data-testid="login-submit"]')
     await page.waitForURL('**/dashboard')
   }
   ```
3. Update ProductFormPage locators to match Pixel's testids
4. Fix file upload assertions
5. Add Supabase cleanup for uploaded images

**DoD:**
- [ ] 3 tests passing
- [ ] Image upload creates file in Supabase
- [ ] Image URL stored in database
- [ ] Tests cleanup uploaded files

---

#### **TASK 1.5: Review Webhook Tests**
**Estimate:** 30 min

**Files:** `tests/e2e/specs/webhook-mercadopago.spec.ts` (2 tests)

**Problema:** Tests buscan UI elements (webhooks son API-only)

**Pasos:**
1. Review test logic - shouldn't need UI
2. If tests are API-only:
   - Convert to pure API tests (no page.goto)
   - Use `request.post('/api/webhooks/mercadopago')`
3. If tests need UI for verification:
   - Document why (e.g. checking order status update in dashboard)
   - Add proper page navigation + testids

**DoD:**
- [ ] 2 tests passing OR
- [ ] Tests refactored to API-only
- [ ] Signature validation working

---

### **PHASE 2: Add Missing Happy Path Tests** ⚡ NEW

**Estimate:** 3-4 hours

**Prerequisite:** Phase 1 complete (13/13 green)

---

#### **TASK 2.1: Admin Products CRUD**
**Estimate:** 1.5 hours

**File:** Create `tests/e2e/specs/admin/admin-products-crud.spec.ts`

**Scope:** 4 tests - Create, Read (list), Update, Delete

**Implementation:**
```typescript
import { test, expect } from '@playwright/test'
import { adminAuth } from '@/tests/e2e/fixtures/auth.fixture'

test.describe('Admin Products CRUD - Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    await adminAuth(page, 'owner@test.com')
  })

  test('creates product successfully', async ({ page }) => {
    await page.goto('/es/test-store/dashboard/products')
    await page.click('[data-testid="products-new-button"]')

    await page.fill('[data-testid="product-form-name"]', 'Test Product')
    await page.fill('[data-testid="product-form-price"]', '2500')
    await page.selectOption('[data-testid="product-form-category"]', 'electronics')
    await page.fill('[data-testid="product-form-stock"]', '50')

    await page.click('[data-testid="product-form-submit"]')

    await expect(page.getByText('Product created')).toBeVisible()
    await expect(page.getByText('Test Product')).toBeVisible()
  })

  test('lists products in table', async ({ page }) => {
    await page.goto('/es/test-store/dashboard/products')

    await expect(page.getByTestId('product-table-row')).toHaveCount.greaterThan(0)
  })

  test('updates product successfully', async ({ page }) => {
    await page.goto('/es/test-store/dashboard/products')

    // Find and edit first product
    await page.locator('[data-testid="product-table-row"]').first()
      .locator('[data-testid="product-edit-button"]').click()

    await page.fill('[data-testid="product-form-price"]', '3000')
    await page.click('[data-testid="product-form-submit"]')

    await expect(page.getByText('Product updated')).toBeVisible()
  })

  test('deletes product successfully', async ({ page }) => {
    await page.goto('/es/test-store/dashboard/products')

    await page.locator('[data-testid="product-table-row"]').first()
      .locator('[data-testid="product-delete-button"]').click()

    await page.click('[data-testid="confirm-delete-button"]')

    await expect(page.getByText('Product deleted')).toBeVisible()
  })
})
```

**DoD:**
- [ ] 4 tests created (C/R/U/D)
- [ ] All tests pass
- [ ] Page objects created if needed
- [ ] Tests cleanup created products

**Files:**
- Create: `tests/e2e/specs/admin/admin-products-crud.spec.ts`
- Create (if needed): `tests/e2e/pages/admin-products.page.ts`

---

#### **TASK 2.2: Admin Orders Management**
**Estimate:** 1 hour

**File:** Create `tests/e2e/specs/admin/admin-orders-management.spec.ts`

**Scope:** 3 tests - List, View Detail, Update Status

**Implementation:**
```typescript
test.describe('Admin Orders Management - Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    await adminAuth(page, 'owner@test.com')
  })

  test('lists orders in table', async ({ page }) => {
    await page.goto('/es/test-store/dashboard/orders')

    await expect(page.getByTestId('order-table-row')).toHaveCount.greaterThan(0)
  })

  test('views order detail', async ({ page }) => {
    await page.goto('/es/test-store/dashboard/orders')

    await page.locator('[data-testid="order-table-row"]').first().click()

    await expect(page.getByTestId('order-detail-modal')).toBeVisible()
    await expect(page.getByText(/Customer:/)).toBeVisible()
    await expect(page.getByText(/Total:/)).toBeVisible()
  })

  test('updates order status successfully', async ({ page }) => {
    await page.goto('/es/test-store/dashboard/orders')

    await page.locator('[data-testid="order-table-row"]').first().click()

    await page.selectOption('[data-testid="status-dropdown"]', 'preparing')
    await page.click('[data-testid="save-status-button"]')

    await expect(page.getByText('Order updated')).toBeVisible()
  })
})
```

**DoD:**
- [ ] 3 tests created
- [ ] All tests pass
- [ ] Order fixtures created for test data

**Files:**
- Create: `tests/e2e/specs/admin/admin-orders-management.spec.ts`

---

#### **TASK 2.3: Cross-Tenant Isolation Security**
**Estimate:** 1 hour

**File:** Create `tests/e2e/specs/security/cross-tenant-isolation.spec.ts`

**Scope:** 2 tests - Catalog isolation, Admin isolation

**Implementation:**
```typescript
test.describe('Cross-Tenant Isolation - Security', () => {
  test('tenant A cannot see tenant B products', async ({ page }) => {
    // Visit tenant-a catalog
    await page.goto('/es/test-store-a')
    const productsA = await page.getByTestId('product-card').count()
    const productNameA = await page.getByTestId('product-card').first()
      .getByTestId('product-name').textContent()

    // Visit tenant-b catalog
    await page.goto('/es/test-store-b')
    const productsB = await page.getByTestId('product-card').count()

    // Verify counts are independent
    expect(productsA).toBeGreaterThan(0)
    expect(productsB).toBeGreaterThan(0)

    // Verify no overlap (tenant-a product not in tenant-b)
    await expect(page.getByText(productNameA)).not.toBeVisible()
  })

  test('tenant A admin cannot access tenant B admin panel', async ({ page }) => {
    // Login as tenant-a admin
    await adminAuth(page, 'admin-a@test.com')

    // Try to access tenant-b admin
    await page.goto('/es/test-store-b/dashboard/products')

    // Should redirect or show 403
    await expect(page).not.toHaveURL(/test-store-b/)
    await expect(page.getByText('Access denied')).toBeVisible()
  })
})
```

**DoD:**
- [ ] 2 tests created
- [ ] RLS policies validated (no leaks)
- [ ] Tests use 2 separate tenant fixtures
- [ ] Security validated

**Files:**
- Create: `tests/e2e/specs/security/cross-tenant-isolation.spec.ts`
- Create: `tests/e2e/fixtures/multi-tenant.fixture.ts`

---

## 🚫 Out of Scope

- ❌ NO agregar tests de validaciones/errores (solo happy paths)
- ❌ NO arreglar UI (eso es Pixel)
- ❌ NO agregar features nuevas
- ❌ Solo tests E2E (no unit tests)

---

## 📊 Success Metrics

**DoD Global:**
- [ ] Phase 1: 13/13 existing tests PASSING (100% green)
- [ ] Phase 2: +9 new tests created and passing
- [ ] **Total: 22 tests, 100% green**
- [ ] **Execution time: <5 min** (full suite)
- [ ] 0 P0 bugs
- [ ] Coverage: 100% happy paths core flows

**Test Count Breakdown:**
```
Existing (fixed):          13 tests
+ Admin Products CRUD:     +4 tests
+ Admin Orders:            +3 tests
+ Cross-Tenant:            +2 tests
────────────────────────────────────
Total:                     22 tests
```

---

## 🎯 Happy Paths Coverage (Final)

### Usuario Comprador
1. ✅ Signup → Onboarding (5 steps) → Storefront activo
2. ✅ Ver catálogo → Ver producto → Agregar al carrito
3. ✅ Checkout con efectivo → Success page
4. ✅ Checkout con MercadoPago → Redirect → Webhook success

### Usuario Administrador
1. ✅ Login admin → Dashboard
2. ✅ Crear producto → Ver en lista
3. ✅ Editar producto → Ver cambios
4. ✅ Eliminar producto → Desaparece
5. ✅ Ver lista de órdenes
6. ✅ Ver detalle de orden
7. ✅ Cambiar estado de orden

### Seguridad
1. ✅ Tenant A NO ve productos de Tenant B
2. ✅ Admin A NO accede admin de Tenant B

---

## 🛠️ Tech Stack

**Framework:** Playwright 1.56.1
**Pattern:** Page Object Model (3 layers)
**Config:** `playwright.config.ts`

**Commands:**
```bash
npm run test:e2e              # Run all tests
npm run test:e2e:ui           # Interactive UI mode
npm run test:e2e:headed       # Headed mode
npm run test:e2e:debug        # Debug mode
npm run test:e2e:report       # View HTML report
```

---

## 🚨 Blockers & Escalation

**Current Blocker:**
- ⛔ BLOCKED by Pixel UI fixes (SKY_13_PIXEL_TASKS.md)
- Cannot proceed with Phase 1 until Pixel completes TASK 1-6

**If you encounter:**
- ⚠️ UI still broken after Pixel fix → Re-escalate to Pixel
- ⚠️ API endpoints missing → Escalate to Kokoro
- ⚠️ RLS policies broken → Escalate to Kokoro
- ⚠️ Test architecture blocker → Escalate to Mentat

**Escalate to:**
- **Pixel** - Si UI no funciona después de fix
- **Kokoro** - Si falta backend/API
- **Mentat** - Si arquitectura blocker

---

## 📁 Files Summary

**Fix (Phase 1):**
```
tests/e2e/specs/checkout-flow.spec.ts               [UPDATE - after Pixel]
tests/e2e/specs/checkout-mercadopago.spec.ts        [UPDATE - after Pixel]
tests/e2e/specs/complete-signup-flow.spec.ts        [UPDATE - after Pixel]
tests/e2e/specs/products/product-image-upload.spec.ts [UPDATE - after Pixel]
tests/e2e/specs/webhook-mercadopago.spec.ts         [REVIEW/REFACTOR]
tests/e2e/fixtures/auth.fixture.ts                  [CREATE - if needed]
```

**Create (Phase 2):**
```
tests/e2e/specs/admin/
├── admin-products-crud.spec.ts       [NEW - 4 tests]
└── admin-orders-management.spec.ts   [NEW - 3 tests]

tests/e2e/specs/security/
└── cross-tenant-isolation.spec.ts    [NEW - 2 tests]

tests/e2e/fixtures/
└── multi-tenant.fixture.ts           [NEW]

tests/e2e/pages/
└── admin-products.page.ts            [NEW - if needed]
```

---

## 🎯 Timeline

| Phase | Tasks | Hours | Blocker |
|-------|-------|-------|---------|
| **Phase 1** | Fix 13 existing tests | 2-3h | ⛔ WAIT Pixel |
| **Phase 2** | Add 9 new tests | 3-4h | Phase 1 done |

**Total:** 6-8 hours (después de Pixel)

---

## ✅ Final Checklist

Antes de cerrar SKY-13:

- [ ] **WAIT:** Pixel completes SKY_13_PIXEL_TASKS.md
- [ ] Phase 1: All existing tests fixed (13/13 green)
- [ ] Phase 2: New tests created and passing (+9 tests)
- [ ] `npm run test:e2e` → 22/22 tests green
- [ ] Execution time: <5 min
- [ ] 0 P0 bugs
- [ ] Documentation updated:
  - [ ] `E2E_TEST_SUMMARY.md`
  - [ ] `SKY_13_NOTES.md`
- [ ] Commit + push
- [ ] Update SKY-13 in Linear → "Done"

---

**Happy paths baseline = foundation sólida. Wait for Pixel, then ship!** 🚀

**Created:** 2025-11-25
**Updated:** 2025-11-29 (v3 - realistic state)
**Owner:** Sentinela
**Coordinator:** Mentat
**Blocker:** Pixel (SKY_13_PIXEL_TASKS.md)
