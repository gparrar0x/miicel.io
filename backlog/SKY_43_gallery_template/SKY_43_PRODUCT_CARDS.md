# SKY-43: Gallery Template - Product Card Variants

> 3 product card designs optimized for mobile QR gallery experience
> Created: 2025-01-17

---

## Context

100% mobile traffic from QR scans. Need large artwork display, quick options access, sticky CTA, <2s load. Portrait priority (1 col), landscape secondary (2 cols).

---

## Variant A: Art Gallery (RECOMMENDED)

**Use Case:** Art gallery QR (primary), visual artist digital + physical, photography

**Philosophy:** Artwork dominates. Minimal text. Quick View prominent. Sticky CTA thumb zone.

### Mobile Portrait Layout (1 col, <640px)

```
┌───────────────────────────────────┐
│ [Digital]                  [New] │ ← Badges (top corners, 32x22px)
│                                   │
│                                   │
│                                   │
│         [Artwork 1:1]             │ ← Image (full width, tap target)
│                                   │
│                                   │
│                                   │
│                                   │
├───────────────────────────────────┤
│ "Sunset Over Mountains"           │ ← Title (16px, 2 lines max)
│ From $45 • 3 formats              │ ← Price + meta (14px, muted)
│                                   │
│ [♡] [Quick View ↗]                │ ← Actions (48x48px tap targets)
└───────────────────────────────────┘
```

**Dimensions:**
- Card width: 100% viewport (minus 16px edge padding)
- Image: 1:1 aspect (square), 100% card width
- Height: Auto (image + 96px info section)
- Padding: 0px (image full-bleed), 16px (info section)
- Gap between cards: 16px vertical

**Typography:**
- Title: 16px, font-weight 600, line-height 1.4, color `--text-primary`
- Meta: 14px, font-weight 400, color `--text-secondary`
- Price: 16px, font-weight 700, color `--accent-primary` (gold)

**Badges:**
- Position: Absolute top-left 8px (Type), top-right 8px (Status)
- Size: 32x22px minimum, padding 4px 8px
- Font: 11px, font-weight 600, uppercase
- Type badge: `Digital` (blue), `Physical` (brown), `Both` (purple)
- Status badge: `New` (gold), `Limited` (red), `Featured` (yellow)

**Actions:**
- Wishlist icon: 48x48px tap target, left
- Quick View button: 48x48px tap target, right, primary accent color
- Spacing: 8px between actions

**Interaction:**
- Tap anywhere on card: Navigate to product detail
- Tap Quick View: Open full-screen modal (digital/physical options)
- Tap wishlist: Toggle saved (heart outline → fill, no navigate)

### Mobile Landscape Layout (2 cols, 640-900px)

```
┌──────────────────┐  ┌──────────────────┐
│ [Digital]  [New] │  │ [Physical]       │
│                  │  │                  │
│   [Artwork 1:1]  │  │   [Artwork 1:1]  │
│                  │  │                  │
├──────────────────┤  ├──────────────────┤
│ "Sunset..."      │  │ "Ocean Waves"    │
│ From $45 • 3     │  │ $120             │
│ [♡] [Quick View] │  │ [♡] [Quick View] │
└──────────────────┘  └──────────────────┘
```

**Dimensions:**
- Card width: 50% viewport (minus 16px gap)
- Image: 1:1 aspect
- 2 columns, 16px gap horizontal + vertical

### Tablet Layout (2-3 cols, 900-1024px)

- 2 cols: 48% width each, 24px gap
- 3 cols: 31% width each, 24px gap (max density)
- Same structure as mobile

### Desktop Layout (3 cols, >1024px)

- 3 cols: 320-360px width each, 32px gap
- Same structure, more breathing room

---

## Variant B: Magazine Editorial

**Use Case:** Fashion, luxury products, statement pieces

**Philosophy:** Vertical editorial. Ultra generous spacing. Elegant typography.

### Mobile Portrait Layout

