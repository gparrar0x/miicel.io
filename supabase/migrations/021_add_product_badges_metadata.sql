-- Migration 021: Add metadata JSONB column with badges schema
-- Date: 2025-01-17
-- Author: Kokoro
-- Purpose: Support product badges for restaurant template (SKY-42)

-- Add metadata column if not exists
ALTER TABLE products
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Initialize metadata for existing products (preserve if exists)
UPDATE products
SET metadata = COALESCE(metadata, '{}'::jsonb)
WHERE metadata IS NULL;

-- Add badges array to all products
UPDATE products
SET metadata = jsonb_set(
  metadata,
  '{badges}',
  '[]'::jsonb,
  true
)
WHERE NOT metadata ? 'badges';

-- Add display_order if not exists
ALTER TABLE products
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Create index on metadata for badge queries
CREATE INDEX IF NOT EXISTS idx_products_metadata_badges
ON products USING GIN ((metadata -> 'badges'));

-- Create composite index for category queries
CREATE INDEX IF NOT EXISTS idx_products_tenant_category_active
ON products(tenant_id, category, active)
WHERE active = true;

-- Add constraint for badges array validation
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_metadata_badges_valid;

ALTER TABLE products
ADD CONSTRAINT products_metadata_badges_valid
CHECK (
  NOT metadata ? 'badges' OR
  jsonb_typeof(metadata -> 'badges') = 'array'
);

-- Update column comment
COMMENT ON COLUMN products.metadata IS 'JSONB metadata: { badges: BadgeType[], dietary_info?: {...}, supplier_id?: string, last_sync?: timestamp }. Badge types: nuevo, promo, spicy-mild, spicy-hot, veggie, vegan, gluten-free, popular';

-- Helper function: Get product badges
CREATE OR REPLACE FUNCTION get_product_badges(product_id bigint)
RETURNS text[]
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    ARRAY(
      SELECT jsonb_array_elements_text(metadata -> 'badges')
      FROM products
      WHERE id = product_id
    ),
    ARRAY[]::text[]
  );
$$;

COMMENT ON FUNCTION get_product_badges IS 'Extract badges array from product metadata';

-- Verify: SELECT name, metadata -> 'badges' as badges FROM products LIMIT 5;
