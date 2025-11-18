-- Migration 015: Add Template System (Simplified for manual execution)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/lmqysqapqbttmyheuejo/sql/new

-- PHASE 1: Add columns
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS template VARCHAR(50) DEFAULT 'gallery';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS theme_overrides JSONB DEFAULT '{}'::jsonb;
ALTER TABLE tenants ALTER COLUMN template SET NOT NULL;
ALTER TABLE tenants ALTER COLUMN theme_overrides SET NOT NULL;

-- PHASE 2: Validation function
CREATE OR REPLACE FUNCTION validate_theme_overrides() RETURNS TRIGGER AS $$
BEGIN
  IF jsonb_typeof(NEW.theme_overrides) != 'object' THEN
    RAISE EXCEPTION 'theme_overrides must be a JSON object';
  END IF;

  IF NEW.theme_overrides ? 'gridCols' THEN
    IF NOT (NEW.theme_overrides->>'gridCols' ~ '^\d+$') THEN
      RAISE EXCEPTION 'gridCols must be a positive integer';
    END IF;
    IF (NEW.theme_overrides->>'gridCols')::int NOT BETWEEN 1 AND 6 THEN
      RAISE EXCEPTION 'gridCols must be between 1 and 6';
    END IF;
  END IF;

  IF NEW.theme_overrides ? 'imageAspect' THEN
    IF NOT (NEW.theme_overrides->>'imageAspect' ~ '^\d+:\d+$') THEN
      RAISE EXCEPTION 'imageAspect must be in format "W:H"';
    END IF;
  END IF;

  IF NEW.theme_overrides ? 'cardVariant' THEN
    IF NEW.theme_overrides->>'cardVariant' NOT IN ('flat', 'elevated', 'outlined') THEN
      RAISE EXCEPTION 'cardVariant must be flat, elevated, or outlined';
    END IF;
  END IF;

  IF NEW.theme_overrides ? 'spacing' THEN
    IF NEW.theme_overrides->>'spacing' NOT IN ('compact', 'normal', 'relaxed') THEN
      RAISE EXCEPTION 'spacing must be compact, normal, or relaxed';
    END IF;
  END IF;

  IF NEW.theme_overrides ? 'colors' THEN
    IF jsonb_typeof(NEW.theme_overrides->'colors') != 'object' THEN
      RAISE EXCEPTION 'colors must be an object';
    END IF;
    IF NEW.theme_overrides->'colors' ? 'primary' THEN
      IF NOT (NEW.theme_overrides->'colors'->>'primary' ~ '^#[0-9A-Fa-f]{6}$') THEN
        RAISE EXCEPTION 'colors.primary must be hex (e.g., #000000)';
      END IF;
    END IF;
    IF NEW.theme_overrides->'colors' ? 'accent' THEN
      IF NOT (NEW.theme_overrides->'colors'->>'accent' ~ '^#[0-9A-Fa-f]{6}$') THEN
        RAISE EXCEPTION 'colors.accent must be hex';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_theme_overrides_trigger ON tenants;
CREATE TRIGGER validate_theme_overrides_trigger
  BEFORE INSERT OR UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION validate_theme_overrides();

-- PHASE 3: Update 'sky' tenant with gallery template
UPDATE tenants SET
  template = 'gallery',
  theme_overrides = '{"gridCols":3,"imageAspect":"1:1","cardVariant":"elevated","spacing":"normal","colors":{"primary":"#3B82F6","accent":"#F59E0B"}}'::jsonb,
  updated_at = NOW()
WHERE slug = 'sky';

-- PHASE 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_tenants_template ON tenants(template) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_tenants_theme_overrides ON tenants USING GIN (theme_overrides);

-- Verify
SELECT slug, template, theme_overrides FROM tenants WHERE slug = 'sky';
