# SKY-43: Product Detail Page - Component Specifications

> Detailed component specs, props interfaces, states, test IDs
> Created: 2025-01-18

---

## Components Architecture

```
ProductDetailPage (Server Component)
├─ ProductDetailWrapper (Client Component - cart state)
   ├─ ImageGallery (swipeable, zoom, LQIP)
   ├─ ProductInfo (title, artist, price, description)
   ├─ OptionsSelector (digital/physical tabs, radio options)
   ├─ AddToCartSticky (bottom CTA, thumb zone)
   └─ RelatedProducts (gallery cards carousel)
```

---

## 1. ImageGallery Component

### Purpose
Display product images with swipe/zoom on mobile, hover zoom on desktop. Performance-optimized (LQIP blur-up, lazy thumbnails).

### Props Interface

```typescript
interface ImageGalleryProps {
  images: Array<{
    id: string
    url: string
    alt: string
    lqip?: string  // Base64 20x20px blur
    width: number
    height: number
  }>
  productName: string
  artistName?: string
  'data-testid'?: string
}
```

### Behavior

**Mobile (<640px):**
- Main image: Swipeable horizontal (touch)
- Dots indicator: 8px circles, gold active, muted inactive
- Tap to zoom: Full-screen modal (pinch-to-zoom enabled)
- Thumbnails: 80x80px strip, horizontal scroll, tap to switch
- LQIP: Blur-up animation 300ms

**Desktop (>1024px):**
- Main image: Hover to show zoom cursor
- Click: Lightbox modal 1.5x size (centered, backdrop blur)
- Thumbnails: Hover border gold, click to switch
- Keyboard: Arrow keys to navigate images

### States

| State | Behavior |
|-------|----------|
| **Loading** | LQIP blur visible, skeleton shimmer |
| **Loaded** | Fade-in 300ms, blur-up effect |
| **Swiping** | Transform translateX, snap to image |
| **Zooming** | Modal full-screen, pinch/pan enabled |
| **Error** | Fallback placeholder, retry button |

### Layout

```tsx
<div className="image-gallery" data-testid="image-gallery">
  <figure className="gallery-main">
    <Image
      src={currentImage.url}
      alt={`${productName} by ${artistName}`}
      width={800}
      height={800}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 60vw"
      quality={85}
      format="webp"
      placeholder="blur"
      blurDataURL={currentImage.lqip}
      priority
      data-testid="image-main"
      onClick={handleZoom}
    />

    {/* Swipe dots (mobile) */}
    <div className="swipe-dots" data-testid="image-swipe-dots">
      {images.map((img, idx) => (
        <button
          key={img.id}
          className={idx === currentIndex ? 'active' : ''}
          aria-label={`View image ${idx + 1}`}
          onClick={() => setCurrentIndex(idx)}
        />
      ))}
    </div>
  </figure>

  {/* Thumbnails */}
  <div className="gallery-thumbnails" data-testid="image-thumbnails">
    {images.map((img, idx) => (
      <button
        key={img.id}
        className={idx === currentIndex ? 'active' : ''}
        onClick={() => setCurrentIndex(idx)}
        aria-label={`View image ${idx + 1}`}
        data-testid={`image-thumbnail-${idx}`}
      >
        <Image
          src={img.url}
          alt=""
          width={80}
          height={80}
          quality={75}
          loading="lazy"
        />
      </button>
    ))}
  </div>

  {/* Zoom modal */}
  {isZoomed && (
    <dialog
      className="zoom-modal"
      data-testid="image-zoom-modal"
      onClick={handleCloseZoom}
    >
      <Image src={currentImage.url} alt={currentImage.alt} fill />
      <button className="close-btn" aria-label="Close zoom">×</button>
    </dialog>
  )}
</div>
```

### Styles

