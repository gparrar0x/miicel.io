# SKY-43: Product Detail Page - Wireframes

> Mobile-first layout specs, gallery aesthetic, QR optimized
> Created: 2025-01-18

---

## Mobile Portrait (<640px) - 1 Col Priority

**Context:** 100% QR traffic, user standing/walking, portrait orientation absolute.

### Layout Structure

```
┌────────────────────────────────┐
│ [←] Product Name         [🛒3] │  Header 56px sticky (back, title, cart)
├────────────────────────────────┤
│ ┌────────────────────────────┐ │
│ │                            │ │
│ │   [Image Main 1:1]         │ │  Full-width, swipe indicator dots
│ │   ●○○○                     │ │  Aspect ratio 1:1 (360x360px)
│ │                            │ │
│ └────────────────────────────┘ │
│ ┌──┬──┬──┬──┐                  │  Thumbnail strip 80x80px, tap to switch
│ │■ │□ │□ │□ │ 4 images max     │  16px gap, scrollable horizontal
│ └──┴──┴──┴──┘                  │
├────────────────────────────────┤
│ "Sunset Over Mountains"        │  Title 20px bold, line-clamp 2
│ by Artist Name (link)          │  14px, gold underline
│ ⭐⭐⭐⭐⭐ (42 reviews)          │  14px muted, future phase
├────────────────────────────────┤
│ From $45                       │  Price 24px bold gold (if options)
│ or: $120                       │  or: fixed price 24px bold gold
├────────────────────────────────┤
│ ┌──────────────────────────┐  │
│ │ 🖼️ Digital │ 🎨 Physical │  │  Tabs 48px height, full-width split
│ └─────────────┴─────────────┘  │  Active gold underline 3px
│                                │
│ [DIGITAL SELECTED]             │
│ ┌────────────────────────────┐ │
│ │ ○ High-Res JPG - $45       │ │  Radio 48px tap target
│ │   4000x4000px, 300 DPI     │ │  14px specs muted
│ │                            │ │
│ │ ○ Print-Ready PDF - $55    │ │
│ │   Vector, CMYK, A3 ready   │ │
│ └────────────────────────────┘ │
├────────────────────────────────┤
│ Description                    │  16px bold
│ Museum-quality digital art...  │  16px line-height 1.6
│ Perfect for home printing or   │  Expandable (future: Read More)
│ professional framing.          │
├────────────────────────────────┤
│ Details                        │  Accordion sections
│ ▼ Dimensions                   │  48px tap target each
│   40 x 60 cm (16 x 24 in)      │
│ ▼ Materials & Care              │
│   Canvas, archival ink...      │
├────────────────────────────────┤
│ Related Products               │  Gallery cards carousel
│ ←  [Card][Card][Card]  →       │  Horizontal scroll, same as catalog
└────────────────────────────────┘

┌────────────────────────────────┐
│ Add to Cart         $45        │  Sticky bottom 64px height
│ ───────────────────────────►   │  Thumb zone, always visible
└────────────────────────────────┘  16px bottom safe area (iOS)
```

### Specs Detail

| Element | Specs | Why |
|---------|-------|-----|
| **Header** | 56px height, sticky top, `--bg-primary` white | Back nav, context (title), cart count |
| **Back button** | 48x48px tap, chevron-left icon 24px | WCAG AA, thumb-friendly |
| **Cart badge** | 20px circle, gold bg, white text 12px bold | High contrast, impulse buy visibility |
| **Image main** | 100vw (minus 16px padding each side), 1:1 aspect | Full attention, swipeable, zoom tap |
| **Swipe dots** | 8px circle, 8px gap, gold active, muted inactive | Visual feedback, 4 images max mobile |
| **Thumbnails** | 80x80px, 16px gap, horizontal scroll, gold border active | Fast switch, preview, tap target OK |
| **Title** | 20px, font-weight 700, line-clamp 2, `--text-primary` | Hierarchy, legibility |
| **Artist link** | 14px, gold underline, tap 48px height (padding) | Secondary action, brand awareness |
| **Price** | 24px, font-weight 700, `--accent-primary` gold | Visual anchor, clear value |
| **Tabs** | 48px height, 50% width each, gold underline 3px active | Tap target, clear state, digital/physical |
| **Options** | Radio 24px circle, 48px total tap height, 16px gap | Single select, WCAG AA, fast decision |
| **Description** | 16px, line-height 1.6, `--text-primary` | iOS no-zoom, readable gallery lighting |
| **Accordion** | 48px tap target, chevron-down icon, expand/collapse | Space saving, on-demand info |
| **Related** | Horizontal scroll, same gallery cards, 16px gap | Cross-sell, stay in flow |
| **Sticky CTA** | 64px height, 16px padding top, `--accent-primary` bg | Thumb zone bottom, always visible, impulse buy |

---

