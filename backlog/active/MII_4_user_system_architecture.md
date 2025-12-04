---
id: MII_4
project_code: MII
project: miicel.io
title: "MII_4: User System Architecture - Customers vs Staff/Admin"
estado: active
tags:
  - architecture
  - database
  - auth
created_at: 2025-12-03
---

## Description
Design and implement user system architecture for Miicel.io multi-tenant platform. Current need: separate customers (tenant buyers) from operational users (staff/admins). Decision: unified table vs split tables (`customers` + `users`).

## Context
Miicel.io is multi-tenant e-commerce platform. Today handles tenant data separation but lacks formal user system. Use cases mixing:
- **Customers**: Buy products, track orders, loyalty points (tenant-scoped)
- **Staff**: Manage inventory, process orders, view analytics (tenant-scoped)
- **Admins**: Tenant configuration, theme editor, user management (tenant-scoped)
- **Platform Admins**: Cross-tenant ops, system config (platform-level)

Auth currently ad-hoc; needs scalable foundation for roles, permissions, multi-tenant isolation.

## Problem / Need
Mixing customer purchase data with staff operation data in single table causes:
1. **Schema bloat**: Nullable fields for each persona (cart_id null for staff, shift_id null for customers)
2. **Permission complexity**: RLS policies must distinguish role on every query
3. **Security risk**: Misconfigured filter = customer accesses staff endpoints
4. **Maintenance cost**: Changes to purchase flow touch staff logic and vice-versa

Need clean separation that scales with tenant growth, role additions, and compliance requirements.

## Objective
Define user system architecture that:
1. Separates customer lifecycle (purchase/cart/loyalty) from staff lifecycle (permissions/audit/shifts)
2. Supports multi-tenant isolation with clear RLS policies
3. Enables independent evolution of customer features vs staff features
4. Integrates with Supabase Auth cleanly (anon for customers, service role for staff)

## Proposed Solution: 2-Table Split (Balanced)

### Schema

```sql
-- Customers: tenant buyers, purchase-focused
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  loyalty_points INT DEFAULT 0,
  cart_id UUID REFERENCES carts(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Users: staff + admins, operation-focused
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id), -- NULL = platform admin
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('staff', 'tenant_admin', 'platform_admin')),
  name TEXT NOT NULL,
  permissions JSONB DEFAULT '{}', -- tenant-specific overrides
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_customers_tenant ON customers(tenant_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_role ON users(role);
```

### Auth Strategy
- **Customers**: Supabase Auth anon key + magic link (passwordless, simple UX)
- **Users**: Supabase Auth service role + invite flow (admin control, password required)

### RLS Policies (simplified)
```sql
-- Customers: tenant-scoped read/write
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY customers_tenant_isolation ON customers
  FOR ALL USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- Users: tenant-scoped for staff, platform-wide for platform_admin
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_tenant_isolation ON users
  FOR ALL USING (
    tenant_id = current_setting('app.current_tenant')::uuid
    OR role = 'platform_admin'
  );
```

### Why This Beats Alternatives

**vs Single Table (Quick)**:
- ✓ Avoids schema bloat (no nullable fields for mixed personas)
- ✓ Simpler RLS (no role-based filtering on every query)
- ✓ Clearer separation of concerns (purchase logic ≠ staff logic)

**vs 3 Tables (Complete)**:
- ✓ Lower complexity (2 tables vs 3)
- ✓ Unified staff/admin ops (no joins for tenant admin dashboard)
- ✓ Easier role evolution (add `manager` role without new table)

## Success Metric
1. **Security**: Zero cross-tenant data leaks in auth flow (validated via E2E tests)
2. **Performance**: Customer queries don't scan staff rows (measured via query plans)
3. **Maintainability**: Adding customer feature (e.g., wishlists) doesn't touch `users` table

## Next Steps
- [ ] **Kokoro**: Implement migration scripts (customers + users tables, RLS policies)
- [ ] **Kokoro**: Update auth middleware to set `app.current_tenant` context
- [ ] **Pixel**: Build customer login flow (magic link UI)
- [ ] **Pixel**: Build staff invite/login flow (admin portal)
- [ ] **Sentinela**: E2E tests for tenant isolation (customer cannot access staff endpoints)
- [ ] **Sentinela**: E2E tests for role-based access (staff cannot edit tenant config)

## References
- Current tenant isolation: `db/supabase/migrations/` (existing tenant table)
- Auth setup: `lib/supabase/` (client config)
- Admin portal: `app/admin/` (theme editor, future user management)

## Open Questions for Debate
1. **Customer auth**: Magic link vs social OAuth (Google/Apple) - which first?
2. **Staff permissions JSONB**: Free-form vs predefined schema (e.g., `{can_edit_inventory: bool}`)?
3. **Platform admin access**: Separate login portal or role flag in same UI?

---

**Recommendation**: Start with 2-table split. If future analytics/compliance requires even stricter separation, promote to 3 tables later (low migration cost). Over-engineering now = wasted time.
