---
sidebar_position: 2
title: Product Management
---

# Product Management

Complete guide to managing products, categories, and inventory in Vendio.

---

## Product Cards

Vendio supports three product card variants optimized for different use cases:

### Gallery Card
- **Purpose:** Large image display with minimal text
- **Features:**
  - Hover zoom animation (scale-110)
  - Text overlay with gradient fade
  - Stock indicators (out of stock, low stock)
  - Lazy image loading
- **Best for:** Visual-first products (fashion, art, photography)

### Detail Card
- **Purpose:** Image + detailed specifications grid
- **Features:**
  - Expanded product description (3-line clamp)
  - Specs grid: category, stock status, colors
  - Color swatches display (max 5 visible)
  - Hover elevation effect
- **Best for:** Technical products (electronics, furniture)

### Minimal Card
- **Purpose:** Compact layout for high-density grids
- **Features:**
  - Small image + name + price only
  - Compact color dots (max 3 visible)
  - Minimal stock badges
  - Subtle hover opacity
- **Best for:** Catalog browsing, large inventories

---

## Product Grid

The `ProductGrid` component provides responsive layout:

- **Responsive columns:** 1-6 columns based on screen size
- **Gap spacing:** Configurable spacing (compact, normal, relaxed)
- **Template-aware:** Automatically selects card variant based on tenant template
- **Lazy loading:** Images load as user scrolls

---

## Creating Products

### Via Dashboard

1. Navigate to `/{tenantId}/dashboard/products`
2. Click "Add Product"
3. Fill in required fields:
   - Name
   - Description
   - Price
   - Category
   - Stock quantity
   - Image (upload or URL)

### Recommended Image Sizes

- **Product images:** 1200×900 px, 4:3 aspect ratio
- **Banner images:** 1920×1080 px, 16:9 aspect ratio
- **Logo:** ≥ 400×400 px, square

---

## Categories

### Creating Categories

1. Navigate to `/{tenantId}/dashboard/categories`
2. Click "Add Category"
3. Enter category name and optional description
4. Set display order (for sorting)

### Category Organization

- Categories are tenant-specific
- Products can belong to one category
- Categories appear in navigation accordion (Restaurant template)
- Categories can be filtered/searched

---

## Stock Management

### Stock Levels

- **In Stock:** Product available for purchase
- **Low Stock:** Stock below threshold (configurable)
- **Out of Stock:** Stock = 0, product hidden or marked unavailable

### Updating Stock

1. Navigate to product list
2. Click product to edit
3. Update stock quantity
4. Save changes

Stock updates are reflected immediately in the storefront.

---

## Bulk Operations

### Bulk Price Update

1. Select multiple products
2. Click "Bulk Actions"
3. Choose "Update Prices"
4. Enter percentage or fixed amount
5. Apply to selected products

### Bulk Stock Update

1. Select multiple products
2. Click "Bulk Actions"
3. Choose "Update Stock"
4. Enter new stock quantity
5. Apply to selected products

---

## Product Variants

### Color Variants

Products can have multiple color options:
- Each color variant can have its own image
- Stock tracked per variant
- Color swatches displayed on product cards

### Size Variants

Size variants are supported for:
- Clothing (S, M, L, XL)
- Food portions (Small, Medium, Large)
- Custom sizes per tenant

---

## Best Practices

1. **Use high-quality images:** Clear, well-lit product photos convert better
2. **Write clear descriptions:** Include key features and benefits
3. **Keep stock updated:** Prevents overselling and customer frustration
4. **Organize with categories:** Makes browsing easier for customers
5. **Set competitive prices:** Research market rates before pricing

---

## API Reference

See [API Documentation](/api/orders) for programmatic product management.

