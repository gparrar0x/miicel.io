-- Migration 020: Add template and theme_overrides to tenants_public view
-- Date: 2025-01-17
-- Author: Kokoro
-- Purpose: Expose template field for frontend routing (SKY-42)

-- Drop existing view
DROP VIEW IF EXISTS tenants_public;

-- Recreate view with template and theme_overrides
CREATE VIEW tenants_public AS
SELECT
  id,
  slug,
  name,
  plan,
  config,
  template,           -- 👈 ADD: template field for frontend routing
  theme_overrides,    -- 👈 ADD: theme customization
  active,
  created_at
FROM tenants
WHERE active = true;

-- Add comment
COMMENT ON VIEW tenants_public IS 'Public tenant data including template field for storefront routing';

-- Grant access
GRANT SELECT ON tenants_public TO anon;
GRANT SELECT ON tenants_public TO authenticated;

-- Verify template visible
-- Test: SELECT slug, template FROM tenants_public WHERE slug = 'mangobajito';
