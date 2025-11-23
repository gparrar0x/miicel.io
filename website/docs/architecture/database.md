---
sidebar_position: 2
title: Database Schema
---

# Payment Data Model

## Overview

The payment system uses a pragmatic denormalized design that balances query performance with data integrity.

---

## Tables

### `orders`

```sql
orders (
  id BIGINT PRIMARY KEY,
  checkout_id TEXT,      -- MercadoPago preference_id (created on checkout)
  payment_id TEXT,       -- MercadoPago payment_id (set when paid)
  status TEXT,           -- Order status: pending → paid → preparing → delivered
  payment_method TEXT,   -- mercadopago | cash | transfer
  tenant_id BIGINT,      -- FK to tenants
  customer_id BIGINT,    -- FK to customers
  total NUMERIC,
  items JSONB,           -- Denormalized product data
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### `payments`

```sql
payments (
  id BIGINT PRIMARY KEY,           -- Internal auto-increment PK (not exposed)
  order_id BIGINT,                 -- FK to orders.id
  payment_id TEXT UNIQUE,          -- MercadoPago payment_id (external reference)
  status TEXT,                     -- Payment status from MP
  status_detail TEXT,
  payment_type TEXT,               -- credit_card, debit_card, ticket, etc
  payment_method_id TEXT,          -- visa, mastercard, etc
  amount NUMERIC,
  currency TEXT,
  payer_email TEXT,
  payer_name TEXT,
  metadata JSONB,                  -- Full MP response data
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

---

## Design Rationale

### Why both `orders.payment_id` AND `payments` table?

**Pragmatic denormalization for performance:**

1. **orders.payment_id**: Quick reference for fast queries
   - Used in: Dashboard lists, order summaries, admin views
   - Benefit: No JOIN needed for common queries
   - Example: `SELECT * FROM orders WHERE tenant_id = 1` includes payment_id

2. **payments table**: Full payment details when needed
   - Used in: Payment reconciliation, webhook processing, audit logs
   - Benefit: Complete payment history and metadata
   - Example: `SELECT * FROM payments WHERE payment_id = 'MP-123'`

### Denormalization Trade-offs

**Pros:**
- Faster dashboard queries (no JOINs)
- Simpler code for common cases
- Better performance at scale

**Cons:**
- Data duplication (payment_id stored twice)
- Need to keep both in sync
- More complex updates

**Decision:** Acceptable trade-off for read-heavy workload (dashboard views >> payment updates)

---

## Relationships

```
tenants (1) ──< (many) orders
customers (1) ──< (many) orders
orders (1) ──< (1) payments
```

---

## Indexes

```sql
-- Fast tenant order lookups
CREATE INDEX idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Payment lookups
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_payment_id ON payments(payment_id);
```

---

## Row Level Security (RLS)

All tables use RLS policies to ensure tenant isolation:

```sql
-- Orders: tenants can only see their own orders
CREATE POLICY orders_tenant_isolation ON orders
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::bigint);

-- Payments: accessible via order relationship
CREATE POLICY payments_via_order ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.tenant_id = current_setting('app.current_tenant_id')::bigint
    )
  );
```

---

## Migration Strategy

When updating payment data:

1. Update `payments` table (source of truth)
2. Update `orders.payment_id` (denormalized copy)
3. Use database triggers or application logic to keep in sync

---

## Best Practices

1. **Always query by tenant_id** to ensure isolation
2. **Use transactions** when updating both tables
3. **Validate payment_id** exists in payments table before updating orders
4. **Log all payment updates** for audit trail

