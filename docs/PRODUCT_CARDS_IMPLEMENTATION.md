# ProductCard Variants + ProductGrid Implementation

**Issue:** #4  
**Owner:** Pixel  
**Status:** Complete  
**Date:** 2025-11-16

---

## Summary

Implemented 3 ProductCard variants and responsive ProductGrid component for multi-tenant storefront templates.

---

## Components Created

### 1. GalleryCard (`/components/storefront/GalleryCard.tsx`)
- **Purpose:** Large image display with minimal text
- **Features:**
  - Hover zoom animation (scale-110)
  - Text overlay with gradient fade
  - Stock indicators (out of stock, low stock)
  - Lazy image loading
- **Test ID:** `product-card-gallery`
- **Best for:** Visual-first products (fashion, art, photography)

### 2. DetailCard (`/components/storefront/DetailCard.tsx`)
- **Purpose:** Image + detailed specifications grid
- **Features:**
  - Expanded product description (3-line clamp)
  - Specs grid: category, stock status, colors
  - Color swatches display (max 5 visible)
  - Hover elevation effect
- **Test ID:** `product-card-detail`
- **Best for:** Technical products (electronics, furniture)

### 3. MinimalCard (`/components/storefront/MinimalCard.tsx`)
- **Purpose:** Compact layout for high-density grids
- **Features:**
  - Small image + name + price only
  - Compact color dots (max 3 visible)
  - Minimal stock badges
  - Subtle hover opacity
- **Test ID:** `product-card-minimal`
- **Best for:** Catalog browsing, large inventories

### 4. ProductGrid (`/components/storefront/ProductGrid.tsx`)
- **Purpose:** Responsive container for product cards
- **Features:**
  - Template-based card rendering (gallery | detail | minimal)
  - Responsive columns via Tailwind classes
  - CSS var integration (--grid-cols, --spacing-*)
  - Loading skeleton state
  - Empty state with icon + message
- **Test ID:** `product-grid-{template}`

---

## Theme Integration

All components consume CSS variables from ThemeProvider:

```css
--grid-cols          /* Grid column count */
--image-aspect       /* Product image ratio (W:H) */
--spacing-xs/sm/md/lg/xl  /* Spacing scale */
--color-primary      /* Brand primary color */
--color-accent       /* Brand accent color */
```

---

## Usage Example

```tsx
import { ProductGrid } from '@/components/storefront'
import { useTheme } from '@/components/theme/use-theme'

function StorefrontPage({ products }: { products: Product[] }) {
  const theme = useTheme()

  return (
    <ProductGrid
      template={theme.template}
      products={products}
      loading={false}
      onProductClick={(product) => router.push(`/products/${product.id}`)}
    />
  )
}
```

---

## TypeScript Types

All components use the `Product` interface from `/types/commerce.ts`:

```typescript
interface Product {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  images: string[]
  colors: ProductColor[]
  stock: number
  category: string | null
}
```

---

## Testing

### data-testid Attributes

- `product-card-gallery` - GalleryCard component
- `product-card-detail` - DetailCard component
- `product-card-minimal` - MinimalCard component
- `product-grid-{template}` - ProductGrid container (template = gallery | detail | minimal)

### States Covered

1. **Default State:** Normal rendering with product data
2. **Loading State:** Skeleton UI with pulse animation
3. **Empty State:** ProductGrid shows "No products found" message

---

## Responsive Breakpoints

### GalleryCard
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns

### DetailCard
- Mobile: 1 column
- Desktop: 2 columns

### MinimalCard
- Mobile: 2 columns
- Tablet: 3 columns
- Desktop: 4 columns

---

## Next Steps

1. **Storybook Stories:** Create visual QA stories (3 variants × 3 states)
2. **E2E Tests:** Sentinela to write Playwright tests using data-testid attributes
3. **Screenshots:** Capture template variants for documentation
4. **Admin UI:** Integrate with theme selector (Issue #4 - blocked by Kokoro API)

---

## Files Created

```
/components/storefront/
├── GalleryCard.tsx      (3.3 KB)
├── DetailCard.tsx       (5.4 KB)
├── MinimalCard.tsx      (3.7 KB)
├── ProductGrid.tsx      (4.5 KB)
└── index.ts             (barrel export)
```

---

**Handoff:** Components ready for integration. Sentinela can begin E2E test creation.
