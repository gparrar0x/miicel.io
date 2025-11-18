# SKY-43: Gallery Template - Design System

> Comprehensive token system + components for mobile-first gallery QR experience
> Created: 2025-01-17

---

## Context

Mobile-first (100% QR traffic). Gallery White palette default. Performance <80KB bundle. WCAG AA minimum.

---

## Design Tokens

### Color Tokens (Gallery White Default)

```css
:root {
  /* Background */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #FAFAFA;
  --color-bg-tertiary: #F5F5F5;

  /* Text */
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #666666;
  --color-text-muted: #999999;
  --color-text-inverse: #FFFFFF;

  /* Accent */
  --color-accent-primary: #B8860B;
  --color-accent-hover: #9A7209;
  --color-accent-active: #7D5C07;

  /* Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  /* Border */
  --color-border-subtle: #E5E5E5;
  --color-border-default: #D1D5DB;
  --color-border-strong: #9CA3AF;

  /* Shadow */
  --shadow-color-soft: rgba(0, 0, 0, 0.08);
  --shadow-color-medium: rgba(0, 0, 0, 0.12);
  --shadow-color-strong: rgba(0, 0, 0, 0.16);

  /* Badge Colors */
  --badge-digital-bg: #EFF6FF;
  --badge-digital-text: #1E40AF;
  --badge-digital-border: #3B82F6;

  --badge-physical-bg: #FEF3C7;
  --badge-physical-text: #92400E;
  --badge-physical-border: #F59E0B;

  --badge-both-bg: #F3E8FF;
  --badge-both-text: #6B21A8;
  --badge-both-border: #A855F7;

  --badge-new-bg: #FEF3C7;
  --badge-new-text: #92400E;
  --badge-new-border: #F59E0B;

  --badge-limited-bg: #FEE2E2;
  --badge-limited-text: #991B1B;
  --badge-limited-border: #EF4444;

  --badge-featured-bg: #FEF3C7;
  --badge-featured-text: #854D0E;
  --badge-featured-border: #EAB308;
}
```

### Typography Tokens

```css
:root {
  /* Font Family */
  --font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
                      'Helvetica Neue', Arial, sans-serif;
  --font-family-serif: 'Georgia', 'Times New Roman', serif;

  /* Font Size (Mobile-First) */
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;   /* iOS no-zoom minimum */
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 32px;
  --font-size-4xl: 48px;

  /* Font Weight */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Line Height */
  --line-height-tight: 1.2;
  --line-height-normal: 1.4;
  --line-height-relaxed: 1.6;
  --line-height-loose: 1.8;

  /* Letter Spacing */
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.02em;
  --letter-spacing-wider: 0.05em;
}
```

### Spacing Tokens (8px Base)

```css
:root {
  /* Spacing Scale */
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;   /* Mobile edge padding */
  --space-5: 20px;
  --space-6: 24px;   /* Card gap tablet */
  --space-8: 32px;   /* Card gap desktop */
  --space-12: 48px;  /* Section spacing */
  --space-16: 64px;
  --space-24: 96px;

  /* Component-Specific Spacing */
  --spacing-card-padding: var(--space-4);         /* 16px mobile */
  --spacing-card-gap: var(--space-4);             /* 16px mobile */
  --spacing-edge-mobile: var(--space-4);          /* 16px */
  --spacing-edge-tablet: var(--space-5);          /* 20px */
  --spacing-edge-desktop: var(--space-6);         /* 24px */
}
```

### Sizing Tokens

```css
:root {
  /* Tap Targets (Mobile-First) */
  --tap-target-min: 48px;      /* WCAG 2.5.5 AA */
  --tap-target-comfortable: 56px;

  /* Icon Sizes */
  --icon-xs: 16px;
  --icon-sm: 20px;
  --icon-md: 24px;
  --icon-lg: 32px;
  --icon-xl: 48px;

  /* Component Heights */
  --height-header: 56px;
  --height-filter-bar: 48px;
  --height-button-sm: 40px;
  --height-button-md: 48px;
  --height-button-lg: 56px;
  --height-cta-sticky: 72px;   /* 48px button + 24px padding */

  /* Container Max Width */
  --container-max: 1200px;
  --container-narrow: 960px;
  --container-wide: 1440px;
}
```

### Border Tokens

```css
:root {
  /* Border Width */
  --border-width-thin: 1px;
  --border-width-default: 2px;
  --border-width-thick: 3px;

  /* Border Radius */
  --radius-none: 0;            /* Gallery aesthetic: sharp corners */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Border Styles */
  --border-style-solid: solid;
  --border-style-dashed: dashed;
}
```

