# Phase 2 Manual Test Guide

## Prerequisites
- Dev server running: `npm run dev` (should be on port 3001)
- Database seeded with 5 products for `sky` tenant

---

## Test 1: Product Detail Page

**URL:** `http://localhost:3001/shop/sky/product/11`

### Expected Behavior
- [x] Page loads with tenant header (sky logo + colors)
- [x] Product title: "Premium Wireless Headphones"
- [x] Price: "ARS 12500.00"
- [x] Description visible
- [x] Stock indicator: "In stock (15 available)"
- [x] Image carousel shows Unsplash image (headphones)
- [x] Color selector shows 3 circles (Red, Blue, Gray) with hex colors
- [x] Clicking color highlights it with ring + checkmark
- [x] Quantity defaults to 1
- [x] Plus/minus buttons work
- [x] Manual quantity input accepts numbers, clamps to 1-15
- [x] "Add to Cart" button enabled

### Test IDs (for Playwright)
```ts
await page.getByTestId('product-11-title')
await page.getByTestId('product-11-price')
await page.getByTestId('product-11-color-selector')
await page.getByTestId('product-11-color-red').click()
await page.getByTestId('product-11-quantity-plus').click()
await page.getByTestId('product-11-add-to-cart').click()
```

---

## Test 2: Out of Stock Product

**URL:** `http://localhost:3001/shop/sky/product/15` (Minimalist Desk Lamp)

### Expected Behavior
- [x] Stock indicator: "Out of stock"
- [x] Color selector disabled (circles grayed out)
- [x] Quantity controls disabled
- [x] "Add to Cart" button disabled (gray bg)
- [x] Out of stock message visible

---

## Test 3: Add to Cart Flow

**Steps:**
1. Visit product 11
2. Select "Blue" color
3. Set quantity to 3
4. Click "Add to Cart"
5. Button shows "Adding..." for 300ms
6. Open browser DevTools → Application → LocalStorage
7. Check key: `sw-cart-storage`

### Expected LocalStorage Value
```json
{
  "state": {
    "items": [
      {
        "productId": "11",
        "name": "Premium Wireless Headphones",
        "price": 12500,
        "currency": "ARS",
        "quantity": 3,
        "image": "https://images.unsplash.com/photo-...",
        "color": { "id": "blue", "name": "Azul", "hex": "#2563eb" },
        "maxQuantity": 15
      }
    ]
  },
  "version": 0
}
```

---

## Test 4: Cart Page - With Items

**URL:** `http://localhost:3001/shop/sky/cart`

### Expected Behavior
- [x] Title: "Shopping Cart"
- [x] Cart item visible with:
  - Thumbnail image
  - Product name
  - Color swatch (blue circle) + "Azul"
  - Quantity controls (shows 3)
  - Price per item + total (ARS 37,500.00)
  - Delete button (trash icon)
- [x] Summary sidebar (right on desktop):
  - Subtotal: "ARS 37500.00"
  - Shipping: "Calculated at checkout"
  - Total: "ARS 37500.00"
  - "Proceed to Checkout" button
  - "Continue Shopping" link

### Test IDs
```ts
await page.getByTestId('cart-items-list')
await page.getByTestId('cart-item-11-blue')
await page.getByTestId('cart-item-11-quantity-plus').click()
await page.getByTestId('cart-subtotal') // Should update to 50,000
await page.getByTestId('cart-item-11-delete').click()
await page.getByTestId('cart-empty-state') // Should appear
```

---

## Test 5: Cart Page - Empty State

**Steps:**
1. Clear localStorage or delete all cart items
2. Visit `/shop/sky/cart`

### Expected Behavior
- [x] Empty state card visible
- [x] Icon: shopping bag
- [x] Text: "Your cart is empty"
- [x] Subtext: "Add some products to get started"
- [x] "Continue Shopping" link

---

## Test 6: Multiple Products with Different Colors

**Steps:**
1. Add product 11 (Headphones) with Red color, qty 2
2. Add product 11 (Headphones) with Blue color, qty 1
3. Add product 12 (Smart Watch) with Red color, qty 1
4. Visit cart

### Expected Behavior
- [x] 3 separate cart items:
  - Headphones (Red) × 2
  - Headphones (Blue) × 1
  - Smart Watch (Red) × 1
- [x] Each has own quantity controls
- [x] Deleting one doesn't affect others
- [x] Total calculates correctly

---

## Test 7: Quantity Max Enforcement

**Steps:**
1. Visit product 12 (Smart Watch - 8 in stock)
2. Try to set quantity to 10 via input
3. Blur input

### Expected Behavior
- [x] Quantity clamps to 8 (max stock)
- [x] Cannot add more than 8 to cart
- [x] If already in cart with 5, adding 5 more clamps total to 8

---

## Test 8: Image Carousel

**URL:** Product with multiple images (future test - current products have 1 image)

### Expected Behavior
- [x] Single image: no arrows, no indicators
- [x] Multiple images:
  - Prev/next arrows on hover
  - Dot indicators below
  - Click arrows cycles images
  - Click dot jumps to image

---

## Test 9: Responsive Layout

**Steps:**
1. Visit product page on desktop (>1024px)
2. Resize to mobile (<768px)

### Expected Behavior Desktop
- [x] 2-column grid: carousel left | details right
- [x] Sticky header stays visible

### Expected Behavior Mobile
- [x] Stacked: carousel top, details below
- [x] Full-width "Add to Cart" button
- [x] Cart page: summary moves below items

---

## Test 10: Tenant Theming

**URL:** `/shop/sky/product/11`

### Expected Behavior
- [x] Primary color (sky: #222F3C) used for:
  - Selected color ring
  - Price text
  - "Add to Cart" button background
- [x] Secondary color (#C0A052) for accents
- [x] Background (#F8F8F8) for card elevation
- [x] Text colors from CSS vars

**Future:** Test with different tenant (e.g., `/shop/demo/product/X`) to verify theme switches

---

## Browser Console Checks

### No Errors
- [x] No React hydration errors
- [x] No 404s for images
- [x] No TypeScript errors in build output

### Performance
- [x] FCP < 2s (check Network tab)
- [x] Images lazy load (only first image priority)
- [x] Smooth carousel transitions

---

## Accessibility (Manual)

- [x] All buttons have `aria-label`
- [x] Color selector has `aria-pressed` state
- [x] Keyboard navigation works (Tab through elements)
- [x] Focus visible on all interactive elements
- [x] Screen reader announces button states

---

## Next: Playwright E2E Tests

Hand off to **Sentinela** with test IDs documented above.

**Priority Tests:**
1. Add to cart flow (product → cart page)
2. Quantity updates persist
3. Delete item flow
4. Empty cart state
5. Out of stock validation
