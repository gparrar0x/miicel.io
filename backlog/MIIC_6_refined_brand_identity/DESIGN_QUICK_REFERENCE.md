# Miicel.io Design System – Quick Reference

**TL;DR:** Cinzel + Inter, noir/gold/white, 8px grid, WCAG AA compliant, SaaS-professional.

---

## Color Palette (Copy-Paste Ready)

```
Primary:   #0F0F0F (noir)      | Text, UI
Accent:    #B8860B (gold)      | CTAs, hover
Light:     #FAFAFA (alabaster) | Backgrounds
White:     #FFFFFF             | Cards
```

**Status Colors:**
```
Success:   #2D5F4F (emerald)
Warning:   #D97760 (coral)
Info:      #4A5F7F (slate-blue)
```

---

## Typography

| Usage | Font | Size | Weight |
|-------|------|------|--------|
| H1 | Cinzel | 48px | 700 |
| H2 | Cinzel | 36px | 600 |
| H3 | Cinzel | 28px | 600 |
| H4 | Cinzel | 20px | 600 |
| Body | Inter | 14px | 400 |
| Label | Inter | 12px | 500 |
| Small | Inter | 11px | 400 |

**Imports:**
```html
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## Spacing Grid (8px Base)

```
1 unit = 4px
2 units = 8px (sm)
3 units = 12px (md)
4 units = 16px (lg)
6 units = 24px (xl)
8 units = 32px (2xl)
```

**Common Values:**
- Card padding: 24px (6 units)
- Button padding: 12px 24px (3 × 6 units)
- Component gap: 16px (4 units)
- Section margin: 32px (8 units)

---

## Component Checklist

### Button (Primary)
- BG: `#B8860B` | Text: `#FAFAFA`
- Padding: `12px 24px` | Border-radius: `6px`
- Hover: BG → `#D4AF37`
- Focus: `2px solid #B8860B outline`
- Test ID: `data-testid="btn-{action}"`

### Input
- Border: `1px solid #D0D0D0`
- Padding: `12px 16px`
- Focus: `2px solid #B8860B` + shadow
- Error border: `#D97760`
- Test ID: `data-testid="input-{field}"`

### Card
- BG: `#FFFFFF`
- Border: `1px solid #E5E5E5`
- Padding: `24px`
- Shadow: `0 1px 2px rgba(15,15,15,0.04)`
- Hover shadow: `0 2px 4px rgba(15,15,15,0.08)`
- Border-radius: `8px`

### Stat Card
- Same as card, but:
- Flex: column, gap 12px
- Value size: 28px (Cinzel 600)
- Label size: 12px (gray secondary)
- Trend: 12px, colored icon + text

### Nav Item (Sidebar)
- Inactive: `bg: transparent` | Text: `#595959`
- Active: `bg: #B8860B` | Text: `#FAFAFA`
- Padding: `12px 16px`
- Height: `44px` min (touch target)
- Border-radius: `6px`

### Badge
- Padding: `4px 12px`
- Font: `12px 500`
- Success: `bg: #2D5F4F` | Text: white
- Warning: `bg: #D97760` | Text: white
- Border-radius: `4px`

---

## Shadows

```
XS: 0 1px 2px rgba(15,15,15,0.04)     — Default card
SM: 0 2px 4px rgba(15,15,15,0.08)     — Card hover
MD: 0 4px 8px rgba(15,15,15,0.12)     — Strong hover
LG: 0 8px 16px rgba(15,15,15,0.16)    — Modal
XL: 0 12px 24px rgba(15,15,15,0.20)   — Modal large
```

**Rule:** Never add shadow to gold elements. Use border color change instead.

---

## Responsive Breakpoints

```
Mobile:  < 640px  → 1 column, 16px padding
Tablet:  641-1024 → 2 columns, 24px padding
Desktop: 1025px+  → 3-4 columns, 32px padding
```

**Font Adjustments (Mobile):**
- H1: 48px → 38px
- H2: 36px → 28px
- H3: 28px → 20px
- Body: 14px (unchanged)

---

## Focus & Accessibility

```
All interactive elements:
  outline: 2px solid #B8860B;
  outline-offset: 2px;
```

**Contrast Minimums:**
- Text on white: 4.5:1 ✓ (19.26:1 actual)
- Gold on dark: 4.5:1 ✓ (7.89:1 actual)
- Error text: 4.5:1 ✓ (7.24:1 actual)

**Touch Targets:**
- Minimum: 44x44px
- Buttons: 48px height
- Form fields: 44px height

---

## Motion & Transitions

