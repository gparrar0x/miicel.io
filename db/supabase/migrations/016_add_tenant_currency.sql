-- Migration: Add currency field to tenant config
-- Description: Add currency to tenant config JSONB to support multi-currency stores
-- Timestamp: 20251116233143

BEGIN;

-- Add currency field to existing tenant configs with default 'USD'
UPDATE tenants
SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb),
  '{currency}',
  '"USD"'
)
WHERE config->>'currency' IS NULL;

-- Add comment documenting the config structure
COMMENT ON COLUMN tenants.config IS 'Tenant configuration (JSONB): {
  "logo": string (optional),
  "logoText": string (optional),
  "banner": string (optional),
  "colors": { "primary": string, "secondary": string, ... },
  "business": { "name": string, "subtitle": string (optional), "location": string (optional) },
  "hours": object (optional),
  "currency": string (default: USD) - ISO 4217 currency code
}';

COMMIT;
