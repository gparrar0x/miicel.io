# SKY-43: Gallery Template - Pixel Tasks

> **Ticket:** SKY-43
> **Agent:** Pixel (UI Build + Performance)
> **Priority:** Alta
> **Created:** 2025-01-17
> **Owner:** Mentat → Pixel

---

## Context (Ultra Brief)

**What:** Redesign gallery template for art QR → mobile purchase.
**Why:** Artista visual selling via QR codes in physical gallery (100% mobile traffic, weak WiFi, impulse buy).
**Target:** <2 min QR scan → checkout. Mobile conversion ↑35%. TTI <2s. Bundle <80KB.

**Design handoff:** Aurora completed specs. Files ready in `SKY_43_DESIGN_SPECS.md`.

---

## Critical Specs (Non-Negotiable)

| Metric | Target | Why |
|--------|--------|-----|
| **TTI mobile 3G** | **<2s** | Weak gallery WiFi, impulse buy momentum |
| **Bundle JS** | **<80KB gzip** | Performance critical |
| **Tap targets** | **48x48px** | Thumb-friendly, gallery context |
| **Font mobile** | **16px+** | iOS no-zoom, legibility |
| **Grid mobile** | **1 col portrait** | 100% QR traffic, full attention |
| **Quick View** | **Full-screen mobile** | Clarity, impulse buy |
| **Image format** | **WebP + JPEG fallback** | 50% smaller, fast load |
| **WCAG** | **AA minimum** | Contrast 4.5:1, tap 48px, focus visible |

---

## Phase 1: MVP (Week 1) - SHIP THIS FIRST

### 1. Design Tokens (CSS Vars)

**File:** `styles/tokens.css`

```css
/* Gallery White palette (default) */
--color-bg-primary: #FFFFFF;
--color-bg-secondary: #FAFAFA;
--color-text-primary: #1A1A1A;
--color-text-secondary: #666666;
--color-text-muted: #999999;
--color-accent-primary: #B8860B;
--color-accent-hover: #9A7209;
--color-border-subtle: #E5E5E5;

/* Spacing (mobile-first) */
--spacing-xs: 8px;
--spacing-sm: 16px;
--spacing-md: 24px;
--spacing-lg: 32px;
--spacing-xl: 48px;

/* Typography (mobile-first) */
--font-size-h1: 24px;
--font-size-h2: 20px;
--font-size-h3: 18px;
--font-size-h4: 16px;
--font-size-body: 16px;
--font-size-small: 14px;
--font-size-tiny: 12px;

/* Breakpoints */
--breakpoint-mobile-landscape: 640px;
--breakpoint-tablet: 900px;
--breakpoint-desktop: 1024px;

/* Animation */
--timing-fast: 100ms;
--timing-normal: 300ms;
--timing-slow: 500ms;
```

**Checklist:**
- [ ] Create `styles/tokens.css`
- [ ] Import in global CSS
- [ ] Test: swap palette (Modern Dark) → verify all components adapt

---

### 2. Art Gallery Card (Mobile-First)

**File:** `components/storefront/GalleryCard.tsx`

**Spec:** Section 4 in `SKY_43_DESIGN_SPECS.md`

**Mobile Portrait (<640px):**
- 1 col, full width (minus 16px edge padding)
- Image: 1:1 aspect, full-bleed, 800x800px WebP
- Info: 96px height, 16px padding
- Title: 16px, weight 600, line-clamp 2
- Meta: 14px, muted
- Price: 16px, weight 700, accent color
- Actions: 48x48px tap targets (heart 48x48px, Quick View flex-1 min-48px)
- Badges: Type (top-left), Status (top-right), 8px from edges

**Props Interface:**
```typescript
interface GalleryCardProps {
  product: {
    id: string
    name: string
    artist?: string
    price: number
    currency: string
    images: string[]
    type: 'digital' | 'physical' | 'both'
    optionsCount?: number
    isNew?: boolean
    isLimited?: boolean
    isFeatured?: boolean
  }
  onQuickView?: (productId: string) => void
  onWishlist?: (productId: string) => void
  loading?: boolean
  'data-testid'?: string
}
```

**Test IDs:**
```typescript
'product-card-gallery'
'card-image'
'card-title'
'card-price'
'card-meta'
'action-wishlist'
'action-quickview'
'badge-type-digital'
'badge-type-physical'
'badge-type-both'
'badge-status-new'
'badge-status-limited'
'badge-status-featured'
```