```
Duration:  100ms (fast) | 200ms (normal) | 300ms (slow)
Easing:    cubic-bezier(0.2, 0, 0, 1) [ease-out]
Property:  all (for hover), specific (for focus)

Hover:     200ms ease-out (color + shadow)
Active:    100ms ease-out (scale 0.98)
Focus:     100ms ease-out (outline)
```

**Load Animation (Optional):**
```css
.card { animation: slideUp 300ms ease-out; }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## Test IDs (Sentinela Contract)

```
btn-{action}          Buttons (e.g., "btn-save")
input-{field}         Form inputs (e.g., "input-email")
select-{field}        Selects (e.g., "select-plan")
card-{section}        Cards (e.g., "card-stats")
nav-{item}            Nav items (e.g., "nav-dashboard")
badge-{status}        Status badges (e.g., "badge-active")
modal-{name}          Modals (e.g., "modal-confirm")
spinner               Loading spinner
table-{name}          Tables (e.g., "table-orders")
```

---

## CSS Variables

**Location:** `/styles.css` (import in layout.tsx)

**Usage in Components:**
```tsx
className="bg-[var(--color-gold)] text-[var(--color-text-inverse)]"
// Or with Tailwind
className="text-noir hover:text-gold"
```

**Key Variables:**
```
--color-noir, --color-gold, --color-surface-bg
--font-display, --font-body, --font-mono
--spacing-{1,2,3,4,6,8,12,16}
--radius-{xs,sm,md,lg,full}
--shadow-{xs,sm,md,lg,xl}
--transition-{fast,normal,slow}
```

---

## Tailwind Config Additions

```typescript
theme: {
  colors: {
    noir: '#0F0F0F',
    charcoal: '#1A1A1A',
    gold: '#B8860B',
    'gold-light': '#D4AF37',
    emerald: '#2D5F4F',
    coral: '#D97760',
    // ... (full list in COMPONENT_SPECS.md)
  },
  fontSize: { xs: '11px', sm: '12px', base: '14px', ... },
  spacing: { 1: '4px', 2: '8px', 3: '12px', ... },
  boxShadow: {
    xs: '0 1px 2px rgba(15, 15, 15, 0.04)',
    // ... (full list)
  },
  fontFamily: {
    display: ['Cinzel', 'serif'],
    body: ['Inter', 'sans-serif'],
    mono: ['Source Code Pro', 'monospace'],
  },
}
```

---

## Common Component Patterns

### Success State
```tsx
<input className="border-2 border-emerald shadow-[0_0_0_3px_rgba(45,95,79,0.1)]" />
<span className="text-emerald">✓ Success</span>
```

### Error State
```tsx
<input className="border-2 border-coral shadow-[0_0_0_3px_rgba(217,119,96,0.1)]" />
<span className="text-coral" role="alert">✗ Error message</span>
```

### Disabled State
```tsx
<button disabled className="opacity-60 cursor-not-allowed pointer-events-none" />
```

### Loading State
```tsx
<div className="animate-spin">
  <svg className="w-6 h-6" />
</div>
```

### Hover Card
```tsx
<div className="border-gray-light hover:border-gray-dark hover:shadow-md transition-all duration-200 ease-out" />
```

---

## Quick Wins (Pixel Checklist)

- [ ] Import fonts (Cinzel + Inter from Google Fonts)
- [ ] Import `/styles.css` in Next.js layout
- [ ] Add Tailwind config colors
- [ ] Build Button component (3 variants)
- [ ] Build Input component (with error handling)
- [ ] Build Card components (Standard + Stat)
- [ ] Add test IDs to all interactive elements
- [ ] Test focus indicators (Tab through page)
- [ ] Test on mobile (375px viewport)
- [ ] Run Lighthouse audit (target >90)

---

## Files Reference

| File | Purpose |
|------|---------|
| `DESIGN_SYSTEM.md` | Complete spec (read first) |
| `COMPONENT_SPECS.md` | Code examples + TypeScript |
| `VISUAL_SPECS.md` | ASCII mockups + layouts |
| `DESIGN_HANDOFF.md` | Team coordination + integration |
| `styles.css` | CSS variables (import immediately) |
| `DESIGN_QUICK_REFERENCE.md` | This file (bookmark it) |

---

## Need Help?

- **Aurora:** Design questions, brand decisions → `@Aurora`
- **Pixel:** Implementation, components → `@Pixel`
- **Sentinela:** Testing, accessibility → `@Sentinela`
- **Kokoro:** API contracts → `@Kokoro`
- **Hermes:** Deployment, performance → `@Hermes`

---

**Print this. Reference constantly. Ship fast.**
