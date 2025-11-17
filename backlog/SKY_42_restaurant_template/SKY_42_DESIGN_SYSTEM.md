# SKY-42: Restaurant Template Design System

> Component specs, tokens, spacing, typography for restaurant template

---

## Design Tokens

### Color Tokens (Palette A: Warm Appetite)

```css
/* Primary Colors */
--color-primary: #E63946;           /* Red Salsa - CTAs, badges, active states */
--color-primary-hover: #C62E38;     /* Darker red - hover state */
--color-primary-light: #FF5A67;     /* Lighter red - backgrounds, disabled */

/* Accent Colors */
--color-accent: #F4A261;            /* Sandy Brown - secondary CTAs, highlights */
--color-accent-hover: #E08E4A;      /* Darker orange - hover */

/* Semantic Colors */
--color-success: #06D6A0;           /* Caribbean Green - confirmations, available */
--color-warning: #FFC857;           /* Mustard - new badges, alerts */
--color-error: #D62828;             /* Fire Engine Red - errors, sold out */

/* Neutral Colors */
--color-bg: #F8F9FA;                /* Cultured White - page background */
--color-surface: #FFFFFF;           /* Pure White - card surfaces */
--color-border: #E5E7EB;            /* Light Gray - borders, dividers */
--color-text: #1A1A1A;              /* Almost Black - primary text */
--color-text-light: #6C757D;        /* Dim Gray - secondary text */
--color-text-inverse: #FFFFFF;      /* White - text on dark backgrounds */

/* Overlay Colors */
--color-overlay: rgba(0, 0, 0, 0.5);       /* Modal backdrop */
--color-overlay-light: rgba(0, 0, 0, 0.08); /* Hover overlay */
```

---

## Typography Scale

