-- Migration: 035_add_owner_role_and_sync.sql
-- Description: Add 'owner' role to users table and sync existing tenant owners
-- Created: 2024-12-21
-- Idempotent: Yes

-- ============================================================
-- Step 1: Add 'owner' to the role CHECK constraint
-- ============================================================

-- Drop existing constraint and recreate with 'owner' role
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('owner', 'staff', 'tenant_admin', 'platform_admin'));

COMMENT ON COLUMN users.role IS 'owner: tenant owner, staff: basic ops, tenant_admin: tenant config, platform_admin: cross-tenant';

-- ============================================================
-- Step 2: Change UNIQUE constraint to allow same user in multiple tenants
-- ============================================================

-- Drop the global email unique constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- Add composite unique: same email can exist in different tenants, but not twice in same tenant
-- Note: tenant_id can be NULL for platform_admin, so we need a partial index too
CREATE UNIQUE INDEX IF NOT EXISTS users_email_tenant_unique
  ON users(email, tenant_id)
  WHERE tenant_id IS NOT NULL;

-- For platform admins (tenant_id IS NULL), email must still be unique
CREATE UNIQUE INDEX IF NOT EXISTS users_email_platform_unique
  ON users(email)
  WHERE tenant_id IS NULL;

-- ============================================================
-- Step 3: Sync existing tenant owners to public.users
-- ============================================================

-- Insert owner records for tenants that don't have one in public.users
INSERT INTO users (tenant_id, email, role, name, auth_user_id, is_active, created_at)
SELECT
  t.id as tenant_id,
  au.email,
  'owner' as role,
  COALESCE(t.name, 'Owner') as name,  -- Use tenant name as default user name
  t.owner_id as auth_user_id,
  true as is_active,
  au.created_at
FROM tenants t
JOIN auth.users au ON au.id = t.owner_id
WHERE t.owner_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM users u
    WHERE u.auth_user_id = t.owner_id
      AND u.tenant_id = t.id
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- Step 3: Update RLS policy to include owners
-- ============================================================

-- Drop and recreate policy to include owner role
DROP POLICY IF EXISTS "Tenant admins view tenant users" ON users;

CREATE POLICY "Tenant owners and admins view tenant users"
ON users FOR SELECT
USING (
  tenant_id IN (
    SELECT t.id FROM tenants t WHERE t.owner_id = auth.uid()
  )
  OR
  tenant_id IN (
    SELECT u.tenant_id FROM users u
    WHERE u.auth_user_id = auth.uid()
      AND u.role IN ('owner', 'tenant_admin')
      AND u.is_active = true
  )
);

-- ============================================================
-- Verification query (for manual check after migration)
-- ============================================================
-- SELECT
--   t.name as tenant_name,
--   u.email,
--   u.role,
--   u.auth_user_id
-- FROM tenants t
-- LEFT JOIN users u ON u.tenant_id = t.id AND u.role = 'owner'
-- WHERE t.owner_id IS NOT NULL;
