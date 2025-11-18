# SKY-43: Gallery Template - Icon Pack

> SVG icon system for mobile-first gallery QR experience
> Created: 2025-01-17

---

## Context

Mobile tap targets (48x48px). Simple line icons (performance). High contrast (WCAG AA). SVG sprite + individual files.

---

## Icon Categories

1. **Action Icons** (8) - User interactions
2. **Product Type Icons** (6) - Digital/physical differentiation
3. **UI Icons** (8) - Navigation, system
4. **Status Icons** (4) - Badge states

**Total:** 26 icons

---

## 1. Action Icons (User Interactions)

### Heart (Wishlist)

**States:** Outline (default), Fill (active)

```svg
<!-- heart-outline.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"/>
</svg>

<!-- heart-fill.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="currentColor"/>
</svg>
```

**Usage:**
- Default: Outline (not in wishlist)
- Active: Fill (in wishlist, accent color)
- Tap target: 48x48px button

---

### Quick View (Magnifying Glass)

```svg
<!-- quick-view.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="11" cy="11" r="8"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"/>
  <path d="M21 21l-4.35-4.35"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"/>
</svg>
```

**Usage:**
- Card: "Quick View" button
- Tap target: 48x48px

---

### Add to Cart (Shopping Bag)

```svg
<!-- cart.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"/>
  <line x1="3" y1="6" x2="21" y2="6"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"/>
  <path d="M16 10a4 4 0 01-8 0"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"/>
</svg>
```

**Usage:**
- Quick View: "Add to Cart" button
- Product detail: Sticky CTA

---

### Eye (View Details)

```svg
<!-- eye.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"/>
  <circle cx="12" cy="12" r="3"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"/>
</svg>
```

**Usage:**
- Quick View: "View Full Details" link
- Card: Secondary action

---

### Download (Digital Products)

```svg
<!-- download.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"/>
  <polyline points="7 10 12 15 17 10"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"/>
  <line x1="12" y1="15" x2="12" y2="3"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"/>
</svg>
```

**Usage:**
- Digital products: Download indicator
- Quick View: Digital option icon

---

### Ruler (Size Guide)

```svg
<!-- ruler.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 4l7.07 7.07M4 4v16l16-16"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"/>
  <line x1="8" y1="8" x2="10" y2="10"
        stroke="currentColor"
        stroke-width="2"/>
  <line x1="12" y1="12" x2="14" y2="14"
        stroke="currentColor"
        stroke-width="2"/>
  <line x1="16" y1="16" x2="18" y2="18"
        stroke="currentColor"
        stroke-width="2"/>
</svg>
```

**Usage:**
- Physical products: Size guide link
- Product detail: Sizing info

---

### Star (Rating)

**States:** Outline (empty), Fill (active)

```svg
<!-- star-outline.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
           stroke="currentColor"
           stroke-width="2"
           stroke-linecap="round"
           stroke-linejoin="round"/>
</svg>

<!-- star-fill.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
           fill="currentColor"/>
</svg>
```

**Usage:**
- Product detail: Rating display
- Reviews section

---

### Share

```svg
<!-- share.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="18" cy="5" r="3"
          stroke="currentColor"
          stroke-width="2"/>
  <circle cx="6" cy="12" r="3"
          stroke="currentColor"
          stroke-width="2"/>
  <circle cx="18" cy="19" r="3"
          stroke="currentColor"
          stroke-width="2"/>
  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"
        stroke="currentColor"
        stroke-width="2"/>
  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"
        stroke="currentColor"
        stroke-width="2"/>
</svg>
```

**Usage:**
- Product detail: Share artwork
- Header: Share catalog

---

## 2. Product Type Icons (Digital/Physical)

### Digital (Monitor/Download)

```svg
<!-- type-digital.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="3" width="20" height="14" rx="2"
        stroke="currentColor"
        stroke-width="2"/>
  <line x1="8" y1="21" x2="16" y2="21"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"/>
  <line x1="12" y1="17" x2="12" y2="21"
        stroke="currentColor"
        stroke-width="2"/>
  <path d="M12 10l-3 3h6l-3-3z"
        fill="currentColor"/>
</svg>
```

**Usage:**
- Badge: Digital product type
- Quick View: Digital option icon

---

### Canvas Print