**Checklist:**
- [ ] Create component (mobile-first)
- [ ] Image: WebP + JPEG fallback, lazy load, LQIP placeholder
- [ ] Tap feedback: scale 0.98 on active (100ms)
- [ ] Desktop hover: lift 4px, shadow, image scale 1.03x (300ms)
- [ ] Test IDs everywhere (Sentinela contract)
- [ ] Accessibility: semantic HTML, alt text, aria-labels
- [ ] Performance: lazy load below fold (first 2 eager)

---

### 3. Quick View Modal (Full-Screen Mobile)

**File:** `components/storefront/QuickViewModal.tsx`

**Spec:** Section 5 in `SKY_43_DESIGN_SPECS.md`

**Mobile Portrait (Full-Screen):**
- Modal: 100vh, slide-up animation (300ms ease-out)
- Backdrop: rgba(0,0,0,0.6), tap to close
- Close button: 48x48px, top-right 16px
- Image: 360px height (1:1), full width, swipeable
- Title: 18px, weight 700
- Artist: 14px, link
- Option cards: 24px padding, 16px gap, tap to expand/collapse
- CTA per option: 48px height, primary color, full-width
- Scroll: vertical if overflow

**Props Interface:**
```typescript
interface QuickViewModalProps {
  product: {
    id: string
    name: string
    artist?: string
    images: string[]
    options: Array<{
      id: string
      type: 'digital' | 'physical'
      title: string
      specs: string[]
      price: number
      currency: string
    }>
  }
  isOpen: boolean
  onClose: () => void
  onAddToCart: (optionId: string) => void
  'data-testid'?: string
}
```

**Test IDs:**
```typescript
'modal-quickview'
'modal-backdrop'
'modal-close'
'modal-image'
'modal-title'
'modal-artist'
'modal-option-card'
'modal-option-cta'
'modal-detail-link'
```

**Checklist:**
- [ ] Create modal component (full-screen mobile, split layout landscape)
- [ ] Slide-up animation (300ms ease-out)
- [ ] Backdrop fade (200ms)
- [ ] Close: tap backdrop, ESC key, close button
- [ ] Keyboard nav: Tab order, Enter/Space activate
- [ ] Focus trap (lock focus inside modal)
- [ ] Body scroll lock (prevent background scroll)
- [ ] Lazy load: only render when open (on-demand)
- [ ] Test IDs everywhere

---

### 4. Badge System

**File:** `components/ui/Badge.tsx`

**Spec:** Section 6 in `SKY_43_DESIGN_SPECS.md`

**Type Badges:**
- Digital: bg `#EFF6FF`, text `#1E40AF`, border `#3B82F6`
- Physical: bg `#FEF3C7`, text `#92400E`, border `#F59E0B`
- Both: bg `#F3E8FF`, text `#6B21A8`, border `#A855F7`

**Status Badges:**
- New: bg `#FEF3C7`, text `#92400E`, border `#F59E0B`
- Limited: bg `#FEE2E2`, text `#991B1B`, border `#EF4444`
- Featured: bg `#FEF3C7`, text `#854D0E`, border `#EAB308`

**Size:** 32x22px min (4px 8px padding), font 11px, weight 600, uppercase

**Checklist:**
- [ ] Create Badge component (variant: type | status)
- [ ] Props: variant, children, data-testid
- [ ] Reusable: use in GalleryCard, QuickViewModal, ProductDetail
- [ ] Accessibility: sufficient contrast (WCAG AA)

---

### 5. Product Grid (Responsive)

**File:** `components/storefront/ProductGrid.tsx`

**Spec:** Section 7 in `SKY_43_DESIGN_SPECS.md`

**Grid:**
- Mobile Portrait (<640px): 1 col, gap 16px, padding 0 16px
- Mobile Landscape (640-900px): 2 cols, gap 16px, padding 0 16px
- Tablet (900-1024px): 3 cols, gap 24px, padding 0 20px
- Desktop (>1024px): 3 cols, gap 32px, max-width 1200px, padding 0 24px

```css
/* Mobile Portrait: 1 col (default) */
.product-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 16px;
}

/* Mobile Landscape: 2 cols */
@media (min-width: 640px) {
  .product-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

/* Tablet: 3 cols */
@media (min-width: 900px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    padding: 0 20px;
  }
}

/* Desktop: 3 cols, max width */
@media (min-width: 1024px) {
  .product-grid {
    gap: 32px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }
}
```