### Shadow Tokens

```css
:root {
  /* Elevation Shadows */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px var(--shadow-color-soft);
  --shadow-md: 0 4px 8px var(--shadow-color-soft);
  --shadow-lg: 0 8px 16px var(--shadow-color-medium);
  --shadow-xl: 0 12px 24px var(--shadow-color-medium);
  --shadow-2xl: 0 20px 40px var(--shadow-color-strong);

  /* Focus Shadow */
  --shadow-focus: 0 0 0 2px var(--color-accent-primary);
}
```

### Animation Tokens

```css
:root {
  /* Duration */
  --duration-instant: 100ms;
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-moderate: 300ms;
  --duration-slow: 500ms;

  /* Easing */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* Transitions */
  --transition-fast: var(--duration-fast) var(--ease-out);
  --transition-normal: var(--duration-normal) var(--ease-out);
  --transition-slow: var(--duration-slow) var(--ease-out);
}
```

### Breakpoint Tokens

```css
:root {
  /* Breakpoints (Mobile-First) */
  --breakpoint-mobile-portrait: 0px;        /* <640px */
  --breakpoint-mobile-landscape: 640px;     /* 640-900px */
  --breakpoint-tablet: 900px;               /* 900-1024px */
  --breakpoint-desktop: 1024px;             /* >1024px */
}
```

---

## Component Library

### Atoms

#### Button

**Variants:**
- Primary (CTA)
- Secondary (Quick View)
- Tertiary (Text only)
- Icon (Wishlist)

**Specs:**

```css
/* Primary Button */
.button-primary {
  min-height: var(--tap-target-min);        /* 48px */
  padding: 0 var(--space-6);                /* 0 24px */
  background: var(--color-accent-primary);
  color: var(--color-text-inverse);
  font-size: var(--font-size-base);        /* 16px */
  font-weight: var(--font-weight-semibold);
  border: none;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.button-primary:hover {
  background: var(--color-accent-hover);
}

.button-primary:active {
  transform: scale(0.98);
  background: var(--color-accent-active);
}

/* Secondary Button */
.button-secondary {
  min-height: var(--tap-target-min);
  padding: 0 var(--space-6);
  background: transparent;
  color: var(--color-text-primary);
  border: var(--border-width-default) solid var(--color-border-default);
  border-radius: var(--radius-sm);
  /* ... */
}

/* Icon Button */
.button-icon {
  width: var(--tap-target-min);
  height: var(--tap-target-min);
  padding: 0;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

**React Component:**

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  'data-testid'?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  'data-testid': testId,
}: ButtonProps) {
  return (
    <button
      className={`button button-${variant} button-${size}`}
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
    >
      {children}
    </button>
  )
}
```

---

#### Badge

**Variants:**
- Type (Digital, Physical, Both)
- Status (New, Limited, Featured)

**Specs:**

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);     /* 4px 8px */
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  border-radius: var(--radius-sm);
  border: var(--border-width-thin) solid;
}

/* Type Badges */
.badge-digital {
  background: var(--badge-digital-bg);
  color: var(--badge-digital-text);
  border-color: var(--badge-digital-border);
}

.badge-physical {
  background: var(--badge-physical-bg);
  color: var(--badge-physical-text);
  border-color: var(--badge-physical-border);
}

.badge-both {
  background: var(--badge-both-bg);
  color: var(--badge-both-text);
  border-color: var(--badge-both-border);
}

/* Status Badges */
.badge-new {
  background: var(--badge-new-bg);
  color: var(--badge-new-text);
  border-color: var(--badge-new-border);
}

.badge-limited {
  background: var(--badge-limited-bg);
  color: var(--badge-limited-text);
  border-color: var(--badge-limited-border);
}

.badge-featured {
  background: var(--badge-featured-bg);
  color: var(--badge-featured-text);
  border-color: var(--badge-featured-border);
}
```

**React Component:**

```tsx
interface BadgeProps {
  variant: 'digital' | 'physical' | 'both' | 'new' | 'limited' | 'featured'
  children: React.ReactNode
  position?: 'top-left' | 'top-right'
  'data-testid'?: string
}

export function Badge({
  variant,
  children,
  position = 'top-left',
  'data-testid': testId,
}: BadgeProps) {
  return (
    <span
      className={`badge badge-${variant} badge-position-${position}`}
      data-testid={testId}
    >
      {children}
    </span>
  )
}
```

---

#### Icon

**Specs:**

```css
.icon {
  display: inline-block;
  width: var(--icon-md);     /* 24px default */
  height: var(--icon-md);
  color: currentColor;
}

