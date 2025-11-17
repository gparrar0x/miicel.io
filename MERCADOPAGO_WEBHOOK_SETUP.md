# MercadoPago Webhook Setup Guide
## SKY-4 Production Deployment

---

## Prerequisites

1. MercadoPago account with API credentials
2. Application deployed to Vercel
3. Production domain: `https://sw-commerce-saas.vercel.app`

---

## Step 1: Register Webhook in MercadoPago Dashboard

### Access Dashboard
1. Go to https://www.mercadopago.com/developers
2. Login with your MercadoPago account
3. Navigate to **Your integrations** > **Webhooks**

### Add Webhook URL
1. Click **Create webhook** or **Add URL**
2. **Webhook URL:** `https://sw-commerce-saas.vercel.app/api/webhooks/mercadopago`
3. **Events to subscribe:**
   - [x] `payment` - Payment created
   - [x] `payment` - Payment updated
   - Select: **approved, rejected, pending, cancelled, refunded, charged_back**
4. Click **Save**

### Get Webhook Secret
1. After creating webhook, MP dashboard shows **Webhook Secret**
2. Copy the secret (format: `abc123def456...`)
3. Store securely - needed for Vercel env vars

**Example webhook secret format:**
```
abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

## Step 2: Configure Vercel Environment Variables

### Access Vercel Project Settings
1. Go to https://vercel.com/dashboard
2. Select project: `sw-commerce-saas`
3. Navigate to **Settings** > **Environment Variables**

### Add Missing Variables

| Variable | Value | Environments |
|----------|-------|--------------|
| `MERCADOPAGO_WEBHOOK_SECRET` | `<from MP dashboard>` | Production + Preview |
| `NEXT_PUBLIC_BASE_URL` | `https://sw-commerce-saas.vercel.app` | Production |
| `NEXT_PUBLIC_BASE_URL` | `https://sw-commerce-saas-preview.vercel.app` | Preview |

**IMPORTANT:** After adding variables, trigger a redeploy:
- Go to **Deployments** tab
- Click **...** on latest deployment
- Select **Redeploy**

---

## Step 3: Test Webhook Endpoint

### Manual cURL Test (Optional)
```bash
# Test signature validation (should return 403)
curl -X POST https://sw-commerce-saas.vercel.app/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -H "x-signature: ts=1234567890,v1=invalid" \
  -H "x-request-id: test-123" \
  -d '{"type":"payment","data":{"id":"test"}}'

# Expected: 403 Invalid signature
```

### MercadoPago Test Mode Payment
1. Create test tenant with encrypted `mp_access_token`
2. Visit tenant storefront
3. Add product to cart
4. Complete checkout → redirects to MP sandbox
5. Use test card: `4000 0000 0000 0000` (approved)
6. Complete payment
7. **Verify webhook called in Vercel logs**

---

## Step 4: Verify Webhook Working

### Check Vercel Logs
1. Go to Vercel Dashboard > Project > **Logs**
2. Filter by function: `/api/webhooks/mercadopago`
3. Look for recent POST requests

**Success indicators:**
```
POST /api/webhooks/mercadopago → 200 OK
Order {orderId} updated to paid (payment {paymentId})
```

**Failure indicators:**
```
POST /api/webhooks/mercadopago → 403 Forbidden
Error: Invalid webhook signature
```

### Check Order Status in Supabase
1. Open Supabase Dashboard
2. Navigate to **Table Editor** > `orders`
3. Find order by `id` from test
4. Verify:
   - `status` = `'paid'`
   - `payment_id` = `'{MP payment ID}'`
   - `updated_at` = recent timestamp

---

## Webhook Signature Validation

### How It Works
MercadoPago sends signature in header:
```
x-signature: ts=1731801234,v1=abc123def...
x-request-id: req-xyz789
```

**Our validation logic (`app/api/webhooks/mercadopago/route.ts`):**
```typescript
// 1. Parse signature header
const sigParts = signature.split(',')
const ts = extract('ts')
const hash = extract('v1')

// 2. Construct signed payload
const signedPayload = `${ts}.${requestId}.${body}`

// 3. Calculate expected hash
const expectedHash = crypto
  .createHmac('sha256', webhookSecret)
  .update(signedPayload)
  .digest('hex')

// 4. Compare (constant-time)
if (!crypto.timingSafeEqual(hash, expectedHash)) {
  return 403 // Invalid signature
}
```

