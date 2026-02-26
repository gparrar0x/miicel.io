-- =============================================================================
-- MIGRATION 039: Optimize RLS policies — wrap auth.uid() / auth.jwt() with (select ...)
-- =============================================================================
-- Performance: auth.uid() evaluated per-row costs ~171 ms on large tables.
-- (select auth.uid()) is evaluated once per statement → <0.1 ms.
-- Official Supabase benchmark shows ~100× speedup.
-- Ref: https://supabase.com/docs/guides/database/postgres/row-level-security#use-security-definer-functions
-- =============================================================================

-- -----------------------------------------------------------------------
-- TABLE: payments (migration 028)
-- Policy: "Tenants can view their payments"
-- Policy: "Service role can manage payments"
-- -----------------------------------------------------------------------

ALTER POLICY "Tenants can view their payments"
  ON payments
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      INNER JOIN tenants t ON o.tenant_id = t.id
      WHERE o.id = payments.order_id
        AND t.owner_id = (select auth.uid())
    )
  );

ALTER POLICY "Service role can manage payments"
  ON payments
  USING ((select auth.jwt()) ->> 'role' = 'service_role')
  WITH CHECK ((select auth.jwt()) ->> 'role' = 'service_role');

-- -----------------------------------------------------------------------
-- TABLE: users (migration 032)
-- Policy: "Tenant admins view tenant users"      — recreate (was created via DO block)
-- Policy: "Platform admins view all users"       — recreate (was created via DO block)
-- Policy: "Service role manages users"           — recreate (was created via DO block)
-- Policy: "Users view own record"               — recreate (was created via DO block)
-- -----------------------------------------------------------------------

DROP POLICY IF EXISTS "Tenant admins view tenant users" ON users;
CREATE POLICY "Tenant admins view tenant users"
  ON users FOR SELECT
  USING (
    tenant_id IN (
      SELECT t.id FROM tenants t WHERE t.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Platform admins view all users" ON users;
CREATE POLICY "Platform admins view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = (select auth.uid())
        AND u.role = 'platform_admin'
        AND u.is_active = true
    )
  );

DROP POLICY IF EXISTS "Service role manages users" ON users;
CREATE POLICY "Service role manages users"
  ON users FOR ALL
  USING ((select auth.jwt()) ->> 'role' = 'service_role')
  WITH CHECK ((select auth.jwt()) ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Users view own record" ON users;
CREATE POLICY "Users view own record"
  ON users FOR SELECT
  USING (auth_user_id = (select auth.uid()));

-- -----------------------------------------------------------------------
-- TABLE: users (migration 035)
-- Policy: "Tenant owners and admins view tenant users"  — replaces 032 policy
-- -----------------------------------------------------------------------

DROP POLICY IF EXISTS "Tenant owners and admins view tenant users" ON users;
CREATE POLICY "Tenant owners and admins view tenant users"
  ON users FOR SELECT
  USING (
    tenant_id IN (
      SELECT t.id FROM tenants t WHERE t.owner_id = (select auth.uid())
    )
    OR
    tenant_id IN (
      SELECT u.tenant_id FROM users u
      WHERE u.auth_user_id = (select auth.uid())
        AND u.role IN ('owner', 'tenant_admin')
        AND u.is_active = true
    )
  );

-- -----------------------------------------------------------------------
-- TABLE: consignment_locations (migration 037)
-- -----------------------------------------------------------------------

ALTER POLICY "Users can view their tenant's locations"
  ON consignment_locations
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = (select auth.uid())
    )
  );

ALTER POLICY "Users can insert locations for their tenants"
  ON consignment_locations
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = (select auth.uid())
    )
  );

ALTER POLICY "Users can update their tenant's locations"
  ON consignment_locations
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = (select auth.uid())
    )
  );

ALTER POLICY "Users can delete their tenant's locations"
  ON consignment_locations
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = (select auth.uid())
    )
  );

-- -----------------------------------------------------------------------
-- TABLE: artwork_consignments (migration 037)
-- -----------------------------------------------------------------------

ALTER POLICY "Users can view their tenant's consignments"
  ON artwork_consignments
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = (select auth.uid())
    )
  );

ALTER POLICY "Users can insert consignments for their tenants"
  ON artwork_consignments
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = (select auth.uid())
    )
  );

ALTER POLICY "Users can update their tenant's consignments"
  ON artwork_consignments
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = (select auth.uid())
    )
  );

ALTER POLICY "Users can delete their tenant's consignments"
  ON artwork_consignments
  USING (
    tenant_id IN (
      SELECT id FROM tenants WHERE owner_id = (select auth.uid())
    )
  );

-- -----------------------------------------------------------------------
-- TABLE: feature_flags (migration 038)
-- -----------------------------------------------------------------------

DROP POLICY IF EXISTS "Superadmins can insert feature flags" ON feature_flags;
CREATE POLICY "Superadmins can insert feature flags"
  ON feature_flags FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_user_id = (select auth.uid()) AND role = 'platform_admin')
  );

DROP POLICY IF EXISTS "Superadmins can update feature flags" ON feature_flags;
CREATE POLICY "Superadmins can update feature flags"
  ON feature_flags FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_user_id = (select auth.uid()) AND role = 'platform_admin')
  );

DROP POLICY IF EXISTS "Superadmins can delete feature flags" ON feature_flags;
CREATE POLICY "Superadmins can delete feature flags"
  ON feature_flags FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM users WHERE auth_user_id = (select auth.uid()) AND role = 'platform_admin')
  );
