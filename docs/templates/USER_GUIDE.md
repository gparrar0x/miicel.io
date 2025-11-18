# Template System - User Guide

**Audience:** Tenant owners
**Version:** 1.0
**Updated:** 2025-01-16

---

## Overview

Customize your storefront's visual presentation with 3 pre-built templates. Each template is optimized for different product types and selling approaches.

---

## Accessing Template Settings

1. Log in as tenant owner
2. Navigate to **Dashboard → Settings → Appearance**
3. Select your template and customize overrides

**URL:** `/{your-tenant}/dashboard/settings/appearance`

---

## Template Options

### 1. Gallery Template (Default)
**Best for:** Fashion, art, photography, visual-heavy products

**Features:**
- Large, prominent images (hover zoom)
- Minimal text overlay
- Grid layout (3-4 columns desktop)
- Quick visual scanning

**Use when:** Product appeal is primarily visual and customers browse by image.

---

### 2. Detail Template
**Best for:** Electronics, tech, spec-driven products

**Features:**
- Medium images + expanded descriptions
- Specifications grid visible on card
- Color swatches
- 2-column layout for more content

**Use when:** Customers need product specs before clicking (CPU, RAM, dimensions, etc.).

---

### 3. Minimal Template
**Best for:** Luxury brands, simple catalogs, clean aesthetics

**Features:**
- Small images, generous whitespace
- Product name + price only
- 4-column compact grid
- Clean, uncluttered

**Use when:** Brand identity emphasizes simplicity or you have large SKU counts.

---

## Customization Options

### Grid Columns
Control products per row (1-6 columns). Responsive breakpoints adjust automatically.

**Recommendation:**
- Gallery/Minimal: 3-4 cols
- Detail: 2 cols (more content per product)

### Image Aspect Ratio
Choose how product images are cropped:
- **1:1 (Square)** - Most versatile, works for all products
- **4:3 (Landscape)** - Traditional photography ratio
- **16:9 (Wide)** - Cinematic, hero-style

### Card Variant
Visual style of product cards:
- **Elevated** - Drop shadow, modern (default)
- **Flat** - No shadow, minimal
- **Outlined** - Border, clean separation

### Spacing
Adjust whitespace density:
- **Compact** - More products visible, tight spacing
- **Normal** - Balanced (default)
- **Relaxed** - Generous whitespace, luxury feel

### Colors
- **Primary** - Buttons, links, accents
- **Accent** - Badges, highlights

Color picker validates contrast for accessibility (WCAG AA).

---

## Live Preview

Changes preview in real-time (300ms debounce). Preview shows sample products with your current settings.

---

## Saving Changes

1. Customize template + overrides
2. Click **Save Changes**
3. Toast notification confirms success
4. Visit your storefront to see live changes

**Note:** Changes apply immediately to your storefront. Preview before saving to avoid surprises.

---

## Reset to Defaults

Click **Reset** to revert all overrides back to template defaults (keeps your template selection).

---

## Best Practices

### Template Selection
- **A/B test** different templates with analytics to see which converts better
- **Match your brand** - luxury brands often prefer Minimal, tech brands prefer Detail
- **Consider SKU count** - large catalogs may benefit from compact Minimal template

### Color Customization
- Use your brand colors for consistency
- Preview ensures contrast meets accessibility standards
- Test on both light/dark mode if enabled

### Image Aspect Ratios
- **Consistent product photos** work best (all same orientation)
- If photos vary, use **1:1 square** to normalize appearance
- Upload high-res images (template handles optimization)

### Spacing
- More whitespace = perceived quality/luxury
- Tight spacing = more products visible, browsing efficiency
- Test on mobile (spacing affects scroll fatigue)

---

## Troubleshooting

**Changes not appearing on storefront?**
- Hard refresh browser (Cmd/Ctrl + Shift + R)
- Verify you clicked "Save Changes" (toast confirmation)
- Check browser console for errors

**Preview not updating?**
- Wait 300ms after field change (debounced)
- Check browser console for errors

**Color picker validation errors?**
- Contrast must meet WCAG AA (4.5:1 ratio)
- Try lighter/darker shades

**Access denied error?**
- Only tenant OWNER role can edit theme
- Contact your tenant owner for access

---

## Support

For technical issues or custom template requests, contact support with:
- Tenant slug
- Template currently using
- Description of issue
- Screenshots (if visual bug)

---

**Next:** See [Developer Guide](DEV_GUIDE.md) for technical implementation details.
