# SKY-42: Template Restaurante - Kokoro Tasks

> **Ticket:** SKY-42
> **Agente:** Kokoro (Backend Engineering)
> **Prioridad:** Alta
> **Creado:** 2025-01-16
> **Owner:** Mentat → Aurora → Pixel → Kokoro

---

## Contexto

Pixel completó implementación frontend template "restaurant":
- 10 componentes (atoms → organisms)
- Template seleccionable admin
- Layout responsive mobile-first
- Build pasa, test IDs completos

**Blockers backend:**
1. `tenants_public` view no incluye `template` column
2. `products.metadata` no tiene schema badges
3. Category icons no estructurados
4. Query performance productos por categoría

---

## Objetivo

Ajustes backend para soportar template restaurant:
- Exponer `template` field en RLS view
- Schema JSONB metadata badges
- Migration data MangoBajito/SuperHotdog
- Optimizar queries categorías

---

## Deliverables

### 1. Database Schema
- [ ] Agregar `template` a `tenants_public` view
- [ ] Extender `products.metadata` JSONB schema (badges)
- [ ] Index `products.category` (performance)
- [ ] Migration backfill data clientes existentes

### 2. API Adjustments
- [ ] Validar `/api/tenant/[slug]/config` retorna template
- [ ] Endpoint `/api/products/by-category` (opcional)
- [ ] Types sync backend ↔ frontend

### 3. Data Migration
- [ ] Script migración MangoBajito → restaurant
- [ ] Script migración SuperHotdog → restaurant
- [ ] Validar RLS policies

---

## Specs Técnicos

### Schema Changes

#### 1. tenants_public View - Add template Column

**Current view:**
```sql
-- supabase/migrations/XXX_tenants_public_view.sql
CREATE OR REPLACE VIEW tenants_public AS
SELECT
  id,
  slug,
  name,
  logo_url,
  config  -- JSONB con colores, horarios, etc
FROM tenants
WHERE active = true;
```

**Issue:** Frontend necesita `template` field para routing condicional.

**Solution:**
```sql
-- Migration: add_template_to_tenants_public.sql
CREATE OR REPLACE VIEW tenants_public AS
SELECT
  id,
  slug,
  name,
  logo_url,
  config,
  template,  -- 👈 ADD THIS
  theme_overrides
FROM tenants
WHERE active = true;

-- Refresh materialized view si existe
COMMENT ON VIEW tenants_public IS 'Public tenant data including template field';
```

**Test:**
```sql
-- Verify template visible
SELECT slug, template FROM tenants_public WHERE slug = 'mangobajito';
-- Expected: { slug: 'mangobajito', template: 'gallery' }
```

---

#### 2. products.metadata JSONB - Badges Schema

**Current structure:**
```json
// products.metadata (JSONB)
{
  "supplier_id": "ABC123",
  "last_sync": "2025-01-15T10:00:00Z"
}
```

**New structure (add badges):**
```json
{
  "supplier_id": "ABC123",
  "last_sync": "2025-01-15T10:00:00Z",
  "badges": ["nuevo", "promo", "spicy-mild", "veggie"],  // 👈 ADD THIS
  "dietary_info": {  // 👈 OPTIONAL (future)
    "calories": 850,
    "allergens": ["gluten", "dairy"],
    "spicy_level": 2  // 0=none, 1=mild, 2=medium, 3=hot
  }
}
```

**Badge types (from Pixel):**
```typescript
type BadgeType =
  | 'nuevo'        // 🔥 New item
  | 'promo'        // 💰 Discount/promotion
  | 'spicy-mild'   // 🌶️ Mild spicy
  | 'spicy-hot'    // 🌶️🌶️ Hot spicy
  | 'veggie'       // 🥗 Vegetarian
  | 'vegan'        // 🌱 Vegan
  | 'gluten-free'  // 🚫 No gluten
  | 'popular'      // ⭐ Best seller
```

**Migration: Add badges to existing products**
```sql
-- Migration: add_product_badges_metadata.sql

-- 1. Add badges array to metadata (preserve existing fields)
UPDATE products
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{badges}',
  '[]'::jsonb
)
WHERE metadata IS NULL OR NOT metadata ? 'badges';

-- 2. Backfill badges para productos específicos
-- Example: MangoBajito hot dogs
UPDATE products
SET metadata = jsonb_set(
  metadata,
  '{badges}',
  '["popular"]'::jsonb
)
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'mangobajito')
  AND name ILIKE '%clásico%';

UPDATE products
SET metadata = jsonb_set(
  metadata,
  '{badges}',
  '["nuevo", "spicy-mild"]'::jsonb
)
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'mangobajito')
  AND name ILIKE '%premium%';

-- 3. Add validation constraint (optional, strict mode)
ALTER TABLE products
ADD CONSTRAINT products_metadata_badges_valid
CHECK (
  metadata ? 'badges' AND
  jsonb_typeof(metadata -> 'badges') = 'array'
);

COMMENT ON COLUMN products.metadata IS 'JSONB metadata: { badges: BadgeType[], dietary_info?: {...}, supplier_id?: string, last_sync?: timestamp }';
```