.icon-sm { width: var(--icon-sm); height: var(--icon-sm); }
.icon-md { width: var(--icon-md); height: var(--icon-md); }
.icon-lg { width: var(--icon-lg); height: var(--icon-lg); }
.icon-xl { width: var(--icon-xl); height: var(--icon-xl); }
```

**React Component:**

```tsx
interface IconProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  'data-testid'?: string
}

export function Icon({
  name,
  size = 'md',
  color,
  'data-testid': testId,
}: IconProps) {
  return (
    <svg
      className={`icon icon-${size}`}
      style={{ color }}
      data-testid={testId}
    >
      <use href={`#icon-${name}`} />
    </svg>
  )
}
```

---

### Molecules

#### Product Card (Art Gallery Variant)

**Structure:**

```tsx
<article className="product-card" data-testid="product-card-gallery">
  <div className="card-image">
    <Image src={artwork} alt={title} />
    <Badge type={type} position="top-left" />
    {status && <Badge status={status} position="top-right" />}
  </div>

  <div className="card-info">
    <h3 className="card-title">{title}</h3>
    <p className="card-meta">
      <span className="card-price">{price}</span>
      {optionsCount && <span className="card-options">{optionsCount} formats</span>}
    </p>

    <div className="card-actions">
      <button className="action-wishlist" aria-label="Add to wishlist">
        <Icon name="heart" />
      </button>
      <button className="action-quickview" onClick={openQuickView}>
        Quick View
      </button>
    </div>
  </div>
</article>
```

**Specs:**
- Image: 1:1 aspect, 100% width mobile
- Info: 16px padding, 8px vertical spacing
- Title: 16px, font-weight 600, 2 lines max
- Price: 16px, font-weight 700, accent color
- Actions: 48x48px tap targets, 8px gap

---

#### Quick View Modal

**Structure:**

```tsx
<div className="modal-backdrop" onClick={handleClose}>
  <div className="modal-content" onClick={e => e.stopPropagation()}>
    <button className="modal-close" onClick={handleClose}>
      <Icon name="close" />
    </button>

    <div className="modal-image">
      <Image src={artwork} alt={title} />
    </div>

    <div className="modal-info">
      <h2 className="modal-title">{title}</h2>
      <p className="modal-artist">by {artist}</p>

      <div className="modal-options">
        {options.map(option => (
          <div className="option-card" key={option.id}>
            <div className="option-header">
              <Icon name={option.icon} />
              <h3>{option.title}</h3>
            </div>
            <ul className="option-specs">
              {option.specs.map(spec => <li>{spec}</li>)}
            </ul>
            <div className="option-footer">
              <span className="option-price">{option.price}</span>
              <Button variant="primary">Add to Cart</Button>
            </div>
          </div>
        ))}
      </div>

      <a href={detailUrl} className="modal-detail-link">
        View Full Details →
      </a>
    </div>
  </div>
</div>
```

**Specs:**
- Backdrop: rgba(0,0,0,0.6), tap to close
- Modal: Full-screen mobile, slide-up 300ms
- Close: 48x48px tap target, top-right
- Image: 360px height (1:1), full width
- Options: Card layout, 48px padding, 16px gap

---

### Organisms

#### Product Grid

**Structure:**

```tsx
<div className="product-grid" data-testid="product-grid">
  {products.map(product => (
    <GalleryCard key={product.id} product={product} />
  ))}
</div>
```

**Responsive CSS:**

```css
/* Mobile Portrait: 1 col */
.product-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-card-gap);      /* 16px */
  padding: 0 var(--spacing-edge-mobile);
}

/* Mobile Landscape: 2 cols */
@media (min-width: 640px) {
  .product-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-card-gap);
  }
}

/* Tablet: 3 cols */
@media (min-width: 900px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);              /* 24px */
    padding: 0 var(--spacing-edge-tablet);
  }
}

