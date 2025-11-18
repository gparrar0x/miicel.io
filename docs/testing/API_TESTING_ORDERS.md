# Orders Management API - Testing Guide

## Overview

This document provides comprehensive testing instructions for the Orders Management API endpoints.

**Endpoints:**
- `GET /api/orders/list` - List orders with filters and pagination
- `PATCH /api/orders/[id]/status` - Update order status

---

## Prerequisites

1. **Start Development Server:**
   ```bash
   cd /Users/gpublica/workspace/skywalking/projects/sw_commerce_saas
   npm run dev
   ```

2. **Get Authentication Token:**
   - Log in to your application
   - Open browser DevTools → Application → Cookies
   - Copy the `sb-access-token` value
   - Use as: `Authorization: Bearer YOUR_TOKEN`

3. **Known Test Data:**
   - Tenant ID: 1
   - Order ID: 1 (if exists from SKY-7)
   - Customer ID: 1

---

## API Endpoint Testing

### 1. GET /api/orders/list - List All Orders

**Test Case 1.1: List all orders for tenant**
```bash
curl -X GET "http://localhost:3000/api/orders/list?tenant_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response (200 OK):**
```json
{
  "orders": [
    {
      "id": 1,
      "tenant_id": 1,
      "customer": {
        "id": 1,
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "phone": "+5491123456789"
      },
      "items": [
        {
          "product_id": 1,
          "name": "Product Name",
          "quantity": 2,
          "unit_price": 1500
        }
      ],
      "total": 3000,
      "status": "pending",
      "payment_method": null,
      "payment_id": null,
      "notes": null,
      "created_at": "2025-01-12T...",
      "updated_at": "2025-01-12T..."
    }
  ],
  "total_count": 1,
  "page": 1,
  "per_page": 50
}
```

---

### 2. GET /api/orders/list - Filter by Status

**Test Case 2.1: Filter orders by status**
```bash
curl -X GET "http://localhost:3000/api/orders/list?tenant_id=1&status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response (200 OK):**
```json
{
  "orders": [...],
  "total_count": 1,
  "page": 1,
  "per_page": 50
}
```

**Test Case 2.2: Filter with different statuses**
```bash
# Test each status value
for status in pending paid preparing ready delivered cancelled; do
  echo "Testing status: $status"
  curl -X GET "http://localhost:3000/api/orders/list?tenant_id=1&status=$status" \
    -H "Authorization: Bearer YOUR_TOKEN"
  echo ""
done
```

---

### 3. GET /api/orders/list - Filter by Date Range

**Test Case 3.1: Filter by date_from**
```bash
curl -X GET "http://localhost:3000/api/orders/list?tenant_id=1&date_from=2025-01-01" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Test Case 3.2: Filter by date range**
```bash
curl -X GET "http://localhost:3000/api/orders/list?tenant_id=1&date_from=2025-01-01&date_to=2025-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response (200 OK):**
```json
{
  "orders": [...],
  "total_count": X,
  "page": 1,
  "per_page": 50
}
```

---

### 4. GET /api/orders/list - Pagination

**Test Case 4.1: Limit results**
```bash
curl -X GET "http://localhost:3000/api/orders/list?tenant_id=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Test Case 4.2: Pagination with offset**
```bash
# Page 1
curl -X GET "http://localhost:3000/api/orders/list?tenant_id=1&limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Page 2
curl -X GET "http://localhost:3000/api/orders/list?tenant_id=1&limit=10&offset=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "orders": [...],
  "total_count": 25,
  "page": 1,  // or 2 for second request
  "per_page": 10
}
```

---

### 5. GET /api/orders/list - Combined Filters

**Test Case 5.1: Multiple filters**
```bash
curl -X GET "http://localhost:3000/api/orders/list?tenant_id=1&status=pending&date_from=2025-01-01&date_to=2025-01-31&limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

### 6. GET /api/orders/list - Error Cases

**Test Case 6.1: Missing tenant_id (400)**
```bash
curl -X GET "http://localhost:3000/api/orders/list" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "tenant_id is required"
}
```

**Test Case 6.2: Invalid status value (400)**
```bash
curl -X GET "http://localhost:3000/api/orders/list?tenant_id=1&status=invalid_status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Invalid status"
}
```

**Test Case 6.3: Unauthorized (401)**
```bash
curl -X GET "http://localhost:3000/api/orders/list?tenant_id=1"
```

**Expected Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized. Please log in."
}
```

**Test Case 6.4: Access another tenant's orders (403)**
```bash
curl -X GET "http://localhost:3000/api/orders/list?tenant_id=999" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (403 Forbidden):**
```json
{
  "error": "Forbidden. You do not own this tenant."
}
```

---

## PATCH /api/orders/[id]/status - Update Order Status

### 7. Update Status - Valid Transitions

**Test Case 7.1: Update to preparing**
```bash
curl -X PATCH "http://localhost:3000/api/orders/1/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "preparing"
  }'
```

**Expected Response (200 OK):**
```json
{
  "order": {
    "id": 1,
    "tenant_id": 1,
    "status": "preparing",
    "updated_at": "2025-01-12T...",
    ...
  }
}
```

**Test Case 7.2: Update to ready**
```bash
curl -X PATCH "http://localhost:3000/api/orders/1/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "ready"
  }'
```

**Test Case 7.3: Update to delivered**
```bash
curl -X PATCH "http://localhost:3000/api/orders/1/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "delivered"
  }'
```

**Test Case 7.4: Update to cancelled (from any status)**
```bash
curl -X PATCH "http://localhost:3000/api/orders/1/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "cancelled"
  }'
```

