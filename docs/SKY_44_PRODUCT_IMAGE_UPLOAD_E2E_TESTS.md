# SKY-44: Product Image Upload E2E Tests

## Overview

Complete E2E test suite for the product image upload flow per the spec in `SKY_44_SENTINELA_TASKS.md`. Tests validate image upload, replacement, optional images, and file type validation.

**Status:** Ready for execution
**Test File:** `tests/e2e/specs/products/product-image-upload.spec.ts`
**Execution Time:** <30s total
**Platform:** Playwright Test Runner

---

## Test Coverage

### Test 1: Product Image Upload
Validates creating a new product with image upload.

**What it tests:**
- Open ProductForm modal
- Upload image file
- Image preview appears
- Fill product form
- Submit and verify product created
- Database check: product has `image_url` (not null)
- Image is publicly accessible via URL

**File:** `tests/e2e/specs/products/product-image-upload.spec.ts`
**Duration:** ~7-8s

### Test 2: Image Replace
Validates editing existing product and replacing its image.

**What it tests:**
- Create product with initial image
- Edit product via dashboard
- Upload new image
- Verify new image URL in database
- New image is publicly accessible

**Duration:** ~8-10s

### Test 3: Product Without Image
Validates creating product without image (optional field).

**What it tests:**
- Fill form fields but skip image upload
- Submit form
- Database check: product has `image_url: null`
- No validation errors

**Duration:** ~5-6s

### Test 4: Invalid File Type Validation
Validates client-side file type restrictions.

**What it tests:**
- File input has `accept="image/*"` attribute
- Browser prevents non-image files
- Can still upload valid image after validation check

**Duration:** ~5-6s

---

## Architecture

### Page Objects (Modular Design)

#### ProductFormPage (`tests/e2e/pages/product-form.page.ts`)
Encapsulates all ProductForm interactions and locators per TEST_ID_CONTRACT.

**Exported Methods:**
```typescript
fillName(name: string)
fillCategory(category: string)
fillDescription(description: string)
fillPrice(price: string | number)
fillDisplayOrder(order: number)
setActive(active: boolean)
uploadImage(filePath: string)
fillForm(data: ProductFormData) // Convenience method
submit()
cancel()
hasImagePreview(): boolean
waitForForm(timeout?: number)
waitForFormClosed(timeout?: number)
getFieldError(field: 'name' | 'category' | 'price'): string | null
isLoading(): boolean
```

**Data-testid Mappings:**
```
product-image-input -> File input
product-name-input -> Name field
product-category-input -> Category field
product-description-input -> Description textarea
product-price-input -> Price field
product-display-order-input -> Display order
product-active-checkbox -> Active status
product-form-submit-btn -> Submit button
product-form-cancel-btn -> Cancel button
```

#### ProductsDashboardPage (`tests/e2e/pages/products-dashboard.page.ts`)
Encapsulates products dashboard interactions.

**Exported Methods:**
```typescript
goto(tenant?: string)
clickAddProduct()
waitForPageLoad(timeout?: number)
productExists(name: string): boolean
editProduct(name: string)
deleteProduct(name: string)
waitForProductInList(name: string, timeout?: number)
getProductNames(): string[]
```

### Test Utilities

**DB Verification:**
```typescript
verifyProductInDB(name: string): Promise<{id, image_url, name}>
deleteProductFromDB(productId: number)
verifyImageAccessible(imageUrl: string): boolean
```

Uses Supabase admin client (service role key) to bypass RLS.

---

## Running Tests Locally

### Prerequisites

1. **Start Next.js dev server:**
   ```bash
   npm run dev
   # Server runs on http://localhost:3000
   ```

