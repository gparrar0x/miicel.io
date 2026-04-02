# app/api/CLAUDE.md

> API route handler conventions
> Updated: 2026-04-01

---

## Route Pattern

Thin handlers: validate → authenticate → authorize → delegate → respond.

```typescript
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // delegate to service/repo
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## Auth — Manual, Every Route

No middleware. Each route does its own auth chain:
1. `await createClient()` → `auth.getUser()`
2. Ownership check: `tenant.owner_id === user.id`
3. Superadmin bypass: `isSuperadmin(user.email)` (checks `SUPER_ADMINS` env var)

## Supabase Client Selection

| Client | When | RLS |
|--------|------|-----|
| `await createClient()` | Default for all routes | Yes |
| `createServiceRoleClient()` | Admin ops, webhooks, cross-tenant lookups | **Bypasses** |
| Raw `createServerClient` | Auth callback/login only (manual cookie mgmt) | Yes |

**Conditional pattern** for superadmin:
```typescript
const client = isSuperAdmin ? createServiceRoleClient() : supabase
```

## Gotchas

- **PGRST116**: `.single()` returns this error code when no rows found. It's a success case for existence checks (e.g., slug available). Only `/api/signup/validate-slug` handles this correctly.
- **MP token encryption**: Settings route encrypts/decrypts MercadoPago tokens (AES-256-GCM). Decrypt failure is silent — continues without token.
- **Webhook returns 200 on error**: MP webhook returns `200 OK` even for invalid notifications to prevent retry loops.
- **Rate limiting**: Only 4 routes rate-limit (`orders/create`, `checkout/create-preference`, `signup/validate-slug`, `webhooks/mercadopago`). Other public endpoints are unprotected.
- **Pagination**: Only `/api/orders/list` paginates. Other list routes return all results.
- **Tenant lookup inconsistent**: Some routes use numeric `tenant_id`, others use `tenantSlug`. No single pattern.

## Runtime

- `edge`: Only `/api/health`
- `nodejs` (explicit): `/api/agents/*` (needs full Node stdlib, 55s timeout via `Promise.race`)
- Default (Node): Everything else

## Error Handling

```typescript
// Standard
catch (err) {
  if (err instanceof AppError) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode })
  }
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
```

- Dev-only debug info in agent routes (`process.env.NODE_ENV === 'development'`)
- `AppError` adoption is partial — not all routes use it

## Services Receive Repos

```typescript
const service = new OrderService(
  new TenantRepo(supabase),
  new CustomerRepo(supabase),
  new OrderRepo(supabase),
  new ProductRepo(supabase),
)
```

Routes instantiate repos and inject into services. Don't call DB directly from route handlers.
