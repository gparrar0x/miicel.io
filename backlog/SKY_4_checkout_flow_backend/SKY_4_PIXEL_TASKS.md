# SKY-4: Pixel Frontend Tasks

**Owner:** Pixel (Frontend Specialist)
**Estimate:** 4h
**Status:** Blocked by Kokoro T2-T3 (needs API endpoints)

---

## Context

Integrate SKY-4 backend APIs into existing `CheckoutModal` component. Current implementation has mock MercadoPago flow - needs real API integration + loading states + error handling.

**Existing Component:** `components/CheckoutModal.tsx`
- ✅ Form validation with react-hook-form + Zod
- ✅ Payment method selection (cash/mercadopago)
- ⚠️ API integration incomplete (calls mock endpoint)

**New Backend Endpoints (Kokoro):**
- `POST /api/orders/create` - Creates order, returns orderId + total
- `POST /api/checkout/create-preference` - Returns MP initPoint for redirect

---

## Tasks

### T1: Update CheckoutModal API Integration (2h)

**File:** `components/CheckoutModal.tsx`

**Changes:**

1. **Update `onSubmit` handler:**
```tsx
const onSubmit = async (data: CheckoutFormData) => {
  setIsSubmitting(true)

  try {
    // Step 1: Create order
    const orderResponse = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantSlug: tenantId,
        customer: {
          name: data.name,
          phone: data.phone,
          email: data.email,
        },
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: data.paymentMethod,
        notes: data.notes || '',
      }),
    })

    if (!orderResponse.ok) {
      const error = await orderResponse.json()
      throw new Error(error.error || 'Failed to create order')
    }

    const { orderId, total } = await orderResponse.json()

    // Step 2: Create MP preference and redirect
    const checkoutResponse = await fetch('/api/checkout/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        tenantSlug: tenantId,
        customer: {
          name: data.name,
          phone: data.phone,
          email: data.email,
        },
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          currency: item.currency,
          image: item.image,
        })),
        total,
        currency: items[0].currency,
      }),
    })

    if (!checkoutResponse.ok) {
      throw new Error('Failed to create checkout preference')
    }

    const { initPoint } = await checkoutResponse.json()

    // Redirect to MercadoPago
    clearCart()
    window.location.href = initPoint
  } catch (error) {
    console.error('Checkout error:', error)
    toast.error(error instanceof Error ? error.message : 'Checkout failed')
  } finally {
    setIsSubmitting(false)
  }
}
```

2. **Add better loading states:**
```tsx
{isSubmitting && (
  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-gray-600">Redirecting to payment...</p>
    </div>
  </div>
)}
```

**DoD:**
- Calls real backend APIs (orders/create → checkout/create-preference)
- MercadoPago redirect works with initPoint
- Cash payment shows success toast
- Cart clears after successful order
- Error messages displayed via toast

---

### T2: Add Success/Failure Pages (1.5h)

**Files to create:**
- `app/[tenantId]/checkout/success/page.tsx`
- `app/[tenantId]/checkout/failure/page.tsx`
- `app/[tenantId]/checkout/pending/page.tsx`

**Success Page:**
```tsx
// app/[tenantId]/checkout/success/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { CheckCircle } from 'lucide-react'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment_id')
  const orderId = searchParams.get('external_reference')

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-4">
          Your order #{orderId} has been confirmed.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Payment ID: {paymentId}
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
          data-testid="return-home-button"
        >
          Return to Store
        </button>
      </div>
    </div>
  )
}
```

**Failure Page:**
```tsx
// app/[tenantId]/checkout/failure/page.tsx
'use client'

import { XCircle } from 'lucide-react'

export default function CheckoutFailurePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          Your payment could not be processed. Please try again.
        </p>
        <button
          onClick={() => window.history.back()}
          className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
          data-testid="retry-payment-button"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
```

**Pending Page:** Similar structure with clock icon.

**DoD:**
- All 3 pages created with proper test IDs
- Success page extracts payment_id from MP redirect
- Failure page has retry button
- Matches tenant theme (use global CSS variables)

---

### T3: Add Error Boundary for Checkout (30min)

**File:** `components/CheckoutModal.tsx`

Add granular error handling for API failures:

```tsx
// Add error state
const [errorMessage, setErrorMessage] = useState<string | null>(null)

// In catch block, set specific error messages
catch (error) {
  let message = 'An unexpected error occurred'

  if (error instanceof Error) {
    if (error.message.includes('stock')) {
      message = 'Some products are out of stock. Please review your cart.'
    } else if (error.message.includes('MercadoPago')) {
      message = 'Payment provider unavailable. Please try again later.'
    } else {
      message = error.message
    }
  }

  setErrorMessage(message)
  toast.error(message)
}

// Display persistent error in modal
{errorMessage && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
    {errorMessage}
  </div>
)}
```

**DoD:**
- Stock errors show specific message
- MP config errors suggest cash alternative
- Error persists in UI until dismissed

---

## Test IDs Required

Per `.claude/TEST_ID_CONTRACT.md`:

```tsx
// CheckoutModal.tsx
data-testid="checkout-modal"
data-testid="checkout-form"
data-testid="customer-name-input"
data-testid="customer-phone-input"
data-testid="customer-email-input"
// Payment method selector removed (only MP supported)
data-testid="checkout-submit-button"
data-testid="checkout-error-message" // for error state

// Success/Failure pages
data-testid="checkout-success-page"
data-testid="checkout-failure-page"
data-testid="return-home-button"
data-testid="retry-payment-button"
```

---

## Deliverables

1. ✅ `CheckoutModal.tsx` integrated with real APIs
2. ✅ `app/[tenantId]/checkout/success/page.tsx`
3. ✅ `app/[tenantId]/checkout/failure/page.tsx`
4. ✅ `app/[tenantId]/checkout/pending/page.tsx`
5. ✅ Error handling with user-friendly messages
6. ✅ All test IDs added per contract

**Verification:** Sentinela will write E2E tests covering full checkout flow.

---

## Dependencies

- **Blocked by:** Kokoro T2 (`/api/orders/create`)
- **Blocked by:** Kokoro T3 (`/api/checkout/create-preference` real MP)
- **Blocks:** Sentinela E2E tests

**Start after:** Kokoro completes API endpoints (~7h after kickoff)
