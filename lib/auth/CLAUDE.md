# lib/auth/CLAUDE.md

> Authentication & authorization
> Updated: 2026-04-01

---

## Auth Flow

1. `getServerSession()` — reads cookies, validates with Supabase Auth
2. `getUser()` — extracts `session.user`
3. `isSuperadmin(email)` — checks against `SUPERADMIN_EMAIL` constant (`gparrar@skywalking.dev`)
4. `assertOwnership(userId, userEmail, ownerId)` — throws `ForbiddenError` if not owner or superadmin

## Roles

Stored in `users` table: `platform_admin`, `tenant_admin`, `owner`, `staff`

- **Superadmin**: Email-based, not a DB role. Bypasses most ownership checks.
- **Owner**: Full access to their tenant
- **tenant_admin**: Access via `users` table role lookup (not direct ownership)

## Server vs Client Auth

- **Server guards** (`requireAuth`, `requireTenantOwner`, `verifyTenantOwnership`): Re-exported from `@skywalking/core`
- **Client permission check**: `checkDashboardAccess(tenantSlug)` calls `/api/auth/check-superadmin` to avoid exposing env vars in frontend

## Gotchas

- Superadmin check is a server-only env var — client must call API endpoint to verify
- Auth handlers (`/api/auth/login`, `/callback`) manually manage cookies via custom setter pattern — don't use this pattern elsewhere
- Login redirect logic routes to appropriate tenant dashboard based on role
