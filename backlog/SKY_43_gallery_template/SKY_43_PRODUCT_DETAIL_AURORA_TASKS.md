# SKY-43: Product Detail Page - Aurora Tasks (Handoff to Pixel)

> Implementation checklist for product detail page components
> Created: 2025-01-18

---

## Context

Product detail page extension for SKY-43 Gallery Template. Maintain catalog consistency:
- Gallery White palette (gold accent #B8860B)
- Mobile-first QR (100% traffic, portrait priority)
- Performance <2s TTI (<80KB bundle)
- Museum aesthetic (neutral, artwork hero)
- Test IDs everywhere (Sentinela contract)

**User journey:** QR scan → catalog (Gallery White) → Quick View → **product detail** → add to cart

**Problem:** Detail page currently legacy (azul, generic layout) → visual inconsistency.

**Solution:** Gallery White design system applied to detail page. Mobile-first layout, sticky CTA thumb zone, performance-optimized.

---

## Design Deliverables Complete

1. **SKY_43_PRODUCT_DETAIL_WIREFRAMES.md** ✅
   - Mobile portrait (<640px): 1 col, full attention
   - Mobile landscape (640-900px): 50/50 split image/info
   - Desktop (>1024px): 60/40 image/info, max 1200px
   - Annotated specs (spacing, sizing, breakpoints)

2. **SKY_43_PRODUCT_DETAIL_COMPONENTS.md** ✅
   - ImageGallery: swipeable, zoom, LQIP, thumbnails
   - ProductInfo: title, artist, price, description
   - OptionsSelector: tabs (digital/physical), radio options
   - AddToCartSticky: bottom CTA 64px mobile, in-flow desktop
   - RelatedProducts: gallery cards carousel
   - AccordionSection: dimensions, materials, shipping
   - Props interfaces complete
   - Test IDs documented

3. **SKY_43_PRODUCT_DETAIL_AURORA_TASKS.md** ✅ (this file)
   - Handoff to Pixel
   - Implementation checklist
   - Design tokens usage
   - Performance targets
   - Files to create

---

## Implementation Checklist (Pixel)

### Phase 1: Core Components (3h)

#### 1. ProductDetailLayout (30 min)

**File:** `components/storefront/ProductDetailLayout.tsx`

**Responsibilities:**
- Responsive grid wrapper (1 col mobile, 2 col desktop)
- Breakpoint logic (<640px, 640-900px, >1024px)
- Max width 1200px desktop, centered
- Header sticky (back button, title, cart badge)
- Safe area bottom (iOS notch)

**Layout:**
```tsx
<div className="product-detail-layout">
  <header>
    <button back>←</button>
    <h1>{product.name}</h1>
    <span cart-badge>🛒3</span>
  </header>

  <div className="detail-grid">
    <div className="grid-image">
      <ImageGallery {...} />
    </div>

    <div className="grid-info">
      <ProductInfo {...} />
      <OptionsSelector {...} />
      <AccordionSection {...} />
      <AddToCartSticky {...} />  {/* Desktop only */}
    </div>
  </div>

  <RelatedProducts {...} />

  <AddToCartSticky {...} />  {/* Mobile sticky */}
</div>
```

**Design tokens:**
- `--bg-primary: #FFFFFF` (header, cards)
- `--bg-secondary: #FAFAFA` (page background)
- `--border-subtle: #E5E5E5` (header border)
- Mobile padding: `16px`
- Desktop padding: `24px`
- Grid gap: `32px` desktop, `24px` mobile

**Test IDs:**
```typescript
'product-detail-page'
'product-detail-header'
'product-detail-back-btn'
'product-detail-cart-badge'
```

**Checklist:**
- [ ] Responsive grid (1 col → 2 col breakpoints)
- [ ] Sticky header 56px mobile, 64px desktop
- [ ] Back button 48x48px tap target
- [ ] Cart badge gold bg, white text, count
- [ ] Safe area inset bottom (iOS)
- [ ] Max width 1200px desktop, centered
- [ ] Test IDs added

---

#### 2. ImageGallery Component (45 min)

**File:** `components/storefront/ImageGallery.tsx`

**Features:**
- Main image 1:1 aspect, full-width mobile
- Swipeable horizontal (touch, no library bloat)
- Swipe dots indicator (8px, gold active)
- Thumbnails strip 80x80px, horizontal scroll
- Tap to zoom: full-screen modal (mobile)
- Click lightbox: 1.5x zoom modal (desktop)
- LQIP blur-up animation 300ms
- WebP primary, JPEG fallback

**Props:**
```typescript
interface ImageGalleryProps {
  images: Array<{
    id: string
    url: string
    alt: string
    lqip?: string
    width: number
    height: number
  }>
  productName: string
  artistName?: string
  'data-testid'?: string
}
```

**Design tokens:**
- Image border: `--border-subtle` thumbnails
- Active thumbnail: `--accent-primary` border 2px
- Dots: `--text-muted` inactive, `--accent-primary` active
- Backdrop: `rgba(0,0,0,0.9)` zoom modal

**Performance:**
- Main image: Eager load (priority), WebP 800x800px ~40KB
- Thumbnails: Lazy load, WebP 80x80px ~3KB each
- LQIP: Base64 20x20px blur <1KB inline
- Total budget: ~60KB for 4 images

**Test IDs:**
```typescript
'image-gallery'
'image-main'
'image-swipe-dots'
'image-thumbnails'
'image-thumbnail-{index}'
'image-zoom-modal'
```

**Checklist:**
- [ ] 1:1 aspect ratio reserved (CLS <0.1)
- [ ] Swipe gesture (transform translateX, snap)
- [ ] Dots indicator (current index gold)
- [ ] Thumbnails 80x80px, horizontal scroll
- [ ] Tap zoom mobile (full-screen modal)
- [ ] Click zoom desktop (lightbox 1.5x)
- [ ] LQIP blur-up 300ms fade
- [ ] WebP with `<picture>` JPEG fallback
- [ ] Lazy load thumbnails (below fold)
- [ ] Keyboard: Arrow keys navigate images
- [ ] Alt text: "{productName} by {artistName}"
- [ ] Test IDs added

---

#### 3. ProductInfo Component (20 min)

**File:** `components/storefront/ProductInfo.tsx`

**Features:**
- Title `<h1>` 20px mobile, 28px desktop
- Artist link (gold underline, future profile page)
- Price 24px gold (From $45 or $120)
- Description 16px, line-height 1.6
- Future: Star rating + reviews count

**Props:**
```typescript
interface ProductInfoProps {
  product: {
    id: string
    name: string
    artist?: {
      id: string
      name: string
      slug: string
    }
    price: number
    currency: string
    priceType: 'fixed' | 'from'
    rating?: {
      average: number
      count: number
    }
    description: string
  }
  'data-testid'?: string
}
```

**Design tokens:**
- Title: `--text-primary` (#1A1A1A), font-weight 700
- Artist: `--accent-primary` (#B8860B), underline 1px
- Price: `--accent-primary`, font-weight 700, 24px
- Description: `--text-primary`, 16px, line-height 1.6
- "From" prefix: `--text-secondary`, 16px, weight 400

**Test IDs:**
```typescript
'product-info'
'product-title'
'product-artist-link'
'product-rating'  // Future
'product-price'
'product-description'
```

**Checklist:**
- [ ] Semantic `<h1>` title, line-clamp 2
- [ ] Artist `<a>` link, gold underline
- [ ] Price dynamic (From $45 if options, $120 if fixed)
- [ ] Description 16px+ (iOS no-zoom)
- [ ] Future: Star rating component hook
- [ ] Screen reader: "From 45 dollars" announced
- [ ] Test IDs added

---

#### 4. OptionsSelector Component (45 min)

**File:** `components/storefront/OptionsSelector.tsx`

**Features:**
- Tabs: Digital/Physical (if both types exist)
- Radio group: Select one option (48px tap target)
- Show specs: Bullet list below each option
- Price inline: Bold gold per option
- Out of stock: Gray out, disable, show badge
- Update parent: Trigger `onSelectOption(id)` on change

**Props:**
```typescript
interface OptionsSelectorProps {
  options: Array<{
    id: string
    type: 'digital' | 'physical'
    title: string
    specs: string[]
    price: number
    currency: string
    stock: number
    sku: string
  }>
  selectedOptionId?: string
  onSelectOption: (optionId: string) => void
  'data-testid'?: string
}
```

**Design tokens:**
- Tabs border bottom: `--border-subtle` 1px
- Active tab: `--accent-primary` underline 3px
- Option card border: `--border-subtle` 2px
- Selected card: `--accent-primary` border, `#FFFBF0` bg (light gold tint)
- Radio accent: `--accent-primary`
- Specs color: `--text-secondary` 14px
- Out of stock badge: `#991B1B` text, `#FEE2E2` bg

**Edge cases:**
- Single type: Skip tabs layer, show options directly
- Single option: Skip radio, show as static info
- All out of stock: Disable sticky CTA, show "Notify Me"

**Test IDs:**
```typescript
'options-selector'
'options-tabs'
'options-tab-digital'
'options-tab-physical'
'options-tabpanel'
'option-radio-{id}'
'option-label-{id}'
'option-specs-{id}'
```

**Checklist:**
- [ ] Tabs 48px height, 50% width each (if both types)
- [ ] Active tab gold underline 3px
- [ ] Radio 24px circle, 48px total tap height
- [ ] Selected card gold border + light bg tint
- [ ] Specs bullet list 14px muted
- [ ] Price inline 18px bold gold
- [ ] Out of stock: opacity 0.5, disabled, badge
- [ ] Keyboard: Arrow keys navigate tabs
- [ ] ARIA: `role="tablist"`, `role="group"` radio
- [ ] Screen reader: Announce option specs + price
- [ ] Test IDs added

---

#### 5. AddToCartSticky Component (30 min)

**File:** `components/storefront/AddToCartSticky.tsx`

**Features:**
- Mobile: Sticky bottom 64px height, full-width, safe area
- Desktop: In-flow (not sticky), 56px height, centered
- Show selected price (mobile only)
- States: Disabled, Loading, Success, Error
- Disabled if no option selected
- Loading spinner, text "Adding..."
- Success checkmark, pulse animation
- Error shake animation

**Props:**
```typescript
interface AddToCartStickyProps {
  selectedOption?: {
    id: string
    price: number
    currency: string
  }
  isLoading?: boolean
  onAddToCart: () => void | Promise<void>
  'data-testid'?: string
}
```

**Design tokens:**
- Background: `--accent-primary` (#B8860B)
- Text: `#FFFFFF` (white on gold, 4.6:1 contrast AA)
- Disabled: `--text-muted` (#999999), opacity 0.6
- Border top: `--border-subtle` (mobile only)
- Safe area: `env(safe-area-inset-bottom)` iOS

**States:**
```css
/* Disabled: no option selected */
.add-to-cart-btn:disabled {
  background: var(--text-muted);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Loading: spinner + "Adding..." */
.add-to-cart-btn.loading {
  pointer-events: none;
}

/* Success: green bg, pulse animation 300ms */
.add-to-cart-btn.success {
  background: #10B981;
  animation: pulse 300ms;
}

/* Error: shake animation 400ms */
.add-to-cart-btn.error {
  animation: shake 400ms;
}
```

**Test IDs:**
```typescript
'add-to-cart-sticky'
'add-to-cart-btn'
'add-to-cart-price'
```

**Checklist:**
- [ ] Mobile: Sticky bottom, 64px height, full-width
- [ ] Desktop: Not sticky, in-flow, min-width 320px
- [ ] Safe area inset bottom (iOS notch)
- [ ] Price display mobile (hide desktop)
- [ ] Disabled if no option selected
- [ ] Loading state: spinner + text
- [ ] Success state: green bg, pulse
- [ ] Error state: shake animation
- [ ] Tap feedback: scale 0.98 active
- [ ] Arrow icon translate 4px on hover
- [ ] ARIA: `aria-label="Add to cart, {price}"`
- [ ] Test IDs added

---

### Phase 2: Secondary Components (1h)

#### 6. AccordionSection Component (20 min)

**File:** `components/storefront/AccordionSection.tsx`

**Features:**
- Native `<details>` accordion (no JS bloat)
- Sections: Dimensions, Materials, Shipping
- Chevron rotate 180deg when expanded
- Smooth expand animation 300ms
- Default collapsed mobile, expanded desktop (optional)

**Props:**
```typescript
interface AccordionSectionProps {
  sections: Array<{
    id: string
    title: string
    content: string | React.ReactNode
    defaultExpanded?: boolean
  }>
  'data-testid'?: string
}
```

**Design tokens:**
- Border bottom: `--border-subtle` 1px
- Title: `--text-primary` 16px, font-weight 600
- Content: `--text-secondary` 14px, line-height 1.6
- Chevron: `--text-secondary` 12px

**Test IDs:**
```typescript
'accordion-section-{id}'
'accordion-toggle-{id}'
'accordion-content-{id}'
```

**Checklist:**
- [ ] Native `<details>` element (semantic)
- [ ] 48px tap target toggle
- [ ] Chevron rotate 180deg transition 300ms
- [ ] Expand animation: fade + translateY
- [ ] Keyboard: Enter/Space to toggle
- [ ] Screen reader: "collapsed" / "expanded" state
- [ ] Test IDs added

---

#### 7. RelatedProducts Component (20 min)

**File:** `components/storefront/RelatedProducts.tsx`

**Features:**
- Reuse GalleryCard component from catalog
- Mobile: Horizontal scroll carousel, 280px card width
- Tablet: 2 cols grid
- Desktop: 3-4 cols grid, 32px gap
- Lazy load: Below fold, intersection observer
- Code split: Separate chunk (dynamic import)
- Limit: 4-8 products max

**Props:**
```typescript
interface RelatedProductsProps {
  products: Array<{
    id: string
    name: string
    artist?: string
    price: number
    currency: string
    images: string[]
    type: 'digital' | 'physical' | 'both'
    optionsCount?: number
    isNew?: boolean
  }>
  limit?: number
  'data-testid'?: string
}
```

**Design tokens:**
- Background: `--bg-secondary` (#FAFAFA)
- Title: `--text-primary` 20px, font-weight 700
- Gap mobile: 16px
- Gap desktop: 32px
- Max width: 1200px centered

**Test IDs:**
```typescript
'related-products'
'related-products-carousel'
'related-product-card-{id}'
```

**Checklist:**
- [ ] Reuse GalleryCard component (no duplication)
- [ ] Mobile: Horizontal scroll, snap scroll
- [ ] Tablet: 2 cols grid, 16px gap
- [ ] Desktop: 3-4 cols grid, 32px gap
- [ ] Lazy load: Intersection observer trigger
- [ ] Code split: Dynamic import chunk
- [ ] Limit 8 products max (performance)
- [ ] Hide if no related products (no empty state)
- [ ] Test IDs added

---

#### 8. ProductDetailWrapper (Client State) (20 min)

**File:** `components/storefront/ProductDetailWrapper.tsx`

**Responsibilities:**
- Client component (cart state, option selection)
- useState: selectedOptionId, isAdding
- useCartStore: addToCart action
- Pass props to child components
- Handle add to cart logic (success/error)

**Layout:**
```tsx
'use client'

export function ProductDetailWrapper({ product }: { product: ProductDetail }) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>()
  const [isAdding, setIsAdding] = useState(false)
  const addToCart = useCartStore(state => state.addItem)

  const selectedOption = product.options.find(opt => opt.id === selectedOptionId)

  const handleAddToCart = async () => {
    if (!selectedOption) return
    setIsAdding(true)
    try {
      await addToCart({
        productId: product.id,
        optionId: selectedOption.id,
        quantity: 1,
      })
      // Success toast or redirect to cart
    } catch (error) {
      // Error toast
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div>
      <ImageGallery images={product.images} {...} />
      <ProductInfo product={product} />
      <OptionsSelector
        options={product.options}
        selectedOptionId={selectedOptionId}
        onSelectOption={setSelectedOptionId}
      />
      <AddToCartSticky
        selectedOption={selectedOption}
        isLoading={isAdding}
        onAddToCart={handleAddToCart}
      />
    </div>
  )
}
```

**Checklist:**
- [ ] Client component (`'use client'` directive)
- [ ] useState: selectedOptionId, isAdding
- [ ] useCartStore: addToCart action integration
- [ ] handleAddToCart: loading state, try/catch
- [ ] Pass selectedOption to sticky CTA
- [ ] Success feedback (toast or redirect)
- [ ] Error feedback (toast or shake animation)

---

## Files to Create

```
components/
├─ storefront/
│  ├─ ProductDetailLayout.tsx        # Responsive grid wrapper
│  ├─ ProductDetailWrapper.tsx       # Client state (cart, options)
│  ├─ ImageGallery.tsx               # Swipe, zoom, LQIP
│  ├─ ProductInfo.tsx                # Title, artist, price, description
│  ├─ OptionsSelector.tsx            # Tabs + radio options
│  ├─ AddToCartSticky.tsx            # Bottom CTA mobile, in-flow desktop
│  ├─ RelatedProducts.tsx            # Carousel/grid GalleryCard
│  └─ AccordionSection.tsx           # Collapsible details
└─ ui/
   ├─ Icon.tsx                       # Chevron, close, arrow (if not exist)
   └─ Spinner.tsx                    # Loading spinner (if not exist)

app/
└─ products/
   └─ [slug]/
      └─ page.tsx                    # Server component, fetch product data

types/
└─ product-detail.ts                 # ProductDetail, ProductOption interfaces

styles/
└─ product-detail.css                # Component-specific styles (if needed)
```

---

## Design Tokens Usage

### Color System (Gallery White)

```css
/* Use existing tokens from catalog */
:root {
  --bg-primary: #FFFFFF;           /* Cards, header */
  --bg-secondary: #FAFAFA;         /* Page background */
  --text-primary: #1A1A1A;         /* Headings, body */
  --text-secondary: #666666;       /* Meta, specs */
  --text-muted: #999999;           /* Placeholders, disabled */
  --accent-primary: #B8860B;       /* CTA, links, gold */
  --accent-hover: #9A7209;         /* CTA hover */
  --border-subtle: #E5E5E5;        /* Dividers */
}
```

### Typography Scale

```css
/* Mobile (<640px) */
--font-h1: 20px;        /* Product title */
--font-h2: 18px;        /* Section titles */
--font-body: 16px;      /* Description (iOS no-zoom) */
--font-small: 14px;     /* Specs, meta */
--font-tiny: 12px;      /* Badges */

/* Desktop (>1024px) */
--font-h1: 28px;
--font-h2: 24px;
--font-body: 18px;
```

### Spacing

```css
--spacing-xs: 8px;      /* Icon gaps, badge padding */
--spacing-sm: 16px;     /* Mobile padding, gaps */
--spacing-md: 24px;     /* Desktop padding, section gaps */
--spacing-lg: 32px;     /* Desktop grid gap, max spacing */
```

### Tap Targets (Mobile)

```css
--tap-target-min: 48px;  /* WCAG AA minimum */
--button-height: 56px;   /* CTA height */
--header-height: 56px;   /* Mobile header */
```

---

## Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| **TTI** | <2s | Critical CSS inline, defer non-critical |
| **LCP** | <1.5s | Main image eager, WebP, LQIP |
| **FID** | <100ms | Tap feedback instant (scale 0.98) |
| **CLS** | <0.1 | Aspect ratio reserved (1:1 images) |
| **Bundle** | <80KB gzip | Core components <25KB, lazy related |

### Optimization Checklist

- [ ] Critical CSS inline (<14KB): Layout, header, image placeholder
- [ ] Defer non-critical: Tabs, accordion, related products
- [ ] Images: WebP eager (main), lazy (thumbnails, related), LQIP blur
- [ ] Code split: RelatedProducts separate chunk (dynamic import)
- [ ] Aspect ratio: Reserved for images (1:1, CLS <0.1)
- [ ] Bundle target: <25KB core components gzip
- [ ] Lighthouse score: ≥90 mobile (TTI <2s)

---

## Accessibility Requirements (WCAG AA)

### Checklist

- [ ] **Semantic HTML:** `<main>`, `<article>`, `<header>`, `<section>`, `<h1>`
- [ ] **ARIA labels:** Icon-only buttons (`aria-label="Close zoom"`)
- [ ] **ARIA roles:** Tabs (`role="tablist"`), radio (`role="group"`)
- [ ] **Focus visible:** 2px gold outline, 2px offset
- [ ] **Keyboard navigation:** Tab, Enter, Space, Arrow keys
- [ ] **Color contrast:** 4.5:1 text, 3:1 UI (Gallery White achieves AAA)
- [ ] **Tap targets:** 48x48px minimum mobile
- [ ] **Font size:** 16px+ mobile (iOS no-zoom)
- [ ] **Alt text:** Images "{productName} by {artistName}"
- [ ] **Screen reader:** Test VoiceOver (iOS), NVDA (Windows)

---

## Responsive Breakpoints

| Breakpoint | Width | Layout | Image | CTA |
|------------|-------|--------|-------|-----|
| **Mobile portrait** | <640px | 1 col | 100% width | Sticky bottom 64px |
| **Mobile landscape** | 640-900px | 2 col (50/50) | 50% left | Sticky bottom 64px |
| **Desktop** | >1024px | 2 col (60/40) | 60% left | In-flow (not sticky) |

---

## Integration Points

### Cart Store (Zustand)

```typescript
// stores/cart.ts
interface CartItem {
  productId: string
  optionId: string
  quantity: number
  price: number
  currency: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => Promise<void>
  removeItem: (productId: string, optionId: string) => void
  // ...
}

export const useCartStore = create<CartStore>(...)
```

**Usage in ProductDetailWrapper:**
```tsx
const addToCart = useCartStore(state => state.addItem)

await addToCart({
  productId: product.id,
  optionId: selectedOption.id,
  quantity: 1,
})
```

### Product Data Fetch

```tsx
// app/products/[slug]/page.tsx (Server Component)
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await fetchProduct(params.slug)

  return <ProductDetailWrapper product={product} />
}
```

---

## Test IDs Contract (Sentinela)

Complete list documented in `SKY_43_PRODUCT_DETAIL_COMPONENTS.md` section "Test IDs Complete List".

**Critical test IDs:**
```typescript
// E2E flow: QR scan → catalog → detail → add to cart
'product-detail-page'
'image-gallery'
'product-info'
'options-selector'
'option-radio-{id}'
'add-to-cart-sticky'
'add-to-cart-btn'
```

**Naming convention:**
- Component root: `{component-name}`
- Interactive elements: `{component-name}-{action}`
- Dynamic items: `{component-name}-{id}` (use product/option ID)

---

## Success Criteria

### Functionality
- [ ] Product detail page loads <2s TTI mobile 3G
- [ ] Images swipeable (mobile), hover zoom (desktop)
- [ ] Options selectable (tabs + radio)
- [ ] Sticky CTA updates price on option select
- [ ] Add to cart: loading state, success feedback
- [ ] Related products lazy load below fold
- [ ] Accordion sections expand/collapse smoothly

### Design
- [ ] Gallery White palette consistent (gold accent)
- [ ] Typography scale matches catalog (16px+ mobile)
- [ ] Tap targets 48x48px minimum
- [ ] Spacing matches design system (16px mobile, 32px desktop)
- [ ] Responsive breakpoints correct (1 col → 2 col)

### Performance
- [ ] TTI <2s mobile 3G (Lighthouse)
- [ ] LCP <1.5s (main image LQIP)
- [ ] CLS <0.1 (aspect ratio reserved)
- [ ] Bundle <80KB gzip total
- [ ] Core components <25KB gzip

### Accessibility
- [ ] WCAG AA compliance (color contrast, tap targets, font size)
- [ ] Keyboard navigation works (Tab, Enter, Arrow keys)
- [ ] Screen reader tested (VoiceOver, NVDA)
- [ ] Focus visible on all interactive elements
- [ ] Semantic HTML + ARIA labels

### Test Coverage
- [ ] All test IDs added (Sentinela can locate elements)
- [ ] E2E flow: Catalog → detail → add to cart
- [ ] Visual regression: Gallery White palette consistency
- [ ] Performance test: TTI <2s verified
- [ ] Accessibility audit: WCAG AA passed

---

## Next Steps (Sequencing)

1. **Pixel:** Implement Phase 1 components (3h core)
   - ProductDetailLayout, ImageGallery, ProductInfo, OptionsSelector, AddToCartSticky

2. **Pixel:** Implement Phase 2 components (1h secondary)
   - AccordionSection, RelatedProducts, ProductDetailWrapper

3. **Sentinela:** E2E tests + visual regression (1h)
   - QR flow: Catalog → detail → add to cart
   - Gallery White palette consistency
   - Performance + accessibility audits

4. **Deploy staging:** Test with real QR scan workflow
   - Weak WiFi simulation
   - Mobile devices (iOS Safari, Chrome Android)
   - Gallery lighting conditions

5. **Production rollout:** Monitor metrics
   - TTI, conversion rate, bounce rate
   - User feedback (artist + gallery visitors)

---

## References

**Design specs:**
- `SKY_43_DESIGN_SPECS.md` (tokens, philosophy, performance)
- `SKY_43_PRODUCT_DETAIL_WIREFRAMES.md` (layouts, breakpoints)
- `SKY_43_PRODUCT_DETAIL_COMPONENTS.md` (props, behavior, styles)

**Parent context:**
- `SKY_43_NOTES.md` (user journey, QR context)
- `SKY_43_PRODUCT_DETAIL_SCOPE.md` (extension scope)

**Related:**
- `SKY_43_PIXEL_TASKS.md` (catalog implementation reference)
- `.claude/TEST_ID_CONTRACT.md` (Pixel ↔ Sentinela contract)

---

## Questions for Pixel

1. **Cart store:** Zustand already exists? Interface compatible with props?
2. **Product fetch:** Server component pattern OK? Or need API route?
3. **Image optimization:** Next.js Image component configured? WebP enabled?
4. **Icon system:** Use existing Icon component or create new?
5. **Toast notifications:** Library preference (sonner, react-hot-toast, custom)?
6. **Code splitting:** RelatedProducts dynamic import strategy OK?

**Escalate blockers:** Tag @Mentat if cart integration or performance targets unclear.

---

**Status:** Handoff complete. Pixel can start implementation. Aurora available for clarifications. Target: 4h total (3h core + 1h secondary).