```css
.image-gallery {
  --gallery-gap: 16px;
}

/* Main image */
.gallery-main {
  position: relative;
  aspect-ratio: 1 / 1;
  width: 100%;
  overflow: hidden;
  cursor: zoom-in;
}

.gallery-main img {
  object-fit: cover;
  transition: transform 500ms ease-out;
}

/* Desktop hover zoom */
@media (min-width: 1024px) {
  .gallery-main:hover img {
    transform: scale(1.05);
  }
}

/* Swipe dots */
.swipe-dots {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.swipe-dots button {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
  transition: background 200ms;
}

.swipe-dots button.active {
  background: var(--accent-primary);
}

/* Thumbnails */
.gallery-thumbnails {
  display: flex;
  gap: var(--gallery-gap);
  overflow-x: auto;
  padding: var(--gallery-gap) 0;
  scrollbar-width: none;  /* Hide scrollbar */
}

.gallery-thumbnails button {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 200ms;
}

.gallery-thumbnails button.active {
  border-color: var(--accent-primary);
}

/* Zoom modal */
.zoom-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.9);
  display: grid;
  place-items: center;
  animation: fade-in 200ms;
}

.zoom-modal img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 48px;
  height: 48px;
  font-size: 32px;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
}
```

### Performance

- **LQIP:** 20x20px blur base64 inline (<1KB per image)
- **Main image:** Eager load (priority), WebP 800x800px ~40KB
- **Thumbnails:** Lazy load, WebP 80x80px ~3KB each
- **Total budget:** ~60KB for 4 images (main + 3 thumbs)
- **Swipe library:** Use CSS transform (no Swiper.js bloat)

### Accessibility

- Alt text: "{productName} by {artistName}"
- Thumbnails: `aria-label="View image {n}"`
- Keyboard: Arrow keys navigate images
- Focus: Visible outline on thumbnails
- Screen reader: Announce current image "Image 2 of 4"

### Test IDs

```typescript
'image-gallery'
'image-main'
'image-swipe-dots'
'image-thumbnails'
'image-thumbnail-{index}'  // 0-indexed
'image-zoom-modal'
```

---

## 2. ProductInfo Component

### Purpose
Display product title, artist, price, rating, description. Clear hierarchy, readable mobile.

### Props Interface

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
    priceType: 'fixed' | 'from'  // "From $45" if options, "$120" if fixed
    rating?: {
      average: number  // 0-5
      count: number
    }
    description: string
  }
  'data-testid'?: string
}
```

### Layout

```tsx
<header className="product-info" data-testid="product-info">
  <h1 className="product-title" data-testid="product-title">
    {product.name}
  </h1>

  {product.artist && (
    <a
      href={`/artists/${product.artist.slug}`}
      className="product-artist"
      data-testid="product-artist-link"
    >
      by {product.artist.name}
    </a>
  )}

  {product.rating && (
    <div className="product-rating" data-testid="product-rating">
      <span className="stars" aria-label={`${product.rating.average} out of 5 stars`}>
        {'⭐'.repeat(Math.round(product.rating.average))}
      </span>
      <span className="count">({product.rating.count} reviews)</span>
    </div>
  )}

  <div className="product-price" data-testid="product-price">
    {product.priceType === 'from' && <span className="price-prefix">From</span>}
    <span className="price-amount">
      {formatCurrency(product.price, product.currency)}
    </span>
  </div>

  <div className="product-description" data-testid="product-description">
    <p>{product.description}</p>
    {/* Future: Read More expand/collapse if >300 chars */}
  </div>
</header>
```

### Styles

```css
.product-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 16px;
}

/* Title */
.product-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (min-width: 1024px) {
  .product-title {
    font-size: 28px;
  }
}

/* Artist link */
.product-artist {
  font-size: 14px;
  color: var(--accent-primary);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  transition: color 200ms;
}

.product-artist:hover {
  color: var(--accent-hover);
}

/* Rating (future) */
.product-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.product-rating .stars {
  color: #F59E0B;  /* Gold stars */
}

/* Price */
.product-price {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-primary);
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.product-price .price-prefix {
  font-size: 16px;
  font-weight: 400;
  color: var(--text-secondary);
}

@media (min-width: 1024px) {
  .product-price {
    font-size: 32px;
  }
}