**Helper function: Get product badges**
```sql
-- Function to extract badges from metadata
CREATE OR REPLACE FUNCTION get_product_badges(product_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE
AS $$
  SELECT ARRAY(
    SELECT jsonb_array_elements_text(metadata -> 'badges')
    FROM products
    WHERE id = product_id
  );
$$;

-- Usage:
SELECT name, get_product_badges(id) as badges
FROM products
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'mangobajito');
```

---

#### 3. Categories - Add Icon Field (Optional)

**Current:** Categories stored as string in `products.category`.

**Issue:** Frontend hardcodes emoji icons (mod 5 array).

**Solution A (Quick):** Keep as-is, frontend handles icons.

**Solution B (Proper, v2):**
```sql
-- Create categories table (normalized)
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  icon text,  -- Emoji or SVG name
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- RLS policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories viewable by tenant"
  ON categories FOR SELECT
  USING (tenant_id IN (SELECT id FROM tenants WHERE active = true));

-- Migrate existing categories
INSERT INTO categories (tenant_id, slug, name, icon)
SELECT DISTINCT
  tenant_id,
  lower(regexp_replace(category, '\s+', '-', 'g')) as slug,
  category as name,
  '🍔' as icon  -- Default, update manually
FROM products
WHERE category IS NOT NULL;

-- Update products to reference category_id
ALTER TABLE products ADD COLUMN category_id uuid REFERENCES categories(id);

UPDATE products p
SET category_id = c.id
FROM categories c
WHERE p.tenant_id = c.tenant_id
  AND p.category = c.name;
```

**Decision:** Solution A para MVP (defer categories table a v2).

---

#### 4. Performance - Add Index on category

**Current:** No index on `products.category` → slow queries.

**Solution:**
```sql
-- Migration: add_products_category_index.sql
CREATE INDEX IF NOT EXISTS idx_products_category
  ON products(tenant_id, category)
  WHERE category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_active_category
  ON products(tenant_id, category, active)
  WHERE active = true;

-- Analyze query plan
EXPLAIN ANALYZE
SELECT category, COUNT(*) as product_count
FROM products
WHERE tenant_id = 'xxx'
  AND active = true
GROUP BY category
ORDER BY display_order, category;
-- Expected: Index Scan on idx_products_active_category
```

---

### API Changes

#### 1. Validate /api/tenant/[slug]/config Returns template

**Current code (Pixel report):**
```typescript
// app/api/tenant/[slug]/config/route.ts
const { data: tenant } = await supabase
  .from('tenants')  // Direct query (not tenants_public)
  .select('id, slug, name, logo_url, config, template')  // 👈 template included
  .eq('slug', slug)
  .eq('active', true)
  .single()
```

**Status:** ✅ Already implemented by Pixel.

**Test:**
```bash
curl https://yourapp.vercel.app/api/tenant/mangobajito/config
# Expected:
{
  "id": "xxx",
  "slug": "mangobajito",
  "name": "MangoBajito",
  "template": "gallery",  # 👈 Present
  "config": { "colors": {...} }
}
```

---

#### 2. Optional: /api/products/by-category Endpoint

**Purpose:** Optimize frontend fetch (group by category in 1 query).

**Current:** Frontend fetches all products, groups client-side.

**Optimized:**
```typescript
// app/api/tenant/[slug]/products/by-category/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })

  // 1. Get tenant
  const { data: tenant } = await supabase
    .from('tenants_public')
    .select('id')
    .eq('slug', params.slug)
    .single()

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  // 2. Get products grouped by category
  const { data: products } = await supabase
    .from('products')
    .select('id, name, description, price, image_url, category, metadata, active')
    .eq('tenant_id', tenant.id)
    .eq('active', true)
    .order('category, display_order, name')

  if (!products) {
    return NextResponse.json({ categories: [] })
  }

  // 3. Group by category
  const grouped = products.reduce((acc, product) => {
    const cat = product.category || 'Sin categoría'
    if (!acc[cat]) {
      acc[cat] = {
        category: cat,
        products: []
      }
    }
    acc[cat].products.push(product)
    return acc
  }, {} as Record<string, { category: string; products: any[] }>)

  const categories = Object.values(grouped).map((group, idx) => ({
    id: `cat-${idx}`,
    slug: group.category.toLowerCase().replace(/\s+/g, '-'),
    name: group.category,
    icon: '🍔',  // TODO: from categories table
    productCount: group.products.length,
    products: group.products
  }))

  return NextResponse.json({ categories })
}
```