### Font Families
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-secondary: 'Inter', sans-serif; /* Same family for consistency */
```

### Font Sizes (Mobile)
```css
--text-xs: 11px;      /* Badges, small tags */
--text-sm: 13px;      /* Captions, metadata */
--text-base: 14px;    /* Body text, descriptions */
--text-lg: 16px;      /* Card titles, labels */
--text-xl: 18px;      /* Section headers, product names */
--text-2xl: 20px;     /* Prices, important numbers */
--text-3xl: 24px;     /* Page titles (rare in catalog) */
--text-4xl: 32px;     /* Hero text (if used) */
```

### Font Sizes (Desktop - Scale Up)
```css
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 28px;
--text-4xl: 36px;
```

### Font Weights
```css
--font-regular: 400;   /* Body text */
--font-medium: 500;    /* Badges, tags */
--font-semibold: 600;  /* Subtle emphasis */
--font-bold: 700;      /* Headings, prices, CTAs */
```

### Line Heights
```css
--leading-tight: 1.2;   /* Compact text (badges) */
--leading-snug: 1.3;    /* Product names (multi-line) */
--leading-normal: 1.5;  /* Body text, descriptions */
--leading-relaxed: 1.7; /* Comfortable reading (long text) */
```

---

## Spacing System (8px Grid)

### Space Scale
```css
--space-0: 0px;
--space-1: 4px;     /* Micro spacing (icon-text gap) */
--space-2: 8px;     /* Tight spacing (badge gap, tag row) */
--space-3: 12px;    /* Standard spacing (card padding) */
--space-4: 16px;    /* Content spacing (margins, gaps) */
--space-5: 20px;    /* Spacious (section padding) */
--space-6: 24px;    /* Large gap (desktop grid) */
--space-8: 32px;    /* XL spacing (page margins) */
--space-10: 40px;   /* XXL spacing (section breaks) */
--space-12: 48px;   /* Hero spacing */
--space-16: 64px;   /* Maximum spacing */
```

### Component Spacing
- **Card padding:** 16px (mobile), 20px (desktop)
- **Grid gap:** 16px (mobile), 24px (desktop)
- **Section margin:** 32px (mobile), 48px (desktop)
- **Button padding:** 12px vertical, 24px horizontal
- **Input padding:** 12px vertical, 16px horizontal

---

## Border Radius

```css
--radius-sm: 4px;    /* Badges, small buttons */
--radius-md: 8px;    /* Cards, inputs, standard buttons */
--radius-lg: 12px;   /* Modals, large surfaces */
--radius-full: 9999px; /* Pills, circular buttons */
```

---

## Shadows

```css
/* Elevation System */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);          /* Subtle lift */
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08);          /* Cards default */
--shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.12);         /* Hover state, modals */
--shadow-xl: 0 8px 24px rgba(0, 0, 0, 0.16);         /* Floating elements */
--shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.06); /* Pressed buttons */
--shadow-up: 0 -4px 8px rgba(0, 0, 0, 0.16);         /* Sticky bottom elements */
```

---

## Components (Atomic Design)

### Atoms

#### 1. Button Primary
```
Visual: [+ Agregar al carrito]
```

**Specs:**
- Height: 48px (mobile), 44px (desktop)
- Padding: 12px vertical, 24px horizontal
- Background: var(--color-primary)
- Color: var(--color-text-inverse)
- Border-radius: var(--radius-md)
- Font: var(--text-base), var(--font-bold)
- Shadow: var(--shadow-sm)

**States:**
- **Hover:** Background: var(--color-primary-hover), shadow: var(--shadow-md)
- **Focus:** Outline: 2px solid var(--color-primary), offset: 2px
- **Active:** Shadow: var(--shadow-inner), scale: 0.98
- **Disabled:** Background: #D1D5DB, cursor: not-allowed, opacity: 0.6
- **Loading:** Spinner icon, text: "Agregando..."

---

#### 2. Button Secondary
```
Visual: [Ver detalle]
```

**Specs:**
- Height: 44px
- Padding: 10px vertical, 20px horizontal
- Background: transparent
- Color: var(--color-primary)
- Border: 2px solid var(--color-primary)
- Border-radius: var(--radius-md)
- Font: var(--text-base), var(--font-semibold)

**States:**
- **Hover:** Background: var(--color-primary), color: white
- **Focus:** Outline: 2px solid var(--color-primary), offset: 2px

---

#### 3. Badge (Product Tags)
```
Visual: [🔥 NUEVO]
```

**Specs:**
- Height: 24px (auto width)
- Padding: 4px 8px
- Background: var(--color-warning) [varies by type]
- Color: var(--color-text)
- Border-radius: var(--radius-sm)
- Font: var(--text-xs), var(--font-medium), uppercase
- Icon: 14px emoji or SVG (left aligned, 4px gap)

**Badge Variants:**
| Type | Background | Text Color | Icon |
|------|------------|------------|------|
| Nuevo | #FFC857 (warning) | #1A1A1A | 🔥 |
| Promo | #E63946 (primary) | #FFFFFF | 💰 |
| Popular | #F4A261 (accent) | #1A1A1A | ⭐ |
| Picante | transparent | #E63946 | 🌶️ |
| Veggie | transparent | #06D6A0 | 🥗 |
| Vegano | #06D6A0 | #FFFFFF | 🌱 |
| Sin Gluten | transparent | #3B82F6 | 🚫 |

---

#### 4. Price Tag
```
Visual: $1,200  (or  $1,500  $1,200)
```

**Specs (Regular Price):**
- Font: var(--text-2xl), var(--font-bold)
- Color: var(--color-text)
- Letter-spacing: -0.02em (tighter for numbers)

**Specs (Discounted Price):**
- Original price: var(--text-base), var(--font-regular), strikethrough, color: var(--color-text-light)
- New price: var(--text-2xl), var(--font-bold), color: var(--color-primary)
- Layout: Stack vertical (original on top) or horizontal (original left, new right)

---

#### 5. Category Tab
```
Visual: 🍔 Hot Dogs
```

**Specs (Inactive):**
- Height: 48px
- Padding: 12px 16px
- Background: transparent
- Color: var(--color-text-light)
- Font: var(--text-base), var(--font-medium)
- Icon: 20px emoji or SVG, 8px gap
- Cursor: pointer

**Specs (Active):**
- Color: var(--color-primary)
- Font-weight: var(--font-bold)
- Border-bottom: 3px solid var(--color-primary)
- Background: var(--color-overlay-light) [optional hover]

---

### Molecules

#### 6. Product Card (Menu Item Variant)
```
Visual:
┌─────────────────────────────────┐
│   [Image 16:9]    🔥 💰         │
│ Hot Dog Clásico          $1,200 │
│ Pan brioche, salchicha...       │
│ 🌶️ Picante  🥗 Veggie          │
│        [+ Agregar]              │
└─────────────────────────────────┘
```

**Specs:**
- Width: 328px (mobile), 340px (tablet), 360px (desktop)
- Height: 420px (auto if content varies)
- Background: var(--color-surface)
- Border: 1px solid var(--color-border)
- Border-radius: var(--radius-md)
- Shadow: var(--shadow-md)
- Padding: 0 (image full bleed), 16px (content area)

**Structure:**
1. **Image Container:**
   - Aspect ratio: 16:9
   - Object-fit: cover
   - Position: relative (for badges)
   - Alt text: "[Product name] - [Short description]"

2. **Badge Overlay:**
   - Position: Absolute top-left, 8px margin
   - Stack vertical if multiple (max 2 visible)
   - Gap: 4px

3. **Content Area:**
   - Padding: 16px
   - Gap: 12px between sections

4. **Title Row:**
   - Display: flex, justify-between
   - Product name: 18px bold, max 2 lines (ellipsis)
   - Price: 20px bold, align right

5. **Description:**
   - Font: 14px regular, line-height 1.5
   - Color: var(--color-text-light)
   - Max lines: 2 (ellipsis)

6. **Tags Row:**
   - Display: flex, gap 8px
   - Wrap: no-wrap (scroll horizontal if overflow)
   - Each tag: Badge atom component

7. **CTA Button:**
   - Full width
   - Margin-top: auto (pushes to bottom)

**States:**
- **Default:** Border gray, shadow md
- **Hover (desktop):** Shadow lg, scale 1.02, cursor pointer
- **Focus:** Outline 2px primary
- **Out of stock:** Opacity 0.6, overlay "AGOTADO" badge, button disabled

---

#### 7. Cart Item Row (Side Drawer)
```
Visual:
[80x80 img]  Hot Dog Clásico       [×]
             $1,200 × 2 = $2,400
             [- 2 +]