/* Desktop: 3 cols, max width */
@media (min-width: 1024px) {
  .product-grid {
    gap: var(--space-8);              /* 32px */
    max-width: var(--container-max);
    margin: 0 auto;
    padding: 0 var(--spacing-edge-desktop);
  }
}
```

---

#### Header

**Structure:**

```tsx
<header className="site-header" data-testid="site-header">
  <button className="header-menu" aria-label="Menu">
    <Icon name="menu" />
  </button>

  <h1 className="header-logo">
    <a href="/">{tenantName}</a>
  </h1>

  <div className="header-actions">
    <button className="header-search" aria-label="Search">
      <Icon name="search" />
    </button>
    <button className="header-cart" aria-label="Cart">
      <Icon name="cart" />
      {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
    </button>
  </div>
</header>
```

**Specs:**
- Height: 56px
- Sticky: top 0, z-index 100
- Logo: center, 18px font-size
- Icons: 48x48px tap targets

---

#### Filter Bar

**Structure:**

```tsx
<div className="filter-bar" data-testid="filter-bar">
  <button className="filter-type" onClick={openTypeFilter}>
    Type ▼
  </button>

  <span className="filter-count">{count} artworks</span>

  <button className="filter-sort" onClick={openSortMenu}>
    Sort ▼
  </button>

  <button className="filter-settings" aria-label="Settings">
    <Icon name="settings" />
  </button>
</div>
```

**Specs:**
- Height: 48px
- Sticky: below header
- Buttons: 48px height tap targets
- Font: 14px

---

## Typography Scale

### Mobile Portrait (<640px)

| Element | Size | Weight | Line Height | Use |
|---------|------|--------|-------------|-----|
| **H1** | 24px | 700 | 1.2 | Page title |
| **H2** | 20px | 700 | 1.2 | Section title |
| **H3** | 18px | 600 | 1.4 | Card title (detail) |
| **H4** | 16px | 600 | 1.4 | Card title (catalog) |
| **Body** | 16px | 400 | 1.6 | Description |
| **Small** | 14px | 400 | 1.4 | Meta, caption |
| **Tiny** | 12px | 400 | 1.4 | Legal, footnote |

### Desktop (>1024px)

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| **H1** | 32px | 700 | 1.2 |
| **H2** | 24px | 700 | 1.2 |
| **H3** | 20px | 600 | 1.4 |
| **H4** | 18px | 600 | 1.4 |
| **Body** | 18px | 400 | 1.6 |
| **Small** | 16px | 400 | 1.4 |
| **Tiny** | 14px | 400 | 1.4 |

---

## Animation Patterns

### Card Tap (Mobile)

```css
.product-card:active {
  transform: scale(0.98);
  transition: transform var(--duration-instant) var(--ease-out);
}
```

### Card Hover (Desktop)

```css
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  transition: all var(--duration-moderate) var(--ease-out);
}

.product-card:hover .card-image img {
  transform: scale(1.03);
  transition: transform var(--duration-slow) var(--ease-out);
}
```

### Modal Open (Mobile)

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
  animation: modal-slide-up var(--duration-moderate) var(--ease-out);
}
```

### Skeleton Pulse (Loading)

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

## Accessibility Standards

### WCAG AA Compliance

- **Contrast:** 4.5:1 text minimum (Gallery White = 12.6:1)
- **Tap targets:** 48x48px minimum (2.5.5 AA)
- **Font size:** 16px+ mobile (no iOS zoom)
- **Focus indicators:** 2px outline, visible
- **Alt text:** Descriptive (artwork title + artist)
- **ARIA labels:** Icon buttons, state changes
- **Keyboard nav:** Tab order logical

---

## Performance Standards

### Bundle Targets

- **Core JS:** <50KB gzip
- **Components:** <30KB gzip
- **Total:** <80KB gzip
- **Critical CSS:** <14KB inline

### Image Optimization

- **Format:** WebP primary, JPEG fallback
- **Mobile:** 800x800px max (~40KB WebP)
- **LQIP:** 20x20px base64 (<1KB inline)
- **Lazy load:** Below fold only

### TTI Targets

- **Mobile 3G:** <2s (gallery WiFi weak)
- **Mobile 4G:** <1s
- **Desktop:** <0.5s

---

## Handoff Checklist

### Files to Create

- [ ] `styles/tokens.css` (design tokens)
- [ ] `components/ui/Button.tsx`
- [ ] `components/ui/Badge.tsx`
- [ ] `components/ui/Icon.tsx`
- [ ] `components/storefront/GalleryCard.tsx`
- [ ] `components/storefront/QuickViewModal.tsx`
- [ ] `components/storefront/ProductGrid.tsx`
- [ ] `components/layout/Header.tsx`
- [ ] `components/layout/FilterBar.tsx`

### Token Implementation

```tsx
// tokens.ts
export const tokens = {
  color: {
    bg: {
      primary: '#FFFFFF',
      secondary: '#FAFAFA',
      // ...
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
      // ...
    },
    // ...
  },
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    // ...
  },
  // ...
}
```

### Test IDs

```tsx
// Test ID convention
'product-card-gallery'
'card-image'
'card-title'
'card-price'
'action-wishlist'
'action-quickview'
'badge-type-digital'
'badge-status-new'
'modal-quickview'
'modal-close'
'product-grid'
'site-header'
'filter-bar'
```

---

**Status:** Design system complete. Next: Icon pack.
