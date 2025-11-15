-- Clean Test Data Script
-- Removes all test data (tenants with slug starting with common test patterns)

-- Delete test orders (cascade will handle order_items)
DELETE FROM orders
WHERE tenant_id IN (
  SELECT id FROM tenants
  WHERE slug LIKE 'test-%'
     OR slug LIKE 'e2e-%'
     OR slug LIKE 'store-%'
     OR slug LIKE 'no-logo-%'
     OR slug LIKE 'demo-%'
);

-- Delete test products
DELETE FROM products
WHERE tenant_id IN (
  SELECT id FROM tenants
  WHERE slug LIKE 'test-%'
     OR slug LIKE 'e2e-%'
     OR slug LIKE 'store-%'
     OR slug LIKE 'no-logo-%'
     OR slug LIKE 'demo-%'
);

-- Delete test customers
DELETE FROM customers
WHERE tenant_id IN (
  SELECT id FROM tenants
  WHERE slug LIKE 'test-%'
     OR slug LIKE 'e2e-%'
     OR slug LIKE 'store-%'
     OR slug LIKE 'no-logo-%'
     OR slug LIKE 'demo-%'
);

-- Delete test tenants
DELETE FROM tenants
WHERE slug LIKE 'test-%'
   OR slug LIKE 'e2e-%'
   OR slug LIKE 'store-%'
   OR slug LIKE 'no-logo-%'
   OR slug LIKE 'demo-%';

-- Delete test users (from auth.users)
-- Note: This requires service role access
-- You may need to run this separately via Supabase dashboard
SELECT COUNT(*) as deleted_test_tenants FROM tenants WHERE false;
