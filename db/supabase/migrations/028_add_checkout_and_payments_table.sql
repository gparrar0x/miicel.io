-- Migration: Add checkout_id to orders and create payments table
-- Purpose: Track MercadoPago checkout references and payment transactions
-- Date: 2025-01-22
-- Priority: P1 (Feature Enhancement)
--
-- DESIGN NOTES:
-- ============================================================
-- Q: Why does orders.payment_id exist if we have payments table?
-- A: Pragmatic denormalization for fast queries without JOINs
--    - orders.payment_id: Quick reference (used in dashboards, list views)
--    - payments table: Complete audit trail with full transaction data
--    - Relationship: orders.payment_id = payments.payment_id (both reference MP payment ID)
--    - payments.id: Internal PK (auto-incrementing, not exposed externally)
--
-- Q: Why both checkout_id and payment_id in orders?
-- A: Different lifecycle stages
--    - checkout_id (preference_id): Created when order is created
--    - payment_id: Populated when payment is completed (via webhook)
-- ============================================================

-- ============================================================
-- PART 1: Add checkout_id to orders table
-- ============================================================

-- Add checkout_id column to store MercadoPago preference_id
ALTER TABLE orders
ADD COLUMN checkout_id TEXT;

-- Add index for faster lookups by checkout_id
CREATE INDEX idx_orders_checkout_id ON orders(checkout_id)
WHERE checkout_id IS NOT NULL;

COMMENT ON COLUMN orders.checkout_id IS 'MercadoPago preference_id (checkout reference)';

-- ============================================================
-- PART 2: Create payments table
-- ============================================================

CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,  -- Internal PK (not exposed to clients)
  order_id BIGINT NOT NULL,  -- FK to orders table
  payment_id TEXT NOT NULL,  -- MercadoPago payment ID (external reference)
  status TEXT NOT NULL,
  status_detail TEXT,
  payment_type TEXT,
  payment_method_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ARS',
  payer_email TEXT,
  payer_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Foreign key to orders
  CONSTRAINT payments_order_id_fkey 
    FOREIGN KEY (order_id) 
    REFERENCES orders(id) 
    ON DELETE CASCADE,
  
  -- Ensure unique payment_id (MP can send duplicate webhooks)
  CONSTRAINT payments_payment_id_unique UNIQUE (payment_id),
  
  -- Check valid status
  CONSTRAINT payments_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded', 'charged_back', 'in_process')),
  
  -- Check amount is positive
  CONSTRAINT payments_amount_check 
    CHECK (amount >= 0)
);

-- ============================================================
-- PART 3: Create indexes for payments table
-- ============================================================

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_payment_id ON payments(payment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- ============================================================
-- PART 4: Enable RLS on payments table
-- ============================================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view payments for their tenant's orders
CREATE POLICY "Tenants can view their payments"
ON payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders o
    INNER JOIN tenants t ON o.tenant_id = t.id
    WHERE o.id = payments.order_id
      AND t.owner_id = auth.uid()
  )
);

-- Policy: System can insert/update payments (service role only)
CREATE POLICY "Service role can manage payments"
ON payments
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- PART 5: Add comments
-- ============================================================

COMMENT ON TABLE payments IS 'Payment transactions from MercadoPago and other payment providers';
COMMENT ON COLUMN payments.payment_id IS 'MercadoPago payment ID or external payment reference';
COMMENT ON COLUMN payments.status IS 'Payment status from payment provider';
COMMENT ON COLUMN payments.payment_type IS 'Payment type: credit_card, debit_card, ticket, atm, etc';
COMMENT ON COLUMN payments.metadata IS 'Additional payment data from provider (JSON)';

-- ============================================================
-- VERIFICATION QUERIES (RUN MANUALLY AFTER MIGRATION)
-- ============================================================

/*
-- Check new column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'checkout_id';

-- Check payments table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'payments'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('orders', 'payments')
ORDER BY tablename, indexname;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'payments';
*/

