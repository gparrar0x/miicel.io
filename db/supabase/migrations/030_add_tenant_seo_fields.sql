-- Migration 030: Add SEO fields to tenants table
-- Purpose: Enable custom SEO metadata for tenant storefronts
-- Date: 2025-11-26
-- Priority: P1 (Sprint 2 - SEO Richness + Control)

-- ============================================================
-- PHASE 1: ADD SEO COLUMNS
-- ============================================================

-- Add SEO columns (nullable, defaults to NULL)
-- If NULL, system falls back to business_name/subtitle
ALTER TABLE tenants
ADD COLUMN seo_title VARCHAR(60),
ADD COLUMN seo_description VARCHAR(160),
ADD COLUMN seo_keywords VARCHAR(255);

-- ============================================================
-- PHASE 2: CREATE INDEXES
-- ============================================================

-- Create partial index for search/filtering (only rows with seo_title set)
CREATE INDEX idx_tenants_seo_title
  ON tenants(seo_title)
  WHERE seo_title IS NOT NULL;

-- ============================================================
-- PHASE 3: ADD DOCUMENTATION
-- ============================================================

-- Add comment documentation for schema clarity
COMMENT ON COLUMN tenants.seo_title IS 'Custom SEO title (max 60 chars). If NULL, falls back to business_name from config.';
COMMENT ON COLUMN tenants.seo_description IS 'Custom SEO description (max 160 chars). If NULL, falls back to subtitle from config.';
COMMENT ON COLUMN tenants.seo_keywords IS 'Comma-separated keywords for SEO (optional, max 255 chars).';

-- ============================================================
-- VERIFICATION QUERIES (RUN MANUALLY AFTER MIGRATION)
-- ============================================================

/*
-- Check columns exist with correct types
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'tenants'
  AND column_name LIKE 'seo_%'
ORDER BY column_name;

-- Expected output:
-- seo_description | character varying | 160 | YES
-- seo_keywords    | character varying | 255 | YES
-- seo_title       | character varying | 60  | YES

-- Verify all existing tenants have NULL values (no data loss)
SELECT slug, business_name, seo_title, seo_description, seo_keywords
FROM tenants
LIMIT 10;

-- Test update on mangobajito tenant
UPDATE tenants
SET seo_title = 'Mango Bajito - Café & Brunch en Buenos Aires',
    seo_description = 'Visitá nuestro café especializado en brunch y postres artesanales. Ambiente acogedor en el corazón de Buenos Aires.',
    seo_keywords = 'café, brunch, postres, buenos aires, mango bajito'
WHERE slug = 'mangobajito';

-- Verify update applied
SELECT business_name, seo_title, seo_description, seo_keywords
FROM tenants
WHERE slug = 'mangobajito';

-- Test fallback logic (simulate API query)
SELECT
  slug,
  COALESCE(seo_title, (config->'business'->>'name'), name) as effective_title,
  COALESCE(seo_description, config->'business'->>'subtitle') as effective_description,
  seo_keywords
FROM tenants
WHERE slug IN ('demo', 'superhotdog', 'mangobajito')
ORDER BY slug;
*/
