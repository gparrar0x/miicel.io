# db/supabase/migrations/CLAUDE.md

> Migration conventions
> Updated: 2026-04-01

---

## Naming

`NNN_descriptive_name.sql` — sequential 3-digit number, snake_case description.

Currently 51 migrations (001–051).

## Writing Migrations

- Use `CREATE TABLE IF NOT EXISTS`, `CREATE POLICY IF NOT EXISTS` — idempotent
- Always enable RLS: `ALTER TABLE x ENABLE ROW LEVEL SECURITY;`
- Include verification queries as comments at the end
- Trigger-based `updated_at` — don't rely on application logic:
  ```sql
  CREATE TRIGGER x_updated_at
    BEFORE UPDATE ON x FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
  ```

## RLS Patterns

### Performance Critical
Wrap `auth.uid()` with `(select ...)` — evaluated once per statement, not per row (100x speedup):
```sql
-- CORRECT
USING (tenant_id IN (SELECT id FROM tenants WHERE owner_id = (select auth.uid())))

-- WRONG (171ms per row on large tables)
USING (tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid()))
```

### Three Policy Patterns

**1. Tenant-Owner Access** (most common):
```sql
CREATE POLICY "owners view items" ON items FOR SELECT
  USING (tenant_id IN (SELECT id FROM tenants WHERE owner_id = (select auth.uid())));
```

**2. Tenant + Staff Access** (multi-role):
```sql
CREATE POLICY "owners and admins view users" ON users FOR SELECT
  USING (
    tenant_id IN (SELECT t.id FROM tenants t WHERE t.owner_id = (select auth.uid()))
    OR tenant_id IN (SELECT u.tenant_id FROM users u
      WHERE u.auth_user_id = (select auth.uid()) AND u.role IN ('owner', 'tenant_admin'))
  );
```

**3. Service Role Bypass**:
```sql
CREATE POLICY "service role manages items" ON items FOR ALL
  USING ((select auth.jwt()) ->> 'role' = 'service_role')
  WITH CHECK ((select auth.jwt()) ->> 'role' = 'service_role');
```

## Design Conventions

- **Denormalize `tenant_id`**: Include on every table even when FK to parent exists — RLS needs it directly to avoid expensive joins
- **Partial indexes** for active records:
  ```sql
  CREATE INDEX idx_x_status ON x(tenant_id, status) WHERE status = 'active';
  ```
- **Unique constraints**: Scope per tenant where applicable: `UNIQUE (tenant_id, slug)`
- **Soft delete**: Use `active` boolean or `status` field, not `DELETE`
