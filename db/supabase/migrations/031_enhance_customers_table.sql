-- Migration: 031_enhance_customers_table.sql
-- Description: Add loyalty and tracking fields to customers table
-- Created: 2024-12-04
-- Idempotent: Yes (checks for column existence before adding)

-- Add loyalty and tracking fields (idempotent)
DO $$
BEGIN
  -- Add loyalty_points column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'loyalty_points'
  ) THEN
    ALTER TABLE customers ADD COLUMN loyalty_points INT DEFAULT 0;
  END IF;

  -- Add total_orders column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'total_orders'
  ) THEN
    ALTER TABLE customers ADD COLUMN total_orders INT DEFAULT 0;
  END IF;

  -- Add total_spent column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'total_spent'
  ) THEN
    ALTER TABLE customers ADD COLUMN total_spent NUMERIC DEFAULT 0;
  END IF;

  -- Add last_order_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'last_order_at'
  ) THEN
    ALTER TABLE customers ADD COLUMN last_order_at TIMESTAMPTZ;
  END IF;

  -- Add updated_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE customers ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Add constraints (idempotent)
DO $$
BEGIN
  -- Add loyalty_points constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'customers_loyalty_points_check'
  ) THEN
    ALTER TABLE customers
      ADD CONSTRAINT customers_loyalty_points_check CHECK (loyalty_points >= 0);
  END IF;

  -- Add total_orders constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'customers_total_orders_check'
  ) THEN
    ALTER TABLE customers
      ADD CONSTRAINT customers_total_orders_check CHECK (total_orders >= 0);
  END IF;

  -- Add total_spent constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'customers_total_spent_check'
  ) THEN
    ALTER TABLE customers
      ADD CONSTRAINT customers_total_spent_check CHECK (total_spent >= 0);
  END IF;
END $$;

-- Add indexes for analytics queries (idempotent)
CREATE INDEX IF NOT EXISTS idx_customers_tenant_loyalty 
  ON customers(tenant_id, loyalty_points DESC);

CREATE INDEX IF NOT EXISTS idx_customers_last_order 
  ON customers(last_order_at DESC) 
  WHERE last_order_at IS NOT NULL;

-- Comments
COMMENT ON COLUMN customers.loyalty_points IS 'Accumulated loyalty points for rewards programs';
COMMENT ON COLUMN customers.total_orders IS 'Cached count of completed orders';
COMMENT ON COLUMN customers.total_spent IS 'Cached sum of order totals (all statuses)';
COMMENT ON COLUMN customers.last_order_at IS 'Timestamp of most recent order';