## Mobile Landscape (640-900px) - Split Layout

**Context:** User seated (bench, floor), horizontal space, comparison mode.

```
┌──────────────────────────────────────────────┐
│ [←] Product Name                       [🛒3] │  Header 56px
├───────────────────────┬──────────────────────┤
│ ┌───────────────────┐ │ "Sunset Over..."     │  Image 50%, Info 50%
│ │                   │ │ by Artist Name       │
│ │  [Image 1:1]      │ │ ⭐⭐⭐⭐⭐ (42)        │
│ │  ●○○○             │ │                      │
│ │                   │ │ From $45             │  Scroll info vertical
│ └───────────────────┘ │                      │
│ ┌─┬─┬─┬─┐             │ ┌──────────────────┐ │
│ │■│□│□│□│ Thumbs 4    │ │🖼️ Digital│🎨 Phys│ │
│ └─┴─┴─┴─┘             │ └──────────────────┘ │
│                       │ ○ High-Res JPG - $45 │
│                       │ ○ PDF - $55          │
│                       │                      │
│                       │ Description...       │
│                       │ Details ▼            │
└───────────────────────┴──────────────────────┘
┌──────────────────────────────────────────────┐
│ Add to Cart                   $45  ───────►  │  Sticky bottom 64px
└──────────────────────────────────────────────┘
```

**Changes from portrait:**
- Image 50% left (fixed), info 50% right (scroll vertical)
- Thumbnails 4 cols vertical stack (no horizontal scroll)
- Tabs remain 48px height, split 50/50
- Related products below fold (2 cols grid)

---

## Desktop (>1024px) - 2 Col Focused

**Context:** Secondary traffic (admin, curator), mouse/keyboard, detail exploration.

```
┌──────────────────────────────────────────────────────────┐
│  [Logo]  Home > Gallery > Sunset Over Mountains    [🛒3] │  Header 64px
├───────────────────────────────┬──────────────────────────┤
│ ┌───────────────────────────┐ │                          │
│ │                           │ │ "Sunset Over Mountains"  │  Image 60%
│ │                           │ │ by Artist Name (link)    │  Info 40%
│ │      [Image 1:1]          │ │ ⭐⭐⭐⭐⭐ (42 reviews)     │  Max 1200px
│ │         (zoom)            │ │                          │  container
│ │                           │ │ $120                     │  Center
│ │                           │ │ or: From $45 (options)   │
│ └───────────────────────────┘ │                          │
│ ┌─┬─┬─┬─┐ Thumbnails (hover)  │ ┌────────────────────┐   │
│ │■│□│□│□│ 80x80px, 16px gap   │ │🖼️ Digital│🎨 Physical│  │  Tabs
│ └─┴─┴─┴─┘                     │ └────────────────────┘   │
│                               │                          │
│                               │ ○ High-Res JPG - $45     │  Options
│                               │   4000x4000px, 300 DPI   │
│                               │ ○ Print-Ready PDF - $55  │
│                               │   Vector, CMYK, A3       │
│                               │                          │
│                               │ ┌──────────────────────┐ │
│                               │ │ Add to Cart     $45  │ │  Not sticky
│                               │ │ ──────────────────►  │ │  (desktop)
│                               │ └──────────────────────┘ │
│                               │                          │
│                               │ Description              │  Scroll info
│                               │ Museum-quality...        │
│                               │                          │
│                               │ ▼ Dimensions             │
│                               │ ▼ Materials & Care       │
│                               │ ▼ Shipping Info          │
├───────────────────────────────┴──────────────────────────┤
│ Related Products                                         │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                         │  3-4 cols
│ │Card │ │Card │ │Card │ │Card │ Gallery cards            │  32px gap
│ └─────┘ └─────┘ └─────┘ └─────┘                         │
└──────────────────────────────────────────────────────────┘
```

**Desktop specifics:**
- Grid 60% image / 40% info (not 50/50, image emphasis)
- Image zoom on hover (1.5x lightbox modal)
- Thumbnails 4-6 visible, horizontal scroll
- CTA **not sticky** (info section shorter, always visible)
- Breadcrumb navigation (Home > Gallery > Product)
- Related products 3-4 cols (32px gap)
- Max width 1200px, centered, 24px edge padding

---

## Breakpoint Summary

| Breakpoint | Layout | Image | Info | CTA | Grid Related |
|------------|--------|-------|------|-----|--------------|
| **<640px** | 1 col | 100% width, 1:1 | Below image | Sticky bottom 64px | 1 col |
| **640-900px** | 2 col (50/50) | 50% left, 1:1 | 50% right, scroll | Sticky bottom 64px | 2 cols |
| **>1024px** | 2 col (60/40) | 60% left, 1:1 | 40% right, scroll | Not sticky (in flow) | 3-4 cols |

---

## Component Annotations

