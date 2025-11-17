-- Migration: Add Template and Theme Override Configuration to Tenants
-- Purpose: Enable template selection (gallery/detail/minimal) + JSONB theme overrides
-- Date: 2025-11-16
-- Priority: P0 (Blocks Frontend ThemeProvider)

-- ============================================================
-- PHASE 1: ADD NEW COLUMNS TO TENANTS TABLE
-- ============================================================

-- Add template column (enum constraint via CHECK)
ALTER TABLE tenants
ADD COLUMN template VARCHAR(50) DEFAULT 'gallery'
CHECK (template IN ('gallery', 'detail', 'minimal'));

-- Add theme_overrides JSONB column (defaults to empty object)
ALTER TABLE tenants
ADD COLUMN theme_overrides JSONB DEFAULT '{}'::jsonb;

-- Add NOT NULL constraints
ALTER TABLE tenants
ALTER COLUMN template SET NOT NULL;

ALTER TABLE tenants
ALTER COLUMN theme_overrides SET NOT NULL;

-- ============================================================
-- PHASE 2: CREATE VALIDATION FUNCTION FOR theme_overrides
-- ============================================================

-- Ensures theme_overrides is valid JSON and follows expected structure
-- Prevents invalid keys, enforces gridCols range, validates hex colors
CREATE OR REPLACE FUNCTION validate_theme_overrides()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure it's a valid JSON object (not array or null)
  IF jsonb_typeof(NEW.theme_overrides) != 'object' THEN
    RAISE EXCEPTION 'theme_overrides must be a JSON object';
  END IF;

  -- Validate gridCols if present (must be 1-6)
  IF NEW.theme_overrides ? 'gridCols' THEN
    IF NOT (NEW.theme_overrides->>'gridCols' ~ '^\d+$') THEN
      RAISE EXCEPTION 'gridCols must be a positive integer';
    END IF;
    IF (NEW.theme_overrides->>'gridCols')::int NOT BETWEEN 1 AND 6 THEN
      RAISE EXCEPTION 'gridCols must be between 1 and 6';
    END IF;
  END IF;

  -- Validate imageAspect if present (must match ratio pattern)
  IF NEW.theme_overrides ? 'imageAspect' THEN
    IF NOT (NEW.theme_overrides->>'imageAspect' ~ '^\d+:\d+$') THEN
      RAISE EXCEPTION 'imageAspect must be in format "W:H" (e.g., "1:1", "16:9")';
    END IF;
  END IF;

  -- Validate cardVariant if present
  IF NEW.theme_overrides ? 'cardVariant' THEN
    IF NEW.theme_overrides->>'cardVariant' NOT IN ('flat', 'elevated', 'outlined') THEN
      RAISE EXCEPTION 'cardVariant must be one of: flat, elevated, outlined';
    END IF;
  END IF;

  -- Validate spacing if present
  IF NEW.theme_overrides ? 'spacing' THEN
    IF NEW.theme_overrides->>'spacing' NOT IN ('compact', 'normal', 'relaxed') THEN
      RAISE EXCEPTION 'spacing must be one of: compact, normal, relaxed';
    END IF;
  END IF;

  -- Validate colors.primary and colors.accent if present (must be hex)
  IF NEW.theme_overrides ? 'colors' THEN
    IF jsonb_typeof(NEW.theme_overrides->'colors') != 'object' THEN
      RAISE EXCEPTION 'colors must be a JSON object';
    END IF;

    IF NEW.theme_overrides->'colors' ? 'primary' THEN
      IF NOT (NEW.theme_overrides->'colors'->>'primary' ~ '^#[0-9A-Fa-f]{6}$') THEN
        RAISE EXCEPTION 'colors.primary must be a valid hex color (e.g., #000000)';
      END IF;
    END IF;

    IF NEW.theme_overrides->'colors' ? 'accent' THEN
      IF NOT (NEW.theme_overrides->'colors'->>'accent' ~ '^#[0-9A-Fa-f]{6}$') THEN
        RAISE EXCEPTION 'colors.accent must be a valid hex color (e.g., #ffffff)';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to tenants table
