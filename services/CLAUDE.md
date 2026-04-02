# services/CLAUDE.md

> Service & repository layer
> Updated: 2026-04-01

---

## Architecture

```
Route Handler (thin)
  └── Service (business logic, orchestration)
       └── Repository (data access, Supabase queries)
```

Services receive repos via constructor injection. Repos implement interfaces (`IOrderRepo`, `IProductRepo`).

## Repository Pattern

- Repos wrap Supabase query builder (`.select()`, `.eq()`, `.single()`)
- One repo per domain entity: `TenantRepo`, `ProductRepo`, `OrderRepo`, `CustomerRepo`
- Repos are instantiated per request in route handlers with the appropriate Supabase client

## Service Rules

### Price Resolution (Critical)
**Never trust client prices.** Always resolve from DB:
```typescript
const dbProduct = await productRepo.findById(item.productId)
const serverPrice = computeEffectivePrice(dbProduct) // applies active discounts
```

Discount logic: `discount_type`, `discount_value`, `discount_starts_at`, `discount_ends_at` → `computeEffectivePrice()`

### Modifiers
Extra charges stored as delta, not in base price:
```typescript
const total = items.reduce(
  (sum, item) => sum + item.price * item.quantity + (item.modifiersDelta ?? 0) * item.quantity, 0
)
```

### Customer Upsert
Checkout upserts customer by email — find existing or create new. Single source of truth.

### MercadoPago Integration
- Tenant MP token decrypted on-demand (not at startup)
- `findBySlugWithToken()` fetches tenant + token in single query
- Preference uses server-resolved prices, external_reference = order ID

## Auth in Services

```typescript
interface AuthContext { userId: string; userEmail?: string }
```

Services call `assertOwnership(userId, userEmail, tenant.owner_id)` — throws `ForbiddenError`.

## Agent Services (services/agents/)

Lightweight loaders for agent definitions:
- Load YAML definitions from `lib/agents/definitions/`
- Register tools via `getToolsForAgent(agentId)`
- Return complete agent config

## Testing

- `services/__tests__/` for unit tests
- `services/agents/__tests__/` for agent service tests
- Repos are injectable — mock them for unit tests