```
┌───────────────────────────────────┐
│                                   │
│                                   │
│                                   │
│                                   │
│         [Artwork 4:5]             │ ← Portrait aspect (taller)
│                                   │
│                                   │
│                                   │
│                                   │
│                                   │
├───────────────────────────────────┤
│                                   │
│ SUNSET OVER MOUNTAINS             │ ← Title (18px, uppercase, bold)
│                                   │
│ Limited Edition • $120            │ ← Meta (14px, elegant)
│                                   │
│       [♡]          [View]         │ ← Actions centered
│                                   │
└───────────────────────────────────┘
```

**Dimensions:**
- Image: 4:5 aspect (portrait), 100% card width
- Info section: 128px height (more space)
- Padding: 0px (image), 24px (info)
- Gap: 24px vertical between cards

**Typography:**
- Title: 18px, font-weight 700, uppercase, letter-spacing 0.5px
- Meta: 14px, font-weight 400, italic option
- Price: 18px, font-weight 700, color `--accent-primary`

**Style:**
- Minimal badge (only status, top-right if any)
- Actions: Centered horizontal, 48x48px each
- Background: Pure white (no shadow, flat)

**Trade-offs vs Art Gallery:**
- **Pros:** Statement presentation, editorial feel, premium spacing
- **Cons:** Fewer products visible (taller cards), less info density
- **Use when:** Luxury products, limited catalog, brand > product

---

## Variant C: Overlay Minimal

**Use Case:** Modern brands, fashion, perfume, clean aesthetic

**Philosophy:** Everything on image. Overlay text. Hover/tap reveals.

### Mobile Portrait Layout

```
┌───────────────────────────────────┐
│ [Digital]                         │ ← Badge (top-left only)
│                                   │
│                                   │
│                                   │
│      [Artwork with gradient]      │ ← Image + gradient overlay bottom
│                                   │
│                                   │
│          ▼▼▼                      │
│ Sunset Over Mountains             │ ← Text overlay (white, bottom)
│ $45+              [♡] [↗]         │ ← Price + actions (floating)
└───────────────────────────────────┘
```

**Dimensions:**
- Image: 1:1 aspect, 100% card width, full-bleed
- Overlay: Gradient from transparent (top 60%) to rgba(0,0,0,0.7) (bottom 40%)
- Text: Absolute positioned bottom 16px, left/right 16px
- Gap: 12px vertical (tighter, more products visible)

**Typography:**
- Title: 16px, font-weight 600, color `#FFFFFF`
- Price: 16px, font-weight 700, color `#FFFFFF` or `--accent-primary`

**Style:**
- Badge: Type only (top-left), no status badge (cleaner)
- Actions: Floating icons (heart, quick view), right side, white icons
- Gradient: `linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.7) 100%)`

**Interaction:**
- Default: Minimal info visible (title + price only)
- Tap: Navigate to detail
- Quick View icon: Full-screen modal

**Trade-offs vs Art Gallery:**
- **Pros:** Compact (more products visible), modern aesthetic, clean
- **Cons:** Text legibility (depends on image), less info upfront
- **Use when:** Strong visual products (image speaks), modern brands, tight catalogs

---

## Comparison Matrix

| Criteria | Art Gallery | Magazine Editorial | Overlay Minimal |
|----------|-------------|-------------------|-----------------|
| **Info Density** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Legibility** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Artwork Focus** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Quick View Access** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Mobile Optimized** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Tap Targets** | ⭐⭐⭐⭐⭐ (48px) | ⭐⭐⭐⭐⭐ (48px) | ⭐⭐⭐⭐⭐ (48px) |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ (gradient) |
| **Versatility** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Impulse Buy** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## Recommendation: Art Gallery Variant

**Why Art Gallery for QR Context:**

1. **Legibility:** Text outside image (no legibility issues in gallery lighting)
2. **Info density:** Price + meta visible (no tap to reveal)
3. **Quick View:** Prominent button (impulse buy, fast options access)
4. **Badges:** Clear type differentiation (Digital/Physical/Both)
5. **Tap targets:** All 48x48px (thumb-friendly, gallery context)
6. **Performance:** No gradient rendering (faster)
7. **Versatility:** Works all product types (art, perfume, fashion)
8. **Accessibility:** WCAG AA contrast (text on white bg, no image dependency)

