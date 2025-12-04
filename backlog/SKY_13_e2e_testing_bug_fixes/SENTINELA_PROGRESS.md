# SKY-13: E2E Testing - Sentinela Progress Report

**Date:** 2025-11-29
**Owner:** Sentinela
**Status:** PHASE 1 - IN PROGRESS (Waiting for Pixel + Fixing Component Testids)

---

## Current Phase: PHASE 1 (Fix Existing 13 Tests)

### BLOCKED: Waiting on Pixel
- Pixel task SKY_13_PIXEL_TASKS.md must complete first
- Tests cannot pass without UI fixes

### COMPLETED:
1. ✅ Updated CheckoutModal testids to match expectations:
   - `customer-name-input` → `checkout-name-input`
   - `customer-phone-input` → `checkout-phone-input`
   - `customer-email-input` → `checkout-email-input`
   - `checkout-modal-overlay` → `checkout-modal-container` (and added backdrop)

2. ✅ Added payment method selection to CheckoutModal:
   - Radio buttons for "Cash on Delivery" (`checkout-payment-cash`)
   - Radio buttons for "MercadoPago" (`checkout-payment-mercadopago`)
   - Dynamic submit handler based on selected payment method
   - Cash payments redirect to success page directly
   - MercadoPago payments redirect to MP checkout URL

3. ✅ Updated checkout-flow.spec.ts test file:
   - Fixed all testid references to match CheckoutModal changes
   - Tests ready once UI is available

### IN PROGRESS:
- Running checkout-flow tests to verify fixes work with mock API

### TODO (Blocked on Pixel):
- TASK 1.1: Fix checkout-flow tests (3 tests) - waiting for Cart/Modal UI
- TASK 1.2: Fix checkout-mercadopago tests (3 tests) - needs page objects
- TASK 1.3: Fix signup-flow tests (2 tests) - page object dependent
- TASK 1.4: Fix product-image-upload tests (3 tests) - needs dashboard access
- TASK 1.5: Review webhook tests (2 tests) - API-only, can start

---

## Test Status

| Test File | Tests | Status | Notes |
|-----------|-------|--------|-------|
| checkout-flow.spec.ts | 3 | 🟡 Pending | Testids fixed, waiting for UI |
| checkout-mercadopago.spec.ts | 3 | 🔴 Failing | Uses page objects, waiting for UI |
| complete-signup-flow.spec.ts | 2 | 🔴 Failing | UI + page objects, waiting |
| product-image-upload.spec.ts | 3 | 🔴 Failing | Dashboard auth + testids |
| webhook-mercadopago.spec.ts | 2 | 🔴 Failing | API-only, can fix independently |
| **Phase 1 Total** | **13** | 🔴 7.7% | 1/13 prep done |

---

## Key Decisions Made

### 1. CheckoutModal Architecture
- Keep modal, don't create separate checkout page (test simpler this way)
- Support both cash + MercadoPago payment methods
- Dynamic redirect based on payment selection
- Testids follow `{feature}-{element}-{type}` convention

### 2. Test Strategy
- Fix component testids first (done)
- Update test expectations (done for checkout-flow)
- Let Pixel fix UI visibility issues
- Then focus on API mocks + assertions

### 3. Page Object Usage
- checkout-mercadopago.spec.ts uses CheckoutPage (recommended pattern)
- checkout-flow.spec.ts uses raw Playwright (legacy, but simpler)
- Will standardize on page objects for new tests (Phase 2)

---

## Blocker Analysis

**Why tests fail currently:**
1. `cart-checkout-button` not visible in storefront → Can't open modal
2. `checkout-modal-container` not appearing → Can't interact with form
3. Product dashboard inaccessible → Can't test image upload
4. Signup flow incomplete → Missing onboarding UI

**Pixel needs to fix:**
- TASK 1: Cart button visibility + click handler
- TASK 2: Modal rendering + visibility
- TASK 3: Success page API endpoint
- TASK 4: Dashboard auth + product form testids
- TASK 6: Signup/onboarding routes

**Sentinela can do in parallel:**
- Fix webhook tests (API-only, no UI needed)
- Prepare Phase 2 test templates
- Create page object infrastructure

---

## Next Steps (Blocked until Pixel completes)

### Immediately After Pixel Completes:
1. Run all 5 test files again
2. Fix remaining locator mismatches
3. Update API mocks if needed
4. Debug any timing issues
5. Get 13/13 green

### Then Phase 2 (Add 9 new tests):
1. Admin Products CRUD (4 tests)
2. Admin Orders Management (3 tests)
3. Cross-Tenant Isolation (2 tests)
4. Final verification: 22/22 tests, <5 min

---

## Commits Made

```
Components updated:
- /components/CheckoutModal.tsx (payment methods, testids)

Tests updated:
- /tests/e2e/specs/checkout-flow.spec.ts (testid references)
```

Files ready for commit once tests pass.

---

**Status Check:** Check Pixel's SKY_13_PIXEL_TASKS.md progress before continuing.
