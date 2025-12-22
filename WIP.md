# WIP - SKY-44 Dashboard Analytics

## Context
Building analytics dashboard for paridad Loyverse. User needs:
- Top 10 productos mas vendidos
- Categorias mas vendidas
- Medios de pago discriminados
- Descuentos por origen (RedBag8, local, folleto)

## Schema Analysis (completed)
- `orders` table: id, tenant_id, customer_id, items (JSONB), total, status, payment_method, payment_id, checkout_id
- `orders.items` structure: [{product_id, name, quantity, unit_price}]
- `products` table: id, tenant_id, name, description, price, category, stock, image_url, active
- `payments` table: id, order_id, payment_id, status, payment_type, payment_method_id, amount
- NO existe `discount_metadata` en orders - DEBE AGREGARSE

## Key Decisions
1. **NO materialized views** inicialmente - usar queries directas con buenos indexes
   - Razon: Supabase free tier no tiene pg_cron, refresh manual es tedioso
   - Alternativa: Caching en frontend con React Query (5min stale)

2. **Items JSONB** vs order_items table
   - Ya existe como JSONB, no crear tabla separada
   - Usar jsonb_array_elements para queries

3. **discount_metadata** nuevo campo JSONB en orders
   - Estructura: {source, code, amount, percentage}

## Next Steps
1. Create migration for discount_metadata
2. Create API route /api/analytics/dashboard
3. Create API route /api/analytics/export
4. [Pixel] Dashboard UI components

## Blockers
- None

## Files Modified
- docs/backlog/SKY_44_dashboard_analytics/SKY_44_NOTES.md
- docs/backlog/SKY_44_dashboard_analytics/SKY_44_KOKORO_TASKS.md
- docs/backlog/SKY_44_dashboard_analytics/SKY_44_PIXEL_TASKS.md
- docs/backlog/SKY_44_dashboard_analytics/SKY_44_SENTINELA_TASKS.md
