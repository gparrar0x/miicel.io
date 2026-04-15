-- Index on JSONB path tenants.secure_config->'nequi'->>'commerce_code'
-- Speeds up per-tenant webhook lookup (findByNequiCommerceCode).
-- Partial: only rows that actually have the field set.
CREATE INDEX IF NOT EXISTS idx_tenants_nequi_commerce_code
  ON tenants ((secure_config->'nequi'->>'commerce_code'))
  WHERE secure_config->'nequi'->>'commerce_code' IS NOT NULL;