### ImageGallery
- **Mobile:** Swipe horizontal (touch), tap to zoom (modal full-screen)
- **Desktop:** Hover to zoom (cursor magnify), click lightbox
- **LQIP:** 20x20px blur base64, fade to WebP 800x800px
- **Lazy:** Main image eager, thumbnails lazy
- **Format:** WebP primary, JPEG fallback `<picture>`

### ProductInfo
- **Title:** Semantic `<h1>`, product name, line-clamp 2
- **Artist:** `<a>` link, gold underline, future profile page
- **Price:** Dynamic (From $45 if options, $120 if fixed)
- **Reviews:** Future phase (star rating, count, link to reviews)

### OptionsSelector
- **Tabs:** Digital/Physical (if both), single tab if one type
- **Options:** Radio group, single select, 48px tap target
- **Specs:** Bullet list below each option (size, format, DPI)
- **Validation:** Show selected price in sticky CTA

### AddToCartSticky
- **Mobile:** Sticky bottom, 64px height, full-width, 16px safe area
- **Desktop:** Not sticky, in-flow, 56px height, CTA button
- **State:** Disabled if no option selected, loading spinner on tap
- **Price:** Update dynamically based on selected option

### Accordion Sections
- **Details:** Dimensions, Materials, Care, Shipping
- **Expand:** Chevron-down → chevron-up, smooth 300ms
- **Default:** All collapsed (save space mobile)
- **Desktop:** All expanded (more vertical space)

### Related Products
- **Mobile portrait:** Horizontal scroll carousel, same gallery cards
- **Mobile landscape:** 2 cols grid, 16px gap
- **Desktop:** 3-4 cols grid, 32px gap
- **Limit:** 4-8 products max (performance)

---

## Responsive Images

### Size Strategy

```tsx
<Image
  src={productImage}
  alt={`${title} by ${artist}`}
  width={800}
  height={800}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 60vw"
  quality={85}
  format="webp"
  placeholder="blur"
  blurDataURL={lqip}
  priority={isMainImage}  // Main eager, thumbs lazy
/>
```

| Breakpoint | Viewport Width | Image Width | File Size Target |
|------------|----------------|-------------|------------------|
| Mobile portrait | 375-428px | 800px (1:1) | ~40KB WebP |
| Mobile landscape | 640-900px | 600px (1:1) | ~30KB WebP |
| Desktop | 1024px+ | 800px (1:1) | ~40KB WebP |

**Why 800px max:** Balance quality/performance. 1:1 aspect = square. Retina display (2x) = 400px CSS → 800px physical. WebP 85% quality = gallery-acceptable, <50KB.

---

## Navigation Patterns

### Breadcrumb (Desktop)
```
Home > Gallery > Sunset Over Mountains
```
- 14px, `--text-secondary`, chevron separator
- Links clickable (Home, Gallery), current page text only
- 48px height tap target mobile (if shown)

### Back Button (Mobile)
- Chevron-left icon 24px
- 48x48px tap target
- Navigate to previous page (catalog or Quick View)
- Position: Top-left header, 16px from edge

### Close Quick View → Product Detail
- If user came from Quick View modal
- Show "X" close button top-right (return to catalog)
- Optional breadcrumb "← Back to Gallery"

---

## Accessibility

### Focus Indicators
```css
*:focus-visible {
  outline: 2px solid var(--accent-primary);  /* Gold */
  outline-offset: 2px;
}
```

### Semantic HTML
```tsx
<main>
  <article itemScope itemType="https://schema.org/Product">
    <div className="image-gallery">
      <figure>
        <img src={main} alt={`${title} by ${artist}`} />
        <figcaption className="sr-only">{description}</figcaption>
      </figure>
    </div>

    <header className="product-info">
      <h1 itemProp="name">{title}</h1>
      <a href={artistUrl} itemProp="brand">{artist}</a>
      <span itemProp="offers" itemScope itemType="https://schema.org/Offer">
        <span itemProp="price">{price}</span>
      </span>
    </header>

    <section className="options-selector" role="group" aria-label="Product options">
      <div role="tablist" aria-label="Product type">
        <button role="tab" aria-selected="true">Digital</button>
        <button role="tab" aria-selected="false">Physical</button>
      </div>

      <div role="tabpanel">
        <fieldset>
          <legend className="sr-only">Select format</legend>
          <label>
            <input type="radio" name="option" value="jpg" />
            High-Res JPG - $45
          </label>
        </fieldset>
      </div>
    </section>

    <button className="add-to-cart-sticky" aria-label="Add to cart">
      Add to Cart <span aria-hidden="true">→</span>
    </button>
  </article>
</main>
```

### Keyboard Navigation
- **Tab:** Cycle through interactive elements (links, buttons, radio)
- **Enter/Space:** Activate buttons, select radio
- **Arrow keys:** Navigate tabs (Digital/Physical)
- **Escape:** Close lightbox/zoom modal