**Frontend usage:**
```typescript
// app/[tenant]/page.tsx
const res = await fetch(`/api/tenant/${slug}/products/by-category`)
const { categories } = await res.json()

// Pass directly to RestaurantLayout
<RestaurantLayout categories={categories} />
```

**Decision:** Opcional (defer si performance OK con client-side grouping).

---

### Data Migration Scripts

#### Script 1: Update MangoBajito Template

```sql
-- migrations/migrate_mangobajito_restaurant.sql

-- 1. Update template
UPDATE tenants
SET
  template = 'restaurant',
  updated_at = now()
WHERE slug = 'mangobajito';

-- 2. Add badges to products
-- Hot Dog Clásico (popular)
UPDATE products
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{badges}',
  '["popular"]'::jsonb
)
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'mangobajito')
  AND name ILIKE '%clásico%';

-- Hot Dog Premium (nuevo, spicy)
UPDATE products
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{badges}',
  '["nuevo", "spicy-mild"]'::jsonb
)
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'mangobajito')
  AND name ILIKE '%premium%';

-- Combos (promo)
UPDATE products
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{badges}',
  '["promo"]'::jsonb
)
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'mangobajito')
  AND name ILIKE '%combo%';

-- Veggie options (veggie badge)
UPDATE products
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{badges}',
  '["veggie"]'::jsonb
)
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'mangobajito')
  AND (name ILIKE '%veggie%' OR description ILIKE '%vegetariano%');

-- 3. Verify migration
SELECT
  name,
  category,
  metadata -> 'badges' as badges
FROM products
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'mangobajito')
ORDER BY category, name;
```

---

#### Script 2: Update SuperHotdog Template

```sql
-- migrations/migrate_superhotdog_restaurant.sql

-- Similar to MangoBajito
UPDATE tenants
SET
  template = 'restaurant',
  updated_at = now()
WHERE slug = 'superhotdog';

-- Add badges (adjust product names as needed)
UPDATE products
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{badges}',
  '["popular"]'::jsonb
)
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'superhotdog')
  AND name ILIKE '%super hot dog%';

UPDATE products
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{badges}',
  '["spicy-hot"]'::jsonb
)
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'superhotdog')
  AND (name ILIKE '%picante%' OR name ILIKE '%spicy%');

-- Verify
SELECT
  name,
  metadata -> 'badges' as badges
FROM products
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'superhotdog');
```

---

#### Script 3: Rollback (if needed)

```sql
-- migrations/rollback_restaurant_template.sql

-- Revert template
UPDATE tenants
SET template = 'gallery'
WHERE slug IN ('mangobajito', 'superhotdog');

-- Remove badges (preserve other metadata)
UPDATE products
SET metadata = metadata - 'badges'
WHERE tenant_id IN (
  SELECT id FROM tenants WHERE slug IN ('mangobajito', 'superhotdog')
);
```

---

## Implementation Steps

### Step 1: Schema Migrations (2h)

**Files:**
```
supabase/migrations/
├─ 020_add_template_to_tenants_public.sql
├─ 021_add_product_badges_metadata.sql
└─ 022_add_products_category_index.sql
```

**Tasks:**
- [ ] Create migration 020 (tenants_public view)
- [ ] Create migration 021 (badges metadata + constraint)
- [ ] Create migration 022 (category index)
- [ ] Apply migrations local dev (`supabase db reset`)
- [ ] Test queries performance (EXPLAIN ANALYZE)
- [ ] Push migrations staging (`supabase db push`)

---

### Step 2: API Validation (1h)

**Tasks:**
- [ ] Test `/api/tenant/mangobajito/config` returns template
- [ ] Verify RLS policies allow tenants_public.template read
- [ ] Update API types if needed (sync with Pixel)
- [ ] (Optional) Implement `/api/products/by-category` endpoint

---

### Step 3: Data Migration (1h)

**Tasks:**
- [ ] Run migration script MangoBajito (dev first)
- [ ] Verify badges visible frontend
- [ ] Run migration script SuperHotdog
- [ ] Screenshot results (before/after)
- [ ] Document manual steps if any

---

### Step 4: Performance Testing (1h)

**Queries to test:**
```sql
-- 1. Category grouping (should use index)
EXPLAIN ANALYZE
SELECT category, COUNT(*) as count
FROM products
WHERE tenant_id = 'xxx' AND active = true
GROUP BY category;

-- 2. Products with badges
EXPLAIN ANALYZE
SELECT id, name, metadata -> 'badges' as badges
FROM products
WHERE tenant_id = 'xxx'
  AND metadata ? 'badges'
  AND jsonb_array_length(metadata -> 'badges') > 0;

-- 3. tenants_public view
EXPLAIN ANALYZE
SELECT slug, template FROM tenants_public WHERE slug = 'mangobajito';
```

