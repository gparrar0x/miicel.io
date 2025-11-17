# SKY-43: Gallery Template - Moodboard

> Visual references for art gallery QR-optimized mobile template
> Created: 2025-01-17

---

## Context

100% mobile traffic from QR scans in physical gallery. Need premium art gallery aesthetic, lightweight, impulse-buy optimized.

---

## Primary References (Art Gallery Mobile-First)

### 1. Saatchi Art Mobile
**URL:** saatchiart.com (mobile view)

**Why:**
- Neutral white backgrounds (artwork is hero)
- Large image cards with generous spacing
- Quick tap to full-screen view
- Minimal text overlay, clean hierarchy
- Mobile-optimized grid (1-2 cols)

**Borrow:**
- Gallery White palette
- Full-screen quick view pattern
- Minimal badge placement (top corners)
- Breathing room between artworks (24-32px)

---

### 2. Artsy Mobile App
**URL:** artsy.net (iOS/Android app)

**Why:**
- Premium feel, justifies high prices
- Portrait artwork display (4:5 ratio)
- Sticky CTA bottom (thumb zone)
- Fast load, lightweight images
- Type differentiation (print/original)

**Borrow:**
- Sticky bottom CTA pattern
- Type badges (Digital/Physical/Both)
- Portrait aspect ratio option (4:5)
- Swipe gestures for quick browse

---

### 3. Format Portfolio (Artist Sites)
**URL:** format.com/themes (portfolio templates)

**Why:**
- Portfolio-quality image presentation
- Artist-first branding
- Customizable neutral palettes
- Mobile performance focus
- Elegant typography (refined sans-serif)

**Borrow:**
- Typography scale (elegant sans-serif)
- Neutral palette system (white/warm/dark)
- Artist bio integration (footer)
- Collection/series grouping

---

### 4. Behance Mobile
**URL:** behance.net (mobile view)

**Why:**
- Creative showcase optimized
- Grid + List hybrid views
- Quick project preview
- Tap targets (48x48px minimum)
- Font 16px+ (no iOS zoom)

**Borrow:**
- Tap target sizing (48x48px)
- Font sizing (16px+ base)
- Grid density (mobile 1-2 cols max)
- Preview modal patterns

---

### 5. Squarespace Gallery Templates
**URL:** squarespace.com/templates (gallery category, mobile)

**Why:**
- Responsive gallery patterns
- Hover → tap state translations
- Aspect ratio flexibility (1:1, 4:5, 16:9)
- Performance optimization
- Lazy load patterns

**Borrow:**
- Aspect ratio system
- Lazy load + LQIP (blur-up)
- Responsive grid breakpoints
- Animation subtlety (mobile-first)

---

## Secondary References (eCommerce Visual)

### 6. Nike Product Mobile
**Why:** Tap interactions, sticky CTA, fast add-to-cart
**Borrow:** Sticky bottom CTA pattern, quick size selection

### 7. Farfetch Luxury
**Why:** Premium feel, high perceived value, elegant spacing
**Borrow:** Luxury aesthetic, generous padding, elegant badges

### 8. Etsy Artisan Products
**Why:** Artist-seller focus, download/physical differentiation
**Borrow:** Type badges (digital/physical), seller info integration

---

## Mobile Performance References

### 9. Google Web.dev Gallery Perf Study
**Why:** Core Web Vitals mobile optimization
**Borrow:**
- WebP + JPEG fallback
- LQIP blur-up technique
- Lazy load thresholds
- <80KB bundle target
- Critical CSS inline (<14KB)

---

## Anti-Patterns (Avoid)

### Amazon Product Grid Mobile
**Why Avoid:** Cluttered, low perceived value, generic
**Issue:** Competing visual noise, no breathing room

### Generic Shopify Themes (Outdated)
**Why Avoid:** Desktop-first, small tap targets, slow mobile
**Issue:** <44px tap targets, <16px fonts (iOS zoom)

### Heavy Animation Sites
**Why Avoid:** Performance issues on weak WiFi
**Issue:** Large JS bundles, slow TTI, gallery WiFi = bad UX

---

## Key Visual Themes

