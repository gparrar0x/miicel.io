---
sidebar_position: 1
title: Document
---

---
sidebar_position: 2
title: Database Schema
---

# Payment Data Model

## Overview

The payment system uses a pragmatic denormalized design that balances query performance with data integrity.

## Tables

### `orders`
```sql
orders (
  id BIGINT PRIMARY KEY,
  checkout_id TEXT,      -- MercadoPago preference_id (created on checkout)
  payment_id TEXT,       -- MercadoPago payment_id (set when paid)
  status TEXT,           -- Order status: pending → paid → preparing → delivered
  payment_method TEXT,   -- mercadopago | cash | transfer
  ...
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

## Design Rationale

### Why both `orders.payment_id` AND `payments` table?

**Pragmatic denormalization for performance:**

1. **orders.payment_id**: Quick reference for fast queries
   - Used in: Dashboard lists, order summaries, admin views
   - Benefit: No JOIN needed for common queries
   - Example: `SELECT * FROM orders WHERE tenant_id = 1` includes payment_id

2. **payments table**: Complete audit trail
   - Purpose: Full transaction metadata, compliance, reporting
   - Benefit: Detailed payment history, refunds tracking, analytics
   - Example: Query all failed payments, calculate fees, export for accounting

**Relationship:**
```
orders.payment_id = payments.payment_id
       ↓                     ↓
   "12345"    ←─────→    "12345"
                         (+ full metadata)
```

### Why both `checkout_id` AND `payment_id` in orders?

Different lifecycle stages:

```
1. User clicks "Pay"
   → orders.checkout_id = "pref-abc123" (MP preference_id)
   → orders.status = "pending"

2. User completes payment
   → MP webhook arrives
   → orders.payment_id = "pay-xyz789" (MP payment_id)
   → orders.status = "paid"
   → payments record created with full data
```

### Field Naming Convention

| Field | Meaning | Exposed to Clients? |
|-------|---------|-------------------|
| `payments.id` | Internal DB primary key | ❌ No (implementation detail) |
| `payments.payment_id` | MercadoPago payment ID | ✅ Yes (external reference) |
| `payments.order_id` | Reference to order | ✅ Yes (for lookups) |

## Query Examples

### Fast dashboard query (no JOIN needed)
```sql
-- Get orders with payment references
SELECT id, total, status, payment_method, payment_id
FROM orders
WHERE tenant_id = 1
ORDER BY created_at DESC
LIMIT 50;
```

### Detailed payment audit
```sql
-- Get full payment details
SELECT 
  o.id as order_id,
  o.total,
  p.payment_id,
  p.status,
  p.status_detail,
  p.amount,
  p.payer_email,
  p.metadata
FROM orders o
LEFT JOIN payments p ON o.payment_id = p.payment_id
WHERE o.tenant_id = 1;
```

### Payment analytics
```sql
-- Calculate successful payment rate
SELECT 
  COUNT(*) FILTER (WHERE status = 'approved') as successful,
  COUNT(*) FILTER (WHERE status = 'rejected') as failed,
  SUM(amount) FILTER (WHERE status = 'approved') as total_revenue
FROM payments
WHERE created_at >= '2025-01-01';
```

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. CHECKOUT                                             │
│    POST /api/checkout/create-preference                 │
│    → Create order (status: pending)                     │
│    → Create MP preference                               │
│    → Save orders.checkout_id = preference_id            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. USER PAYS                                            │
│    → MercadoPago payment flow                           │
│    → MP sends webhook to /api/webhooks/mercadopago      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. WEBHOOK PROCESSING                                   │
│    → Fetch payment details from MP API                  │
│    → Update orders.status = 'paid'                      │
│    → Update orders.payment_id = MP payment_id           │
│    → INSERT INTO payments (full transaction data)       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 4. ORDER COMPLETION                                     │
│    → Stock decremented (trigger fires on status=paid)   │
│    → Email sent to customer                             │
│    → Dashboard shows payment_id                         │
└─────────────────────────────────────────────────────────┘
```

## Trade-offs

### ✅ Benefits of Current Design

1. **Performance**: Dashboard queries don't need JOINs
2. **Backward compatible**: Existing code using `orders.payment_id` works
3. **Audit trail**: Full payment data preserved in `payments` table
4. **Flexibility**: Can query payments independently of orders

### ⚠️ Considerations

1. **Denormalization**: `orders.payment_id` duplicates `payments.payment_id`
   - Mitigation: Webhook atomically updates both in same transaction
   - Risk: Low (payment_id is immutable once set)

2. **Naming confusion**: `payments.id` vs `payments.payment_id`
   - Mitigation: Clear documentation (this file)
   - Convention: Never expose `payments.id` to clients

## Migration Notes

- Migration: `028_add_checkout_and_payments_table.sql`
- Date: 2025-01-22
- Breaking changes: None (additive only)
- Rollback: Not recommended (would lose payment metadata)

## Future Considerations

If refunds/chargebacks are implemented:
- Add `payments.original_payment_id` for refund tracking
- Add `payments.refund_amount` field
- Status transitions: `approved → refunded`