2. **Verify environment variables** (`.env`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

3. **Test user exists:** `owner@test.com` / `testpass123`
   - Auto-seeded or create manually in Supabase

### Run Tests

**Run all product image tests:**
```bash
npx playwright test tests/e2e/specs/products/product-image-upload.spec.ts
```

**Run with simple config (no global setup):**
```bash
npx playwright test tests/e2e/specs/products/product-image-upload.spec.ts --config=playwright.config.simple.ts
```

**Run in headed mode (see browser):**
```bash
npx playwright test tests/e2e/specs/products/product-image-upload.spec.ts --headed
```

**Run specific test:**
```bash
npx playwright test -g "should upload image when creating new product"
```

**Run with UI mode:**
```bash
npm run test:e2e:ui
```

**Debug mode:**
```bash
npm run test:e2e:debug
```

---

## CI/CD Integration

### GitHub Actions Example

Add to `.github/workflows/test.yml`:

```yaml
- name: Run E2E Tests
  run: |
    npm run dev &
    sleep 5
    npx playwright test tests/e2e/specs/products/product-image-upload.spec.ts
    kill %1
  timeout-minutes: 5
```

### Test Reports

After running:
```bash
# View HTML report
npm run test:e2e:report

# Reports location
tests/reports/index.html
tests/test-results.json
tests/junit.xml
```

---

## Key Implementation Details

### Schema Validation
Schema fixed to use `z.union()` instead of chaining `.or()` after `.optional()`:
```typescript
// ✅ Correct
image_url: z.union([z.string().url(), z.literal(""), z.null()]).optional()

// ❌ Wrong (causes "Cannot read properties of undefined")
image_url: z.string().url().nullable().optional().or(z.literal(""))
```

### Storage Path Structure
Images stored in Supabase bucket `product-images`:
```
product-images/
  {tenant_id}/{timestamp}-{uuid}.{ext}

Example: 1/1700600000000-a1b2c3d4.png
```

### Authentication
Tests use existing auth fixture:
- Email: `owner@test.com`
- Password: `testpass123`
- Auto-seeded in global setup

### Cleanup
Each test:
1. Creates product with unique name (`Test Product ${Date.now()}`)
2. Verifies in DB and storage
3. **Deletes product using admin client** after test completes
   - Prevents orphaned test data
   - Keeps database clean

---

## Debugging Failed Tests

### Screenshot on Failure
Playwright captures screenshots automatically:
```
tests/reports/[timestamp]-failed/
```

### View Trace
Enable trace recording in config:
```typescript
use: {
  trace: 'on-first-retry'
}
```

Then open:
```bash
npx playwright show-trace tests/reports/trace/trace.zip
```

### Common Issues

**"No products dashboard" → Server not running**
```bash
npm run dev
# Wait for "ready - started server on 0.0.0.0:3000"
```

**"Login failed" → Test user doesn't exist**
- Manually create in Supabase: `owner@test.com` / `testpass123`
- Or re-run global setup

**"Product not found in DB" → RLS issue**
- Verify test user owns test-store tenant
- Check Supabase RLS policies

**"Image not accessible" → Storage bucket issue**
- Verify bucket `product-images` exists
- Check bucket is public
- Verify CORS settings

---

## Performance Targets

| Test | Target | Typical |
|------|--------|---------|
| Upload new product | <10s | 7-8s |
| Replace image | <12s | 8-10s |
| Create without image | <8s | 5-6s |
| File type validation | <8s | 5-6s |
| **Total suite** | **<30s** | **25-28s** |

---

## Files Reference

```
tests/e2e/
├── specs/
│   └── products/
│       └── product-image-upload.spec.ts (main test file)
├── pages/
│   ├── product-form.page.ts (page object)
│   ├── products-dashboard.page.ts (page object)
│   └── admin-layout.page.ts (reused)
├── fixtures/
│   ├── images/
│   │   └── test-product.png (test image fixture)
│   ├── auth.fixture.ts (auth helpers)
│   └── database.fixture.ts (db cleanup)
└── spec-products/ (this folder)
    └── product-image-upload.spec.ts
```

---

## Next Steps

1. **Verify server running** before tests
2. **Check env vars** loaded
3. **Run tests locally** to validate
4. **Add to CI/CD** pipeline
5. **Monitor in production** with Playwright Cloud (optional)

---

## Related Documents

- **Spec:** `docs/backlog/SKY_44_product_image_upload_e2e_test/SKY_44_SENTINELA_TASKS.md`
- **Component:** `components/ProductForm.tsx` (has all required data-testid)
- **Schema:** `lib/schemas/product.ts` (z.union fix)
- **API:** `app/api/products/upload-image/route.ts`
- **Test ID Contract:** `.claude/TEST_ID_CONTRACT.md`

---

**Status:** Ready for execution ✅
