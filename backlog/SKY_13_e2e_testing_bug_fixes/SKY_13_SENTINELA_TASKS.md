# SKY-13: E2E Testing Baseline (Happy Paths Only)

> **Ticket:** [SKY-13](https://linear.app/publica/issue/SKY-13)
> **Priority:** P2
> **Estimate:** 6 hours
> **Owner:** Sentinela (QA/E2E Specialist)
> **Project:** miicel.io
> **Updated:** 2025-11-25
> **Scope:** SOLO HAPPY PATHS - Baseline mínimo

---

## 🎯 Objetivo (ACTUALIZADO)

Crear **baseline E2E mínimo** con solo happy paths de flujos core:
- ✅ Usuario comprador: signup → catalog → checkout exitoso
- ✅ Usuario admin: products CRUD + orders management
- ✅ Cross-tenant isolation (seguridad)
- ❌ **SIN validaciones, errores, edge cases**

---

## 📊 Estado Actual

### Tests Existentes: ~99 tests

**Problema:** 75% son validaciones/errores (NO happy path)

**Acción:** Eliminar tests non-happy-path según `SKY_13_TESTS_TO_DELETE.md`

**Target Final:** ~20-25 tests happy path únicamente

---

## 📋 Tasks (REVISADAS)

### **TASK 0: Cleanup Existing Tests** 🗑️ **NUEVO**
**Estimate:** 1 hour

**Objetivo:** Eliminar todos los tests que NO sean happy path.

**Steps:**
1. Leer `SKY_13_TESTS_TO_DELETE.md` (lista completa)
2. Por cada spec file:
   - Identificar tests a eliminar
   - Borrar bloques completos de tests
   - Mantener solo happy paths (ver criterios abajo)
3. Eliminar archivos completos:
   ```bash
   rm tests/e2e/specs/gallery-template-unit.spec.ts
   rm tests/e2e/specs/debug-activation.spec.ts
   rm tests/e2e/specs/gallery-integration.spec.ts
   ```
4. Ejecutar suite: `npm run test:e2e`
5. Confirmar solo ~15-20 tests existentes quedan

**Criterios de eliminación:**
- ❌ Tests con "should show error"
- ❌ Tests con "should validate"
- ❌ Tests con "should handle ... error"
- ❌ Tests de loading states, timeouts, network errors
- ✅ SOLO tests "should successfully..."

**DoD:**
- [ ] `tenant-creation.spec.ts`: 20 → 4 tests
- [ ] `checkout-flow.spec.ts`: 8 → 3 tests
- [ ] `checkout-mercadopago.spec.ts`: 17 → 2-3 tests
- [ ] `webhook-mercadopago.spec.ts`: 20 → 2-3 tests
- [ ] Archivos debug/stub eliminados
- [ ] Test suite ejecuta en <3 min
- [ ] Todos tests pasan (green)

**Files:**
- Update: All existing `.spec.ts` files
- Delete: `gallery-template-unit.spec.ts`, `debug-activation.spec.ts`, `gallery-integration.spec.ts`

---

### **TASK 1: Validate Existing Happy Paths** ✅
**Estimate:** 0.5 hours

**Objetivo:** Verificar que tests existentes happy path funcionan.

**Steps:**
1. Ejecutar suite limpia: `npm run test:e2e`
2. Revisar `test-results.json`
3. Si hay failures → debugear y corregir
4. Documentar en `SKY_13_NOTES.md`

**Tests a validar:**
- `complete-signup-flow.spec.ts` (4 tests - ya son happy path)
- `checkout-flow.spec.ts` (3 tests restantes)
- `tenant-creation.spec.ts` (4 tests restantes)

**DoD:**
- [ ] All existing happy path tests pass
- [ ] 0 P0 bugs bloqueadores
- [ ] Report: `tests/reports/index.html`

---

### **TASK 2: Admin Products CRUD (Happy Paths)** ⚡ HIGH
**Estimate:** 1.5 hours

**Objetivo:** Test CRUD básico de productos en admin (solo exitoso).

**Scope:** CREATE, READ (list), UPDATE, DELETE - solo flows exitosos

**Test Cases (SOLO 4):**
```typescript
describe('Admin Products CRUD - Happy Path', () => {
  test('creates product successfully', async ({ page, adminAuth }) => {
    await adminPage.navigateToProducts()
    await adminPage.clickNewProduct()
    await productForm.fill({
      name: 'Test Product',
      price: 2500,
      category: 'electronics',
      stock: 50
    })
    await productForm.submit()
    await expect(page.getByText('Product created')).toBeVisible()
  })

  test('lists products in table', async ({ page, adminAuth }) => {
    await adminPage.navigateToProducts()
    await expect(page.getByTestId('product-table-row')).toHaveCount.greaterThan(0)
  })

  test('updates product successfully', async ({ page, adminAuth }) => {
    await adminPage.navigateToProducts()
    await adminPage.editProduct('Test Product')
    await productForm.fillField('price', 3000)
    await productForm.submit()
    await expect(page.getByText('Product updated')).toBeVisible()
  })

  test('deletes product successfully', async ({ page, adminAuth }) => {
    await adminPage.navigateToProducts()
    await adminPage.deleteProduct('Test Product')
    await page.getByTestId('confirm-delete-button').click()
    await expect(page.getByText('Product deleted')).toBeVisible()
  })
})
```

**DoD:**
- [ ] 4 tests created (C/R/U/D)
- [ ] Page object pattern used
- [ ] All tests pass
- [ ] NO validations, NO error tests

**Files:**
- Create: `tests/e2e/specs/admin-products-crud.spec.ts`
- Create: `tests/e2e/pages/admin-products.page.ts`
- Create: `tests/e2e/locators/admin-products.locators.ts`

---

### **TASK 3: Admin Orders Management (Happy Paths)** ⚡ HIGH
**Estimate:** 1 hour

**Objetivo:** Test gestión de pedidos (solo exitoso).

**Scope:** List, view detail, update status

**Test Cases (SOLO 3):**
```typescript
describe('Admin Orders Management - Happy Path', () => {
  test('lists orders in table', async ({ page, adminAuth }) => {
    await adminPage.navigateToOrders()
    await expect(page.getByTestId('order-table-row')).toHaveCount.greaterThan(0)
  })

  test('views order detail', async ({ page, adminAuth }) => {
    await adminPage.navigateToOrders()
    await adminPage.clickOrderRow('order-uuid-123')

    await expect(page.getByTestId('order-detail-modal')).toBeVisible()
    await expect(page.getByText(/Customer:/)).toBeVisible()
    await expect(page.getByText(/Total:/)).toBeVisible()
  })

  test('updates order status successfully', async ({ page, adminAuth }) => {
    await adminPage.navigateToOrders()
    await adminPage.clickOrderRow('order-uuid-123')

    await page.getByTestId('status-dropdown').selectOption('preparing')
    await page.getByTestId('save-status-button').click()

    await expect(page.getByText('Order updated')).toBeVisible()
  })
})
```

**DoD:**
- [ ] 3 tests created (list, detail, update)
- [ ] Page object pattern
- [ ] All tests pass
- [ ] NO filters, NO error tests

**Files:**
- Create: `tests/e2e/specs/admin-orders-management.spec.ts`
- Create: `tests/e2e/pages/admin-orders.page.ts`
- Create: `tests/e2e/locators/admin-orders.locators.ts`

---

### **TASK 4: Cross-Tenant Isolation (Happy Paths)** 🔥 CRITICAL
**Estimate:** 1 hour

**Objetivo:** Validar seguridad RLS (happy path = funciona correctamente).

**Scope:** Tenant A NO ve data de Tenant B

**Test Cases (SOLO 2):**
```typescript
describe('Cross-Tenant Isolation - Security', () => {
  test('tenant A cannot see tenant B products', async ({ page }) => {
    // Visit tenant-a catalog
    await page.goto('/shop/tenant-a')
    const productsA = await page.getByTestId('product-card').count()

    // Visit tenant-b catalog
    await page.goto('/shop/tenant-b')
    const productsB = await page.getByTestId('product-card').count()

    // Verify counts are independent
    expect(productsA).toBeGreaterThan(0)
    expect(productsB).toBeGreaterThan(0)

    // Verify no overlap (tenant-a product not in tenant-b)
    await expect(page.getByText('Tenant A Exclusive Product')).not.toBeVisible()
  })

  test('tenant A admin cannot access tenant B admin panel', async ({ page }) => {
    // Login as tenant-a admin
    await adminAuth.login('admin-a@example.com', 'password')

    // Try to access tenant-b admin
    await page.goto('/admin/tenant-b/products')

    // Should redirect or show 403
    await expect(page).not.toHaveURL(/tenant-b/)
    await expect(page.getByText('Access denied')).toBeVisible()
  })
})
```

**DoD:**
- [ ] 2 tests created (catalog isolation + admin isolation)
- [ ] Tests validate RLS works (happy path = secure)
- [ ] All tests pass
- [ ] Document any vulnerability found

**Files:**
- Create: `tests/e2e/specs/cross-tenant-isolation.spec.ts`
- Create: `tests/e2e/fixtures/multi-tenant.fixture.ts`

---

### **TASK 5: Onboarding Wizard (Happy Path Only)** ⚡ HIGH
**Estimate:** 1 hour

**Objetivo:** Test completo signup → onboarding → storefront (solo exitoso).

**Scope:** 5 steps wizard exitoso

**Test Cases (SOLO 1-2):**
```typescript
describe('Onboarding Wizard - Happy Path', () => {
  test('completes 5-step wizard successfully', async ({ page, dbCleanup }) => {
    const testData = generateTestData('store')

    // Step 1: Signup
    await signupPage.navigate()
    await signupPage.fillForm(testData)
    await signupPage.submit()

    // Step 2: Logo upload
    await onboardingPage.uploadLogo('assets/logo-test.png')
    await onboardingPage.clickContinue()

    // Step 3: Colors
    await onboardingPage.selectPresetColor('blue')
    await onboardingPage.clickContinue()

    // Step 4: Products
    await onboardingPage.addProduct({
      name: 'Test Product',
      price: 1000,
      category: 'electronics',
      stock: 10
    })
    await onboardingPage.clickContinue()

    // Step 5: Preview
    await expect(page.getByTestId('preview-logo')).toBeVisible()
    await onboardingPage.clickContinue()

    // Step 6: Activation
    await onboardingPage.clickActivate()

    // Redirect to storefront
    await expect(page).toHaveURL(/\/shop\/.*/)

    await dbCleanup({ tenantSlug: testData.slug })
  })

  // OPCIONAL: Si ya existe en complete-signup-flow, puede omitirse
})
```

**Nota:** Verificar si `complete-signup-flow.spec.ts` ya cubre esto. Si SÍ → skip esta task.

**DoD:**
- [ ] 1 test covers full flow (signup → onboarding 5 steps → active store)
- [ ] Page objects created
- [ ] Test passes
- [ ] NO validation tests

**Files:**
- Create: `tests/e2e/specs/onboarding-wizard.spec.ts` (SOLO si no existe en complete-signup-flow)
- Create: `tests/e2e/pages/onboarding.page.ts`
- Create: `tests/e2e/locators/onboarding.locators.ts`

---

## 🚫 Out of Scope (NO HACER)

**Explícitamente NO incluir:**
- ❌ Tests de validaciones de formularios (email inválido, password corto, etc.)
- ❌ Tests de error handling (API errors, network errors, 500s)
- ❌ Tests de loading states
- ❌ Tests de edge cases (boundary conditions)
- ❌ Tests de responsive design (fuera de baseline)
- ❌ Tests unitarios (solo E2E)
- ❌ Tests de performance

**Rationale:** Baseline = mínimo viable. Validaciones/errores en v2.

---

## 📊 Success Metrics

**DoD Global:**
- [ ] TASK 0 complete: Tests existentes limpiados (~75% eliminados)
- [ ] TASK 1-5 complete: Solo happy paths implementados
- [ ] **Total tests: 20-25** (target)
- [ ] **Execution time: <5 min** (full suite)
- [ ] All tests pass (100% green)
- [ ] 0 P0 bugs
- [ ] Coverage: 100% happy paths core flows

**Test Count Target:**
```
Existing (cleaned):        ~15 tests
+ Admin Products CRUD:     +4 tests
+ Admin Orders:            +3 tests
+ Cross-Tenant:            +2 tests
+ Onboarding (if needed):  +1 test
--------------------------------
Total:                     ~25 tests
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

## 📁 Files Summary

**Update (cleanup):**
```
tests/e2e/specs/
├── tenant-creation.spec.ts           [UPDATE - remove validations]
├── checkout-flow.spec.ts             [UPDATE - remove errors]
├── checkout-mercadopago.spec.ts      [UPDATE - remove validations]
├── webhook-mercadopago.spec.ts       [UPDATE - keep only happy path]
├── complete-signup-flow.spec.ts      [KEEP AS IS - already happy path]
```

**Delete:**
```
tests/e2e/specs/
├── gallery-template-unit.spec.ts     [DELETE]
├── debug-activation.spec.ts          [DELETE]
├── gallery-integration.spec.ts       [DELETE]
```

**Create (new):**
```
tests/e2e/specs/
├── admin-products-crud.spec.ts       [NEW - 4 tests]
├── admin-orders-management.spec.ts   [NEW - 3 tests]
├── cross-tenant-isolation.spec.ts    [NEW - 2 tests]
└── onboarding-wizard.spec.ts         [NEW - 1 test, if needed]

tests/e2e/pages/
├── admin-products.page.ts            [NEW]
├── admin-orders.page.ts              [NEW]
└── onboarding.page.ts                [NEW, if needed]

tests/e2e/locators/
├── admin-products.locators.ts        [NEW]
├── admin-orders.locators.ts          [NEW]
└── onboarding.locators.ts            [NEW, if needed]
```

---

## 🚨 Blockers & Escalation

**Potential Blockers:**
- ⚠️ Admin products/orders UI no implementado → Pixel
- ⚠️ RLS policies broken → Kokoro
- ⚠️ Onboarding incomplete → Pixel

**Escalate to:**
- **Pixel** - Si falta UI
- **Kokoro** - Si hay bugs API/RLS
- **Mentat** - Si hay blockers arquitectónicos

---

## 🎯 Timeline (Revisado)

| Day | Tasks | Hours |
|-----|-------|-------|
| **Day 1** | TASK 0 (cleanup) + TASK 1 (validate) | 1.5h |
| **Day 2** | TASK 2 (products) + TASK 3 (orders) | 2.5h |
| **Day 3** | TASK 4 (isolation) + TASK 5 (onboarding) | 2h |

**Total:** 6 hours (reducido de 8h)

---

## ✅ Final Checklist

Antes de cerrar SKY-13:

- [ ] TASK 0-5 completed
- [ ] Test suite: `npm run test:e2e` → 100% green
- [ ] Test count: 20-25 tests (happy path only)
- [ ] Execution time: <5 min
- [ ] 0 P0 bugs
- [ ] Documentation updated:
  - [ ] `E2E_TEST_SUMMARY.md`
  - [ ] `SKY_13_NOTES.md`
- [ ] Commit + push
- [ ] Update SKY-13 in Linear → "Done"

---

**Baseline happy paths = foundation sólida. Validations = v2.** 🚀

**Creado:** 2025-11-25
**Actualizado:** 2025-11-25 (v2 - happy paths only)
**Owner:** Sentinela
**Reviewer:** Mentat