**When to Use Alternatives:**
- **Magazine Editorial:** Luxury brands, limited catalog, editorial feel priority
- **Overlay Minimal:** Modern brands, tight catalogs, image-only focus

---

## Detailed Specs: Art Gallery Variant

### Component Breakdown

```tsx
<div className="product-card" data-testid="product-card-gallery">
  {/* Image container */}
  <div className="card-image">
    <Image src={artwork} alt={title} aspectRatio="1:1" />

    {/* Badges */}
    <Badge type="digital" position="top-left" />
    <Badge status="new" position="top-right" />
  </div>

  {/* Info section */}
  <div className="card-info">
    <h3 className="card-title">{title}</h3>
    <p className="card-meta">
      <span className="card-price">{price}</span>
      <span className="card-options">{optionsCount} formats</span>
    </p>

    {/* Actions */}
    <div className="card-actions">
      <button className="action-wishlist" aria-label="Add to wishlist">
        <HeartIcon />
      </button>
      <button className="action-quickview" onClick={openQuickView}>
        Quick View
      </button>
    </div>
  </div>
</div>
```

### CSS Implementation (Mobile-First)

```css
/* Base: Mobile Portrait (<640px) */
.product-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border-radius: 0; /* Gallery aesthetic: no rounded corners */
  overflow: hidden;
  width: 100%;
  margin-bottom: 16px;
}

.card-image {
  position: relative;
  aspect-ratio: 1 / 1;
  width: 100%;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 500ms ease-out; /* Desktop hover only */
}

.card-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-meta {
  font-size: 14px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent-primary);
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.action-wishlist,
.action-quickview {
  min-width: 48px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.action-quickview {
  flex: 1;
  background: var(--accent-primary);
  color: var(--bg-primary);
  font-size: 14px;
  font-weight: 600;
  border-radius: 4px;
  transition: background 200ms ease;
}

.action-quickview:active {
  transform: scale(0.98); /* Tap feedback */
}

/* Badges */
.badge {
  position: absolute;
  top: 8px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 4px;
  z-index: 10;
}

.badge-type {
  left: 8px;
}

.badge-status {
  right: 8px;
}

/* Mobile Landscape (640-900px) */
@media (min-width: 640px) {
  .product-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .product-card {
    margin-bottom: 0;
  }
}

/* Tablet (900-1024px) */
@media (min-width: 900px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  .card-info {
    padding: 20px;
  }
}

/* Desktop (>1024px) */
@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }

  .card-image img {
    /* Hover zoom (desktop only) */
  }

  .product-card:hover .card-image img {
    transform: scale(1.03);
  }

  .card-info {
    padding: 24px;
  }

  .card-title {
    font-size: 18px;
  }

  .card-price {
    font-size: 18px;
  }
}
```

### Responsive Image Strategy

```tsx
<Image
  src={artwork}
  alt={title}
  width={800} // Mobile max
  height={800} // 1:1 aspect
  sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
  loading="lazy"
  placeholder="blur"
  blurDataURL={lqip} // Low-quality placeholder
  format="webp" // WebP primary, JPEG fallback
/>
```

**Performance:**
- Mobile: 800x800px WebP (~40KB, 3G = 0.5s load)
- Lazy load: Below fold only (first 2 cards eager)
- LQIP: Blur-up from 20x20px base64 (<1KB inline)
- Total bundle: <80KB JS gzip target

---

## Badge System Integration

### Type Badges (Product Type)

```tsx
{product.type === 'digital' && (
  <Badge variant="digital" position="top-left">
    Digital
  </Badge>
)}

{product.type === 'physical' && (
  <Badge variant="physical" position="top-left">
    Physical
  </Badge>
)}

{product.type === 'both' && (
  <Badge variant="both" position="top-left">
    Both
  </Badge>
)}
```

