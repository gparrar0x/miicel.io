# SKY-4: Kokoro Backend Tasks

**Owner:** Kokoro (Backend Specialist)
**Estimate:** 11h
**Status:** Ready to start

---

## Context

Implement complete checkout backend with MercadoPago integration. Existing partial implementation in `app/api/checkout/create-preference/route.ts` needs full MercadoPago SDK integration + webhook handler + order creation refactor.

**DB Schema (confirmed via Supabase MCP):**
```sql
-- customers table
id BIGINT PK, tenant_id BIGINT FK, name TEXT, email TEXT, phone TEXT

-- orders table
id BIGINT PK, tenant_id BIGINT FK, customer_id BIGINT FK
items JSONB (array of {product_id, quantity, unit_price, name})
total NUMERIC, status TEXT (pending|paid|preparing|ready|delivered|cancelled)
payment_method TEXT (mercadopago|cash|transfer), payment_id TEXT

-- tenants table
mp_access_token TEXT (encrypted with lib/encryption.ts)
```

**Existing Files:**
- ✅ `lib/encryption.ts` - AES-256-GCM encrypt/decrypt ready
- ✅ `lib/supabase/server.ts` - createServiceRoleClient() for RLS bypass
- ⚠️ `app/api/checkout/create-preference/route.ts` - Mock MP implementation
- ❌ `app/api/orders/create/route.ts` - Does NOT exist (create)
- ❌ `app/api/webhooks/mercadopago/route.ts` - Does NOT exist (create)

---

## Tasks

### T1: Install MercadoPago SDK (30min)
```bash
npm install mercadopago
```

Verify types available or add `@types/mercadopago` if needed.

**DoD:** `package.json` updated, types resolved.

---

### T2: Create `POST /api/orders/create` (3h)

**File:** `app/api/orders/create/route.ts`

**Responsibilities:**
1. Validate product ownership (tenant_id match) - **CRITICAL SECURITY**
2. Check stock availability (products.stock >= quantity)
3. Create/update customer by phone+email
4. Insert order with service-role client (bypass RLS)

**Request Schema (Zod):**
```ts
{
  tenantSlug: string
  customer: { name, phone (10 digits), email }
  items: [{ productId: number, quantity: number }]
  paymentMethod: 'mercadopago' // Solo digital
  notes?: string
}
```

**Response:**
```ts
{ success: true, orderId: number, total: number }
```

**Security Checks:**
```ts
// For each item.productId:
const product = await supabase
  .from('products')
  .select('tenant_id, stock, price, active')
  .eq('id', productId)
  .single()

if (product.tenant_id !== tenantId) throw 403
if (!product.active || product.stock < quantity) throw 400
```

**Use `createServiceRoleClient()`** to insert orders (bypasses RLS).

**DoD:**
- API route functional
- Product ownership validation passes
- Stock checks work
- Returns orderId + total

---

### T3: Refactor `POST /api/checkout/create-preference` (4h)

**File:** `app/api/checkout/create-preference/route.ts`

**Replace mock MP implementation with real SDK:**

```ts
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { decryptToken } from '@/lib/encryption'

// 1. Get tenant mp_access_token (encrypted)
const { data: tenant } = await supabase
  .from('tenants')
  .select('mp_access_token')
  .eq('slug', tenantSlug)
  .single()

if (!tenant.mp_access_token) {
  return NextResponse.json(
    { error: 'MercadoPago not configured for this tenant' },
    { status: 400 }
  )
}

// 2. Decrypt token
const mpToken = decryptToken(tenant.mp_access_token)

// 3. Initialize MP client
const client = new MercadoPagoConfig({ accessToken: mpToken })
const preference = new Preference(client)

// 4. Create preference
const preferenceData = {
  items: items.map(item => ({
    title: item.name,
    unit_price: item.price,
    quantity: item.quantity,
    currency_id: currency === 'ARS' ? 'ARS' : 'USD',
  })),
  payer: {
    name: customer.name,
    email: customer.email,
    phone: { number: customer.phone },
  },
  back_urls: {
    success: `${process.env.NEXT_PUBLIC_BASE_URL}/${tenantSlug}/checkout/success`,
    failure: `${process.env.NEXT_PUBLIC_BASE_URL}/${tenantSlug}/checkout/failure`,
    pending: `${process.env.NEXT_PUBLIC_BASE_URL}/${tenantSlug}/checkout/pending`,
  },
  auto_return: 'approved',
  external_reference: orderId.toString(), // Link to our order
  notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
}

const result = await preference.create({ body: preferenceData })

return NextResponse.json({
  success: true,
  orderId,
  preferenceId: result.id,
  initPoint: result.init_point, // MP checkout URL
})
```

