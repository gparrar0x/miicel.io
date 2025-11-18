-- Migration: Seed Tenant Theme Configuration
-- Purpose: Add extended theme config to existing tenants (demo + superhotdog)
-- Date: 2025-11-15
-- Priority: P1 (Feature Addition)

-- ============================================================
-- PHASE 1: UPDATE DEMO TENANT WITH FULL CONFIG
-- ============================================================

UPDATE tenants
SET config = '{
  "logo": "https://lmqysqapqbttmyheuejo.supabase.co/storage/v1/object/public/assets/demo/logo-circle.png",
  "logoText": "https://lmqysqapqbttmyheuejo.supabase.co/storage/v1/object/public/assets/demo/logo-text.png",
  "banner": "https://lmqysqapqbttmyheuejo.supabase.co/storage/v1/object/public/assets/demo/banner.jpg",
  "colors": {
    "primary": "#3B82F6",
    "secondary": "#10B981",
    "accent": "#F59E0B",
    "background": "#FFFFFF",
    "surface": "#F8F8F8",
    "textPrimary": "#000000",
    "textSecondary": "#999999"
  },
  "business": {
    "name": "Demo Store - Vendio",
    "subtitle": "Tu tienda en línea favorita",
    "location": "Buenos Aires, Argentina"
  },
  "hours": {
    "monday": {"open": "10:00", "close": "22:00"},
    "tuesday": {"open": "10:00", "close": "22:00"},
    "wednesday": {"open": "10:00", "close": "22:00"},
    "thursday": {"open": "10:00", "close": "22:00"},
    "friday": {"open": "10:00", "close": "22:00"},
    "saturday": {"open": "10:00", "close": "23:00"},
    "sunday": {"open": "12:00", "close": "20:00"}
  }
}'::jsonb,
updated_at = NOW()
WHERE slug = 'demo';

-- ============================================================
-- PHASE 2: CREATE TEST TENANT - SUPERHOTDOG
-- ============================================================

-- Note: Uses INSERT ... ON CONFLICT to be idempotent
INSERT INTO tenants (slug, name, owner_email, owner_id, plan, active, config, created_at, updated_at)
VALUES (
  'superhotdog',
  'Super Hot Dog',
  'test@superhotdog.com',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', -- placeholder UUID
  'free',
  true,
  '{
    "logo": "https://lmqysqapqbttmyheuejo.supabase.co/storage/v1/object/public/assets/superhotdog/logo-circle.png",
    "logoText": "https://lmqysqapqbttmyheuejo.supabase.co/storage/v1/object/public/assets/superhotdog/logo-text.png",
    "banner": "https://lmqysqapqbttmyheuejo.supabase.co/storage/v1/object/public/assets/superhotdog/banner.jpg",
    "colors": {
      "primary": "#dc2626",
      "secondary": "#1e40af",
      "accent": "#fbbf24",
      "background": "#ffffff",
      "surface": "#f8fafc",
      "textPrimary": "#000000",
      "textSecondary": "#999999"
    },
    "business": {
      "name": "Super Hot Dog",
      "subtitle": "Los Hot Dogs más grandes de Bariloche",
      "location": "Av. Gallardo 1081, local 3 - Bariloche"
    },
    "hours": {
      "monday": {"open": "10:30", "close": "23:00"},
      "tuesday": {"open": "10:30", "close": "23:00"},
      "wednesday": {"open": "10:30", "close": "23:00"},
      "thursday": {"open": "10:30", "close": "23:00"},
      "friday": {"open": "10:30", "close": "23:00"},
      "saturday": {"open": "10:30", "close": "23:00"},
      "sunday": {"open": "10:30", "close": "23:00"}
    }
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE
SET
  config = EXCLUDED.config,
  updated_at = NOW();

-- ============================================================
-- VERIFICATION QUERIES (RUN MANUALLY AFTER MIGRATION)
-- ============================================================

/*
-- Check demo tenant config
SELECT slug, name, config->'business' as business, config->'colors' as colors
FROM tenants
WHERE slug = 'demo';

-- Check superhotdog tenant config
SELECT slug, name, config->'business' as business, config->'colors' as colors
FROM tenants
WHERE slug = 'superhotdog';

-- Test API endpoint response shape
SELECT
  slug as id,
  COALESCE((config->'business'->>'name'), name) as business_name,
  config->'business'->>'subtitle' as subtitle,
  config->'business'->>'location' as location,
  config->>'banner' as banner_url,
  config->>'logo' as logo_url,
  config->>'logoText' as logo_text_url,
  config->'colors' as colors,
  config->'hours' as hours
FROM tenants
WHERE slug IN ('demo', 'superhotdog');
*/