**Checklist:**
- [ ] Create ProductGrid component
- [ ] Responsive: 1-2-3 cols based on breakpoint
- [ ] Test ID: `'product-grid'`
- [ ] Skeleton loading states (if fetch >300ms)

---

### 6. Header + Filter Bar

**Files:**
- `components/layout/Header.tsx`
- `components/storefront/FilterBar.tsx`

**Header (Minimal Gallery):**
- Logo/Artist name centered
- Nav: Shop | About | Contact
- Search + Cart icons right
- Sticky on scroll (0-4px shadow)
- 64px height mobile, 72px desktop

**Filter Bar (Sticky):**
- Sort: Featured, New, Price, Popular
- Filter drawer (mobile), sidebar (desktop)
- Sticky below header (64px + 56px = 120px offset)
- Badge count (active filters)

**Checklist:**
- [ ] Create Header (sticky, minimal)
- [ ] Create FilterBar (sticky, sort + filter toggle)
- [ ] Mobile: filter drawer full-screen
- [ ] Desktop: filter sidebar collapsible
- [ ] Test IDs: `'site-header'`, `'filter-bar'`

---

### 7. Performance Optimization

**Targets:**
- TTI <2s on mobile 3G
- Bundle <80KB JS gzip
- LCP <1.5s (first card visible)
- CLS <0.1 (no layout shift)
- FID <100ms (tap feedback instant)

**Strategies:**

**Critical CSS (<14KB inline):**
```html
<!-- In <head> -->
<style>
  /* Header, layout, first card, grid */
  /* Inline only above-fold critical styles */
</style>
```

**Image Optimization:**
```tsx
<Image
  src={artwork}
  alt={`${title} by ${artist}`}
  width={800}
  height={800}
  sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
  loading="lazy"  // Below fold only
  placeholder="blur"
  blurDataURL={lqip}  // 20x20px base64
  format="webp"
  quality={85}
/>
```

**Lazy Load:**
- First 2 cards: eager (above fold)
- Cards 3+: lazy (200px before viewport)
- Quick View: on-demand (modal open)

**Bundle Splitting:**
- Core: <50KB (layout, grid, card)
- Components: <30KB (modal, filters)
- Total: <80KB gzip

**Checklist:**
- [ ] Critical CSS inline (<14KB)
- [ ] Defer non-critical JS (modals, tooltips)
- [ ] WebP images with JPEG fallback
- [ ] Lazy load below fold
- [ ] LQIP blur-up placeholder
- [ ] Aspect ratio reserved (CLS <0.1)
- [ ] Bundle <80KB JS gzip
- [ ] Test: Lighthouse mobile score ≥90

---

## Phase 2: Enhancements (Week 2)

### 8. Magazine + Overlay Card Variants

**Files:**
- `components/storefront/MagazineCard.tsx`
- `components/storefront/OverlayCard.tsx`

**Spec:** Section 4 in `SKY_43_DESIGN_SPECS.md`

**Checklist:**
- [ ] Create MagazineCard (4:5 portrait, editorial feel)
- [ ] Create OverlayCard (text on image, gradient bottom)
- [ ] Tenant config: `variant` prop in GalleryCard parent
- [ ] Test: swap variant → verify layout adapts

---

### 9. Modern Dark + Warm Neutral Palettes

**File:** `styles/tokens.css`

**Modern Dark:**
```css
--color-bg-primary: #0F0F0F;
--color-bg-secondary: #1A1A1A;
--color-text-primary: #F5F5F5;
--color-text-secondary: #A3A3A3;
--color-accent-primary: #3B82F6;
```

**Warm Neutral:**
```css
--color-bg-primary: #F5F1E8;
--color-bg-secondary: #E8DCC4;
--color-text-primary: #2C2416;
--color-text-secondary: #5C4D3C;
--color-accent-primary: #8B7355;
```

**Checklist:**
- [ ] Add palette variants to tokens
- [ ] Tenant config: `palette` prop
- [ ] Test: swap palette → verify contrast WCAG AA

---

### 10. Hero Section (Optional)

**File:** `components/layout/HeroSection.tsx`

**Spec:** Featured artwork full-width, overlay text, CTA

**Checklist:**
- [ ] Create HeroSection (configurable via tenant settings)
- [ ] Mobile: portrait aspect, full-screen
- [ ] Desktop: 16:9 aspect, max 1200px
- [ ] Test ID: `'hero-section'`