```svg
<!-- type-canvas.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="18" height="18"
        stroke="currentColor"
        stroke-width="2"/>
  <path d="M3 3l18 18M21 3L3 21"
        stroke="currentColor"
        stroke-width="1"
        opacity="0.3"/>
</svg>
```

**Usage:**
- Quick View: Canvas option
- Product detail: Canvas specs

---

### Poster/Print

```svg
<!-- type-poster.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="2" width="16" height="20" rx="1"
        stroke="currentColor"
        stroke-width="2"/>
  <line x1="8" y1="6" x2="16" y2="6"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"/>
  <line x1="8" y1="10" x2="16" y2="10"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"/>
  <line x1="8" y1="14" x2="12" y2="14"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"/>
</svg>
```

---

### Framed Print

```svg
<!-- type-framed.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="20" height="20"
        stroke="currentColor"
        stroke-width="3"/>
  <rect x="5" y="5" width="14" height="14"
        stroke="currentColor"
        stroke-width="1"/>
</svg>
```

---

### Physical (Box)

```svg
<!-- type-physical.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"/>
  <polyline points="3.27 6.96 12 12.01 20.73 6.96"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"/>
  <line x1="12" y1="22.08" x2="12" y2="12"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"/>
</svg>
```

**Usage:**
- Badge: Physical product type
- Quick View: Physical option icon

---

### Bundle/Set

```svg
<!-- type-bundle.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="8" height="8"
        stroke="currentColor"
        stroke-width="2"/>
  <rect x="13" y="3" width="8" height="8"
        stroke="currentColor"
        stroke-width="2"/>
  <rect x="3" y="13" width="8" height="8"
        stroke="currentColor"
        stroke-width="2"/>
  <rect x="13" y="13" width="8" height="8"
        stroke="currentColor"
        stroke-width="2"/>
</svg>
```

---

## 3. UI Icons (Navigation, System)

### Menu (Hamburger)

```svg
<!-- menu.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="3" y1="6" x2="21" y2="6"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"/>
  <line x1="3" y1="12" x2="21" y2="12"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"/>
  <line x1="3" y1="18" x2="21" y2="18"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"/>
</svg>
```

---

### Search

```svg
<!-- search.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="11" cy="11" r="8"
          stroke="currentColor"
          stroke-width="2"/>
  <line x1="21" y1="21" x2="16.65" y2="16.65"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"/>
</svg>
```

---

### Close (X)

```svg
<!-- close.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="18" y1="6" x2="6" y2="18"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"/>
  <line x1="6" y1="6" x2="18" y2="18"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"/>
</svg>
```

---

### Arrow Right

```svg
<!-- arrow-right.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="5" y1="12" x2="19" y2="12"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"/>
  <polyline points="12 5 19 12 12 19"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"/>
</svg>
```

---

### Arrow Left (Back)

```svg
<!-- arrow-left.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="19" y1="12" x2="5" y2="12"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"/>
  <polyline points="12 19 5 12 12 5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"/>
</svg>
```

---

### Chevron Down

```svg
<!-- chevron-down.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <polyline points="6 9 12 15 18 9"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"/>
</svg>
```

---

### Settings (Gear)

```svg
<!-- settings.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="3"
          stroke="currentColor"
          stroke-width="2"/>
  <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"/>
</svg>
```

---

### Filter

```svg
<!-- filter.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
           stroke="currentColor"
           stroke-width="2"
           stroke-linecap="round"
           stroke-linejoin="round"/>
</svg>
```

---

## 4. Status Icons (Badge States)

### Check (Success)

```svg
<!-- check.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <polyline points="20 6 9 17 4 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"/>
</svg>
```

---

### Alert (Warning)

```svg
<!-- alert.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"/>
  <line x1="12" y1="9" x2="12" y2="13"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"/>
  <circle cx="12" cy="17" r="1" fill="currentColor"/>
</svg>
```

---

### Info

```svg
<!-- info.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10"
          stroke="currentColor"
          stroke-width="2"/>
  <line x1="12" y1="16" x2="12" y2="12"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"/>
  <circle cx="12" cy="8" r="1" fill="currentColor"/>
</svg>
```

---

### Lightning (Featured)

