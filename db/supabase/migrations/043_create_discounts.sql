-- ============================================================
-- 043: Order Discounts
-- Adds discount definitions + applied discount tracking on orders.
-- Admin-only, max 1 per order, fixed or percentage.
-- ============================================================

CREATE TYPE discount_type AS ENUM ('fixed', 'percentage');
CREATE TYPE discount_scope AS ENUM ('order', 'item');

CREATE TABLE discounts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   int NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        text NOT NULL,
  type        discount_type NOT NULL,
  scope       discount_scope NOT NULL,
  value       numeric(10,2) NOT NULL CHECK (value > 0),
  valid_from  timestamptz,
  valid_to    timestamptz,
  active      boolean NOT NULL DEFAULT true,
  created_by  uuid REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pct_max CHECK (type != 'percentage' OR value <= 100),
  CONSTRAINT valid_range CHECK (valid_from IS NULL OR valid_to IS NULL OR valid_from < valid_to)
);

CREATE INDEX idx_discounts_tenant ON discounts(tenant_id);
CREATE INDEX idx_discounts_active_window ON discounts(tenant_id, active, valid_from, valid_to);

-- Add discount columns to orders
ALTER TABLE orders
  ADD COLUMN discount_id uuid REFERENCES discounts(id),
  ADD COLUMN discount_snapshot jsonb,
  ADD COLUMN discount_amount numeric(10,2) DEFAULT 0.00,
  ADD COLUMN total_before_discount numeric(10,2);

-- Backfill existing orders
UPDATE orders SET total_before_discount = total WHERE total_before_discount IS NULL;

-- RLS
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "discounts_tenant_isolation" ON discounts
  FOR ALL USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = (select auth.uid())
    )
  );

CREATE POLICY "discounts_public_read" ON discounts
  FOR SELECT USING (active = true);
