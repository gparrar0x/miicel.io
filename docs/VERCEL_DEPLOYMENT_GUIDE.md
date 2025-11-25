# Vercel Deployment Guide - Miicel.io
**Project:** miicel.io
**Stack:** Next.js 16 + Supabase + MercadoPago
**ETA:** 30min full setup

---

## Prerequisites

- GitHub repo: `skywalking/miicel.io`
- Vercel account with team access
- Supabase project: `lmqysqapqbttmyheuejo`
- MercadoPago account (production credentials)

---

## Part 1: Initial Deployment (10min)

### 1.1 Connect GitHub → Vercel (3min)

1. Go to https://vercel.com/new
2. Import `miicel.io` repository
3. Configure project settings:
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   Node Version: 20.x
   ```
4. **DO NOT deploy yet** - click "Environment Variables" first

### 1.2 Configure Environment Variables (5min)

Add these in Vercel Dashboard → Environment Variables:

**Required for all environments (Production + Preview):**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://lmqysqapqbttmyheuejo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtcXlzcWFwcWJ0dG15aGV1ZWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNDk4ODcsImV4cCI6MjA1MTkyNTg4N30.ObLy7wMqX2F7XqSrDlpBYr9Tx2JVqK5qBWrxgz5nDkU
SUPABASE_SERVICE_ROLE_KEY=<GET_FROM_SUPABASE_DASHBOARD>

# Encryption (generate: openssl rand -hex 32)
ENCRYPTION_KEY=<64_HEX_CHARACTERS>

# Admin access
SUPER_ADMINS=gparrar@skywalking.dev
```

**Production-only variables:**

```bash
NEXT_PUBLIC_BASE_URL=https://miicel.io
MERCADOPAGO_WEBHOOK_SECRET=<ADD_AFTER_WEBHOOK_SETUP>
```

**Preview-only variables:**

```bash
NEXT_PUBLIC_BASE_URL=<AUTO_GENERATED_PREVIEW_URL>
# Use MercadoPago sandbox credentials for preview
```

### 1.3 Deploy (2min)

1. Click "Deploy" button
2. Wait for build (~4min)
3. Verify deployment success
4. Note production URL: `https://sw-commerce-miicel.io`

**Expected build output:**
```
✓ Compiled successfully in 4.5s
✓ Generating static pages (22/22)
✓ Finalizing page optimization
```

---

## Part 2: Domain & SSL (Optional, 10min)

### 2.1 Custom Domain Setup

If using custom domain (e.g., `miicel.io`):

1. Vercel Dashboard → Domains → Add Domain
2. Enter domain name
3. Choose DNS configuration:

**Option A: Vercel DNS (recommended)**
- Transfer nameservers to Vercel
- Automatic SSL provisioning

**Option B: External DNS**
Add these records:
```
Type: A
Name: @ (or subdomain)
Value: 76.76.21.21

Type: AAAA
Name: @ (or subdomain)
Value: 2606:4700:4700::1111
```

4. Wait for DNS propagation (5-30min)
5. Verify SSL certificate active (auto-provisioned)

### 2.2 Update Environment Variables

After domain active:
```bash
# Update this variable
NEXT_PUBLIC_BASE_URL=https://miicel.io
```

Redeploy to apply changes.

---

## Part 3: MercadoPago Webhook (10min)

### 3.1 Register Webhook in MercadoPago

1. Go to https://mercadopago.com/developers/panel/app
2. Select your application
3. Navigate to "Webhooks" section
4. Click "Add webhook"
5. Configure:
   ```
   URL: https://miicel.io/api/webhooks/mercadopago
   Events: 
     ✓ payment (all events)
   ```
6. Save and copy the webhook secret

### 3.2 Add Webhook Secret to Vercel

1. Vercel Dashboard → Settings → Environment Variables
2. Add new variable:
   ```
   Name: MERCADOPAGO_WEBHOOK_SECRET
   Value: <PASTE_SECRET_FROM_MP>
   Environment: Production
   ```
3. Save (triggers automatic redeploy)

### 3.3 Verify Webhook

Test webhook delivery:
1. Create test order in production
2. Complete MercadoPago payment
3. Check Vercel logs:
   ```bash
   vercel logs --prod | grep mercadopago
   ```
4. Look for: `POST /api/webhooks/mercadopago - 200 OK`
5. Verify order status updated to 'paid' in Supabase

---

## Part 4: Monitoring Setup (5min)

### 4.1 Enable Analytics

