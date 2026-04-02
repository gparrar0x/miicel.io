# lib/supabase/CLAUDE.md

> Supabase client layer
> Updated: 2026-04-02

---

## Clients

| File | Export | Async | RLS | Use Case |
|------|--------|-------|-----|----------|
| `client.ts` | `createClient()` | No | Yes | Browser/client components (`'use client'`) |
| `server.ts` | `createClient()` | **Yes** | Yes | **RSC only** (Server Components, layouts, pages) |
| `server.ts` | `createClientFromRequest(request)` | No | Yes | **API route handlers** (parses cookies from Request) |
| `server.ts` | `createServiceRoleClient()` | No | **Bypasses** | Admin ops, webhooks, cleanup, cross-tenant lookups |

All clients typed via `database.types.ts` (auto-generated from Supabase schema).

## Rules

- **Client components**: Import from `@/lib/supabase/client`
- **Server Components / pages / layouts**: `await createClient()` from `@/lib/supabase/server`
- **API route handlers**: `createClientFromRequest(request)` from `@/lib/supabase/server`
- **Service role**: Only in trusted server contexts. Never expose to client.
- All server exports wrap `@skywalking/core/supabase/*`

## CRITICAL: API Route Handlers

**NEVER use `await createClient()` in API route handlers.** It calls `cookies()` from `next/headers` which hangs indefinitely in Vercel serverless functions. Use `createClientFromRequest(request)` instead — it parses cookies directly from the Request object.

```typescript
// WRONG — hangs in Vercel serverless
export async function GET(request: Request) {
  const supabase = await createClient() // ← HANGS
}

// CORRECT — safe for Vercel serverless
export async function GET(request: Request) {
  const supabase = createClientFromRequest(request) // ← sync, safe
}
```

## Gotcha

`createServiceRoleClient()` and `createClientFromRequest()` are sync. `createClient()` is async (reads cookies via next/headers).

## When to Use Service Role

- Test database cleanup (`dbCleanup`)
- Webhook handlers (no user session)
- Cross-tenant lookups (slug validation)
- Admin views that need all tenants
- Public endpoints that don't need user context (sitemap, tenant list)
- Superadmin conditional: `isSuperAdmin ? createServiceRoleClient() : supabase`