CREATE TRIGGER validate_theme_overrides_trigger
BEFORE INSERT OR UPDATE ON tenants
FOR EACH ROW
EXECUTE FUNCTION validate_theme_overrides();

-- ============================================================
-- PHASE 3: SEED DEMO TENANTS WITH ALL 3 TEMPLATE EXAMPLES
-- ============================================================

-- Update 'demo' tenant to use 'gallery' template
UPDATE tenants
SET
  template = 'gallery',
  theme_overrides = '{
    "gridCols": 3,
    "imageAspect": "1:1",
    "cardVariant": "elevated",
    "spacing": "normal",
    "colors": {
      "primary": "#3B82F6",
      "accent": "#F59E0B"
    }
  }'::jsonb,
  updated_at = NOW()
WHERE slug = 'demo';

-- Update 'superhotdog' tenant to use 'detail' template
UPDATE tenants
SET
  template = 'detail',
  theme_overrides = '{
    "gridCols": 2,
    "imageAspect": "16:9",
    "cardVariant": "outlined",
    "spacing": "relaxed",
    "colors": {
      "primary": "#dc2626",
      "accent": "#fbbf24"
    }
  }'::jsonb,
  updated_at = NOW()
WHERE slug = 'superhotdog';

-- Create a third demo tenant with 'minimal' template
INSERT INTO tenants (slug, name, owner_email, owner_id, plan, active, template, theme_overrides, config, created_at, updated_at)
VALUES (
  'minimal-demo',
  'Minimal Store Demo',
  'test@minimal.com',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', -- placeholder UUID
  'free',
  true,
  'minimal',
  '{
    "gridCols": 4,
    "imageAspect": "4:3",
    "cardVariant": "flat",
    "spacing": "compact",
    "colors": {
      "primary": "#000000",
      "accent": "#ffffff"
    }
  }'::jsonb,
  '{
    "logo": "https://lmqysqapqbttmyheuejo.supabase.co/storage/v1/object/public/assets/demo/logo-circle.png",
    "logoText": "https://lmqysqapqbttmyheuejo.supabase.co/storage/v1/object/public/assets/demo/logo-text.png",
    "colors": {
      "primary": "#000000",
      "secondary": "#999999",
      "accent": "#ffffff",
      "background": "#ffffff",
      "surface": "#f8f8f8",
      "textPrimary": "#000000",
      "textSecondary": "#666666"
    },
    "business": {
      "name": "Minimal Store",
      "subtitle": "Less is more",
      "location": "Online Only"
    }
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
SET
  template = EXCLUDED.template,
  theme_overrides = EXCLUDED.theme_overrides,
  config = EXCLUDED.config,
  updated_at = NOW();

-- ============================================================
-- PHASE 4: CREATE INDEX FOR TEMPLATE FILTERING
-- ============================================================

-- Index for queries filtering by template type
CREATE INDEX idx_tenants_template ON tenants(template) WHERE active = true;

-- GIN index for JSONB theme_overrides lookups (if needed for advanced filtering)
CREATE INDEX idx_tenants_theme_overrides ON tenants USING GIN (theme_overrides);

-- ============================================================
-- VERIFICATION QUERIES (RUN MANUALLY AFTER MIGRATION)
-- ============================================================

/*
-- Check all tenants with new columns
SELECT
  slug,
  name,
  template,
  theme_overrides,
  config->'business'->>'name' as business_name
FROM tenants
WHERE active = true
ORDER BY template, slug;

-- Test validation: Try inserting invalid data
-- (Should fail with constraint errors)

-- Invalid template
INSERT INTO tenants (slug, name, owner_email, owner_id, plan, active, template)
VALUES ('test-fail', 'Test', 'test@test.com', 'abc', 'free', true, 'invalid');

-- Invalid gridCols
UPDATE tenants
SET theme_overrides = '{"gridCols": 10}'
WHERE slug = 'demo';

-- Invalid hex color
UPDATE tenants
SET theme_overrides = '{"colors": {"primary": "#ZZZZZZ"}}'
WHERE slug = 'demo';
*/
