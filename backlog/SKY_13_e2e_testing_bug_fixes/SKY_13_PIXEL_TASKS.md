# SKY-13: E2E Testing UI Fixes

> **Ticket:** [SKY-13](https://linear.app/publica/issue/SKY-13)
> **Priority:** P1 (BLOCKER for E2E tests)
> **Estimate:** 4-6 hours
> **Owner:** Pixel (Frontend Specialist)
> **Project:** miicel.io
> **Created:** 2025-11-29
> **Status:** In Progress

---

## 🎯 Objetivo

Arreglar componentes UI para que los 13 tests E2E existentes pasen (100% green).

**Problema:** 13/13 tests failing por elementos faltantes/invisibles:
- Checkout modal no se abre
- Success pages con elementos no encontrados
- Product dashboard con errores de navegación

---

## 📊 Estado Actual

**Tests failing:** 13/13 (100% rojos)

**Causas identificadas:**
1. **Checkout modal:** `checkout-modal-overlay` no visible al hacer click en cart button
2. **Cart button:** `cart-checkout-button` puede no existir o no funcionar
3. **Success pages:** Redirección incorrecta o API `/api/orders/[id]` falla
4. **Product dashboard:** Login/navegación rota en `/dashboard/products`

---

## 📋 Tasks

### **TASK 1: Fix Cart Checkout Button** 🔥 CRITICAL
**Estimate:** 1 hour

**Problema:** Test hace click en `cart-checkout-button` pero modal no abre

**Pasos:**
1. Buscar componente de carrito actual (CartSheet, FloatingCartButton, etc.)
2. Verificar que existe `data-testid="cart-checkout-button"`
3. Verificar que onClick abre el checkout modal
4. Si no existe modal, crear CheckoutModal component o redirigir a checkout page
5. Testear manualmente: add to cart → click checkout → modal/page visible

**DoD:**
- [ ] `cart-checkout-button` existe en CartSheet/FloatingCart
- [ ] Click en botón abre checkout modal O redirige a `/checkout`
- [ ] Test `checkout-flow.spec.ts:25` pasa localmente

**Files a revisar:**
- `components/restaurant/organisms/CartSheet.tsx`
- `components/restaurant/organisms/FloatingCartButton.tsx`
- `components/gallery/*` (si aplica a otros templates)

---

### **TASK 2: Fix Checkout Modal Visibility** 🔥 CRITICAL
**Estimate:** 1.5 hours

**Problema:** `checkout-modal-overlay` not found después de click

**Opción A - Si existe CheckoutModal:**
1. Buscar `CheckoutModal.tsx` component
2. Agregar `data-testid="checkout-modal-overlay"` al overlay/backdrop
3. Agregar todos los testids requeridos:
   - `checkout-input-name`
   - `checkout-input-phone`
   - `checkout-input-email`
   - `checkout-input-notes`
   - `checkout-payment-cash`
   - `checkout-payment-online`
   - `checkout-submit-button`
4. Verificar que modal se muestra con z-index alto y visible

**Opción B - Si NO existe modal (recomendado):**
1. Crear ruta `/[locale]/[tenantId]/checkout/page.tsx`
2. Form con todos los campos + testids de arriba
3. Cambiar cart button para redirigir a `/checkout` en vez de abrir modal
4. Actualizar tests para navegar a URL en vez de esperar modal

**DoD:**
- [ ] Checkout form visible (modal o page)
- [ ] Todos los testids existen y funcionan
- [ ] Submit crea orden y redirige a success
- [ ] Tests `checkout-flow.spec.ts` (3) + `checkout-mercadopago.spec.ts` (3) pasan

**Files:**
- Create: `app/[locale]/[tenantId]/checkout/page.tsx` (recomendado)
- O fix: `components/CheckoutModal.tsx` (si existe)

---

### **TASK 3: Fix Success Page API** ⚡ HIGH
**Estimate:** 1 hour

**Problema:** Success page muestra error en vez de order details

**Root cause:** API `/api/orders/[id]` devuelve error o formato incorrecto

**Pasos:**
1. Verificar que endpoint existe: `app/api/orders/[id]/route.ts`
2. Testear manualmente: `GET http://localhost:3000/api/orders/123` (con order real)
3. Verificar response format match esperado en success page:
   ```typescript
   {
     orderId: string
     customer: { name, email, phone }
     items: [{ name, quantity, price, currency }]
     total: number
     currency: string
     paymentMethod: string
   }
   ```
4. Si endpoint no existe, crearlo
5. Si existe pero formato wrong, arreglarlo

**DoD:**
- [ ] API `/api/orders/[id]` devuelve datos correctos
- [ ] Success page renderiza con `checkout-success-header` visible
- [ ] Tests `checkout-flow.spec.ts:112` pasa

**Files:**
- `app/api/orders/[id]/route.ts`
- `app/[locale]/[tenantId]/checkout/success/page.tsx` (ya tiene testids OK)

---

### **TASK 4: Fix Product Dashboard Navigation** ⚡ HIGH
**Estimate:** 1 hour

**Problema:** Tests de product upload fallan en navegación/login

**Error:** `page.goto('/es/test-store/dashboard/products') failed`

**Pasos:**
1. Verificar ruta existe: `app/[locale]/[tenantId]/dashboard/products/page.tsx`
2. Verificar auth middleware no bloquea test users
3. Crear Page Object helper para login automático si no existe
4. Agregar testids al product form:
   - `product-form-name`
   - `product-form-price`
   - `product-form-image-upload`
   - `product-form-submit`
5. Testear flujo manual: login → dashboard → products → create

**DoD:**
- [ ] Dashboard products page accesible con auth
- [ ] Form tiene todos los testids necesarios
- [ ] Tests `product-image-upload.spec.ts` (3) pasan

**Files:**
- `app/[locale]/[tenantId]/dashboard/products/page.tsx`
- `components/ProductForm.tsx` (o similar)
- `tests/e2e/fixtures/auth.fixture.ts` (para login helper)

---

### **TASK 5: Fix Webhook Test UI** 🔄 MEDIUM
**Estimate:** 30 min

**Problema:** Tests de webhook buscan elementos UI que no existen

**Nota:** Webhooks son API-only, pero tests buscan elementos UI

**Pasos:**
1. Revisar `tests/e2e/specs/webhook-mercadopago.spec.ts`
2. Identificar qué elementos UI busca (probablemente ninguno - test mal escrito)
3. Si test está bien (solo API), el problema es otro (skip por ahora)
4. Si test busca UI innecesaria, documentar para Sentinela que lo arregle

**DoD:**
- [ ] Entender por qué webhook tests fallan
- [ ] Documentar si es problema UI o test logic
- [ ] Handoff a Sentinela si es test issue

**Files:**
- `tests/e2e/specs/webhook-mercadopago.spec.ts`

---

### **TASK 6: Fix Complete Signup Flow** ⚡ HIGH
**Estimate:** 1 hour

**Problema:** Signup/onboarding tests failing

**Pasos:**
1. Verificar ruta `/signup` o `/onboarding` existe
2. Testear flujo manual: signup → onboarding steps → activation
3. Agregar testids faltantes en onboarding components
4. Verificar redirección final a storefront funciona

**DoD:**
- [ ] Signup/onboarding accessible
- [ ] Todos los testids existen
- [ ] Tests `complete-signup-flow.spec.ts` (2) pasan

**Files:**
- `app/[locale]/signup/page.tsx` (o similar)
- `app/[locale]/onboarding/page.tsx` (o similar)

---

## 🚫 Out of Scope

- ❌ NO crear tests nuevos (eso es para Sentinela)
- ❌ NO refactorizar código que funciona
- ❌ NO agregar features nuevas
- ❌ Solo arreglar UI para que tests existentes pasen

---

## 📊 Success Metrics

**DoD Global:**
- [ ] Task 1-6 completed
- [ ] `npm run test:e2e` → 13/13 tests PASSING (100% green)
- [ ] 0 `data-testid` elements not found
- [ ] Checkout flow funciona end-to-end manualmente

**Test Target:**
- Current: 0/13 passing (0%)
- Target: 13/13 passing (100%)

---

## 🎯 Prioridad de Ejecución

**Crítico (hacer primero):**
1. TASK 1: Cart checkout button
2. TASK 2: Checkout modal/page
3. TASK 3: Success page API

**High (después):**
4. TASK 4: Product dashboard
5. TASK 6: Signup flow

**Medium (último):**
6. TASK 5: Webhook (puede ser test issue, no UI)

---

## 🛠️ Tech Stack

**Framework:** Next.js 16 App Router
**UI:** React 19 + Tailwind + shadcn/ui
**Routing:** `[locale]/[tenantId]` dynamic routes

**Testing:** Playwright locators usando `data-testid`

---

## 🚨 Blockers & Escalation

**Si encuentras:**
- ⚠️ API endpoints no existen → Escalate to Kokoro
- ⚠️ Tests mal escritos (esperan UI wrong) → Escalate to Sentinela
- ⚠️ Auth system roto → Escalate to Kokoro
- ⚠️ Arquitectura blocker → Escalate to Mentat

**Escalate to:**
- **Sentinela** - Si problema es test logic, no UI
- **Kokoro** - Si falta backend/API
- **Mentat** - Si arquitectura blocker

---

## 📁 Files Summary

**Fix (high priority):**
```
components/restaurant/organisms/CartSheet.tsx           [FIX - add checkout button]
app/[locale]/[tenantId]/checkout/page.tsx               [CREATE - checkout form]
app/api/orders/[id]/route.ts                            [FIX - response format]
app/[locale]/[tenantId]/dashboard/products/page.tsx     [FIX - add testids]
```

**Review/validate:**
```
app/[locale]/[tenantId]/checkout/success/page.tsx       [REVIEW - seems OK]
app/[locale]/[tenantId]/checkout/failure/page.tsx       [REVIEW - seems OK]
tests/e2e/specs/webhook-mercadopago.spec.ts             [REVIEW - may be test issue]
```

---

## ✅ Final Checklist

Antes de cerrar:

- [ ] TASK 1-6 completed
- [ ] Run `npm run test:e2e` → 13/13 green
- [ ] Manual smoke test: cart → checkout → success page
- [ ] All `data-testid` elements accessible
- [ ] No console errors en browser
- [ ] Commit changes
- [ ] Notify Sentinela: "UI ready for test fixes"

---

**UI fixes = fundación para tests estables. Ship it!** 🚀

**Created:** 2025-11-29
**Owner:** Pixel
**Coordinator:** Mentat