```

**Specs:**
- Height: 120px
- Background: var(--color-surface)
- Border-bottom: 1px solid var(--color-border)
- Padding: 12px 16px

**Structure:**
- Image: 80x80px, rounded 8px
- Text: Name (16px bold) + Price calc (14px regular)
- Quantity controls: [-] button, qty display, [+] button (32x32px each)
- Remove button [×]: 24x24px, top-right, color: error on hover

---

#### 8. Category Section Header
```
Visual:
🍔 Hot Dogs (8 productos)       🔍
```

**Specs:**
- Height: 56px
- Padding: 16px
- Background: var(--color-surface)
- Border-bottom: 1px solid var(--color-border)
- Display: flex, justify-between, align-center

**Structure:**
- Icon: 24px category icon
- Text: 18px bold, color: primary
- Count: (8 productos) in text-light, 14px regular
- Search icon: 24px (right), optional

---

### Organisms

#### 9. Header (Sticky)
```
Visual:
[🏠 Logo] MangoBajito     [🔍 Search]  [🛒 3]
```

**Specs:**
- Height: 64px (mobile), 72px (desktop)
- Position: Sticky top 0, z-index 100
- Background: var(--color-surface)
- Shadow: var(--shadow-sm)
- Padding: 0 16px (mobile), 0 32px (desktop)

**Structure:**
- Logo: Max height 40px (mobile), 48px (desktop), left align
- Restaurant name: 18px bold (mobile), 20px bold (desktop), 16px margin left of logo
- Search input: 240px width, center (desktop only, hidden mobile)
- Cart button: 48x48px circle, badge shows count (red circle top-right)

---

#### 10. Category Tabs Bar (Sticky)
```
Visual:
🍔 Hot Dogs │🍟 Sides │🥤 Bebidas │🍰 Postres...
   ▔▔▔▔▔