/* Description */
.product-description {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);
}
```

### Accessibility

- Semantic: `<h1>` title, `<a>` artist link
- Screen reader: "From 45 dollars" or "120 dollars"
- Rating: `aria-label="4.5 out of 5 stars, 42 reviews"`
- Focus: Visible outline on artist link

### Test IDs

```typescript
'product-info'
'product-title'
'product-artist-link'
'product-rating'  // Future
'product-price'
'product-description'
```

---

## 3. OptionsSelector Component

### Purpose
Let user select product option (digital/physical type, format, size). Tabs for type, radio for variants.

### Props Interface

```typescript
interface OptionsSelectorProps {
  options: Array<{
    id: string
    type: 'digital' | 'physical'
    title: string
    specs: string[]  // ["4000x4000px", "300 DPI", "High-res JPG"]
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

### Behavior

**Tabs:**
- Show if both digital AND physical options exist
- Hide if only one type (skip tab layer)
- Switch tabpanel content based on active tab
- Keyboard: Arrow keys to switch tabs

**Radio Options:**
- Single select (radio group)
- 48px tap target height (WCAG AA)
- Show specs below each option (14px muted)
- Show price inline (bold gold)
- Disable if stock = 0 (gray out, "Out of Stock" badge)

**Price Update:**
- On option select → trigger `onSelectOption(id)`
- Parent updates sticky CTA price

### Layout

```tsx
<section className="options-selector" data-testid="options-selector">
  {/* Tabs (if both types exist) */}
  {hasBothTypes && (
    <div className="options-tabs" role="tablist" data-testid="options-tabs">
      <button
        role="tab"
        aria-selected={activeTab === 'digital'}
        onClick={() => setActiveTab('digital')}
        data-testid="options-tab-digital"
      >
        🖼️ Digital
      </button>
      <button
        role="tab"
        aria-selected={activeTab === 'physical'}
        onClick={() => setActiveTab('physical')}
        data-testid="options-tab-physical"
      >
        🎨 Physical
      </button>
    </div>
  )}

  {/* Options list */}
  <div
    className="options-tabpanel"
    role="tabpanel"
    data-testid="options-tabpanel"
  >
    <fieldset>
      <legend className="sr-only">Select option</legend>
      {filteredOptions.map(option => (
        <label
          key={option.id}
          className={`option-card ${option.stock === 0 ? 'out-of-stock' : ''}`}
          data-testid={`option-label-${option.id}`}
        >
          <input
            type="radio"
            name="product-option"
            value={option.id}
            checked={selectedOptionId === option.id}
            onChange={() => handleSelect(option.id)}
            disabled={option.stock === 0}
            data-testid={`option-radio-${option.id}`}
          />

          <div className="option-content">
            <div className="option-header">
              <span className="option-title">{option.title}</span>
              <span className="option-price">
                {formatCurrency(option.price, option.currency)}
              </span>
            </div>

            <ul className="option-specs" data-testid={`option-specs-${option.id}`}>
              {option.specs.map((spec, idx) => (
                <li key={idx}>{spec}</li>
              ))}
            </ul>

            {option.stock === 0 && (
              <span className="out-of-stock-badge">Out of Stock</span>
            )}
          </div>
        </label>
      ))}
    </fieldset>
  </div>
</section>
```

### Styles

```css
.options-selector {
  padding: 0 16px 24px;
}

/* Tabs */
.options-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 24px;
}

.options-tabs button {
  flex: 1;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 3px solid transparent;
  transition: all 200ms;
}

.options-tabs button[aria-selected="true"] {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
}

/* Option cards */
.option-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border: 2px solid var(--border-subtle);
  border-radius: 8px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: border-color 200ms;
}

.option-card:has(input:checked) {
  border-color: var(--accent-primary);
  background: #FFFBF0;  /* Light gold tint */
}

.option-card.out-of-stock {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Radio button */
.option-card input[type="radio"] {
  width: 24px;
  height: 24px;
  margin-top: 2px;
  accent-color: var(--accent-primary);
}

/* Option content */
.option-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.option-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.option-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-primary);
}

/* Specs list */
.option-specs {
  list-style: disc;
  padding-left: 20px;
  font-size: 14px;
  color: var(--text-secondary);
}

.option-specs li {
  line-height: 1.4;
}

/* Out of stock badge */
.out-of-stock-badge {
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #991B1B;
  background: #FEE2E2;
  border-radius: 4px;
  text-transform: uppercase;
}
```

### Edge Cases

**Single Type (Digital OR Physical):**
```tsx
// Skip tabs layer
<div className="options-tabpanel">
  {/* Render options directly */}
</div>
```

**Single Option (No Variants):**
```tsx
// Hide radio selector, show as static info
<div className="option-single">
  <h3>{option.title}</h3>
  <p>{option.specs.join(' • ')}</p>
  <span className="price">{formatCurrency(option.price)}</span>
</div>
```

**All Options Out of Stock:**
```tsx
// Disable sticky CTA, show "Notify Me" button
<button className="notify-me">Notify When Available</button>
```

### Accessibility

- Tabs: `role="tablist"`, `aria-selected`, Arrow keys navigate
- Radio: `role="group"`, single select, Space to toggle
- Screen reader: "High-resolution JPG, 4000 by 4000 pixels, 300 DPI, 45 dollars"
- Disabled: `aria-disabled="true"` if out of stock

### Test IDs

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

---

## 4. AddToCartSticky Component

### Purpose
Bottom sticky CTA (mobile), in-flow button (desktop). Show selected price, loading state, disabled if no option selected.

### Props Interface

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

### Behavior

**Mobile (<1024px):**
- Sticky bottom, 64px height, full-width
- 16px safe area bottom (iOS notch)
- Always visible (no hide-on-scroll)
- Thumb zone priority

**Desktop (>1024px):**
- Not sticky, in-flow after options
- 56px height, CTA button style
- Center aligned

**States:**
- Disabled: No option selected (gray, no pointer)
- Loading: Spinner, text "Adding...", no tap
- Success: Checkmark icon, text "Added!", 2s auto-hide
- Error: Shake animation, show toast error

### Layout

```tsx
<div className="add-to-cart-sticky" data-testid="add-to-cart-sticky">
  <button
    className="add-to-cart-btn"
    onClick={handleAddToCart}
    disabled={!selectedOption || isLoading}
    data-testid="add-to-cart-btn"
  >
    {isLoading ? (
      <>
        <Spinner />
        Adding...
      </>
    ) : (
      <>
        Add to Cart
        <span className="arrow" aria-hidden="true">→</span>
      </>
    )}
  </button>

  {selectedOption && (
    <span className="selected-price" data-testid="add-to-cart-price">
      {formatCurrency(selectedOption.price, selectedOption.currency)}
    </span>
  )}
</div>
```

### Styles

```css
/* Mobile: Sticky bottom */
.add-to-cart-sticky {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));  /* iOS notch */
  background: var(--bg-primary);
  border-top: 1px solid var(--border-subtle);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
}

/* Desktop: In-flow */
@media (min-width: 1024px) {
  .add-to-cart-sticky {
    position: static;
    justify-content: center;
    padding: 24px 0;
    border-top: none;
    box-shadow: none;
  }
}

/* Button */
.add-to-cart-btn {
  flex: 1;
  height: 56px;
  padding: 0 32px;
  font-size: 18px;
  font-weight: 600;
  color: white;
  background: var(--accent-primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 200ms;
}

@media (min-width: 1024px) {
  .add-to-cart-btn {
    flex: none;
    min-width: 320px;
  }
}

.add-to-cart-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.add-to-cart-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.add-to-cart-btn:disabled {
  background: var(--text-muted);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Price display */
.selected-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-primary);
  white-space: nowrap;
}

@media (min-width: 1024px) {
  .selected-price {
    display: none;  /* Price already visible in options */
  }
}

/* Arrow icon */
.arrow {
  font-size: 24px;
  transition: transform 200ms;
}

.add-to-cart-btn:hover .arrow {
  transform: translateX(4px);
}
```

### States CSS

```css
/* Loading state */
.add-to-cart-btn.loading {
  pointer-events: none;
}

.add-to-cart-btn .spinner {
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 600ms linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Success state */
.add-to-cart-btn.success {
  background: #10B981;  /* Green */
  animation: pulse 300ms;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Error state */
.add-to-cart-btn.error {
  animation: shake 400ms;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}
```

### Accessibility

- Button: `aria-label="Add to cart, {price}"` if price not visible
- Disabled: `aria-disabled="true"` when no option selected
- Loading: `aria-busy="true"`, screen reader announces "Adding to cart"
- Success: `aria-live="polite"` announces "Added to cart"

### Test IDs

```typescript
'add-to-cart-sticky'
'add-to-cart-btn'
'add-to-cart-price'
```

---

## 5. RelatedProducts Component

### Purpose
Show 4-8 related products below detail content. Use same GalleryCard component from catalog. Horizontal carousel mobile, grid desktop.

### Props Interface

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
  limit?: number  // Default 8
  'data-testid'?: string
}
```

### Layout

```tsx
<section className="related-products" data-testid="related-products">
  <h2 className="section-title">You May Also Like</h2>

