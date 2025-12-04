-- Migration: Renumber tenants to sequential IDs 1-5
-- Description:
--   Renumber existing 5 tenants to IDs 1-5 preserving all references
--   Mapping:
--     ID 1  → ID 1  (demo_galeria)     [no change]
--     ID 36 → ID 2  (demo_restaurant)
--     ID 38 → ID 3  (artmonkeys)
--     ID 39 → ID 4  (superhotdog)
--     ID 40 → ID 5  (mangobajito)
-- Date: 2025-11-29

BEGIN;

-- ============================================
-- STEP 1: Insert new tenants with target IDs
-- ============================================

-- ID 2: demo_restaurant (from 36)
INSERT INTO tenants (
  id, slug, name, owner_email, owner_id, plan, config,
  secure_config, template, theme_overrides, mp_access_token,
  active, created_at, updated_at
)
SELECT
  2 as id,
  slug, name, owner_email, owner_id, plan, config,
  secure_config, template, theme_overrides, mp_access_token,
  active, created_at, updated_at
FROM tenants WHERE id = 36;

-- ID 3: artmonkeys (from 38)
INSERT INTO tenants (
  id, slug, name, owner_email, owner_id, plan, config,
  secure_config, template, theme_overrides, mp_access_token,
  active, created_at, updated_at
)
SELECT
  3 as id,
  slug, name, owner_email, owner_id, plan, config,
  secure_config, template, theme_overrides, mp_access_token,
  active, created_at, updated_at
FROM tenants WHERE id = 38;

-- ID 4: superhotdog (from 39)
INSERT INTO tenants (
  id, slug, name, owner_email, owner_id, plan, config,
  secure_config, template, theme_overrides, mp_access_token,
  active, created_at, updated_at
)
SELECT
  4 as id,
  slug, name, owner_email, owner_id, plan, config,
  secure_config, template, theme_overrides, mp_access_token,
  active, created_at, updated_at
FROM tenants WHERE id = 39;

-- ID 5: mangobajito (from 40)
INSERT INTO tenants (
  id, slug, name, owner_email, owner_id, plan, config,
  secure_config, template, theme_overrides, mp_access_token,
  active, created_at, updated_at
)
SELECT
  5 as id,
  slug, name, owner_email, owner_id, plan, config,
  secure_config, template, theme_overrides, mp_access_token,
  active, created_at, updated_at
FROM tenants WHERE id = 40;

-- ============================================
-- STEP 2: Update foreign keys in related tables
-- ============================================

-- Update products
UPDATE products SET tenant_id = 2 WHERE tenant_id = 36;
UPDATE products SET tenant_id = 3 WHERE tenant_id = 38;
UPDATE products SET tenant_id = 4 WHERE tenant_id = 39;
UPDATE products SET tenant_id = 5 WHERE tenant_id = 40;

-- Update orders
UPDATE orders SET tenant_id = 2 WHERE tenant_id = 36;
UPDATE orders SET tenant_id = 3 WHERE tenant_id = 38;
UPDATE orders SET tenant_id = 4 WHERE tenant_id = 39;
UPDATE orders SET tenant_id = 5 WHERE tenant_id = 40;

-- Update customers
UPDATE customers SET tenant_id = 2 WHERE tenant_id = 36;
UPDATE customers SET tenant_id = 3 WHERE tenant_id = 38;
UPDATE customers SET tenant_id = 4 WHERE tenant_id = 39;
UPDATE customers SET tenant_id = 5 WHERE tenant_id = 40;

-- ============================================
-- STEP 3: Delete old tenant records
-- ============================================

DELETE FROM tenants WHERE id IN (36, 38, 39, 40);

-- ============================================
-- STEP 4: Reset sequence to 6
-- ============================================

SELECT setval('tenants_id_new_seq', 6, false);

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify tenants (should show IDs 1-5)
-- SELECT id, slug, name, template FROM tenants ORDER BY id;

-- Verify products count by tenant
-- SELECT tenant_id, COUNT(*) FROM products GROUP BY tenant_id ORDER BY tenant_id;

-- Verify orders count by tenant
-- SELECT tenant_id, COUNT(*) FROM orders GROUP BY tenant_id ORDER BY tenant_id;

-- Verify customers count by tenant
-- SELECT tenant_id, COUNT(*) FROM customers GROUP BY tenant_id ORDER BY tenant_id;

-- Verify sequence
-- SELECT last_value, is_called FROM tenants_id_new_seq;

COMMIT;

-- ============================================
-- Expected Results:
-- ============================================
-- Tenants: 5 tenants with IDs 1, 2, 3, 4, 5
-- Products:
--   ID 1: 3 products
--   ID 2: 13 products
--   ID 3: 3 products
--   ID 4: 25 products
--   ID 5: 13 products
-- Orders:
--   ID 1: 0 orders
--   ID 2: 0 orders
--   ID 3: 19 orders
--   ID 4: 0 orders
--   ID 5: 4 orders
-- Customers:
--   ID 1: 0 customers
--   ID 2: 0 customers
--   ID 3: 22 customers
--   ID 4: 0 customers
--   ID 5: 2 customers
-- Sequence: next value = 6