### Screen Reader
- Image alt text: "{title} by {artist}" (descriptive)
- Price announced: "From 45 dollars" or "120 dollars"
- Options: "High-resolution JPG, 4000 by 4000 pixels, 300 DPI, 45 dollars"
- CTA: "Add to cart, 45 dollars selected"

---

## Performance Targets

| Metric | Mobile (<640px) | Desktop (>1024px) | Why |
|--------|-----------------|-------------------|-----|
| **TTI** | <2s | <1.5s | Weak WiFi, impulse buy |
| **LCP** | <1.5s | <1s | Main image (LQIP + WebP) |
| **FID** | <100ms | <50ms | Tap feedback instant |
| **CLS** | <0.1 | <0.05 | Aspect ratio reserved |
| **Bundle** | <80KB gzip | <100KB gzip | Components lazy |

### Optimization Strategy
1. **Critical CSS inline:** Layout, header, image placeholder (<14KB)
2. **Defer non-critical:** Tabs, accordion, related products (lazy)
3. **Images:** WebP eager (main), lazy (thumbnails, related), LQIP blur
4. **Code split:** Related products separate chunk (on-demand scroll)
5. **Prefetch:** Catalog page (user likely returns) if Fast 3G+

---

## Test IDs Contract

```typescript
// Layout
'product-detail-page'
'product-detail-header'
'product-detail-back-btn'
'product-detail-cart-badge'

// Image Gallery
'image-gallery'
'image-main'
'image-swipe-dots'
'image-thumbnails'
'image-thumbnail-{index}'  // 0-indexed
'image-zoom-modal'

// Product Info
'product-info'
'product-title'
'product-artist-link'
'product-price'
'product-rating'  // Future

// Options Selector
'options-selector'
'options-tabs'
'options-tab-digital'
'options-tab-physical'
'options-tabpanel'
'option-radio-{id}'  // Option ID
'option-label-{id}'
'option-specs-{id}'

// Description
'product-description'
'accordion-section-{slug}'  // dimensions, materials, shipping
'accordion-toggle-{slug}'
'accordion-content-{slug}'

// Related Products
'related-products'
'related-products-carousel'
'related-product-card-{id}'

// Sticky CTA
'add-to-cart-sticky'
'add-to-cart-price'
'add-to-cart-btn'
```

---

## Animation Specs

### Image Load (Blur-Up)
```css
.image-placeholder {
  filter: blur(20px);
  transform: scale(1.1);
}

.image-loaded {
  filter: blur(0);
  transform: scale(1);
  transition: all 300ms ease-out;
}
```

### Tabs Switch
```css
.tab-panel-enter {
  opacity: 0;
  transform: translateX(20px);
}

.tab-panel-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: all 200ms ease-out;
}
```

### Accordion Expand
```css
.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 300ms ease-out;
}

.accordion-content.expanded {
  max-height: 500px;  /* Or calc based on content */
}
```

### Sticky CTA (Mobile Scroll)
```css
.add-to-cart-sticky {
  position: fixed;
  bottom: 0;
  transform: translateY(0);
  transition: transform 200ms ease-out;
}

.add-to-cart-sticky.hide-on-scroll {
  transform: translateY(100%);  /* Optional: hide on scroll down */
}
```

### Tap Feedback
```css
button:active,
.card:active {
  transform: scale(0.98);
  transition: transform 100ms ease-out;
}
```

---

## Edge Cases

### Single Image
- Hide thumbnails strip
- Hide swipe dots
- Show single image 1:1, centered

### Single Option Type (Digital OR Physical)
- Hide tabs (no toggle needed)
- Show options directly (no tabpanel wrapper)

### Single Option (No Variants)
- Hide radio selector
- Show price + specs as static info
- CTA enabled by default (no selection needed)

### No Related Products
- Hide section entirely (no empty state)

### Long Description (>300 chars)
- Show "Read More" button (expand/collapse)
- Max height 200px collapsed, full height expanded

### Out of Stock
- Gray out option radio + label
- Show "Out of Stock" badge 14px red
- Disable CTA if all options out of stock
- Show "Notify Me" button alternative

---

## File References

**Design tokens:** `SKY_43_DESIGN_SPECS.md` sections 2-3 (color, typography)

**Components:** Create `SKY_43_PRODUCT_DETAIL_COMPONENTS.md` (next deliverable)

**Tasks:** Create `SKY_43_PRODUCT_DETAIL_AURORA_TASKS.md` (handoff Pixel)

**Parent context:** `SKY_43_NOTES.md`, `SKY_43_PRODUCT_DETAIL_SCOPE.md`

---

**Status:** Wireframes complete. Mobile portrait priority, gallery aesthetic, performance-optimized, WCAG AA. Ready for component specs.