---

### 11. Filter Sidebar (Desktop)

**File:** `components/storefront/FilterSidebar.tsx`

**Spec:**
- Desktop: sidebar left, 240px width, collapsible
- Filters: Type, Format, Size, Price, Collection
- Active filters: badge count, clear all

**Checklist:**
- [ ] Create FilterSidebar (desktop only)
- [ ] Mobile: use FilterBar drawer instead
- [ ] Collapsible: localStorage persist state
- [ ] Active filters: badge count, clear button

---

### 12. Skeleton Loading States

**File:** `components/ui/Skeleton.tsx`

**Spec:**
- Card skeleton: image + text placeholders
- Grid skeleton: 3-6 cards (match viewport)
- Fade-in animation when data arrives (300ms)

**Checklist:**
- [ ] Create Skeleton component
- [ ] Use in ProductGrid while fetching
- [ ] Match card structure (image, title, price)
- [ ] Fade-in transition (300ms)

---

### 13. Image Lazy Load + LQIP

**Implementation:**
- LQIP: 20x20px blur, base64 inline
- Lazy load: `loading="lazy"` (native)
- Blur-up transition: 300ms ease-out
- Error fallback: placeholder icon

**Checklist:**
- [ ] Generate LQIP for all product images
- [ ] Implement blur-up transition
- [ ] Error state: fallback placeholder
- [ ] Test: throttle 3G → verify load performance

---

## Phase 3: Polish (Week 3)

### 14. Animations (Mobile + Desktop)

**Spec:** Section 10 in `SKY_43_DESIGN_SPECS.md`

**Mobile Tap Feedback:**
```css
.product-card:active {
  transform: scale(0.98);
  transition: transform 100ms ease-out;
}

.button-primary:active {
  transform: scale(0.96);
  transition: transform 100ms ease-out;
}
```

**Desktop Hover:**
```css
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  transition: all 300ms ease-out;
}

.product-card:hover .card-image img {
  transform: scale(1.03);
  transition: transform 500ms ease-out;
}
```

**Modal Slide-Up:**
```css
@keyframes modal-slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-content {
  animation: modal-slide-up 300ms ease-out;
}
```

**Checklist:**
- [ ] Mobile: tap feedback (scale 0.98, 100ms)
- [ ] Desktop: hover effects (lift 4px, image zoom 1.03x)
- [ ] Modal: slide-up animation (300ms)
- [ ] Image load: blur-up transition (300ms)
- [ ] Filter apply: grid fade-out/in (150ms)

---

### 15. Accessibility Audit (WCAG AA)

**Targets:**
- Color contrast: 4.5:1 text, 3:1 UI
- Tap targets: 48x48px mobile
- Keyboard nav: logical tab order
- Focus indicators: visible, high contrast
- Screen reader: semantic HTML, ARIA labels

**Checklist:**
- [ ] Test contrast: all text/UI (use axe DevTools)
- [ ] Test tap targets: all buttons 48x48px mobile
- [ ] Test keyboard: Tab, Enter, Space, ESC
- [ ] Test screen reader: VoiceOver (iOS), TalkBack (Android)
- [ ] Fix issues: update colors, sizes, labels

---

### 16. Performance Audit (Lighthouse 90+)

**Metrics:**
- Performance: ≥90
- Accessibility: ≥95
- Best Practices: ≥90
- SEO: ≥90

**Checklist:**
- [ ] Run Lighthouse mobile (3G throttle)
- [ ] Fix issues: TTI, LCP, CLS, FID
- [ ] Optimize images: WebP, lazy load, LQIP
- [ ] Optimize bundle: code splitting, tree shaking
- [ ] Re-test: verify ≥90 all metrics

---

### 17. Admin UI (Tenant Theme Settings)

**File:** `app/admin/templates/gallery/page.tsx`

**Settings:**
- Variant: Art Gallery | Magazine | Overlay
- Palette: Gallery White | Modern Dark | Warm Neutral
- Grid cols: Mobile (1-2), Tablet (2-3), Desktop (3-4)
- Image aspect: 1:1 | 4:5 | 16:9
- Show hero: boolean
- Show badges: boolean
- Quick View enabled: boolean