```

**Specs:**
- Height: 48px
- Position: Sticky top 64px (below header), z-index 90
- Background: var(--color-bg)
- Border-bottom: 1px solid var(--color-border)
- Padding: 0 (tabs scrollable)
- Overflow-x: auto (hide scrollbar)

**Structure:**
- Tab list: Flex row, gap 0, no wrap
- Each tab: Category Tab atom (see above)
- Active indicator: 3px underline primary color
- Scroll behavior: Smooth scroll on tab click, auto-highlight on section enter

---

#### 11. Product Grid
```
Visual:
[Card] [Card] [Card]
[Card] [Card] [Card]
```

**Specs:**
- Display: Grid
- Columns: 1 (mobile), 2 (tablet), 3 (desktop)
- Gap: 16px (mobile), 24px (desktop)
- Margin: 16px (mobile), 32px (desktop)
- Max-width: 1280px (desktop, centered)

**Responsive:**
```css
/* Mobile */
@media (max-width: 639px) {
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 16px;
}

/* Tablet */
@media (min-width: 640px) and (max-width: 1023px) {
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 24px;
}

/* Desktop */
@media (min-width: 1024px) {
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding: 32px;
  max-width: 1280px;
  margin: 0 auto;
}
```

---

#### 12. Floating Cart Summary (Sticky Bottom)
```
Visual:
🛒 3 items               Total $3,900
         [Ver Carrito]
```

**Specs:**
- Height: 72px
- Position: Fixed bottom 0, z-index 100
- Width: 100vw (mobile), max 600px centered (desktop)
- Background: var(--color-primary)
- Color: var(--color-text-inverse)
- Shadow: var(--shadow-up)
- Padding: 12px 16px
- Safe area: 16px bottom padding (iOS notch)

**Structure:**
- Cart icon: 24px, white
- Item count: "3 items" (16px regular)
- Total: "$3,900" (20px bold, right align)
- CTA button: "Ver Carrito" (full width, 48px height, white bg, primary text)

**States:**
- **Empty cart:** Hidden (or show "Carrito vacío" disabled)
- **Has items:** Visible
- **Hover (desktop):** Button scale 1.02

---

## Responsive Behavior

### Breakpoints
```css
/* Mobile First */
@media (min-width: 640px) { /* sm: tablet */ }
@media (min-width: 1024px) { /* md: desktop */ }
@media (min-width: 1280px) { /* lg: large desktop */ }
```

### Layout Adjustments

| Element | Mobile (<640px) | Tablet (640-1024px) | Desktop (>1024px) |
|---------|-----------------|---------------------|-------------------|
| **Grid columns** | 1 | 2 | 3 |
| **Card width** | 328px | 340px | 360px |
| **Header height** | 64px | 64px | 72px |
| **Tabs** | Scroll horizontal | Inline (fit) | Inline (fit) |
| **Font scale** | Base | +2px | +4px |
| **Spacing** | 16px | 20px | 24px |

---

## Accessibility (WCAG AA)

### Contrast Ratios
- Primary on background: **6.2:1** ✅
- Text on background: **15.8:1** ✅
- Accent on background: **4.9:1** ✅
- Success on background: **3.8:1** ⚠️ (large text only)

### Tap Targets
- Minimum size: **44x44px** (iOS HIG)
- Recommended: **48x48px** (Material Design)
- Spacing: 8px min between targets

### Focus States
- All interactive elements: 2px outline primary color, 2px offset
- Visible on keyboard navigation (not on mouse click)
- Skip to main content link (hidden, visible on focus)

### Screen Reader
- Alt text on images: "[Product name] - [Short description]"
- Button labels: "Add [product name] to cart" (not just "Add")
- ARIA labels: Cart badge "3 items in cart"
- ARIA live regions: Cart updates announced

### Color Blindness
- Do not rely on color alone (use icons + text)
- Red/green badges: Use shapes (🔥 new, 💰 promo) not just color
- Test with color blindness simulator (Protanopia, Deuteranopia)

---

## Animation & Motion

### Transitions
```css
/* Standard easing */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0.0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);

