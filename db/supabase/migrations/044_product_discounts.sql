-- ============================================================
-- 044: Product-level discounts + cleanup legacy order discounts
-- Replaces the order-level discount system (043) with
-- product-level discount fields and price tracking on line items.
-- ============================================================

-- ---- 1. Add discount fields to products ----

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS discount_type    text CHECK (discount_type IN ('percentage', 'fixed')),
  ADD COLUMN IF NOT EXISTS discount_value   numeric(10,2),
  ADD COLUMN IF NOT EXISTS discount_starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS discount_ends_at   timestamptz;

-- Partial index: only rows that actually have a discount (perf for active-discount queries)
CREATE INDEX IF NOT EXISTS idx_products_discount_active
  ON products(tenant_id, discount_type)
  WHERE discount_type IS NOT NULL;

-- ---- 2. Add price tracking to order_line_items ----

ALTER TABLE order_line_items
  ADD COLUMN IF NOT EXISTS original_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS paid_price     numeric(10,2);

-- Backfill: treat existing line items as no-discount (original = paid = unit_price)
UPDATE order_line_items
  SET original_price = unit_price,
      paid_price     = unit_price
  WHERE original_price IS NULL;

-- ---- 3. Remove legacy order-level discount columns ----

ALTER TABLE orders
  DROP COLUMN IF EXISTS discount_id,
  DROP COLUMN IF EXISTS discount_snapshot,
  DROP COLUMN IF EXISTS discount_amount,
  DROP COLUMN IF EXISTS total_before_discount;

-- ---- 4. Drop legacy discounts table ----
-- Must drop dependent policies first (CASCADE handles indexes/constraints)

DROP TABLE IF EXISTS discounts CASCADE;

-- ---- 5. Drop now-orphaned enum types (safe: only used by discounts table) ----

DROP TYPE IF EXISTS discount_type CASCADE;
DROP TYPE IF EXISTS discount_scope CASCADE;
