-- =============================================================================
-- MIGRATION 042: Add RLS policies for agent_conversations and agent_usage_logs
-- =============================================================================
-- Tables created in 041 with RLS enabled but zero policies.
-- Dashboard users access data directly (not via service_role), so we need
-- tenant-scoped SELECT policies.
--
-- Pattern: (select auth.uid()) — evaluated once per statement, not per row.
-- Ref: migration 039_optimize_rls_auth_uid.sql
--
-- Tenant resolution: users.auth_user_id = auth.uid() → users.tenant_id
-- =============================================================================

-- -----------------------------------------------------------------------
-- TABLE: agent_conversations
-- -----------------------------------------------------------------------

DROP POLICY IF EXISTS "Tenant users can view their agent conversations" ON agent_conversations;
CREATE POLICY "Tenant users can view their agent conversations"
  ON agent_conversations FOR SELECT
  USING (
    tenant_id IN (
      SELECT u.tenant_id FROM users u
      WHERE u.auth_user_id = (select auth.uid())
        AND u.is_active = true
    )
  );

-- -----------------------------------------------------------------------
-- TABLE: agent_usage_logs
-- -----------------------------------------------------------------------

DROP POLICY IF EXISTS "Tenant users can view their agent usage logs" ON agent_usage_logs;
CREATE POLICY "Tenant users can view their agent usage logs"
  ON agent_usage_logs FOR SELECT
  USING (
    tenant_id IN (
      SELECT u.tenant_id FROM users u
      WHERE u.auth_user_id = (select auth.uid())
        AND u.is_active = true
    )
  );