Already configured in code via:
- `@vercel/analytics` (Web Analytics)
- `@vercel/speed-insights` (Core Web Vitals)

No additional setup needed - data appears in dashboard after first visits.

### 4.2 Configure Alerts

Vercel Dashboard → Settings → Notifications:

1. **Deployment Failed:**
   - ✓ Email on build failure
   - ✓ Slack webhook (optional)

2. **Performance Degradation:**
   - Monitor: TTFB > 1s
   - Monitor: Error rate > 1%

### 4.3 Health Check Endpoint

Available at: `https://miicel.io/api/health`

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-23T12:00:00.000Z",
  "service": "miicelio"
}
```

Configure external monitoring (optional):
- UptimeRobot
- Pingdom
- Checkly

---

## Part 5: Preview Deployments

### 5.1 Automatic PR Previews

Every PR automatically creates preview deployment:

1. Open PR against `main`
2. Vercel bot comments with preview URL
3. Preview uses "Preview" environment variables
4. Independent preview per PR

### 5.2 Testing Preview

1. Click preview URL from PR comment
2. Test changes in isolated environment
3. Verify no production data affected
4. Approve PR → merges → auto-deploys to production

---

## Deployment Checklist

**Pre-deployment:**
- [ ] Build passes locally (`npm run build`)
- [ ] All environment variables ready
- [ ] Supabase migrations applied
- [ ] MercadoPago credentials obtained

**Initial deployment:**
- [ ] GitHub repo connected to Vercel
- [ ] Environment variables configured
- [ ] Production deployment successful
- [ ] SSL certificate active

**Post-deployment:**
- [ ] Custom domain configured (if applicable)
- [ ] MercadoPago webhook registered
- [ ] Webhook secret added to Vercel
- [ ] Test order completed successfully
- [ ] Analytics tracking verified
- [ ] Health endpoint responding

---

## Troubleshooting

### Build Fails

**Error:** "Missing environment variable"
- Fix: Add variable in Vercel dashboard
- Redeploy: Dashboard → Deployments → Redeploy

**Error:** "TypeScript compilation failed"
- Check: Build passes locally first
- Review: Build logs for specific errors

### Webhook Returns 403

**Cause:** Invalid `MERCADOPAGO_WEBHOOK_SECRET`
- Verify secret matches MP dashboard
- Check variable applied to Production environment
- Redeploy after updating

### Order Stuck at 'pending'

**Debug steps:**
1. Check Vercel logs: `vercel logs --prod`
2. Look for webhook errors
3. Verify MercadoPago delivery attempts
4. Check Supabase order record

### Domain Not Resolving

**DNS propagation:**
- Wait 5-30min after DNS changes
- Check: `dig miicel.io`
- Verify A/AAAA records point to Vercel IPs

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Build Time | <10min | ~4min ✅ |
| Cold Start | <1s | Edge runtime ✅ |
| TTFB | <800ms | TBD |
| FCP | <1.8s | TBD |
| LCP | <2.5s | TBD |
| Bundle Size | <5MB | ~2MB ✅ |

Monitor via: Vercel Dashboard → Speed Insights

---

## Rollback Plan

If production breaks:

**Option 1: Instant Rollback**
```bash
vercel rollback
```

**Option 2: Dashboard Rollback**
1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Downtime: <30 seconds

**Option 3: Redeploy Specific Commit**
1. Find last working commit SHA
2. Dashboard → Deployments → Redeploy
3. Select commit hash

---

## Maintenance

### Regular Tasks

**Weekly:**
- Review error rates in Analytics
- Check webhook delivery success rate
- Monitor Core Web Vitals trends

**Monthly:**
- Update dependencies (`npm outdated`)
- Review Vercel usage/billing
- Test disaster recovery process

**Quarterly:**
- Audit environment variables
- Review and optimize bundle size
- Update SSL certificates (auto, verify only)

---

## Support Contacts

- **Platform Issues:** Vercel Support (support@vercel.com)
- **Payment Issues:** MercadoPago Support
- **Database Issues:** Supabase Dashboard
- **Code Issues:** @Mentat / @Hermes

---

## Quick Commands

```bash
# Deploy from CLI
vercel --prod

# View production logs
vercel logs --prod

# View preview logs
vercel logs

# Rollback deployment
vercel rollback

# List deployments
vercel ls

# Remove old deployments
vercel remove [deployment-url]
```

---

**Last Updated:** 2025-11-22
**Status:** ✅ Ready for deployment
**Build Validated:** ✅ Local + staging tested

