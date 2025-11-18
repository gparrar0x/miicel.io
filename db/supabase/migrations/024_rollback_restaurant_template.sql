-- Migration 024: Rollback restaurant template changes (emergency use only)
-- Date: 2025-01-17
-- Author: Kokoro
-- Purpose: Revert SKY-42 changes if needed

-- WARNING: This will lose badge data. Backup first!

-- 1. Revert templates to gallery
UPDATE tenants
SET template = 'gallery', updated_at = now()
WHERE slug IN ('mangobajito', 'superhotdog');

-- 2. Remove badges from metadata (preserve other fields)
UPDATE products
SET metadata = metadata - 'badges'
WHERE tenant_id IN (
  SELECT id FROM tenants WHERE slug IN ('mangobajito', 'superhotdog')
);

-- 3. Optionally drop indexes (uncomment if needed)
-- DROP INDEX IF EXISTS idx_products_metadata_badges;
-- DROP INDEX IF EXISTS idx_products_tenant_category_active;
-- DROP INDEX IF EXISTS idx_products_category;
-- DROP INDEX IF EXISTS idx_products_active_category;

-- 4. Verify rollback
SELECT
  t.slug,
  t.template,
  COUNT(p.id) as product_count,
  COUNT(CASE WHEN p.metadata ? 'badges' THEN 1 END) as products_with_badges
FROM tenants t
LEFT JOIN products p ON p.tenant_id = t.id
WHERE t.slug IN ('mangobajito', 'superhotdog')
GROUP BY t.slug, t.template;
