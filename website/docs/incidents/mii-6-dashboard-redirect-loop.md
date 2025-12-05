---
sidebar_label: "MII-6 Dashboard Redirect Loop"
sidebar_position: 1
---

# MII-6: Dashboard Redirect Loop (Dec 2025)

## Summary
Authenticated users were stuck in an infinite redirect between `/en/login` and `/en/3/dashboard`. The middleware (proxy) could not resolve the tenant or the user role, so every dashboard request was bounced back to login, causing ERR_TOO_MANY_REDIRECTS.

## Impact
- Tenant admins could not access the admin dashboard after login.
- Production deployments on Vercel exhibited the loop (e.g., `micelio-rcb48lkwt-*`).

## Root Cause
- The proxy middleware only looked up tenants by **slug**. New dashboard URLs use **numeric tenant IDs** (`/en/3/...`), so tenant lookup failed and triggered a redirect to login.
- Role verification inside the middleware used the session-bound Supabase client (subject to RLS). RLS blocked reads on the `users` table, producing false “not authorized” results and another redirect to login.

## Fix
1. **Tenant lookup by ID or slug**: Detect numeric second segment and query `tenants.id`; otherwise use `tenants.slug`. Cache keyed by the incoming identifier. (commit `ecacac2`).
2. **Locale-aware redirects**: Redirect unauthenticated users to `/${locale}/login` to avoid i18n bounce loops. (commit `ecacac2`).
3. **Role check with service role**: Validate `users.role`/`tenant_id` via `createServiceRoleClient()` in the proxy to bypass RLS and accept `platform_admin`, `tenant_admin`, `staff`, or the tenant owner. (commit `ca9acc6`).

## Verification
- Vercel deploy `micelio-hkg3tni24-*` (Dec 5, 2025): Playwright MCP login as `tenant@miicel.io / Tenant123!` redirected to `/en/3/dashboard` and loaded successfully with stats. No redirect loop observed.

## Lessons Learned
- When URL structures change (slug → ID), update all auth/middleware layers, not just page components.
- Middleware auth checks should avoid RLS ambiguity—use service role for authorization decisions when appropriate.
- Always include locale in middleware redirects when using next-intl to prevent redirect cascades.
- Consider future hardening: canonicalize dashboard URLs to slugs only, and redirect numeric-ID routes to the slug path (`/[locale]/[slug]/...`) to reduce ambiguity and exposure of tenant IDs. Would require updating link generators, middleware, and E2E fixtures.

## Timeline (UTC)
- 2025-12-04: Redirect loop reported on dashboard after login.
- 2025-12-05: Fixed tenant lookup (ID/slug) and locale-aware redirects; still blocked by RLS in middleware.
- 2025-12-05: Switched role check to service role; verified on production deploy.