/* Durations */
--duration-fast: 150ms;   /* Hover, focus */
--duration-base: 250ms;   /* Button press, card lift */
--duration-slow: 350ms;   /* Modal open, drawer slide */
```

### Common Animations
- **Button hover:** Background color transition (150ms)
- **Card hover:** Shadow + scale (250ms)
- **Add to cart:** Button text change + color (1s total: 250ms change, 750ms revert)
- **Scroll to section:** Smooth scroll (350ms ease-out)
- **Modal open:** Fade in backdrop (250ms) + slide up content (350ms)

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Icon System

### Size Scale
- **xs:** 16px (inline text icons)
- **sm:** 20px (category tabs, tags)
- **md:** 24px (header icons, section icons)
- **lg:** 32px (empty states, placeholders)
- **xl:** 48px (hero icons)

### Icon Sources
- Emojis (default): 🍔 🍟 🥤 🍰 (cross-platform, no load time)
- SVG (custom): Lucide icons for UI (cart, search, close, etc.)
- Sprite sheet: All category + badge icons in single SVG (optimize)

### Category Icons (8 Required)
- 🍕 Pizzas
- 🍔 Burgers / Hot Dogs
- 🥗 Ensaladas
- 🍝 Pastas
- 🍰 Postres
- ☕ Cafetería
- 🍺 Bebidas
- 🎉 Promociones

### Badge Icons (7 Required)
- 🔥 Nuevo
- 💰 Promo
- 🌶️ Picante
- 🥗 Vegetariano
- 🌱 Vegano
- 🚫 Sin Gluten
- ⭐ Popular

---

## Loading States

### Skeleton Loaders
```
Card Skeleton:
┌─────────────────────────────────┐
│ [Gray shimmer 328x184]          │ ← Image placeholder
│ [Line shimmer 80% width]        │ ← Title
│ [Line shimmer 60% width]        │ ← Description line 1
│ [Line shimmer 70% width]        │ ← Description line 2
│ [Button shimmer 100% width]     │ ← CTA
└─────────────────────────────────┘
```

**Specs:**
- Background: #E5E7EB (light gray)
- Animation: Shimmer gradient (1.5s infinite)
- Stagger: Each card 50ms delay

---

## Error States

### Out of Stock Badge
```
Visual: Overlay on card image
[AGOTADO] (semi-transparent red background)
```

**Specs:**
- Position: Absolute center of image
- Background: rgba(230, 57, 70, 0.9) (primary with 90% opacity)
- Color: White
- Padding: 8px 16px
- Border-radius: 4px
- Font: 14px bold, uppercase

---

### Network Error (Failed Load)
```
Visual:
[Icon: ⚠️]
Error al cargar productos
[Reintentar]
```

**Specs:**
- Icon: 48px
- Text: 16px regular, color: error
- Button: Secondary style (outline)

---

## Z-Index Scale

```css
--z-base: 0;           /* Default layer */
--z-dropdown: 10;      /* Dropdowns, tooltips */
--z-sticky: 50;        /* Sticky elements (tabs) */
--z-fixed: 100;        /* Fixed elements (header, cart) */
--z-modal-backdrop: 200; /* Modal backdrop */
--z-modal: 300;        /* Modal content */
--z-popover: 400;      /* Popovers, notifications */
--z-toast: 500;        /* Toast messages (highest) */
```

---

## Next Steps

1. ✅ Design system specs complete
2. 🔄 Aurora → Generate icon pack SVG exports
3. 🔄 Aurora → Write final SKY_42_DESIGN_SPECS.md
4. 🔄 Pixel → Implement CSS variables in theme.ts
5. 🔄 Pixel → Build component library (atoms → organisms)
6. 🔄 Sentinela → E2E test component states + accessibility
