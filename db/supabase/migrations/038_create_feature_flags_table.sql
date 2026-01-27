-- Migration: 038_create_feature_flags_table.sql
-- Purpose: Create feature_flags table and seed initial flags
-- Date: 2025-01-26

-- =============================================================================
-- PART 1: Helper function for updated_at (if not exists)
-- =============================================================================

CREATE OR REPLACE FUNCTION update_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- PART 2: Create feature_flags table
-- =============================================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for key lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled) WHERE enabled = true;

-- Updated at trigger
DROP TRIGGER IF EXISTS feature_flags_updated_at ON feature_flags;
CREATE TRIGGER feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_flags_updated_at();

-- =============================================================================
-- PART 3: RLS Policies
-- =============================================================================

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Everyone can read flags (needed for client-side checks)
DROP POLICY IF EXISTS "Anyone can read feature flags" ON feature_flags;
CREATE POLICY "Anyone can read feature flags"
  ON feature_flags FOR SELECT
  USING (true);

-- Only superadmins can modify flags (uses existing is_superadmin RPC)
DROP POLICY IF EXISTS "Superadmins can insert feature flags" ON feature_flags;
CREATE POLICY "Superadmins can insert feature flags"
  ON feature_flags FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'platform_admin')
  );

DROP POLICY IF EXISTS "Superadmins can update feature flags" ON feature_flags;
CREATE POLICY "Superadmins can update feature flags"
  ON feature_flags FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'platform_admin')
  );

DROP POLICY IF EXISTS "Superadmins can delete feature flags" ON feature_flags;
CREATE POLICY "Superadmins can delete feature flags"
  ON feature_flags FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'platform_admin')
  );

-- =============================================================================
-- PART 4: Seed initial feature flags
-- =============================================================================

INSERT INTO feature_flags (key, description, enabled, rules) VALUES
  ('consignments', 'Consignment management for galleries - track artwork locations and sales', true, '{"templates": ["gallery"]}'),
  ('kitchen_view', 'Kitchen display view for restaurants - real-time order tracking', true, '{"templates": ["restaurant", "gastronomy"]}'),
  ('analytics_v2', 'New analytics dashboard with advanced metrics', true, '{}'),
  ('dark_mode', 'Dark mode theme support', true, '{}'),
  ('new_checkout', 'New checkout flow with improved UX', false, '{"percentage": 0}')
ON CONFLICT (key) DO UPDATE SET
  description = EXCLUDED.description,
  enabled = EXCLUDED.enabled,
  rules = EXCLUDED.rules,
  updated_at = now();

-- =============================================================================
-- PART 5: Comments
-- =============================================================================

COMMENT ON TABLE feature_flags IS 'Feature flags for gradual rollout and A/B testing';
COMMENT ON COLUMN feature_flags.key IS 'Unique identifier used in code (e.g., consignments, dark_mode)';
COMMENT ON COLUMN feature_flags.enabled IS 'Global on/off switch - if false, flag is disabled for everyone';
COMMENT ON COLUMN feature_flags.rules IS 'JSON targeting rules: tenants[], templates[], users[], percentage, environments[]';

-- =============================================================================
-- PART 6: Verify
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '=== Feature Flags Migration Complete ===';
  RAISE NOTICE 'Table created: feature_flags';
  RAISE NOTICE 'Flags seeded: consignments, kitchen_view, analytics_v2, dark_mode, new_checkout';
END $$;