**Database Schema:**
```typescript
interface GalleryThemeSettings {
  template: 'gallery'
  variant: 'art-gallery' | 'magazine' | 'overlay'
  palette: 'gallery-white' | 'modern-dark' | 'warm-neutral'
  gridCols: {
    mobile: 1 | 2
    tablet: 2 | 3
    desktop: 3 | 4
  }
  imageAspect: '1:1' | '4:5' | '16:9'
  showHero: boolean
  showBadges: boolean
  quickViewEnabled: boolean
}
```

**Checklist:**
- [ ] Create admin settings UI
- [ ] Save to DB: `tenants.theme_settings`
- [ ] Load on storefront: apply settings dynamically
- [ ] Test: change variant → verify storefront updates

---

### 18. Documentation (Component Usage)

**File:** `docs/components/gallery-template.md`

**Sections:**
- Overview (what, why, when)
- Components (GalleryCard, QuickViewModal, Badge, ProductGrid)
- Props interfaces
- Test IDs (Sentinela contract)
- Customization (tenant settings)
- Performance (optimization strategies)
- Accessibility (WCAG AA compliance)
- Examples (code snippets)

**Checklist:**
- [ ] Write component documentation
- [ ] Add code examples (copy-paste ready)
- [ ] Document test IDs (for Sentinela)
- [ ] Document performance tips
- [ ] Document accessibility best practices

---

## Files to Create/Update

```
components/
├── ui/
│   ├── Button.tsx                    # Update: add tap feedback
│   ├── Badge.tsx                     # NEW: Type + Status badges
│   ├── Icon.tsx                      # Update: add new icons
│   └── Skeleton.tsx                  # NEW: Loading states
├── storefront/
│   ├── GalleryCard.tsx               # REDESIGN: mobile-first Art Gallery
│   ├── MagazineCard.tsx              # NEW: Magazine variant
│   ├── OverlayCard.tsx               # NEW: Overlay variant
│   ├── QuickViewModal.tsx            # NEW: Full-screen mobile modal
│   ├── ProductGrid.tsx               # UPDATE: 1-2-3 cols responsive
│   ├── FilterBar.tsx                 # UPDATE: Sticky filter/sort
│   └── QuickViewButton.tsx           # NEW: Action button
└── layout/
    ├── Header.tsx                    # UPDATE: Sticky, minimal
    ├── FilterSidebar.tsx             # NEW: Desktop filter
    └── HeroSection.tsx               # NEW: Optional hero

styles/
├── tokens.css                        # NEW: Design tokens (CSS vars)
├── gallery.css                       # NEW: Gallery template styles
└── animations.css                    # NEW: Keyframes, transitions

types/
├── product.ts                        # UPDATE: add type: digital | physical | both
├── theme.ts                          # UPDATE: GalleryThemeSettings interface
└── gallery.ts                        # NEW: Gallery-specific types

app/
└── admin/
    └── templates/
        └── gallery/
            └── page.tsx              # NEW: Admin settings UI

docs/
└── components/
    └── gallery-template.md           # NEW: Component documentation
```

---

## Test IDs Contract (Sentinela)

**Product Card:**
```typescript
'product-card-gallery'
'card-image'
'card-title'
'card-price'
'card-meta'
'action-wishlist'
'action-quickview'
'badge-type-digital'
'badge-type-physical'
'badge-type-both'
'badge-status-new'
'badge-status-limited'
'badge-status-featured'
```

**Quick View Modal:**
```typescript
'modal-quickview'
'modal-backdrop'
'modal-close'
'modal-image'
'modal-title'
'modal-artist'
'modal-option-card'
'modal-option-cta'
'modal-detail-link'
```

**Layout:**
```typescript
'product-grid'
'site-header'
'filter-bar'
'hero-section'
```

**IMPORTANT:** Use `data-testid` everywhere. Sentinela depends on this contract.

---

## Performance Checklist

- [ ] Critical CSS inline (<14KB)
- [ ] Defer non-critical JS (modals, filters)
- [ ] WebP images with JPEG fallback
- [ ] Lazy load below fold (first 2 eager)
- [ ] LQIP blur-up placeholder (<1KB)
- [ ] Aspect ratio reserved (CLS <0.1)
- [ ] Bundle <80KB JS gzip
- [ ] TTI <2s on 3G (Lighthouse mobile)
- [ ] No render-blocking resources
- [ ] Code splitting (core + components)
- [ ] Tree shaking (remove unused code)

---

## Accessibility Checklist

