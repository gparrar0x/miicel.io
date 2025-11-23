---
sidebar_position: 3
title: Environment Variables
---

# Environment Variables

Complete reference for all environment variables used in Vendio.

## Required Variables

### Supabase

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from Supabase Dashboard → Project Settings → API

### Encryption

```bash
# Generate with: openssl rand -hex 32
ENCRYPTION_KEY=<64_HEX_CHARACTERS>
```

### Admin Access

```bash
# Comma-separated list of admin emails
SUPER_ADMINS=admin@example.com,another@example.com
```

## Optional Variables

### Base URL

```bash
# Production URL (for webhooks, redirects)
NEXT_PUBLIC_BASE_URL=https://vendio.vercel.app
```

### MercadoPago

```bash
# Webhook secret from MercadoPago dashboard
MERCADOPAGO_WEBHOOK_SECRET=<webhook-secret>
```

## Security Notes

- Never commit `.env` files to git
- Use Vercel Environment Variables for production
- Rotate `ENCRYPTION_KEY` periodically
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret (has admin access)