  <div className="related-products-carousel" data-testid="related-products-carousel">
    {products.slice(0, limit).map(product => (
      <GalleryCard
        key={product.id}
        product={product}
        variant="art-gallery"
        data-testid={`related-product-card-${product.id}`}
      />
    ))}
  </div>
</section>
```

### Styles

```css
.related-products {
  padding: 48px 16px;
  background: var(--bg-secondary);
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
}

@media (min-width: 1024px) {
  .section-title {
    font-size: 24px;
  }
}

/* Mobile: Horizontal scroll carousel */
.related-products-carousel {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.related-products-carousel > * {
  flex-shrink: 0;
  width: 280px;
  scroll-snap-align: start;
}

/* Tablet: 2 cols grid */
@media (min-width: 640px) {
  .related-products-carousel {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    overflow-x: visible;
  }

  .related-products-carousel > * {
    width: auto;
  }
}

/* Desktop: 3-4 cols grid */
@media (min-width: 1024px) {
  .related-products-carousel {
    grid-template-columns: repeat(4, 1fr);
    gap: 32px;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Performance

- Lazy load: Below fold, intersection observer trigger
- Code split: Separate chunk (dynamic import)
- Limit: 8 products max (keep bundle small)
- Images: WebP lazy, 400x400px (~20KB each)

### Accessibility

- Semantic: `<section>` with `<h2>` title
- Carousel: Arrow keys navigate (future)
- Focus: Visible outline on cards

### Test IDs

```typescript
'related-products'
'related-products-carousel'
'related-product-card-{id}'
```

---

## 6. Accordion Section (Details)

### Purpose
Collapsible sections for Dimensions, Materials, Shipping. Save mobile space, expand on demand.

### Props Interface

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

### Layout

```tsx
<div className="accordion-sections">
  {sections.map(section => (
    <details
      key={section.id}
      className="accordion-section"
      open={section.defaultExpanded}
      data-testid={`accordion-section-${section.id}`}
    >
      <summary
        className="accordion-toggle"
        data-testid={`accordion-toggle-${section.id}`}
      >
        {section.title}
        <span className="chevron" aria-hidden="true">▼</span>
      </summary>

      <div
        className="accordion-content"
        data-testid={`accordion-content-${section.id}`}
      >
        {section.content}
      </div>
    </details>
  ))}
</div>
```

### Styles

```css
.accordion-section {
  border-bottom: 1px solid var(--border-subtle);
}

.accordion-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  list-style: none;  /* Hide default marker */
}

.accordion-toggle::-webkit-details-marker {
  display: none;
}

.accordion-toggle .chevron {
  font-size: 12px;
  color: var(--text-secondary);
  transition: transform 300ms;
}

.accordion-section[open] .chevron {
  transform: rotate(180deg);
}

.accordion-content {
  padding-bottom: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
  animation: accordion-expand 300ms ease-out;
}

@keyframes accordion-expand {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Content Examples

```typescript
const sections = [
  {
    id: 'dimensions',
    title: 'Dimensions',
    content: '40 × 60 cm (16 × 24 in)',
  },
  {
    id: 'materials',
    title: 'Materials & Care',
    content: 'Canvas, archival ink. Wipe clean with dry cloth. Avoid direct sunlight.',
  },
  {
    id: 'shipping',
    title: 'Shipping Info',
    content: 'Ships within 3-5 business days. Free shipping over $100. Tracked delivery.',
  },
]
```

### Accessibility

- Semantic: `<details>` native accordion
- Keyboard: Enter/Space to toggle
- Screen reader: "Dimensions, button, collapsed" → "Dimensions, button, expanded"

### Test IDs

```typescript
'accordion-section-{id}'
'accordion-toggle-{id}'
'accordion-content-{id}'
```

---

## Component File Structure

```
components/
├─ storefront/
│  ├─ ProductDetailLayout.tsx       # Wrapper layout (grid, responsive)
│  ├─ ImageGallery.tsx              # Main + thumbnails + zoom
│  ├─ ProductInfo.tsx               # Title, artist, price, description
│  ├─ OptionsSelector.tsx           # Tabs + radio options
│  ├─ AddToCartSticky.tsx           # Bottom CTA mobile, in-flow desktop
│  ├─ RelatedProducts.tsx           # Carousel/grid of GalleryCard
│  └─ AccordionSection.tsx          # Collapsible details sections
└─ ui/
   ├─ Icon.tsx                      # SVG icons (chevron, close, etc)
   ├─ Spinner.tsx                   # Loading spinner
   └─ Modal.tsx                     # Zoom lightbox (shared)
```

---

## Props Type Definitions

```typescript
// types/product-detail.ts

export interface ProductImage {
  id: string
  url: string
  alt: string
  lqip?: string
  width: number
  height: number
}

export interface ProductOption {
  id: string
  type: 'digital' | 'physical'
  title: string
  specs: string[]
  price: number
  currency: string
  stock: number
  sku: string
}

export interface ProductArtist {
  id: string
  name: string
  slug: string
}

export interface ProductRating {
  average: number  // 0-5
  count: number
}

export interface ProductDetail {
  id: string
  name: string
  artist?: ProductArtist
  price: number  // Base price or minimum if options
  currency: string
  priceType: 'fixed' | 'from'
  rating?: ProductRating
  description: string
  images: ProductImage[]
  options: ProductOption[]
  details: {
    dimensions?: string
    materials?: string
    care?: string
    shipping?: string
  }
  relatedProducts?: string[]  // Product IDs
}
```

---

## State Management

### Client Wrapper Component

```tsx
// components/storefront/ProductDetailWrapper.tsx
'use client'

import { useState } from 'react'
import { useCartStore } from '@/stores/cart'
import { ImageGallery } from './ImageGallery'
import { ProductInfo } from './ProductInfo'
import { OptionsSelector } from './OptionsSelector'
import { AddToCartSticky } from './AddToCartSticky'

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
      // Show success toast, or redirect to cart
    } catch (error) {
      // Show error toast
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="product-detail-wrapper">
      <ImageGallery
        images={product.images}
        productName={product.name}
        artistName={product.artist?.name}
      />

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

---

## Test IDs Complete List

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
'image-thumbnail-{index}'
'image-zoom-modal'

// Product Info
'product-info'
'product-title'
'product-artist-link'
'product-rating'
'product-price'
'product-description'

// Options Selector
'options-selector'
'options-tabs'
'options-tab-digital'
'options-tab-physical'
'options-tabpanel'
'option-radio-{id}'
'option-label-{id}'
'option-specs-{id}'

// Accordion
'accordion-section-{id}'
'accordion-toggle-{id}'
'accordion-content-{id}'

// Add to Cart
'add-to-cart-sticky'
'add-to-cart-btn'
'add-to-cart-price'

// Related Products
'related-products'
'related-products-carousel'
'related-product-card-{id}'
```

---

## Performance Budget

| Component | JS Size | Render | Lazy Load |
|-----------|---------|--------|-----------|
| ImageGallery | ~8KB | Eager | Thumbnails lazy |
| ProductInfo | ~2KB | Eager | - |
| OptionsSelector | ~4KB | Eager | - |
| AddToCartSticky | ~3KB | Eager | - |
| RelatedProducts | ~6KB | Lazy | On scroll |
| AccordionSection | ~2KB | Eager | - |
| **Total Core** | **~19KB** | **<2s TTI** | **Main bundle** |
| **Total with Related** | **~25KB** | **<2.5s** | **+Lazy chunk** |

**Target:** <80KB total bundle gzip (includes Next.js runtime, React, Zustand cart store).

---

## Accessibility Checklist

- [ ] Semantic HTML (`<main>`, `<article>`, `<header>`, `<section>`)
- [ ] ARIA labels on icon-only buttons
- [ ] ARIA roles on tabs, radio groups
- [ ] ARIA live regions for cart updates
- [ ] Focus visible on all interactive elements
- [ ] Keyboard navigation (Tab, Enter, Space, Arrow keys)
- [ ] Screen reader tested (VoiceOver, NVDA)
- [ ] Color contrast WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Tap targets 48x48px minimum mobile
- [ ] Font size 16px+ mobile (iOS no-zoom)

---

**Status:** Component specs complete. Props interfaces, layouts, styles, states, test IDs, performance budget documented. Ready for Pixel implementation handoff.
