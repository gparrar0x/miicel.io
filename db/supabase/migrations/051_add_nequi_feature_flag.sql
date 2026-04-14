-- Migration: 051_add_nequi_feature_flag.sql
-- Purpose: Seed nequi_enabled feature flag for controlled rollout
-- Date: 2026-04-13
-- Note: No schema changes — feature_flags table already exists (migration 038)

INSERT INTO feature_flags (key, description, enabled, rules)
VALUES (
  'nequi_enabled',
  'Enable Nequi push payment method in checkout (Colombia COP tenants only)',
  false,
  '{}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Verify
DO $$
BEGIN
  RAISE NOTICE '=== 051_add_nequi_feature_flag complete ===';
  RAISE NOTICE 'Flag nequi_enabled seeded (enabled=false, no targeting rules)';
  RAISE NOTICE 'To enable for specific tenants: UPDATE feature_flags SET rules = jsonb_set(rules, ''{tenants}'', ''[1,2,3]'') WHERE key = ''nequi_enabled'';';
END $$;
