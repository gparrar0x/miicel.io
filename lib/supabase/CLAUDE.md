# lib/supabase/CLAUDE.md

> Supabase client layer
> Updated: 2026-04-01

---

## Clients

| File | Export | Async | RLS | Use Case |
|------|--------|-------|-----|----------|
| `client.ts` | `createClient()` | No | Yes | Browser/client components (`'use client'`) |
| `server.ts` | `createClient()` | **Yes** | Yes | Server components, API routes |
| `server.ts` | `createServiceRoleClient()` | No | **Bypasses** | Admin ops, webhooks, cleanup, cross-tenant lookups |

All clients typed via `database.types.ts` (auto-generated from Supabase schema).

## Rules

- **Client components**: Import from `@/lib/supabase/client`
- **Server/API routes**: Import from `@/lib/supabase/server`
- **Service role**: Only in trusted server contexts. Never expose to client.
- Both server exports wrap `@skywalking/core/supabase/*`

## Gotcha

`createServiceRoleClient()` is sync. `createClient()` on server is async (reads cookies).

## When to Use Service Role

- Test database cleanup (`dbCleanup`)
- Webhook handlers (no user session)
- Cross-tenant lookups (slug validation)
- Admin views that need all tenants
- Superadmin conditional: `isSuperAdmin ? createServiceRoleClient() : supabase`
