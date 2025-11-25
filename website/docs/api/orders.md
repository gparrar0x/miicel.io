---
sidebar_position: 1
title: Orders API
---

# Orders Management API

Complete reference for the Orders Management API endpoints.

---

## Overview

The Orders API provides endpoints for listing and managing orders in the Miicel.io platform.

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

#### Example Response

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
      "created_at": "2025-01-12T12:00:00.000Z",
      "updated_at": "2025-01-12T12:00:00.000Z"
    }
  ],
  "total_count": 1,
  "page": 1,
  "per_page": 50
}
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

#### Example Request

```bash
curl -X PATCH "http://localhost:3000/api/orders/1/status" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "paid"}'
```

#### Example Response

```json
{
  "id": 1,
  "status": "paid",
  "updated_at": "2025-01-12T12:30:00.000Z"
}
```

---

## Authentication

All endpoints require authentication via Bearer token.

### Getting Authentication Token

1. Log in to your application
2. Open browser DevTools → Application → Cookies
3. Copy the `sb-access-token` value
4. Use as: `Authorization: Bearer YOUR_TOKEN`

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

### 404 Not Found

```json
{
  "error": "Not Found",
  "message": "Order not found"
}
```

### 400 Bad Request

```json
{
  "error": "Bad Request",
  "message": "Invalid status value",
  "details": {
    "status": "Status must be one of: pending, paid, preparing, completed, cancelled"
  }
}
```

---

## Rate Limiting

- **Rate Limit:** 100 requests per minute per tenant
- **Headers:** Rate limit info included in response headers:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets

---

## Testing

For comprehensive testing instructions, see the original testing documentation in the `/docs/testing/` folder of the repository.

---

## Best Practices

1. **Always filter by tenant_id:** Ensures data isolation
2. **Use pagination:** For large result sets, use `page` and `per_page`
3. **Handle errors gracefully:** Check status codes and error messages
4. **Cache responses:** Order lists can be cached for short periods
5. **Validate status transitions:** Only allow valid status changes

