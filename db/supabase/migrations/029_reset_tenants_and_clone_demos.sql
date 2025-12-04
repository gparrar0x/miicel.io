-- Migration: Reset tenant IDs and clone demo data
-- Description:
--   1. Delete test tenants (43-45)
--   2. Clean demo_galeria (1) and demo_restaurant (36)
--   3. Clone artmonkeys (38) → demo_galeria (1)
--   4. Clone mangobajito (40) → demo_restaurant (36)
--   5. Reset sequence to safe value
-- Date: 2025-11-29

BEGIN;

-- ============================================
-- STEP 1: Delete test tenants (safe, no data)
-- ============================================
DELETE FROM tenants WHERE id IN (43, 44, 45);

-- ============================================
-- STEP 2: Clean demo tenants data
-- ============================================

-- Clean demo_galeria (ID 1)
DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE tenant_id = 1);
DELETE FROM orders WHERE tenant_id = 1;
DELETE FROM customers WHERE tenant_id = 1;
DELETE FROM products WHERE tenant_id = 1;

-- Clean demo_restaurant (ID 36)
DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE tenant_id = 36);
DELETE FROM orders WHERE tenant_id = 36;
DELETE FROM customers WHERE tenant_id = 36;
DELETE FROM products WHERE tenant_id = 36;

-- ============================================
-- STEP 3: Clone artmonkeys (38) → demo_galeria (1)
-- ============================================

-- Update tenant config (keep slug/name, copy everything else)
UPDATE tenants
SET
  name = 'Demo Galería',
  owner_email = (SELECT owner_email FROM tenants WHERE id = 38),
  owner_id = (SELECT owner_id FROM tenants WHERE id = 38),
  plan = (SELECT plan FROM tenants WHERE id = 38),
  config = (SELECT config FROM tenants WHERE id = 38),
  secure_config = (SELECT secure_config FROM tenants WHERE id = 38),
  template = (SELECT template FROM tenants WHERE id = 38),
  theme_overrides = (SELECT theme_overrides FROM tenants WHERE id = 38),
  mp_access_token = (SELECT mp_access_token FROM tenants WHERE id = 38),
  active = true,
  updated_at = NOW()
WHERE id = 1;

-- Clone products
INSERT INTO products (
  tenant_id,
  name,
  description,
  price,
  category,
  stock,
  image_url,
  metadata,
  display_order,
  active
)
SELECT
  1 as tenant_id,  -- Target demo_galeria
  name,
  description,
  price,
  category,
  stock,
  image_url,
  metadata,
  display_order,
  active
FROM products
WHERE tenant_id = 38  -- Source artmonkeys
ORDER BY id;

-- ============================================
-- STEP 4: Clone mangobajito (40) → demo_restaurant (36)
-- ============================================

-- Update tenant config
UPDATE tenants
SET
  name = 'Demo Restaurant',
  owner_email = (SELECT owner_email FROM tenants WHERE id = 40),
  owner_id = (SELECT owner_id FROM tenants WHERE id = 40),
  plan = (SELECT plan FROM tenants WHERE id = 40),
  config = (SELECT config FROM tenants WHERE id = 40),
  secure_config = (SELECT secure_config FROM tenants WHERE id = 40),
  template = (SELECT template FROM tenants WHERE id = 40),
  theme_overrides = (SELECT theme_overrides FROM tenants WHERE id = 40),
  mp_access_token = (SELECT mp_access_token FROM tenants WHERE id = 40),
  active = true,
  updated_at = NOW()
WHERE id = 36;

-- Clone products
INSERT INTO products (
  tenant_id,
  name,
  description,
  price,
  category,
  stock,
  image_url,
  metadata,
  display_order,
  active
)
SELECT
  36 as tenant_id,  -- Target demo_restaurant
  name,
  description,
  price,
  category,
  stock,
  image_url,
  metadata,
  display_order,
  active
FROM products
WHERE tenant_id = 40  -- Source mangobajito
ORDER BY id;

-- ============================================
-- STEP 5: Reset sequence to safe value
-- ============================================
-- Set to 50 (above current max of 45, leaves room for manual fixes)
SELECT setval('tenants_id_new_seq', 50, false);

-- ============================================
-- VERIFICATION QUERIES (commented - run manually if needed)
-- ============================================
-- SELECT id, slug, name, template FROM tenants ORDER BY id;
-- SELECT tenant_id, COUNT(*) FROM products GROUP BY tenant_id ORDER BY tenant_id;
-- SELECT last_value FROM tenants_id_new_seq;

COMMIT;

-- ============================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================
-- BEGIN;
-- -- Restore original demo_galeria/demo_restaurant from backup
-- -- Re-create test tenants if needed
-- -- Reset sequence to 45
-- SELECT setval('tenants_id_new_seq', 45, true);
-- COMMIT;