---

## Troubleshooting

### Webhook returns 403 (Invalid signature)
**Cause:** Signature validation failed
**Fix:**
1. Verify `MERCADOPAGO_WEBHOOK_SECRET` matches MP dashboard
2. Check Vercel logs for exact error
3. Test with MP test mode payment (not manual cURL)

### Webhook returns 500 (Internal error)
**Cause:** Database or MP API error
**Fix:**
1. Check Vercel logs for stack trace
2. Verify `SUPABASE_SERVICE_ROLE_KEY` set correctly
3. Ensure order exists with matching `external_reference`

### Order status not updating
**Cause:** Webhook not being called
**Fix:**
1. Verify webhook URL registered in MP dashboard
2. Check MP dashboard > Webhooks > Delivery history
3. Ensure `notification_url` set in preference creation

### MP retries webhook 3x
**Cause:** Webhook returned non-200 status
**Fix:**
1. Fix underlying error (see Vercel logs)
2. MP will retry automatically
3. If all retries fail, check MP dashboard for failed deliveries

---

## Security Considerations

### Signature Validation
- NEVER skip signature validation in production
- Use constant-time comparison to prevent timing attacks
- Validate `ts` (timestamp) if implementing replay protection

### Webhook Secret Storage
- Store in Vercel env vars (encrypted at rest)
- NEVER commit to git
- Rotate secret if compromised

### Rate Limiting
- MP may send multiple notifications for same payment
- Current implementation: idempotent (updates existing order)
- Consider adding rate limiting if spam detected

---

## Webhook Event Types

### Handled by Our Endpoint
| Event Type | MP Status | Order Status |
|------------|-----------|--------------|
| `payment` | `approved` | `paid` |
| `payment` | `rejected` | `cancelled` |
| `payment` | `pending` | `pending` |
| `payment` | `in_process` | `pending` |
| `payment` | `cancelled` | `cancelled` |
| `payment` | `refunded` | `cancelled` |
| `payment` | `charged_back` | `cancelled` |

### Ignored Events
- `merchant_order` - Not used in current implementation
- `subscription` - Not applicable (no subscriptions)

---

## Monitoring & Alerts

### Key Metrics to Track
- **Webhook success rate:** Target >99%
- **Response time:** Target <500ms (MP timeout: 5s)
- **Order status mismatch:** Alert if stuck at 'pending' >1h

### Vercel Analytics Setup
1. Enable **Speed Insights** for webhook endpoint
2. Set up **Log Drains** for centralized logging
3. Configure **Notifications** for 5xx errors

### Suggested Alerts
```yaml
- name: Webhook Failure Rate
  condition: status=403 OR status=500
  threshold: >5 in 10min
  action: Slack notification

- name: Webhook Timeout
  condition: duration>4000ms
  threshold: >10 in 5min
  action: Email alert

- name: Orders Stuck Pending
  condition: status='pending' AND age>60min
  threshold: >3
  action: Manual review
```

---

## Rollback Plan

### If Webhook Breaks Production
1. **Quick fix:** Disable webhook in MP dashboard (payments still work, manual status update)
2. **Investigate:** Check Vercel logs for root cause
3. **Fix:** Deploy hotfix to previous working version
4. **Re-enable:** Test in preview environment first

### Manual Order Status Update (Emergency)
```sql
-- If webhook fails and payment succeeded
UPDATE orders
SET status = 'paid',
    payment_id = '<MP payment ID>',
    updated_at = NOW()
WHERE id = <order_id>;
```

---

## Production Checklist

- [ ] Webhook URL registered in MP dashboard
- [ ] Webhook secret added to Vercel env vars
- [ ] Test payment completed successfully
- [ ] Order status updated to 'paid' in Supabase
- [ ] Vercel logs show 200 OK for webhook
- [ ] MP dashboard shows successful delivery
- [ ] Monitoring alerts configured
- [ ] Team trained on troubleshooting steps

---

## Support Contacts

- **MercadoPago Support:** https://www.mercadopago.com/developers/en/support
- **Vercel Support:** https://vercel.com/support
- **Internal Escalation:** @Mentat (Skywalking)

---

**Last Updated:** 2025-11-16
**Document Owner:** Hermes (Deployment Specialist)
