-- Migration 022: Add performance indexes for category queries
-- Date: 2025-01-17
-- Author: Kokoro
-- Purpose: Optimize category grouping queries for restaurant template (SKY-42)

-- Index for category grouping (used in GROUP BY queries)
CREATE INDEX IF NOT EXISTS idx_products_category
ON products(tenant_id, category)
WHERE category IS NOT NULL;

-- Composite index for active products by category
CREATE INDEX IF NOT EXISTS idx_products_active_category
ON products(tenant_id, category, active, display_order)
WHERE active = true;

-- Update statistics for query planner
ANALYZE products;

-- Verify index usage with EXPLAIN:
-- EXPLAIN ANALYZE
-- SELECT category, COUNT(*) as product_count
-- FROM products
-- WHERE tenant_id = 1 AND active = true
-- GROUP BY category
-- ORDER BY category;
