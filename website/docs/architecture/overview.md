---
sidebar_position: 1
title: Architecture Overview
---

# VENDIO - Product Overview

**Audience:** Founders, sales, onboarding  
**Version:** 0.1 (draft)  
**Updated:** 2025-11-22

---

## What is VENDIO?

VENDIO is a SaaS platform that gives small restaurants, food trucks, and independent cooks a **high-converting digital storefront + simple backoffice** in minutes, without agencies or custom development.

- **Storefront:** Ready‑made templates optimized for selling (gallery, detail, minimal, restaurant).
- **Backoffice:** Simple dashboard to manage products, prices, availability, and orders.
- **Infra:** Hosted, secure, responsive, works on mobile first.

VENDIO is opinionated: instead of 1000 options, it ships with **sane defaults** that already follow UX best practices for food and retail.

---

## Who is it for?

Primary target:

- Small restaurants and food trucks (50–300 covers/week).
- Cooks and independent food businesses selling via WhatsApp / Instagram.
- Local shops that need a simple catalog + checkout, not a full ERP.

Non‑goals:

- Enterprise chains with custom ERP integrations.
- Complex B2B wholesale flows.

---

## Core Product Pillars

- **Digital catalog:** Menu / product catalog that looks good by default and is easy to keep updated.
- **Checkout & orders:** Simple cart, order creation, and payment integration (Mercado Pago first).
- **Templates & theming:** Multiple templates (gallery, detail, minimal, restaurant) with color and branding overrides.
- **Multi‑tenant by design:** Each business is a `tenant` with its own slug, config, and data.

Each pillar is backed by concrete features that already exist in this repo.

---

## Key Features

### Multi‑tenant Storefront

- Public route: `/[locale]/[tenantId]`
- Tenant config (name, logo, banner, colors, template) loaded from Supabase.
- Template switching per tenant via `config.template` (`gallery`, `detail`, `minimal`, `restaurant`).

### Product Catalog

- Products stored per tenant in Supabase (`products` table).
- Fields: name, description, price, category, stock, `image_url`, metadata.
- Mapped to frontend `Product` type and rendered via template‑specific grids.

### Restaurant Template

- Layout: `RestaurantLayout` with header, category accordion, product grid, floating cart, and footer.
- Visual focus on **large product photos** and **mobile‑first ordering**.
- Recommended image sizes:
  - **Banner (`tenantBanner`)**: 1920×1080 px, 16:9, landscape, high‑quality.
  - **Product images (`image_url`)**: 1200×900 px, 4:3, landscape.
  - **Logo round (`tenantLogo`)**: ≥ 400×400 px, square.
  - **Logo text (`tenantLogoText`)**: ~800×250 px, horizontal, ideally PNG with transparent background.

### Dashboard & Appearance Settings

- Owners can log in and update branding, colors, and template.
- Appearance screen: `Dashboard → Settings → Appearance`.
- Changes propagate in real‑time to the public storefront.

### Payments & Orders

- Mercado Pago integration for checkout preferences and webhooks.
- Order creation, listing, and status updates via API routes under `app/api/orders`.

---

## User Journeys

### Tenant Owner – From Zero to Live Menu

1. **Sign up** and create a tenant (slug = brand).
2. **Upload logo + banner**, choose template (restaurant for food businesses).
3. **Create categories** (e.g. Entradas, Panchos, Bebidas).
4. **Create products** with name, price, description, and image.
5. Share the public link `https://{host}/{locale}/{tenantSlug}` with customers.

Outcome: customer can browse the menu, add to cart, and place an order with online payment (where enabled).

### Customer – Mobile Ordering

1. Opens tenant link from Instagram / WhatsApp / QR.
2. Sees hero header with logo + banner + subtitle.
3. Scrolls categories accordion and product cards with clear photos and prices.
4. Adds items to cart with 1 tap and confirms order.

Outcome: frictionless ordering flow optimized for mobile, without needing native apps.

---

## Product Boundaries (v0)

Included in current scope:

- 1 storefront per tenant with one active template at a time.
- Basic cart, orders, and Mercado Pago payments.
- Manual product management via dashboard.

Not (yet) included:

- Multi‑location inventory.
- Complex reservation systems.
- Deep marketing automation (ads, email, CRM).

