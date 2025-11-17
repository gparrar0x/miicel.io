# Phase 2: Product Page & Cart Foundation - COMPLETE ✅

**Date:** 2025-01-16
**Project:** `/Users/gpublica/workspace/skywalking/projects/sw_commerce_saas`

---

## Deliverables

### 1. Cart Store (Zustand + LocalStorage)
**File:** `/lib/stores/cartStore.ts`

- State: `items`, actions: `addItem`, `removeItem`, `updateQuantity`, `clearCart`
- Getters: `getTotalItems`, `getTotalPrice`
- Persistence via Zustand middleware → `localStorage` key: `sw-cart-storage`
- Product+color combo uniqueness (same product with different color = separate cart items)

### 2. Product Components
**Directory:** `/components/commerce/`

#### ColorSelector.tsx
- Radio-style color picker with hex swatches
- Active state ring + checkmark
- Disabled state for out-of-stock
- Test IDs: `product-{id}-color-selector`, `product-{id}-color-{colorId}`

#### QuantityControl.tsx
- Minus/input/plus buttons
- Min/max validation
- Manual input with blur validation
- Test IDs: `product-{id}-quantity-{plus|minus|input}`

#### ProductImageCarousel.tsx
- Swipeable carousel with prev/next arrows
- Dot indicators below
- Empty state fallback
- Test IDs: `product-{id}-image-carousel`, `product-{id}-image-{index}`, `product-{id}-image-{prev|next}`

#### AddToCartButton.tsx
- Client component, calls cart store
- Loading state (300ms feedback)
- Disabled when out of stock
- Test ID: `product-{id}-add-to-cart`

#### CartItem.tsx
- Thumbnail, name, color swatch, price
- Quantity controls inline
- Delete button
- Test IDs: `cart-item-{productId}-{colorId}-{name|quantity|delete|total}`

### 3. Product Detail Page
**Route:** `/app/shop/[tenant]/product/[id]/page.tsx`

- Server component fetches tenant config + product from DB
- Adapts DB schema (`image_url` → `images[]`, hardcoded `currency: 'ARS'`)
- Layout: 2-col desktop (carousel | details), stacked mobile
- Client wrapper: `ProductClient.tsx` manages color/quantity state
- All test IDs per spec
- Mock colors: Red, Blue, Gray (static data until `product_variants` table)

**Test URL:** `http://localhost:3001/shop/sky/product/11`

### 4. Cart Page
**Route:** `/app/shop/[tenant]/cart/page.tsx`

- Server component loads tenant config
- Client wrapper: `CartClient.tsx` reads cart store
- Empty state with "Continue Shopping" link
- Item list with summary sidebar (sticky on desktop)
- Summary: subtotal, shipping TBD, total
- Checkout button (placeholder)
- Test IDs: `cart-page-title`, `cart-empty-state`, `cart-items-list`, `cart-summary`, `cart-{subtotal|total}`, `cart-checkout-button`

**Test URL:** `http://localhost:3001/shop/sky/cart`

---

## Files Created/Modified

```
lib/stores/
  cartStore.ts                  ← Zustand store

components/commerce/
  ColorSelector.tsx             ← New
  QuantityControl.tsx           ← New
  ProductImageCarousel.tsx      ← New
  AddToCartButton.tsx           ← New
  CartItem.tsx                  ← New

app/shop/[tenant]/
  product/[id]/
    page.tsx                    ← New (server)
    ProductClient.tsx           ← New (client wrapper)
  cart/
    page.tsx                    ← New (server)
    CartClient.tsx              ← New (client wrapper)

types/
  commerce.ts                   ← Updated CartStore interface

supabase/migrations/
  014_seed_sample_products.sql  ← 5 test products for sky tenant

public/
  placeholder.svg               ← Fallback image
```

---

## Test Data (DB)

**Sky tenant products (5):**
1. Premium Wireless Headphones - ARS 12,500 (15 in stock)
2. Smart Watch Series 5 - ARS 8,900 (8 in stock)
3. Leather Backpack - ARS 6,200 (20 in stock)
4. Organic Coffee Beans 1kg - ARS 1,850 (50 in stock)
5. Minimalist Desk Lamp - ARS 4,500 (**0 in stock** - tests out-of-stock UI)

---

## Technical Notes

### Schema Adapters
DB has `image_url` (string), Product type expects `images` (array).
**Adapter in page.tsx:**
```ts
images: data.image_url ? [data.image_url] : ['/placeholder.svg']
```

DB missing `currency` field.
**Hardcoded in adapter:**
```ts
currency: 'ARS' // TODO: Add currency column in Phase 3
```

### Cart Store Key Collision Fix
Initial `removeItem(productId)` failed for products with different colors.
**Fixed:** Both `removeItem` and `updateQuantity` now accept optional `colorId` parameter.

### Test ID Pattern
Follows Sentinela contract: `{feature}-{element}-{action}`
- Product: `product-{id}-{title|price|description|add-to-cart}`
- Color: `product-{id}-color-{colorId}`
- Quantity: `product-{id}-quantity-{plus|minus|input}`
- Cart: `cart-item-{productId}-{colorId}-{name|delete|total}`

### Responsive Strategy
- Mobile-first: stacked layouts, full-width buttons
- Desktop: 2-col grids (lg: breakpoint), sticky sidebar on cart page
- 8px spacing system via Tailwind classes

---

## Testing Checklist

- [x] Cart store persists to localStorage
- [x] Add same product with different colors → 2 cart items
- [x] Quantity controls enforce min/max
- [x] Image carousel prev/next buttons work
- [x] Out-of-stock product disables "Add to Cart"
- [x] Empty cart shows empty state
- [x] Cart total calculates correctly
- [x] All components have `data-testid`

**Manual Test:**
1. Visit `/shop/sky/product/11`
2. Select color, adjust quantity, add to cart
3. Check localStorage: `sw-cart-storage`
4. Visit `/shop/sky/cart` → item appears
5. Update quantity → total recalculates
6. Delete item → cart empties

---

## Next Steps (Phase 3 - Not Started)

1. **Checkout Flow**
   - Customer info form (name, email, phone)
   - MercadoPago integration
   - Order creation + payment redirect

2. **DB Schema Updates**
   - Add `currency` column to `products` table
   - Create `product_variants` table for dynamic colors/sizes
   - Add `images` JSONB column (or separate `product_images` table)

3. **Search & Filtering**
   - Product list page with category filters
   - Search input in TenantHeader
   - Pagination/infinite scroll

4. **Cart Enhancements**
   - Tenant-scoped carts (different localStorage keys per tenant)
   - Promo codes / discounts
   - Shipping calculator

---

## Performance Notes

- All product images use Next.js `<Image>` with lazy loading
- Carousel prioritizes first image (`priority={currentIndex === 0}`)
- Cart store uses `partialize` to only persist `items` array
- No external deps beyond Zustand (already installed)

**Lighthouse Target:** <2s FCP, WCAG AA compliance (semantic HTML + ARIA labels on all interactive elements)

---

**Status:** Phase 2 complete. Ready for Sentinela E2E tests + Phase 3 checkout flow.
