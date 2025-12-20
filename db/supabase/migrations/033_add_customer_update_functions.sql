-- Migration: 033_add_customer_update_functions.sql
-- Description: Add trigger function to auto-update customer stats on order changes
-- Created: 2024-12-04
-- Idempotent: Yes (uses CREATE OR REPLACE)

-- Function: Update customer stats when order is created/updated
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update for paid/completed orders
  IF NEW.status IN ('paid', 'preparing', 'ready', 'delivered') THEN
    UPDATE customers
    SET
      total_orders = (
        SELECT COUNT(*)
        FROM orders
        WHERE customer_id = NEW.customer_id
          AND status IN ('paid', 'preparing', 'ready', 'delivered')
      ),
      total_spent = (
        SELECT COALESCE(SUM(total), 0)
        FROM orders
        WHERE customer_id = NEW.customer_id
          AND status IN ('paid', 'preparing', 'ready', 'delivered')
      ),
      last_order_at = NEW.created_at,
      updated_at = now()
    WHERE id = NEW.customer_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update customer stats on order insert/update (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_update_customer_stats'
  ) THEN
    CREATE TRIGGER trigger_update_customer_stats
    AFTER INSERT OR UPDATE OF status ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_stats();
  END IF;
END $$;

COMMENT ON FUNCTION update_customer_stats IS 'Auto-update customer total_orders, total_spent, last_order_at on order changes';

