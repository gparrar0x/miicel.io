# SKY-13: Tests to Delete (Non-Happy Path)

> **Objetivo:** Eliminar todos los tests que NO sean happy path para tener baseline limpio.
> **Criterio:** Solo mantener flujos principales exitosos (usuario comprador + admin).

---

## 📋 Tests Existentes a Eliminar

### 1. `tenant-creation.spec.ts` (20 tests → 4 mantener)

**✅ MANTENER (4 happy path):**
- `should successfully create tenant with valid data`
- `should validate slug availability in real-time`
- `should redirect to onboarding after successful signup`
- `should automatically sign in user after account creation`

**❌ ELIMINAR (16 tests):**
```typescript
// Validations
- should show error for invalid email format
- should show error for password too short
- should show error for password missing uppercase letter
- should show error for password missing lowercase letter
- should show error for password missing number
- should toggle password visibility
- should show error for slug too short
- should show error for slug with uppercase letters
- should show error for slug with invalid characters
- should disable submit button when slug is already taken
- should show error for business name too short

// Error handling
- should handle slug validation network error gracefully
- should handle signup API error on submission

// Integration (duplicados con complete-signup-flow)
- should create complete signup flow with all valid data
- should show success message after account creation
- should properly cleanup database after test completion
```

**Líneas a eliminar:** ~125-500 (aprox)

---

### 2. `checkout-flow.spec.ts` (8 tests → 3 mantener)

**✅ MANTENER (3 happy path):**
- `should successfully submit checkout with cash payment`
- `should redirect to MercadoPago for online payment`
- `should display order summary on success page`

**❌ ELIMINAR (5 tests):**
```typescript
// Validations
- should show validation errors for invalid form data

// Error/edge cases
- should display error message on failure page
- should display correct order summary in checkout modal
- should show loading state during form submission
- should handle API errors gracefully
```

---

### 3. `checkout-mercadopago.spec.ts` (17 tests → 2-3 mantener)

**Acción:** REVISAR archivo completo. Probablemente tiene:
- ❌ Validaciones de MP sandbox
- ❌ Error handling de webhooks
- ❌ Tests de reconciliación

**✅ MANTENER (estimar 2-3):**
- Crear preferencia MP exitosa
- Redirect a MP checkout
- Webhook success actualiza orden

**❌ ELIMINAR:** ~14 tests de validaciones/errores

---

### 4. `webhook-mercadopago.spec.ts` (20 tests → 2-3 mantener)

**Similar a checkout-mercadopago:**
- ✅ MANTENER: Happy path webhooks (approved, paid status)
- ❌ ELIMINAR: Validaciones, signatures, rejected payments, etc.

---

### 5. `gallery-template.spec.ts` (10 tests → 1-2 mantener)

**✅ MANTENER:**
- Template switch básico (happy path)

**❌ ELIMINAR:**
- Validaciones de templates
- Edge cases de switching

**Nota:** Evaluar si gallery/templates son core flow. Si NO → eliminar spec completo.

---

### 6. `gallery-template-unit.spec.ts` (10 tests)

**❌ ELIMINAR ARCHIVO COMPLETO**
- Son unit tests, no E2E
- No son happy path de flujo de usuario

---

### 7. `template-switching-happy-path.spec.ts` (9 tests)

**Acción:** REVISAR si realmente son solo happy path
- Si sí → mantener 1-2 tests core
- Si tiene validaciones → eliminar

**Nota:** Si templates NO son feature core → eliminar spec completo

---

### 8. `admin-layout.spec.ts` (0 tests aparentes)

**Acción:** REVISAR archivo - puede estar vacío o mal contado
- Si vacío → eliminar
- Si tiene tests, mantener solo happy path navigation

---

### 9. `debug-activation.spec.ts` (1 test)

**❌ ELIMINAR ARCHIVO COMPLETO**
- Es debug test, no test productivo

---

### 10. `gallery-integration.spec.ts` (0 tests)

**❌ ELIMINAR ARCHIVO COMPLETO**
- Archivo vacío o stub

---

### 11. `complete-signup-flow.spec.ts` (4 tests)

**✅ MANTENER TODOS (4 tests)**
- Ya son happy path completo signup → onboarding
- Nombres indican "Happy Path" en describe

---

### 12. `products/product-image-upload.spec.ts` (? tests)

**Acción:** REVISAR
- ✅ MANTENER: 1 test happy path (upload imagen exitoso)
- ❌ ELIMINAR: Validaciones de file type, size, etc.

---

## 📊 Resumen Eliminaciones

| Spec File | Tests Actuales | Mantener | Eliminar | % Reducción |
|-----------|----------------|----------|----------|-------------|
| tenant-creation.spec.ts | 20 | 4 | 16 | 80% |
| checkout-flow.spec.ts | 8 | 3 | 5 | 62% |
| checkout-mercadopago.spec.ts | 17 | 2-3 | 14-15 | ~82% |
| webhook-mercadopago.spec.ts | 20 | 2-3 | 17-18 | ~85% |
| gallery-template.spec.ts | 10 | 0-2 | 8-10 | ~90% |
| gallery-template-unit.spec.ts | 10 | 0 | 10 | 100% |
| template-switching-happy-path.spec.ts | 9 | 1-2 | 7-8 | ~88% |
| debug-activation.spec.ts | 1 | 0 | 1 | 100% |
| gallery-integration.spec.ts | 0 | 0 | 0 | - |
| admin-layout.spec.ts | 0? | TBD | TBD | TBD |
| complete-signup-flow.spec.ts | 4 | 4 | 0 | 0% |
| product-image-upload.spec.ts | ? | 1 | ? | ~80% |

**Total Estimado:**
- **Antes:** ~99 tests
- **Después:** ~20-25 tests happy path
- **Reducción:** ~75%

---

## 🎯 Happy Paths Finales (Target)

### Usuario Comprador (Frontend)
1. ✅ Signup → Onboarding (5 steps) → Storefront activo
2. ✅ Ver catálogo → Ver producto → Agregar al carrito
3. ✅ Checkout con efectivo → Ver orden en success page
4. ✅ Checkout con MercadoPago → Redirect → Webhook success

**Total:** 4 flows principales

---

### Usuario Administrador (Admin Panel)
1. ✅ Login admin → Dashboard
2. ✅ Admin Products CRUD:
   - Crear producto → Ver en lista
   - Editar producto → Ver cambios
   - Eliminar producto → Desaparece de lista
3. ✅ Admin Orders Management:
   - Ver lista de órdenes
   - Ver detalle de orden
   - Cambiar estado de orden

**Total:** 3 flows principales

---

### Seguridad (Cross-Tenant)
1. ✅ Tenant A NO ve productos de Tenant B
2. ✅ Admin A NO puede acceder admin de Tenant B

**Total:** 2 tests críticos

---

## 🗑️ Acción Sentinela

**Fase 1: Limpieza (Priority)**
1. Eliminar tests según tabla arriba
2. Ejecutar suite: `npm run test:e2e` → Verificar solo happy paths quedan
3. Confirmar con Mentat antes de commit

**Fase 2: Implementar Faltantes**
4. Crear tests de admin (products CRUD, orders management)
5. Crear tests cross-tenant isolation
6. Final run: ~20-25 tests green

---

**Criterio final:** ¿Este test valida flujo exitoso core del negocio?
- ✅ SÍ → Mantener
- ❌ NO (validación, error, edge case) → Eliminar

---

**Creado:** 2025-11-25
**Owner:** Sentinela
**Reviewer:** Mentat
