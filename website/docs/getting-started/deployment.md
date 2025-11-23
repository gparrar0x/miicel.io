---
sidebar_position: 2
title: Deployment Guide
---

# Vercel Deployment Guide - Vendio

**Project:** sw_commerce_vendio  
**Stack:** Next.js 16 + Supabase + MercadoPago  
**ETA:** 30min full setup

---

## Prerequisites

- GitHub repo: `skywalking/sw_commerce_vendio`
- Vercel account with team access
- Supabase project: `lmqysqapqbttmyheuejo`
- MercadoPago account (production credentials)

---

## Part 1: Initial Deployment (10min)

### 1.1 Connect GitHub → Vercel (3min)

1. Go to https://vercel.com/new
2. Import `sw_commerce_vendio` repository
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
NEXT_PUBLIC_BASE_URL=https://vendio.vercel.app
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
4. Note production URL: `https://sw-commerce-vendio.vercel.app`

**Expected build output:**
```
✓ Compiled successfully in 4.5s
✓ Generating static pages (22/22)
✓ Finalizing page optimization
```

---

## Part 2: Domain & SSL (Optional, 10min)

### 2.1 Custom Domain Setup

If using custom domain (e.g., `vendio.skywalking.dev`):

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
Name: vendio (or @)
Value: 76.76.21.21

Type: AAAA  
Name: vendio (or @)
Value: 2606:4700:4700::1111
```

4. Wait for DNS propagation (5-30min)
5. Verify SSL certificate active (auto-provisioned)

### 2.2 Update Environment Variables

After domain active:
```bash
# Update this variable
NEXT_PUBLIC_BASE_URL=https://vendio.skywalking.dev
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
   URL: https://vendio.vercel.app/api/webhooks/mercadopago
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
```

---

**Last Updated:** 2025-11-22  
**Status:** ✅ Ready for deployment  
**Build Validated:** ✅ Local + staging tested