```svg
<!-- lightning.svg -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
           stroke="currentColor"
           stroke-width="2"
           stroke-linecap="round"
           stroke-linejoin="round"/>
</svg>
```

---

## SVG Sprite Implementation

### sprite.svg (All icons combined)

```svg
<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
  <!-- Action Icons -->
  <symbol id="icon-heart-outline" viewBox="0 0 24 24">
    <path d="..." stroke="currentColor" stroke-width="2" fill="none"/>
  </symbol>

  <symbol id="icon-heart-fill" viewBox="0 0 24 24">
    <path d="..." fill="currentColor"/>
  </symbol>

  <symbol id="icon-quick-view" viewBox="0 0 24 24">
    <!-- ... -->
  </symbol>

  <!-- ... all other icons ... -->
</svg>
```

**Usage:**

```tsx
// Icon component
<svg className="icon icon-md">
  <use href="#icon-heart-outline" />
</svg>
```

---

## Icon Sizing

| Size | Dimension | Use |
|------|-----------|-----|
| **xs** | 16x16px | Badge icons, inline text |
| **sm** | 20x20px | Small buttons, meta |
| **md** | 24x24px | Default, action buttons |
| **lg** | 32x32px | Large buttons, hero |
| **xl** | 48x48px | Tap targets (with padding) |

---

## Icon Colors

```css
/* Default: Inherit text color */
.icon {
  color: currentColor;
}

/* Accent (CTA, active states) */
.icon-accent {
  color: var(--color-accent-primary);
}

/* Muted (disabled, secondary) */
.icon-muted {
  color: var(--color-text-muted);
}

/* Inverse (on dark backgrounds) */
.icon-inverse {
  color: var(--color-text-inverse);
}
```

---

## Performance

### File Sizes

- Individual SVG: ~0.5KB each
- Sprite (all 26): ~13KB
- Gzip: ~5KB

### Optimization

```bash
# SVGO optimization
svgo --multipass --pretty \
     --enable=removeDoctype \
     --enable=removeXMLProcInst \
     --enable=removeComments \
     --enable=removeMetadata \
     --enable=removeEditorsNSData \
     --enable=cleanupIDs \
     icons/*.svg
```

### Loading Strategy

```tsx
// Critical: Inline sprite in layout
<svg style={{ display: 'none' }}>
  {/* Sprite symbols */}
</svg>

// Non-critical: Lazy load individual SVGs
import HeartIcon from '@/icons/heart-outline.svg'
```

---

## Accessibility

### ARIA Labels

```tsx
// Icon-only button
<button aria-label="Add to wishlist">
  <Icon name="heart-outline" />
</button>

// Icon + text
<button>
  <Icon name="cart" aria-hidden="true" />
  Add to Cart
</button>
```

### Focus States

```css
.icon-button:focus {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}
```

---

## Handoff Files

### Deliverables

```
icons/
├── sprite.svg                    # All icons combined
├── action/
│   ├── heart-outline.svg
│   ├── heart-fill.svg
│   ├── quick-view.svg
│   ├── cart.svg
│   ├── eye.svg
│   ├── download.svg
│   ├── ruler.svg
│   ├── star-outline.svg
│   ├── star-fill.svg
│   └── share.svg
├── type/
│   ├── digital.svg
│   ├── canvas.svg
│   ├── poster.svg
│   ├── framed.svg
│   ├── physical.svg
│   └── bundle.svg
├── ui/
│   ├── menu.svg
│   ├── search.svg
│   ├── close.svg
│   ├── arrow-right.svg
│   ├── arrow-left.svg
│   ├── chevron-down.svg
│   ├── settings.svg
│   └── filter.svg
└── status/
    ├── check.svg
    ├── alert.svg
    ├── info.svg
    └── lightning.svg
```

### React Component

```tsx
// components/ui/Icon.tsx
interface IconProps {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  className?: string
  'aria-label'?: string
  'aria-hidden'?: boolean
}

export function Icon({
  name,
  size = 'md',
  color,
  className,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
}: IconProps) {
  return (
    <svg
      className={`icon icon-${size} ${className || ''}`}
      style={{ color }}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      role={ariaLabel ? 'img' : undefined}
    >
      <use href={`#icon-${name}`} />
    </svg>
  )
}
```

---

**Status:** Icon pack complete. Next: Master design specs doc.
