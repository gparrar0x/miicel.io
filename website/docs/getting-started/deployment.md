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

### 1.3 Deploy (2min)

1. Click "Deploy" button
2. Wait for build (~4min)
3. Verify deployment success
4. Note production URL: `https://sw-commerce-vendio.vercel.app`

---

## Part 2: MercadoPago Webhook (10min)

### 2.1 Register Webhook in MercadoPago

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

### 2.2 Add Webhook Secret to Vercel

1. Vercel Dashboard → Settings → Environment Variables
2. Add new variable:
   ```
   Name: MERCADOPAGO_WEBHOOK_SECRET
   Value: <PASTE_SECRET_FROM_MP>
   Environment: Production
   ```
3. Save (triggers automatic redeploy)

---

## Quick Commands

```bash
# Deploy from CLI
vercel --prod

# View production logs
vercel logs --prod

# Rollback deployment
vercel rollback
```

---

**Last Updated:** 2025-11-22  
**Status:** ✅ Ready for deployment

