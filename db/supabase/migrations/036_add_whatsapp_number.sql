-- Migration 036: Add WhatsApp number to tenants table
-- Purpose: Enable WhatsApp contact for tenant storefronts
-- Date: 2025-01-14
-- Priority: P1 (Sprint - WhatsApp Integration)

-- ============================================================
-- PHASE 1: ADD WHATSAPP COLUMN
-- ============================================================

-- Add whatsapp_number column (nullable, E.164 format)
ALTER TABLE tenants
ADD COLUMN whatsapp_number VARCHAR(20);

-- ============================================================
-- PHASE 2: ADD DOCUMENTATION
-- ============================================================

-- Add comment documentation for schema clarity
COMMENT ON COLUMN tenants.whatsapp_number IS 'WhatsApp number in E.164 format (e.g., +1234567890). Max 20 chars including country code.';

-- ============================================================
-- VERIFICATION QUERIES (RUN MANUALLY AFTER MIGRATION)
-- ============================================================

/*
-- Check column exists with correct type
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'tenants'
  AND column_name = 'whatsapp_number';

-- Expected output:
-- whatsapp_number | character varying | 20 | YES

-- Verify all existing tenants have NULL values (no data loss)
SELECT id, slug, whatsapp_number
FROM tenants
LIMIT 10;

-- Test update on demo tenant
UPDATE tenants
SET whatsapp_number = '+5491123456789'
WHERE slug = 'mangobajito';

-- Verify update applied
SELECT slug, whatsapp_number
FROM tenants
WHERE slug = 'mangobajito';

-- Test clear field
UPDATE tenants
SET whatsapp_number = NULL
WHERE slug = 'mangobajito';
*/
