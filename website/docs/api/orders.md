---
sidebar_position: 1
title: Orders API
---

# Orders Management API

Complete reference for the Orders Management API endpoints.

---

## Overview

The Orders API provides endpoints for listing and managing orders in the Vendio platform.

**Base URL:** `/api/orders`

**Authentication:** Required (Bearer token)

---

## Endpoints

### GET /api/orders/list

List orders with filters and pagination.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tenant_id` | number | Yes | Tenant ID to filter orders |
| `status` | string | No | Filter by status (pending, paid, completed, cancelled) |
| `page` | number | No | Page number (default: 1) |
| `per_page` | number | No | Items per page (default: 50, max: 100) |

#### Example Request

```bash
curl -X GET "http://localhost:3000/api/orders/list?tenant_id=1&status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

### PATCH /api/orders/[id]/status

Update order status.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | number | Yes | Order ID |

#### Request Body

```json
{
  "status": "paid"
}
```

**Valid statuses:**
- `pending` - Order created, payment pending
- `paid` - Payment completed
- `preparing` - Order being prepared
- `completed` - Order delivered/completed
- `cancelled` - Order cancelled

---

## Authentication

All endpoints require authentication via Bearer token.

---

## Error Responses

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "User does not have access to this tenant"
}
```

---

## Best Practices

1. **Always filter by tenant_id:** Ensures data isolation
2. **Use pagination:** For large result sets, use `page` and `per_page`
3. **Handle errors gracefully:** Check status codes and error messages
4. **Cache responses:** Order lists can be cached for short periods
5. **Validate status transitions:** Only allow valid status changes