- [ ] Color contrast 4.5:1 text, 3:1 UI
- [ ] Tap targets 48x48px mobile
- [ ] Semantic HTML (article, figure, h3, p)
- [ ] Alt text descriptive (`${title} by ${artist}`)
- [ ] ARIA labels (icon-only buttons)
- [ ] Focus indicators visible (2px outline)
- [ ] Keyboard nav (Tab, Enter, ESC)
- [ ] Screen reader tested (VoiceOver, TalkBack)

---

## Success Metrics

**Target (6 months):**
- QR scan → purchase time: <2 min (↓60% vs baseline)
- Mobile conversion rate: ↑35% (2.5% → 3.4%)
- Bounce rate: ↓40% (65% → 39%)
- TTI mobile 3G: <2s (↓52% vs 4.2s baseline)
- Lighthouse mobile: ≥90 (Performance, A11y, Best Practices)
- Bundle size: <80KB JS gzip (↓33% vs 120KB baseline)

**Measure:**
- Google Analytics: conversion funnel (QR scan → checkout)
- Core Web Vitals: LCP, FID, CLS
- Lighthouse CI: track scores per deploy
- User testing: perceived value (qualitative feedback)

---

## Definition of Done

**Phase 1 (MVP):**
- [ ] Design tokens (CSS vars)
- [ ] Art Gallery card (mobile-first)
- [ ] Quick View modal (full-screen mobile)
- [ ] Badge system (Type + Status)
- [ ] Product grid (1-2-3 cols responsive)
- [ ] Header + Filter bar (sticky)
- [ ] Performance: TTI <2s, bundle <80KB
- [ ] Test IDs everywhere (Sentinela contract)
- [ ] Accessibility: WCAG AA (contrast, tap, keyboard)
- [ ] Lighthouse mobile: ≥90

**Phase 2 (Enhancements):**
- [ ] Magazine + Overlay card variants
- [ ] Modern Dark + Warm Neutral palettes
- [ ] Hero section (optional)
- [ ] Filter sidebar (desktop)
- [ ] Skeleton loading states
- [ ] Image lazy load + LQIP

**Phase 3 (Polish):**
- [ ] Animations (tap feedback, hover, modal)
- [ ] Accessibility audit (WCAG AA pass)
- [ ] Performance audit (Lighthouse 90+)
- [ ] Admin UI (tenant settings)
- [ ] Documentation (component usage)

---

## Handoff Notes

**From Aurora:**
- All design specs in `SKY_43_DESIGN_SPECS.md`
- Color palettes in `SKY_43_COLOR_PALETTES.md`
- Product cards in `SKY_43_PRODUCT_CARDS.md`
- Wireframes in `SKY_43_WIREFRAMES.md`
- Design system in `SKY_43_DESIGN_SYSTEM.md`
- Icon pack in `SKY_43_ICON_PACK.md`

**To Sentinela:**
- Test IDs in this doc (section above)
- E2E tests: QR → Quick View → Add to Cart → Checkout
- Visual regression: card variants, modal, responsive
- Performance tests: Lighthouse CI, Core Web Vitals

**Coordination:**
- Use design tokens (CSS vars, no hardcoded colors)
- Follow mobile-first approach (always)
- Test on real devices (iPhone, Android, not just DevTools)
- Handoff session: 30min review with Mentat

---

## Timing Estimate

**Phase 1 (MVP):**
- Design tokens: 1.5h
- GalleryCard: 6h
- QuickViewModal: 5h
- Badge system: 2h
- ProductGrid: 3h
- Header + FilterBar: 4h
- Performance optimization: 4h
- Testing + fixes: 4h

**Total Phase 1:** ~30h (4 days)

**Phase 2 (Enhancements):** ~20h (2.5 days)
**Phase 3 (Polish):** ~15h (2 days)

**Grand Total:** ~65h (~8.5 days)

---

## Next Steps

1. ✅ Aurora completed design
2. ⏳ **Pixel executes Phase 1 MVP** → ship working gallery template
3. ⏳ Sentinela tests E2E + visual regression
4. ⏳ Deploy staging → test with real artista (QR scan, mobile, weak WiFi)
5. ⏳ Measure metrics (conversion, TTI, bounce)
6. ⏳ Iterate Phase 2 + 3 (enhancements, polish)
7. ⏳ Production rollout

---

**Pixel, ready to build mobile-first gallery template. Focus: performance brutal, <2s TTI, <80KB bundle.** 🎨📱⚡
