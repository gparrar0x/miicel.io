# styles/CLAUDE.md

> Theming system for miicel.io
> Updated: 2025-01-27

---

## Dark Mode: Single Source of Truth

**Always use `.dark` class** on `<html>` element for dark mode.

```css
/* CORRECT */
.dark { --color-bg-primary: #0F0F0F; }

/* WRONG - don't use data attributes for dark mode */
[data-theme="modern-dark"] { ... }
```

---

## CSS Variables

### From `tokens.css` (preferred for components)
```css
/* Backgrounds */
--color-bg-primary      /* Main background */
--color-bg-secondary    /* Cards, elevated surfaces */

/* Text */
--color-text-primary    /* Headings, important text */
--color-text-secondary  /* Body text */
--color-text-muted      /* Hints, placeholders */

/* Borders */
--color-border-subtle   /* Light borders */

/* Semantic */
--color-success, --color-warning, --color-error, --color-info

/* Buttons (neo-brutalist) */
--btn-primary-bg, --btn-primary-text, --btn-primary-border
--btn-secondary-bg, --btn-secondary-text, --btn-secondary-border
```

### From `globals.css` (shadcn compatibility)
```css
--background, --foreground
--card, --card-foreground
--muted, --muted-foreground
--border, --input, --ring
```

---

## Component Checklist

Before merging any UI component:

- [ ] Uses CSS variables, NOT hardcoded colors (`bg-white`, `text-black`)
- [ ] Modal/dialog backgrounds: `bg-[var(--color-bg-primary)]`
- [ ] Text colors: `text-[var(--color-text-primary)]`
- [ ] Borders: `border-[var(--color-border-subtle)]`
- [ ] Tested in both light AND dark mode
- [ ] Buttons use `--btn-primary-*` or `--btn-secondary-*` tokens

---

## Quick Dark Mode Test

```js
// Browser DevTools console
document.documentElement.classList.toggle('dark')
```

Run this before committing any UI changes.

---

## File Structure

```
styles/
├── tokens.css      # Design tokens (colors, spacing, typography)
├── CLAUDE.md       # This file
app/
├── globals.css     # Tailwind imports, shadcn variables, base styles
```

---

## Common Mistakes

| Wrong | Right |
|-------|-------|
| `bg-white` | `bg-[var(--color-bg-primary)]` |
| `text-black` | `text-[var(--color-text-primary)]` |
| `text-gray-500` | `text-[var(--color-text-secondary)]` |
| `border-gray-200` | `border-[var(--color-border-subtle)]` |
| `bg-blue-600` (buttons) | `bg-[var(--btn-primary-bg)]` |

---

## Theme Palettes

| Palette | Selector | Use Case |
|---------|----------|----------|
| Gallery White | `:root` (default) | Light mode |
| Modern Dark | `.dark` | Dark mode |
| Warm Neutral | `[data-theme="warm-neutral"]` | Tenant customization |
