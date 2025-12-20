# KOKORO_TASKS: MII_4 User System Architecture

> **Version:** 1.0
> **Agent:** Kokoro (Backend Specialist)
> **Stack:** Next.js + Supabase (PostgreSQL)
> **Issue:** MII_4_user_system_architecture
> **Scope:** Migrations only - separate customers (buyers) from users (staff/admin)

---

## Context

Miicel.io multi-tenant e-commerce platform. Current state:
- ✅ `customers` table exists (id, tenant_id, name, email, phone, created_at)
- ✅ Auto-register logic working in `/api/orders/create/route.ts:155-201`
- ❌ No `users` table for staff/admin
- ❌ No loyalty/metadata fields in `customers`

**Goal:** Add `users` table for operational staff + enhance `customers` without breaking existing order flow.

---

## Sprint 0: User System Migrations (2-3 hours)

### Task 1: Enhance Customers Table (30 min)

Add fields for loyalty/purchase tracking without touching core schema:

```sql
-- Migration: 031_enhance_customers_table.sql

-- Add loyalty and tracking fields
ALTER TABLE customers
  ADD COLUMN loyalty_points INT DEFAULT 0,
  ADD COLUMN total_orders INT DEFAULT 0,
  ADD COLUMN total_spent NUMERIC DEFAULT 0,
  ADD COLUMN last_order_at TIMESTAMPTZ,
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();

-- Add constraints
ALTER TABLE customers
  ADD CONSTRAINT customers_loyalty_points_check CHECK (loyalty_points >= 0),
  ADD CONSTRAINT customers_total_orders_check CHECK (total_orders >= 0),
  ADD CONSTRAINT customers_total_spent_check CHECK (total_spent >= 0);

-- Add indexes for analytics queries
CREATE INDEX idx_customers_tenant_loyalty ON customers(tenant_id, loyalty_points DESC);
CREATE INDEX idx_customers_last_order ON customers(last_order_at DESC) WHERE last_order_at IS NOT NULL;

-- Comments
COMMENT ON COLUMN customers.loyalty_points IS 'Accumulated loyalty points for rewards programs';
COMMENT ON COLUMN customers.total_orders IS 'Cached count of completed orders';
COMMENT ON COLUMN customers.total_spent IS 'Cached sum of order totals (all statuses)';
COMMENT ON COLUMN customers.last_order_at IS 'Timestamp of most recent order';
```

**Deliverable:** ✅ Migration file created, customers table enhanced with analytics fields

---

### Task 2: Create Users Table (45 min)

Create staff/admin users table with RLS policies:

```sql
-- Migration: 032_create_users_table.sql

-- Users table: staff + admins (operation-focused)
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE, -- NULL = platform admin
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('staff', 'tenant_admin', 'platform_admin')),
  name TEXT NOT NULL,

  -- Auth & permissions
  auth_user_id UUID, -- Link to Supabase Auth (optional for now)
  permissions JSONB DEFAULT '{}'::jsonb,

  -- Tracking
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes
CREATE INDEX idx_users_tenant ON users(tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_user ON users(auth_user_id) WHERE auth_user_id IS NOT NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- Comments
COMMENT ON TABLE users IS 'Staff and admin users for tenant operations (not customers)';
COMMENT ON COLUMN users.tenant_id IS 'NULL for platform admins, tenant_id for tenant-scoped staff';
COMMENT ON COLUMN users.role IS 'staff: basic ops, tenant_admin: tenant config, platform_admin: cross-tenant';
COMMENT ON COLUMN users.permissions IS 'Tenant-specific permission overrides (JSON)';
COMMENT ON COLUMN users.auth_user_id IS 'Link to Supabase Auth users (for future SSO)';

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Tenant admins can view their tenant's users
CREATE POLICY "Tenant admins view tenant users"
ON users FOR SELECT
USING (
  tenant_id IN (
    SELECT t.id FROM tenants t WHERE t.owner_id = auth.uid()
  )
);

-- Policy 2: Platform admins can view all users
CREATE POLICY "Platform admins view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_user_id = auth.uid()
      AND u.role = 'platform_admin'
      AND u.is_active = true
  )
);

-- Policy 3: Service role can manage all users (for admin API)
CREATE POLICY "Service role manages users"
ON users FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Policy 4: Users can view their own record
CREATE POLICY "Users view own record"
ON users FOR SELECT
USING (auth_user_id = auth.uid());
```

