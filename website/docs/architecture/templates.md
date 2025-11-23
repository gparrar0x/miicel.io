---
sidebar_position: 3
title: Template System
---

# Template System

Vendio supports multiple storefront templates optimized for different business types.

---

## Available Templates

### Gallery Template

**Best for:** Visual-first products (fashion, art, photography)

**Features:**
- Large image display with minimal text
- Hover zoom animation
- Text overlay with gradient fade
- Stock indicators
- Lazy image loading

**Layout:**
- Responsive grid (1-6 columns)
- Focus on product imagery
- Minimal text overlay

---

### Detail Template

**Best for:** Technical products (electronics, furniture)

**Features:**
- Expanded product description (3-line clamp)
- Specs grid: category, stock status, colors
- Color swatches display (max 5 visible)
- Hover elevation effect

**Layout:**
- Wide layout with rich information
- Detailed product specifications
- Multiple images per product

---

### Minimal Template

**Best for:** Catalog browsing, large inventories

**Features:**
- Small image + name + price only
- Compact color dots (max 3 visible)
- Minimal stock badges
- Subtle hover opacity

**Layout:**
- Compact grid for high density
- Many products visible at once
- Fast scanning

---

### Restaurant Template

**Best for:** Food businesses (restaurants, food trucks, cafes)

**Features:**
- Category accordion navigation
- Large product photos
- Mobile-first ordering
- Floating cart
- Hero header with logo + banner

**Layout:**
- Header with logo, banner, subtitle
- Category accordion (collapsible)
- Product grid with large images
- Floating cart button
- Footer with contact info

**Recommended Image Sizes:**
- **Banner:** 1920×1080 px, 16:9, landscape
- **Product images:** 1200×900 px, 4:3, landscape
- **Logo round:** ≥ 400×400 px, square
- **Logo text:** ~800×250 px, horizontal, PNG with transparent background

---

## Template Selection

Templates are selected per tenant via the Theme Editor:

1. Navigate to `/{tenantId}/dashboard/settings/appearance`
2. Select template from TemplateSelector
3. Template defaults are loaded automatically
4. Customize theme overrides (colors, spacing, etc.)
5. Save changes

---

## Template Configuration

Each template has default settings:

```typescript
interface TemplateDefaults {
  gridCols: number;        // 1-6 columns
  imageAspect: string;     // "1:1" | "4:3" | "16:9"
  cardVariant: string;     // "flat" | "elevated" | "outlined"
  spacing: string;         // "compact" | "normal" | "relaxed"
  colors: {
    primary: string;       // Hex color
    accent: string;        // Hex color
  };
}
```

---

## Customization

All templates support theme customization:

- **Grid Columns:** Control layout density (1-6 columns)
- **Image Aspect:** Product card aspect ratio
- **Card Variant:** Visual style (flat, elevated, outlined)
- **Spacing:** Component padding (compact, normal, relaxed)
- **Colors:** Primary and accent brand colors

Changes are applied in real-time via the Theme Editor preview.

---

## Implementation

Templates are implemented as React components:

- `/components/storefront/GalleryCard.tsx`
- `/components/storefront/DetailCard.tsx`
- `/components/storefront/MinimalCard.tsx`
- `/components/storefront/RestaurantLayout.tsx`

The `ProductGrid` component automatically selects the appropriate card variant based on the tenant's template configuration.

---

## Best Practices

1. **Choose template based on product type:** Visual products → Gallery, Technical → Detail, Food → Restaurant
2. **Use recommended image sizes:** Ensures optimal display quality
3. **Test on mobile:** All templates are mobile-first
4. **Customize colors:** Match brand identity for better recognition
5. **Optimize images:** Compress images for faster loading