---

### 8. Update Status - Invalid Transitions

**Test Case 8.1: Try to change delivered order (400)**
```bash
# First deliver the order
curl -X PATCH "http://localhost:3000/api/orders/1/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "delivered"}'

# Then try to change it back (should fail)
curl -X PATCH "http://localhost:3000/api/orders/1/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "preparing"}'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Cannot change status of delivered order.",
  "current_status": "delivered",
  "hint": "Only cancellation is allowed for delivered orders."
}
```

**Test Case 8.2: Try to change cancelled order (400)**
```bash
# First cancel the order
curl -X PATCH "http://localhost:3000/api/orders/1/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "cancelled"}'

# Then try to change it (should fail)
curl -X PATCH "http://localhost:3000/api/orders/1/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "preparing"}'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Cannot change status of cancelled order.",
  "current_status": "cancelled"
}
```

---

### 9. Update Status - Error Cases

**Test Case 9.1: Invalid status value (400)**
```bash
curl -X PATCH "http://localhost:3000/api/orders/1/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "invalid_status"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Invalid enum value..."
}
```

**Test Case 9.2: Invalid order ID (400)**
```bash
curl -X PATCH "http://localhost:3000/api/orders/abc/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "preparing"}'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Invalid order ID."
}
```

**Test Case 9.3: Order not found (404)**
```bash
curl -X PATCH "http://localhost:3000/api/orders/999999/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "preparing"}'
```

**Expected Response (404 Not Found):**
```json
{
  "error": "Order not found."
}
```

**Test Case 9.4: Unauthorized (401)**
```bash
curl -X PATCH "http://localhost:3000/api/orders/1/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "preparing"}'
```

**Expected Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized. Please log in."
}
```

---

## Database Verification

### Verify Order Updates

After updating an order status, verify in database:

```sql
-- Check order status and updated_at
SELECT
  id,
  status,
  updated_at,
  created_at
FROM orders
WHERE id = 1;

-- Verify updated_at changed
SELECT
  id,
  status,
  updated_at,
  EXTRACT(EPOCH FROM (updated_at - created_at)) as seconds_since_creation
FROM orders
WHERE id = 1;
```

### Verify Customer JOIN

```sql
-- Check order with customer details
SELECT
  o.id,
  o.status,
  o.total,
  c.name as customer_name,
  c.email as customer_email,
  c.phone as customer_phone
FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id
WHERE o.tenant_id = 1
ORDER BY o.created_at DESC;
```

### Verify RLS Policies

```sql
-- As owner (should see all tenant orders)
SET ROLE authenticated;
SET request.jwt.claims.sub = 'owner_user_id_here';

SELECT id, status, tenant_id
FROM orders
WHERE tenant_id = 1;

-- As different user (should see nothing)
SET request.jwt.claims.sub = 'other_user_id_here';

SELECT id, status, tenant_id
FROM orders
WHERE tenant_id = 1;
```

---

## Performance Testing

### Response Time Benchmarks

Target: <100ms for list endpoint, <50ms for status update

**Test with Apache Bench:**
```bash
# List endpoint
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/orders/list?tenant_id=1"

# Status update endpoint
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  -p status_update.json -T application/json \
  "http://localhost:3000/api/orders/1/status"
```

**status_update.json:**
```json
{"status": "preparing"}
```

---

## Integration Testing Checklist

- [ ] GET /api/orders/list returns all tenant orders
- [ ] Filtering by status works correctly
- [ ] Date range filtering is inclusive
- [ ] Pagination works with limit/offset
- [ ] Customer details are included via JOIN
- [ ] RLS enforces tenant isolation
- [ ] PATCH /api/orders/[id]/status updates status
- [ ] Status transitions are validated
- [ ] Delivered orders cannot be changed (except cancel)
- [ ] Cancelled orders cannot be changed
- [ ] updated_at timestamp is updated on status change
- [ ] Unauthorized requests return 401
- [ ] Access to other tenant's orders returns 403
- [ ] Invalid inputs return 400 with clear error messages

---

## Notes

1. **Guest Orders:** customer_id can be NULL - ensure frontend handles this gracefully
2. **Status Transitions:** Current implementation prevents backward transitions for delivered/cancelled
3. **Pagination:** Uses offset-based pagination; consider cursor-based for large datasets
4. **Performance:** Ensure indexes exist on:
   - `orders.tenant_id`
   - `orders.status`
   - `orders.created_at`
   - `orders.customer_id` (foreign key)

---

## Troubleshooting

**Issue: Authentication fails**
- Check token is valid and not expired
- Verify user owns the tenant

**Issue: No orders returned**
- Verify tenant has orders: `SELECT * FROM orders WHERE tenant_id = 1`
- Check RLS policies are enabled
- Verify user is authenticated as tenant owner

**Issue: JOIN returns null customer**
- This is expected for guest orders (customer_id = NULL)
- Frontend should handle null customer gracefully

**Issue: Status update fails**
- Check current status allows the transition
- Verify order belongs to authenticated user's tenant
- Check Zod validation passes

---

## Next Steps

1. **Frontend Integration:** Create admin dashboard components
2. **Real-time Updates:** Consider adding WebSocket for live order status
3. **Analytics:** Add aggregate queries (orders by status, revenue by date)
4. **Export:** Add CSV/PDF export for order history
5. **Notifications:** Send emails on status changes

---

**Created:** 2025-01-12
**Task:** SKY-9 - Orders Management API
**Author:** Kokoro (Backend Specialist)
