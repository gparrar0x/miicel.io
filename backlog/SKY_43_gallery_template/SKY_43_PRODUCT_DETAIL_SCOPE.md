# SKY-43 Extension: Product Detail Page

> **Parent:** SKY-43 Gallery Template Redesign
> **Created:** 2025-01-17
> **Priority:** Alta
> **Estimate:** 4-6h (Aurora 2h, Pixel 3h, Sentinela 1h)

---

## Context

Gallery template (SKY-43) shippeado ✅. Product detail page sigue usando:
- Legacy commerce components
- Tenant theming (azul) NO Gallery White
- No mobile-first QR optimization
- No SKY-43 design tokens

**Gap:** User flow roto. QR scan → gallery (gold, museo vibe) → product detail (azul, generic).

---

## Objetivo

Extender SKY-43 para product detail page. Mantener consistencia:
- Gallery White palette (gold accent)
- Mobile-first QR (100% traffic)
- Performance <2s TTI
- Museum/gallery aesthetic
- Test IDs everywhere

---

## User Journey (QR Gallery)

```
1. 👁️ Ve cuadro físico en galería
2. 📱 Escanea QR → lands catalog (Gallery White, 1 col portrait)
3. 🎨 Tap "Quick View" → navega product detail
4. 👀 Product detail: imagen grande, opciones (digital/físico), specs
5. 🛒 Sticky CTA "Add to Cart" thumb zone
6. ✅ Checkout <2 min total
```

**Problema actual:** Step 4 rompe consistencia visual (azul, generic layout).

---

## Scope Extension

### Aurora Tasks (2h)

**Deliverables:**
1. Product detail wireframes (mobile portrait/landscape, desktop)
2. Component specs (image gallery, info section, options selector, CTA)
3. Gallery White palette application
4. Mobile-first layout (1 col portrait, 2 col landscape)
5. Quick View modal integration (opcional: abrir desde catalog, pre-fill data)
6. Design tokens usage
7. Accessibility WCAG AA
8. Performance specs (<2s TTI, lazy load, WebP)

**File:** `SKY_43_PRODUCT_DETAIL_AURORA_TASKS.md`

---

### Pixel Tasks (3h)

**Deliverables:**
1. ProductDetailLayout component (mobile-first)
2. ImageGallery component (swipeable, zoom, LQIP)
3. ProductInfo component (title, artist, description, price)
4. OptionsSelector component (digital/physical tabs, sizes, formats)
5. AddToCartSticky component (bottom thumb zone, 48px)
6. Integration with existing cart store
7. Test IDs everywhere (Sentinela contract)
8. Performance optimization (<2s TTI, <80KB bundle)

**Files:**
- `components/storefront/ProductDetailLayout.tsx`
- `components/storefront/ImageGallery.tsx`
- `components/storefront/ProductInfo.tsx`
- `components/storefront/OptionsSelector.tsx`
- `components/storefront/AddToCartSticky.tsx`

**File:** `SKY_43_PRODUCT_DETAIL_PIXEL_TASKS.md`

---

### Sentinela Tasks (1h)

**Deliverables:**
1. E2E test: QR flow (catalog → Quick View → product detail → add to cart)
2. Visual regression: Gallery White palette consistency
3. Performance test: TTI <2s mobile 3G
4. Accessibility test: WCAG AA compliance
5. Test IDs verification

**File:** `SKY_43_PRODUCT_DETAIL_SENTINELA_TASKS.md`

---

## Critical Specs (Non-Negotiable)

| Spec | Target | Why |
|------|--------|-----|
| **Palette** | Gallery White (gold #B8860B) | Consistency catalog → detail |
| **Layout mobile** | 1 col portrait | 100% QR traffic |
| **TTI mobile 3G** | <2s | Weak WiFi, impulse buy |
| **CTA position** | Sticky bottom (thumb zone) | Always accessible |
| **Tap targets** | 48x48px | WCAG AA, gallery context |
| **Font mobile** | 16px+ | iOS no-zoom |
| **Test IDs** | Everywhere | Sentinela contract |

---

## Design Philosophy (SKY-43)

1. **Artwork is Hero**
   - Large image gallery (swipeable, zoom)
   - Neutral background (white/off-white)
   - Generous spacing (breathing room)

2. **Mobile-First Absolute**
   - 100% QR traffic
   - Portrait priority (1 col full attention)
   - 48x48px tap targets
   - 16px+ font (no zoom)

3. **Performance Critical**
   - Weak gallery WiFi
   - <2s TTI target
   - WebP images, lazy load, LQIP
   - <80KB bundle

4. **Impulse Buy Optimized**
   - Sticky CTA bottom (always visible)
   - Options selector fast (digital/physical tabs)
   - 3 taps max: catalog → detail → add to cart

---

## Components Architecture

```
ProductDetailPage (Server Component)
├─ ProductDetailWrapper (Client - handles cart)
   ├─ ImageGallery (swipeable, zoom, LQIP)
   ├─ ProductInfo (title, artist, price, description)
   ├─ OptionsSelector (digital/physical, sizes, formats)
   ├─ AddToCartSticky (bottom CTA, thumb zone)
   └─ RelatedProducts (optional, gallery cards)
```

---

## Success Metrics

**Target (vs current):**
- Catalog → detail visual consistency: ↑100% (Gallery White end-to-end)
- Mobile conversion detail page: ↑25% (sticky CTA, clear options)
- Bounce rate detail: ↓30% (fast load, clear path to cart)
- TTI mobile 3G: <2s (↓50% vs current ~4s)

---

## Next Steps

1. ⏳ Aurora → diseña product detail specs (2h)
2. ⏳ Pixel → implementa components (3h)
3. ⏳ Sentinela → E2E tests (1h)
4. ⏳ Deploy staging → test QR flow completo
5. ⏳ Production rollout

---

**Status:** Scope definido. Ready para Aurora kickoff.