**Benchmarks:**
- Category grouping: <50ms (20-30 products)
- Badge filtering: <100ms
- tenants_public view: <10ms (cached)

---

### Step 5: Deploy Staging (30min)

**Tasks:**
- [ ] Push migrations production (`supabase db push --linked`)
- [ ] Run data migration scripts (MangoBajito, SuperHotdog)
- [ ] Verify frontend template switch works
- [ ] Test E2E: browse restaurant template
- [ ] Monitor error logs (Sentry/Supabase dashboard)

---

## Testing Checklist

### Database
- [ ] `tenants_public` view includes template column
- [ ] Query `SELECT * FROM tenants_public WHERE slug = 'mangobajito'` returns template
- [ ] RLS policy allows read (test as anon user)
- [ ] `products.metadata` has badges array structure
- [ ] Constraint validates badges is array (if added)
- [ ] Index `idx_products_category` exists and used by planner

### API
- [ ] `/api/tenant/mangobajito/config` returns `{ template: 'restaurant' }`
- [ ] Frontend receives template field (check Network tab)
- [ ] No 500 errors logs (Vercel/Supabase)

### Data Migration
- [ ] MangoBajito template = 'restaurant'
- [ ] SuperHotdog template = 'restaurant'
- [ ] MangoBajito products have badges (popular, promo, etc)
- [ ] SuperHotdog products have badges
- [ ] No data loss (verify product counts)

### Performance
- [ ] Category grouping <50ms (staging)
- [ ] Badge queries <100ms
- [ ] No N+1 queries (check Supabase slow query log)

---

## Performance Targets

| Query | Target | Current | Status |
|-------|--------|---------|--------|
| tenants_public view | <10ms | TBD | ⚪ |
| Category grouping | <50ms | TBD | ⚪ |
| Products with badges | <100ms | TBD | ⚪ |
| Full products list | <200ms | TBD | ⚪ |

---

## Rollback Plan

**If restaurant template breaks production:**

1. **Immediate:** Revert tenant template
   ```sql
   UPDATE tenants SET template = 'gallery'
   WHERE slug IN ('mangobajito', 'superhotdog');
   ```

2. **Cache clear:** Invalidate ISR cache (Vercel redeploy)

3. **Monitor:** Check error rate drops

4. **Debug:** Review logs, fix issue, re-migrate

---

## Security Considerations

### RLS Policies
- [ ] tenants_public view: SELECT allowed anon (needed for public storefront)
- [ ] products table: SELECT filtered by tenant_id (prevent leak)
- [ ] categories table (if created): SELECT by tenant_id

### Data Validation
- [ ] Badges array: validate BadgeType enum (prevent invalid badges)
- [ ] metadata JSONB: max size limit (prevent DoS)
- [ ] Category names: sanitize (prevent XSS if rendered raw)

---

## Documentation

### Update Docs
- [ ] `docs/projects/sw_commerce_saas/DATABASE_SCHEMA.md` (add badges field)
- [ ] `docs/projects/sw_commerce_saas/API_REFERENCE.md` (template field)
- [ ] Inline comments migrations (explain badges structure)

### Admin Guide
- [ ] How to add badges to products (admin UI or SQL)
- [ ] Badge types reference (nuevo, promo, spicy, etc)
- [ ] Template switching guide (when to use restaurant)

---

## Definition of Done

- [ ] Migration 020: tenants_public includes template ✅
- [ ] Migration 021: products.metadata badges schema ✅
- [ ] Migration 022: category index created ✅
- [ ] API `/api/tenant/[slug]/config` returns template ✅
- [ ] MangoBajito migrated to restaurant template ✅
- [ ] SuperHotdog migrated to restaurant template ✅
- [ ] Performance tests passing (<50ms category queries) ✅
- [ ] RLS policies validated (no data leaks) ✅
- [ ] Staging deploy successful ✅
- [ ] Pixel confirmed frontend working ✅
- [ ] Docs updated ✅

---

## Timeline

| Task | Horas | Owner |
|------|-------|-------|
| Schema migrations | 2h | Kokoro |
| API validation | 1h | Kokoro |
| Data migration scripts | 1h | Kokoro |
| Performance testing | 1h | Kokoro |
| Deploy staging | 0.5h | Kokoro |

**Total:** 5.5h (~1 día)

---

## Next Steps

1. Kokoro ejecuta tasks
2. Staging deploy + validation
3. Handoff a Sentinela para E2E tests
4. A/B test MangoBajito (7 días)
5. Production rollout si KPIs positivos

---

**Kokoro, ready to ship backend support for restaurant template.** 🔧🚀
