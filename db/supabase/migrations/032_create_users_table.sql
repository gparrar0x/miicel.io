-- Migration: 032_create_users_table.sql
-- Description: Create users table for staff and admin users (separate from customers)
-- Created: 2024-12-04
-- Idempotent: Yes (checks for table existence before creating)

-- Users table: staff + admins (operation-focused)
CREATE TABLE IF NOT EXISTS users (
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

-- Indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_users_tenant 
  ON users(tenant_id) 
  WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_role 
  ON users(role);

CREATE INDEX IF NOT EXISTS idx_users_email 
  ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_auth_user 
  ON users(auth_user_id) 
  WHERE auth_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_active 
  ON users(is_active) 
  WHERE is_active = true;

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

-- Policy 1: Tenant admins can view their tenant's users (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Tenant admins view tenant users'
  ) THEN
    CREATE POLICY "Tenant admins view tenant users"
    ON users FOR SELECT
    USING (
      tenant_id IN (
        SELECT t.id FROM tenants t WHERE t.owner_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Policy 2: Platform admins can view all users (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Platform admins view all users'
  ) THEN
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
  END IF;
END $$;

-- Policy 3: Service role can manage all users (for admin API) (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Service role manages users'
  ) THEN
    CREATE POLICY "Service role manages users"
    ON users FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- Policy 4: Users can view their own record (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users view own record'
  ) THEN
    CREATE POLICY "Users view own record"
    ON users FOR SELECT
    USING (auth_user_id = auth.uid());
  END IF;
END $$;