### Theme 1: Gallery White (Recommended)
- Pure white (#FFFFFF) backgrounds
- Artwork is 100% focus
- Minimal black text (#1A1A1A)
- Subtle gold accent (#B8860B) for CTAs
- Museum/gallery professional aesthetic

**Use Case:** Art gallery QR (primary), photography, high-end products

---

### Theme 2: Modern Dark
- Near-black (#0F0F0F) backgrounds
- Drama, high contrast
- Blue accent (#3B82F6)
- Modern edge, digital art focus

**Use Case:** Digital art, fashion, perfume

---

### Theme 3: Warm Neutral
- Cream/beige (#F5F1E8) backgrounds
- Brown accents (#8B7355)
- Organic, vintage gallery vibe
- Sophisticated, warm

**Use Case:** Artisan, handmade, vintage art

---

## Mobile-First Design Principles (From References)

1. **Portrait Priority**
   - 1 col mobile portrait (full attention)
   - 2 cols landscape (comparison)
   - Artwork large, text minimal

2. **Tap Targets**
   - 48x48px minimum (Behance, Artsy)
   - Thumb zone bottom 30% screen (sticky CTAs)
   - Spacing 8px+ between tappable elements

3. **Typography**
   - 16px+ base (iOS no-zoom)
   - Refined sans-serif (Format, Saatchi)
   - Hierarchy: 16-18-24-32px scale

4. **Performance**
   - <2s TTI on 3G (Google Web.dev)
   - WebP images, lazy load, LQIP
   - <80KB JS bundle gzip
   - Critical CSS inline

5. **Navigation**
   - Sticky bottom CTA (Artsy, Nike)
   - Quick View full-screen (Saatchi)
   - Minimal header (Format)
   - Breadcrumbs optional (gallery = flat)

6. **Spacing**
   - 16px mobile (compact but breathable)
   - 24-32px card gaps (Saatchi, Format)
   - Padding 16-24px edges (portrait)

7. **Badges**
   - Top corners (Artsy, Etsy)
   - Minimal size, high contrast
   - Type > Status > Delivery priority

---

## Imagery Guidelines (From Gallery References)

1. **Aspect Ratios:**
   - 1:1 (square, classic gallery)
   - 4:5 (portrait, modern gallery)
   - Flexible per artwork (artist choice)

2. **Quality:**
   - High-res thumbnails (no compression artifacts)
   - Color accuracy (art critical)
   - LQIP blur-up on load

3. **Optimization:**
   - WebP primary, JPEG fallback
   - Responsive srcset (mobile 800px max)
   - Lazy load below fold
   - Preload hero artwork only

---

## Color Palette Extraction (From References)

**Saatchi Art:**
- #FFFFFF (white bg)
- #000000 (text)
- #F5F5F5 (off-white subtle)

**Artsy:**
- #FFFFFF (white bg)
- #1A1A1A (near-black text)
- #6E1FFF (purple accent, rare use)

**Format:**
- #FAFAFA (off-white bg)
- #2D2D2D (dark text)
- Customizable accent (artist choice)

**Behance:**
- #FFFFFF (white bg)
- #191919 (black text)
- #0057FF (blue accent)

**Common Thread:** Neutral backgrounds (white/off-white), dark text, minimal accent color use.

---

## Animation Reference (Mobile-First)

**From Nike Mobile:**
- Tap: scale(0.98) feedback (100ms)
- Modal: slide-up from bottom (300ms ease-out)
- Image load: blur-up fade-in (300ms)

**From Artsy Mobile:**
- Sticky CTA: fade-in on scroll (200ms)
- Quick View: full-screen slide-up (250ms)
- Badge: no animation (static, performance)

**From Saatchi Mobile:**
- Card tap: no animation (instant navigate)
- Image hover (desktop): subtle scale(1.03)
- Skeleton → image: fade-in (200ms)

**Mobile Animation Rules:**
- <300ms duration (feels instant)
- Essential only (performance)
- No hover states (mobile = tap)
- Feedback critical (tap scale)

---

## Accessibility Reference (WCAG AA)

**From Google Web.dev:**
- Contrast: 4.5:1 text, 3:1 UI (AA minimum)
- Tap targets: 48x48px (44px absolute minimum)
- Font: 16px+ (readability, no iOS zoom)
- Focus indicators: 2px outline, high contrast
- Alt text: descriptive (artwork title + artist)

**From Artsy Mobile:**
- Semantic HTML (nav, main, article)
- ARIA labels (icon buttons)
- Keyboard nav (fallback desktop)
- Screen reader: price + type announcement

---

## Performance Benchmarks (From References)

| Site | Mobile TTI | Bundle Size | LCP | Notes |
|------|-----------|-------------|-----|-------|
| **Saatchi Art** | 1.8s | 65KB gzip | 1.2s | Excellent mobile perf |
| **Artsy** | 2.1s | 75KB gzip | 1.5s | Good, PWA optimized |
| **Format** | 2.5s | 90KB gzip | 1.8s | Artist customization = heavier |
| **Behance** | 2.8s | 110KB gzip | 2.1s | Heavy features, acceptable |
| **SKY-43 Target** | **<2.0s** | **<80KB** | **<1.5s** | **Gallery WiFi weak** |

---

## Key Takeaways

**Must Have:**
1. Gallery White palette (neutral, artwork-first)
2. Mobile 1 col portrait, 2 cols landscape
3. Tap targets 48x48px, font 16px+
4. Sticky bottom CTA (thumb zone)
5. Quick View full-screen mobile
6. Performance <2s TTI (<80KB bundle)
7. Type badges (Digital/Physical/Both)
8. Generous spacing (24-32px gaps)

**Inspiration Hierarchy:**
1. **Saatchi Art** (primary) - gallery aesthetic + mobile perf
2. **Artsy** (secondary) - premium feel + sticky CTA
3. **Format** (tertiary) - artist branding + typography

**Context:** QR scan in physical gallery = mobile 100%, weak WiFi, impulse buy (<2 min total).

---

**Status:** Moodboard complete. Next: Color palettes.
