# Deployment Quick Start

> **⚠️ DEPRECATED:** This document is outdated.
> 
> **See:** [`VERCEL_DEPLOYMENT_GUIDE.md`](VERCEL_DEPLOYMENT_GUIDE.md) for current deployment instructions.
> 
> **Quick summary:** [`VERCEL_DEPLOYMENT_SUMMARY.md`](VERCEL_DEPLOYMENT_SUMMARY.md)

---

## Legacy Content (SKY-4)

**Status:** SUPERSEDED BY SKY-15
**Date:** 2025-11-16 → 2025-11-22

---

## Files Created

| File | Purpose |
|------|---------|
| `.env.production.template` | Vercel env var reference |
| `MERCADOPAGO_WEBHOOK_SETUP.md` | Step-by-step webhook config |
| `SKY_4_DEPLOYMENT_STATUS.md` | Full readiness report |
| `DEPLOYMENT_QUICK_START.md` | This file (quick reference) |

---

## Build Status

```
✅ npm run build → EXIT 0
✅ Bundle: 93M/250MB (37% Vercel Free limit)
✅ All API routes compiled:
   - /api/orders/create (552B)
   - /api/checkout/create-preference (630B)
   - /api/webhooks/mercadopago (512B)
```

---

## Environment Variables Required

Copy from `.env.production.template` to Vercel Dashboard:

**Already have from .env:**
```bash
ENCRYPTION_KEY=f8c044e320ac...
NEXT_PUBLIC_SUPABASE_URL=https://lmqysqapqbttmyheuejo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPER_ADMINS=gparrar@skywalking.dev
```

**Need to add:**
```bash
NEXT_PUBLIC_BASE_URL=https://sw-commerce-saas.vercel.app
MERCADOPAGO_WEBHOOK_SECRET=<from MP dashboard after step 3>
```

---

## Deployment Steps

### 1. Add Env Vars to Vercel (5min)
- Vercel Dashboard > Project > Settings > Environment Variables
- Copy all from `.env.production.template`
- Set for Production + Preview
- Leave `MERCADOPAGO_WEBHOOK_SECRET` empty for now

### 2. Deploy (5min)
- Push to main branch OR
- Vercel Dashboard > Deployments > Redeploy
- Wait for build (should succeed)
- Note preview URL: `https://sw-commerce-saas-xyz.vercel.app`

### 3. Register Webhook (5min)
- Follow `MERCADOPAGO_WEBHOOK_SETUP.md` Step 1
- URL: `https://sw-commerce-saas.vercel.app/api/webhooks/mercadopago`
- Events: payment (approved, rejected, pending)
- Copy webhook secret

### 4. Add Webhook Secret (1min)
- Vercel Dashboard > Settings > Environment Variables
- Add `MERCADOPAGO_WEBHOOK_SECRET` = `<copied secret>`
- Redeploy (triggers automatically)

### 5. Smoke Test (10min)
- Visit tenant store
- Add product → checkout
- Complete test payment
- Verify order status = 'paid' in Supabase
- Check Vercel logs for webhook 200 OK

---

## Quick Verification Commands

### Check build locally
```bash
cd /Users/gpublica/workspace/skywalking/projects/sw_commerce_saas
npm run build
```

### Check env vars template
```bash
cat .env.production.template
```

### Check webhook endpoint exists
```bash
ls -la app/api/webhooks/mercadopago/route.ts
```

---

## Troubleshooting

**Build fails on Vercel?**
→ Check env vars present (especially SUPABASE_SERVICE_ROLE_KEY)

**Webhook returns 403?**
→ Verify MERCADOPAGO_WEBHOOK_SECRET matches MP dashboard

**Order stuck at 'pending'?**
→ Check Vercel logs for webhook errors

**Full troubleshooting:** See `MERCADOPAGO_WEBHOOK_SETUP.md` Section "Troubleshooting"

---

## Monitoring (Post-Deployment)

### Vercel Logs
- Dashboard > Logs > Filter: `/api/webhooks/mercadopago`
- Look for: `Order {id} updated to paid`

### Supabase
- Table Editor > orders
- Check recent orders: status='paid', payment_id populated

### MercadoPago
- Dashboard > Webhooks > Delivery history
- Verify: 200 OK responses

---

## Rollback

If something breaks:
1. Vercel Dashboard > Deployments
2. Click previous deployment > "..." > Promote to Production
3. Downtime: <1min (instant rollback)

---

## Support

- **Full report:** `SKY_4_DEPLOYMENT_STATUS.md`
- **Webhook guide:** `MERCADOPAGO_WEBHOOK_SETUP.md`
- **Escalation:** @Mentat

---

**Last Updated:** 2025-11-16
**Confidence:** HIGH (code complete, locally tested)
**Blocker:** Vercel dashboard access