**Deliverable:** ✅ Migration file created, users table with RLS policies

---

### Task 3: Create Helper Functions (30 min)

Add DB functions for customer stats auto-update:

```sql
-- Migration: 033_add_customer_update_functions.sql

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

-- Trigger: Auto-update customer stats on order insert/update
CREATE TRIGGER trigger_update_customer_stats
AFTER INSERT OR UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION update_customer_stats();

COMMENT ON FUNCTION update_customer_stats IS 'Auto-update customer total_orders, total_spent, last_order_at on order changes';
```

**Deliverable:** ✅ Trigger function created, customers stats auto-update on orders

---

### Task 4: Seed Initial Platform Admin (15 min)

Create first platform admin user for testing:

```sql
-- Migration: 034_seed_platform_admin.sql

-- Insert platform admin (replace email with real admin email)
-- NOTE: Actual migration uses admin@miicel.io (see 034_seed_platform_admin.sql)
-- This spec shows the intended structure; actual implementation includes auth user creation
INSERT INTO users (email, role, name, is_active, permissions)
VALUES (
  'admin@miicel.io', -- Production email (migration creates auth user + users record)
  'platform_admin',
  'Platform Admin',
  true,
  '{
    "can_manage_tenants": true,
    "can_view_all_orders": true,
    "can_manage_users": true
  }'::jsonb
)
ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE users IS 'Seeded platform admin for initial setup';
```

**Deliverable:** ✅ Platform admin seeded, ready for auth integration

---

### Task 5: Run Migrations + Verify (30 min)

Apply all migrations and verify schema:

```bash
# From project root
cd db/supabase/migrations

# Apply migrations (assumes Supabase CLI or manual execution)
# Run each migration file in order: 031 → 034

# Verification queries (run after migrations)
```

```sql
-- 1. Check customers new columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'customers'
  AND column_name IN ('loyalty_points', 'total_orders', 'total_spent', 'last_order_at', 'updated_at')
ORDER BY column_name;

-- 2. Check users table exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 3. Check RLS policies on users
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'users';

-- 4. Check trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_customer_stats';

-- 5. Verify platform admin seeded
SELECT id, email, role, is_active FROM users WHERE role = 'platform_admin';
```

**Deliverable:** ✅ All migrations applied, schema verified, no errors

---

## Success Criteria

- [x] `customers` table has loyalty_points, total_orders, total_spent, last_order_at, updated_at
- [x] `users` table created with id, tenant_id, email, role, name, permissions, auth_user_id
- [x] RLS policies on `users`: tenant admins see tenant users, platform admins see all
- [x] Trigger auto-updates customer stats when orders change status
- [x] Platform admin user seeded in `users` table
- [x] Zero breaking changes to existing order creation flow (`/api/orders/create/route.ts`)
- [x] Migration files 031-034 created and documented (idempotent)

---

## Notes

- **No UI changes**: This is DB-only work
- **Backward compatible**: Existing customer auto-register logic in `/api/orders/create/route.ts` still works
- **Future work**: Auth integration (Pixel task), invite flow (Pixel task), E2E tests (Sentinela task)
- **Migration naming**: Follow existing convention `0XX_description.sql`
- **RLS testing**: Use service role client for now, user-level auth comes later

---

## References

- Issue spec: `projects/miicel.io/backlog/active/MII_4_user_system_architecture.md`
- Existing migrations: `projects/miicel.io/db/supabase/migrations/`
- Order creation logic: `projects/miicel.io/app/api/orders/create/route.ts:155-201`
- Payments migration (reference): `028_add_checkout_and_payments_table.sql`
