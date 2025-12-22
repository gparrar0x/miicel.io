# SKY-44: Dashboard Analytics & Reportes - Paridad Loyverse (MVP)

## Contexto
**Objetivo:** Reemplazar Loyverse con Vendio para gestion diaria del negocio.

**Usuario validado usa Loyverse para:**
> "Me permite ver un top 10 de articulos mas vendidos, categorias mas vendidas, bebidas mas vendidas, medios de pago mas usados y discriminar descuentos de que fueron (RedBag8, descuento del local, un folleto). Asi que para eso lo uso."

**Scope MVP:** Paridad funcional con Loyverse en analytics + reporting.
**Fase 2 (fuera de scope):** Meta Ads, Google Business, WhatsApp Bot, KDS/Comandera.

## Features Requeridas

### 1. Dashboard Principal
- KPIs: total_sales, total_transactions, average_ticket, items_sold
- Top 10 productos mas vendidos con ranking y %
- Top categorias con revenue y % participacion
- Medios de pago discriminados (efectivo, MercadoPago, etc)
- Descuentos discriminados por origen (RedBag8, local, folleto, etc)
- Filtros de fecha: Hoy, Ayer, Esta semana, Este mes, Rango custom
- Export CSV funcional

### 2. Performance Requirements
- Queries <500ms (usando materialized views)
- Mobile responsive
- E2E tests 100%

## Dependencies
- Orders table (payment_method, status, total_amount)
- Order_items table (product_id, quantity, price)
- Products table (name, category)
- NUEVO: discount_metadata en orders

## Estimacion
- Backend (Kokoro): 1.5 semanas
- Frontend (Pixel): 1.5 semanas
- Testing (Sentinela): 3 dias
- **Total: 3 semanas**

## Links
- Linear: https://linear.app/publica/issue/SKY-44
- Project: sw_commerce_saas