**Styling:**
- Digital: `#EFF6FF` bg, `#1E40AF` text, `#3B82F6` border
- Physical: `#FEF3C7` bg, `#92400E` text, `#F59E0B` border
- Both: `#F3E8FF` bg, `#6B21A8` text, `#A855F7` border

### Status Badges

```tsx
{product.isNew && (
  <Badge variant="new" position="top-right">
    New
  </Badge>
)}

{product.isLimited && (
  <Badge variant="limited" position="top-right">
    Limited
  </Badge>
)}

{product.isFeatured && (
  <Badge variant="featured" position="top-right">
    Featured
  </Badge>
)}
```

---

## Animation Specs

### Mobile (Tap Feedback)

```css
.product-card:active {
  transform: scale(0.98);
  transition: transform 100ms ease-out;
}

.action-quickview:active {
  transform: scale(0.96);
  background: var(--accent-hover);
}
```

### Desktop (Hover Effects)

```css
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--shadow-soft);
  transition: all 300ms ease-out;
}

.product-card:hover .card-image img {
  transform: scale(1.03);
  transition: transform 500ms ease-out;
}
```

---

## Accessibility

### Semantic HTML

```tsx
<article className="product-card" data-testid="product-card-gallery">
  <a href={productUrl} aria-label={`View ${title} details`}>
    <figure className="card-image">
      <img src={artwork} alt={`${title} by ${artist}`} />
      {/* Badges */}
    </figure>

    <div className="card-info">
      <h3 className="card-title">{title}</h3>
      <p className="card-meta">
        <span className="sr-only">Price:</span>
        <span className="card-price">{price}</span>
        <span className="sr-only">Available in</span>
        <span className="card-options">{optionsCount} formats</span>
      </p>
    </div>
  </a>

  <div className="card-actions">
    <button
      className="action-wishlist"
      aria-label="Add to wishlist"
      aria-pressed={isWishlisted}
    >
      <HeartIcon />
    </button>

    <button
      className="action-quickview"
      onClick={openQuickView}
      aria-label="Quick view product options"
    >
      Quick View
    </button>
  </div>
</article>
```

### WCAG Compliance

- Text contrast: 4.5:1 minimum (Gallery White = 12.6:1)
- Tap targets: 48x48px (WCAG 2.5.5 AA)
- Focus indicators: 2px outline, high contrast
- Alt text: Descriptive (title + artist)
- ARIA labels: Icon buttons, state announcements

---

## Performance Checklist

- [ ] WebP images with JPEG fallback
- [ ] Lazy load below fold (first 2 eager)
- [ ] LQIP blur-up placeholder (<1KB)
- [ ] Responsive srcset (mobile 800px max)
- [ ] <80KB total bundle JS gzip
- [ ] Critical CSS inline (<14KB)
- [ ] TTI <2s on 3G (gallery WiFi target)
- [ ] CLS <0.1 (image aspect ratio reserved)

---

## Handoff to Pixel

**Files to Create:**
- `components/storefront/GalleryCard.tsx` (redesign)
- `components/storefront/Badge.tsx` (new, reusable)
- `components/storefront/QuickViewButton.tsx` (new)

**Props Interface:**

```tsx
interface GalleryCardProps {
  product: {
    id: string
    name: string
    price: number
    currency: string
    images: string[]
    type: 'digital' | 'physical' | 'both'
    optionsCount?: number
    isNew?: boolean
    isLimited?: boolean
    isFeatured?: boolean
    stock: number
  }
  variant?: 'art-gallery' | 'magazine' | 'overlay'
  onQuickView?: (productId: string) => void
  onWishlist?: (productId: string) => void
  loading?: boolean
}
```

**Test IDs:**
- `product-card-gallery` (card container)
- `card-image` (image wrapper)
- `card-title` (title text)
- `card-price` (price text)
- `action-wishlist` (wishlist button)
- `action-quickview` (quick view button)
- `badge-type-{digital|physical|both}` (type badge)
- `badge-status-{new|limited|featured}` (status badge)

---

**Status:** Product card variants complete. Next: Wireframes (mobile-first).
