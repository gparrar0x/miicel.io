-- Migration: UUID to BIGSERIAL
-- Purpose: Convert all primary keys and foreign keys from UUID to BIGSERIAL
-- Date: 2025-01-12
-- Priority: P0 (Architecture Change)

-- ============================================================
-- PHASE 1: CREATE TEMPORARY MAPPING TABLES
-- ============================================================

-- Store UUID → INT mappings for each table
CREATE TEMP TABLE tenants_id_map (
  old_uuid UUID PRIMARY KEY,
  new_id BIGINT NOT NULL
);

CREATE TEMP TABLE products_id_map (
  old_uuid UUID PRIMARY KEY,
  new_id BIGINT NOT NULL
);

CREATE TEMP TABLE customers_id_map (
  old_uuid UUID PRIMARY KEY,
  new_id BIGINT NOT NULL
);

CREATE TEMP TABLE orders_id_map (
  old_uuid UUID PRIMARY KEY,
  new_id BIGINT NOT NULL
);

-- ============================================================
-- PHASE 2: DROP DEPENDENT VIEWS (WILL RECREATE LATER)
-- ============================================================

DROP VIEW IF EXISTS daily_sales CASCADE;
DROP VIEW IF EXISTS tenants_public CASCADE;
DROP VIEW IF EXISTS top_products CASCADE;

-- ============================================================
-- PHASE 3: DISABLE RLS (CRITICAL FOR DATA MIGRATION)
-- ============================================================

ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- PHASE 4: POPULATE MAPPING TABLES
-- ============================================================

-- Tenants: Preserve created_at order
INSERT INTO tenants_id_map (old_uuid, new_id)
SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) FROM tenants;

-- Products: Preserve created_at order
INSERT INTO products_id_map (old_uuid, new_id)
SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) FROM products;

-- Customers: Preserve created_at order
INSERT INTO customers_id_map (old_uuid, new_id)
SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) FROM customers;

-- Orders: Preserve created_at order
INSERT INTO orders_id_map (old_uuid, new_id)
SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) FROM orders;

-- ============================================================
-- PHASE 5: DROP FOREIGN KEY CONSTRAINTS
-- ============================================================

ALTER TABLE products DROP CONSTRAINT products_tenant_id_fkey;
ALTER TABLE customers DROP CONSTRAINT customers_tenant_id_fkey;
ALTER TABLE orders DROP CONSTRAINT orders_tenant_id_fkey;
ALTER TABLE orders DROP CONSTRAINT orders_customer_id_fkey;

-- ============================================================
-- PHASE 6: MIGRATE TENANTS TABLE
-- ============================================================

-- Add new integer ID column
ALTER TABLE tenants ADD COLUMN id_new BIGSERIAL;

-- Migrate data using mapping
UPDATE tenants t
SET id_new = m.new_id
FROM tenants_id_map m
WHERE t.id = m.old_uuid;

-- Drop old UUID column (CASCADE removes dependent constraints)
ALTER TABLE tenants DROP COLUMN id CASCADE;

-- Rename new column to id
ALTER TABLE tenants RENAME COLUMN id_new TO id;

-- Set as primary key
ALTER TABLE tenants ADD PRIMARY KEY (id);

-- ============================================================
-- PHASE 7: MIGRATE PRODUCTS TABLE
-- ============================================================

-- Add new integer columns
ALTER TABLE products ADD COLUMN id_new BIGSERIAL;
ALTER TABLE products ADD COLUMN tenant_id_new BIGINT;

-- Migrate data
UPDATE products p
SET id_new = pm.new_id,
    tenant_id_new = tm.new_id
FROM products_id_map pm, tenants_id_map tm
WHERE p.id = pm.old_uuid AND p.tenant_id = tm.old_uuid;

-- Drop old columns
ALTER TABLE products DROP COLUMN id CASCADE;
ALTER TABLE products DROP COLUMN tenant_id;

-- Rename new columns
ALTER TABLE products RENAME COLUMN id_new TO id;
ALTER TABLE products RENAME COLUMN tenant_id_new TO tenant_id;

-- Set primary key
ALTER TABLE products ADD PRIMARY KEY (id);

-- Recreate foreign key
ALTER TABLE products ADD CONSTRAINT products_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- ============================================================
-- PHASE 8: MIGRATE CUSTOMERS TABLE
-- ============================================================

-- Add new integer columns
ALTER TABLE customers ADD COLUMN id_new BIGSERIAL;
ALTER TABLE customers ADD COLUMN tenant_id_new BIGINT;

-- Migrate data
UPDATE customers c
SET id_new = cm.new_id,
    tenant_id_new = tm.new_id
FROM customers_id_map cm, tenants_id_map tm
WHERE c.id = cm.old_uuid AND c.tenant_id = tm.old_uuid;

-- Drop old columns
ALTER TABLE customers DROP COLUMN id CASCADE;
ALTER TABLE customers DROP COLUMN tenant_id;

-- Rename new columns
ALTER TABLE customers RENAME COLUMN id_new TO id;
ALTER TABLE customers RENAME COLUMN tenant_id_new TO tenant_id;

