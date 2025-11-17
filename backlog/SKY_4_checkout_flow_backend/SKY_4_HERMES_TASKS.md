# SKY-4: Hermes Deployment Tasks

**Owner:** Hermes (Deployment Specialist)
**Estimate:** 1h
**Status:** Blocked by all agents (needs complete implementation)

---

## Context

Verify SKY-4 deployment to Vercel, configure environment variables, test webhook endpoint accessibility, and validate production build.

---

## Tasks

### T1: Environment Variables Setup (15min)

**Vercel Dashboard Configuration:**

Add to project environment variables (Production + Preview):

```bash
# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=<tenant-specific, encrypted in DB>
MERCADOPAGO_WEBHOOK_SECRET=<from MP dashboard>

# Encryption (existing)
ENCRYPTION_KEY=<64 hex chars>

# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Base URL for MP callbacks
NEXT_PUBLIC_BASE_URL=https://sw-commerce-saas.vercel.app
```

**DoD:**
- All env vars set in Vercel
- MERCADOPAGO_WEBHOOK_SECRET matches MP dashboard
- NEXT_PUBLIC_BASE_URL correct for prod

---

### T2: Verify Production Build (20min)

**Check build output:**

```bash
# Locally first
npm run build

# Check for:
# 1. Bundle size < 250MB (Vercel Free limit)
# 2. No build errors
# 3. API routes compiled
```

**Verify in Vercel deployment logs:**
- ✅ Build succeeds
- ✅ `app/api/orders/create/route.ts` compiled
- ✅ `app/api/checkout/create-preference/route.ts` compiled
- ✅ `app/api/webhooks/mercadopago/route.ts` compiled

**DoD:**
- Production build passes
- Bundle size OK
- All 3 API routes deployed

---

### T3: Webhook Endpoint Configuration (15min)

**MercadoPago Dashboard:**

1. Go to https://www.mercadopago.com/developers
2. Navigate to Your integrations → Webhooks
3. Add webhook URL:
   ```
   https://sw-commerce-saas.vercel.app/api/webhooks/mercadopago
   ```
4. Select events: `payment` (approved, rejected, pending)
5. Copy webhook secret → add to Vercel env vars

**Test webhook:**
```bash
# Use MP test mode payment
curl -X POST https://sw-commerce-saas.vercel.app/api/webhooks/mercadopago \
  -H "x-signature: <test-sig>" \
  -H "content-type: application/json" \
  -d '{"type":"payment","data":{"id":"test-123"}}'
```

**DoD:**
- Webhook URL registered in MP
- Secret configured in Vercel
- Test webhook returns 200

---

### T4: Smoke Test Production (10min)

**Manual verification:**

1. Visit production tenant store
2. Add product to cart
3. Click checkout
4. Fill customer form
5. Click submit → verify redirect to MP sandbox
6. Complete test payment
7. Verify order status updated to 'paid' in Supabase

**Check Vercel logs:**
- `POST /api/orders/create` - 200 OK
- `POST /api/checkout/create-preference` - 200 OK
- `POST /api/webhooks/mercadopago` - 200 OK (after MP payment)

**DoD:**
- Full checkout flow works in prod
- Webhook updates order status
- No errors in Vercel logs

---

## Deliverables

1. ✅ Environment variables configured
2. ✅ Production build verified
3. ✅ Webhook endpoint registered with MP
4. ✅ Smoke test passed

**Verification:** Full E2E checkout flow working in production.

---

## Dependencies

- **Blocked by:** Kokoro (APIs), Pixel (UI), Sentinela (tests)
- **Start after:** All agents complete + tests pass (~15h)