**DoD:**
- Real MP SDK integrated
- Preference created with tenant-specific token
- Returns `initPoint` for redirect
- `external_reference` links to orderId

---

### T4: Create `POST /api/webhooks/mercadopago` (3.5h)

**File:** `app/api/webhooks/mercadopago/route.ts`

**Webhook flow (IPN notifications):**

```ts
import crypto from 'crypto'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  // 1. Validate MP signature (x-signature header)
  const signature = request.headers.get('x-signature')
  const xRequestId = request.headers.get('x-request-id')

  // MP signature validation (HMAC-SHA256)
  // See: https://www.mercadopago.com/developers/en/docs/your-integrations/notifications/webhooks

  const body = await request.text()
  const expectedSig = crypto
    .createHmac('sha256', process.env.MERCADOPAGO_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')

  if (signature !== expectedSig) {
    return new Response('Invalid signature', { status: 403 })
  }

  // 2. Parse notification
  const data = JSON.parse(body)

  if (data.type === 'payment') {
    const paymentId = data.data.id

    // 3. Fetch payment details from MP API
    const mpClient = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
    })
    const payment = new Payment(mpClient)
    const paymentInfo = await payment.get({ id: paymentId })

    // 4. Extract orderId from external_reference
    const orderId = parseInt(paymentInfo.external_reference)

    // 5. Update order status based on payment status
    const supabase = createServiceRoleClient()

    let newStatus = 'pending'
    if (paymentInfo.status === 'approved') {
      newStatus = 'paid'
    } else if (paymentInfo.status === 'rejected') {
      newStatus = 'cancelled'
    }

    await supabase
      .from('orders')
      .update({
        status: newStatus,
        payment_id: paymentId.toString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    return new Response('OK', { status: 200 })
  }

  return new Response('Ignored', { status: 200 })
}
```

**Webhook Registration:**
- Register webhook URL in MP dashboard: `https://yourdomain.com/api/webhooks/mercadopago`
- Set webhook secret in MP dashboard
- Add `MERCADOPAGO_WEBHOOK_SECRET` to `.env`

**DoD:**
- Webhook validates MP signature
- Updates order status: pending → paid
- Stores payment_id in orders table
- Returns 200 OK to MP

---

## Environment Variables Required

Add to `.env.local`:
```bash
# MercadoPago (per-tenant encrypted in DB, but need test token)
MERCADOPAGO_ACCESS_TOKEN=TEST-xxx... # For webhook validation
MERCADOPAGO_WEBHOOK_SECRET=xxx # From MP dashboard

# Encryption (existing)
ENCRYPTION_KEY=<64 hex chars>

# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

---

## Testing Checklist

**Manual Testing (MercadoPago Sandbox):**
1. Create test tenant with encrypted `mp_access_token`
2. POST `/api/orders/create` → verify orderId returned
3. POST `/api/checkout/create-preference` → verify initPoint URL
4. Click initPoint → MP sandbox checkout opens
5. Complete test payment → webhook called
6. Verify order status updated to 'paid'

**Edge Cases:**
- [ ] Product not owned by tenant → 403
- [ ] Insufficient stock → 400
- [ ] Tenant without mp_access_token → 400
- [ ] Invalid webhook signature → 403
- [ ] Payment rejected → order cancelled

---

## Deliverables

1. ✅ `app/api/orders/create/route.ts`
2. ✅ `app/api/checkout/create-preference/route.ts` (refactored)
3. ✅ `app/api/webhooks/mercadopago/route.ts`
4. ✅ MercadoPago SDK installed
5. ✅ All security validations implemented
6. ✅ Webhook signature validation working
7. ✅ Order status updates on payment confirmation

**Verification:** Pixel will integrate frontend + Sentinela will write E2E tests.

---

## Notes

- Use `createServiceRoleClient()` for all order writes (bypasses RLS)
- Decrypt `tenant.mp_access_token` per request (don't cache)
- MP webhook retries 3x if non-200 response
- Stock decrement happens on order creation (not payment) - discuss with Mentat if needs change
- Email confirmation (optional subtask) - skip for MVP

**Dependencies:** None (can start immediately)
**Blocks:** SKY-4 Pixel tasks (need API endpoints)