-- Set primary key
ALTER TABLE customers ADD PRIMARY KEY (id);

-- Recreate foreign key
ALTER TABLE customers ADD CONSTRAINT customers_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- ============================================================
-- PHASE 9: MIGRATE ORDERS TABLE (MOST COMPLEX)
-- ============================================================

-- Add new integer columns
ALTER TABLE orders ADD COLUMN id_new BIGSERIAL;
ALTER TABLE orders ADD COLUMN tenant_id_new BIGINT;
ALTER TABLE orders ADD COLUMN customer_id_new BIGINT;

-- Migrate scalar data
UPDATE orders o
SET id_new = om.new_id,
    tenant_id_new = tm.new_id,
    customer_id_new = cm.new_id
FROM orders_id_map om, tenants_id_map tm, customers_id_map cm
WHERE o.id = om.old_uuid
  AND o.tenant_id = tm.old_uuid
  AND o.customer_id = cm.old_uuid;

-- Migrate JSONB items array (product_id UUID → BIGINT)
-- This updates each product_id in the items array
UPDATE orders o
SET items = (
  SELECT jsonb_agg(
    jsonb_set(
      item,
      '{product_id}',
      to_jsonb(pm.new_id)
    )
  )
  FROM jsonb_array_elements(o.items) AS item
  JOIN products_id_map pm ON (item->>'product_id')::uuid = pm.old_uuid
)
WHERE items IS NOT NULL AND items != '[]'::jsonb;

-- Drop old columns
ALTER TABLE orders DROP COLUMN id CASCADE;
ALTER TABLE orders DROP COLUMN tenant_id;
ALTER TABLE orders DROP COLUMN customer_id;

-- Rename new columns
ALTER TABLE orders RENAME COLUMN id_new TO id;
ALTER TABLE orders RENAME COLUMN tenant_id_new TO tenant_id;
ALTER TABLE orders RENAME COLUMN customer_id_new TO customer_id;

-- Set primary key
ALTER TABLE orders ADD PRIMARY KEY (id);

-- Recreate foreign keys
ALTER TABLE orders ADD CONSTRAINT orders_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE orders ADD CONSTRAINT orders_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

-- ============================================================
-- PHASE 10: RECREATE INDEXES
-- ============================================================

CREATE INDEX idx_products_tenant_id ON products(tenant_id);
CREATE INDEX idx_products_active ON products(active) WHERE active = true;

CREATE INDEX idx_customers_tenant_id ON customers(tenant_id);
CREATE INDEX idx_customers_email ON customers(email);

CREATE INDEX idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ============================================================
-- PHASE 11: RE-ENABLE RLS
-- ============================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PHASE 12: RECREATE VIEWS WITH NEW BIGINT IDS
-- ============================================================

-- View: tenants_public (simple, no ID dependencies)
CREATE VIEW tenants_public AS
SELECT
  id,
  slug,
  name,
  plan,
  config,
  active,
  created_at
FROM tenants
WHERE active = true;

-- View: daily_sales (tenant_id is now BIGINT)
CREATE VIEW daily_sales AS
SELECT
  tenant_id,
  DATE(created_at) AS sale_date,
  COUNT(*) AS order_count,
  SUM(total) AS total_sales,
  AVG(total) AS avg_order_value
FROM orders
WHERE status != 'cancelled'
GROUP BY tenant_id, DATE(created_at);

-- View: top_products (needs JSONB handling for numeric product_id)
-- Note: product_id in orders.items is now stored as number, not string
CREATE VIEW top_products AS
SELECT
  p.id,
  p.tenant_id,
  p.name,
  p.price,
  p.category,
  COUNT(DISTINCT o.id) AS order_count
FROM products p
LEFT JOIN orders o ON (
  o.items @> jsonb_build_array(
    jsonb_build_object('product_id', p.id)
  )
)
WHERE p.active = true
GROUP BY p.id, p.tenant_id, p.name, p.price, p.category;

-- ============================================================
-- VERIFICATION QUERIES (RUN MANUALLY AFTER MIGRATION)
-- ============================================================

/*
-- Check data counts match
SELECT 'tenants' as table_name, COUNT(*) as count FROM tenants
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'orders', COUNT(*) FROM orders;

-- Check all IDs are numeric
SELECT id, slug FROM tenants ORDER BY id;
SELECT id, name, tenant_id FROM products ORDER BY id;
SELECT id, name, tenant_id FROM customers ORDER BY id;
SELECT id, total, tenant_id, customer_id FROM orders ORDER BY id;

-- Check foreign keys work
SELECT t.id, t.slug, COUNT(p.id) as product_count
FROM tenants t
LEFT JOIN products p ON p.tenant_id = t.id
GROUP BY t.id, t.slug
ORDER BY t.id;

-- Check orders.items JSONB has numeric product_ids
SELECT id, items FROM orders;

-- Check RLS still works
SET ROLE anon;
SELECT * FROM tenants; -- Should see only active tenants
RESET ROLE;
*/
