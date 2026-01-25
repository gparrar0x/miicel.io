-- =============================================================================
-- SEED DATA: Versión simplificada para ejecutar en Supabase SQL Editor
-- =============================================================================
-- Cambiar TENANT_ID según necesidad
-- =============================================================================

-- PASO 1: Crear customers
INSERT INTO customers (tenant_id, name, email, phone, created_at)
SELECT
  2 as tenant_id,
  'Cliente ' || n as name,
  'cliente' || n || '@test.com' as email,
  '+569' || LPAD(n::text, 8, '0') as phone,
  NOW() - (INTERVAL '1 day' * (180 - n * 7)) as created_at
FROM generate_series(1, 25) n
ON CONFLICT DO NOTHING;

-- PASO 2: Crear órdenes con items, categorías y totales
WITH product_list AS (
  SELECT id, name, price, category FROM products WHERE tenant_id = 2
)
INSERT INTO orders (tenant_id, customer_id, status, total, items, payment_method, discount_metadata, created_at, updated_at)
SELECT
  2 as tenant_id,
  (SELECT id FROM customers WHERE tenant_id = 2 ORDER BY RANDOM() LIMIT 1) as customer_id,
  CASE
    WHEN n <= 85 THEN 'delivered'
    WHEN n <= 90 THEN 'ready'
    WHEN n <= 94 THEN 'preparing'
    WHEN n <= 97 THEN 'paid'
    ELSE 'pending'
  END as status,
  p.price * qty as total,
  jsonb_build_array(
    jsonb_build_object(
      'product_id', p.id,
      'name', p.name,
      'category', COALESCE(p.category, 'Sin categoría'),
      'quantity', qty,
      'unit_price', p.price,
      'total', p.price * qty
    )
  ) as items,
  CASE (n % 3) WHEN 0 THEN 'mercadopago' WHEN 1 THEN 'cash' ELSE 'transfer' END as payment_method,
  CASE
    WHEN (n % 10) = 0 THEN jsonb_build_object('source', 'PROMO10', 'code', 'PROMO10', 'type', 'percentage', 'value', 10, 'amount', (p.price * qty * 0.10)::int)
    WHEN (n % 10) = 3 THEN jsonb_build_object('source', 'BIENVENIDO', 'code', 'BIENVENIDO', 'type', 'percentage', 'value', 15, 'amount', (p.price * qty * 0.15)::int)
    WHEN (n % 10) = 6 THEN jsonb_build_object('source', 'FIDELIDAD', 'code', 'FIDELIDAD', 'type', 'fixed', 'value', 5000, 'amount', 5000)
    WHEN (n % 10) = 9 THEN jsonb_build_object('source', 'WELCOME20', 'code', 'WELCOME20', 'type', 'percentage', 'value', 20, 'amount', (p.price * qty * 0.20)::int)
    ELSE NULL
  END as discount_metadata,
  NOW() - (INTERVAL '1 day' * (210 - n * 2)) as created_at,
  NOW() - (INTERVAL '1 day' * (210 - n * 2)) + INTERVAL '1 hour' as updated_at
FROM generate_series(1, 100) n
CROSS JOIN LATERAL (
  SELECT id, name, price, category FROM product_list ORDER BY RANDOM() LIMIT 1
) p
CROSS JOIN LATERAL (
  SELECT (1 + (RANDOM() * 3)::int) as qty
) q;

-- PASO 3: Crear payments para órdenes pagadas
INSERT INTO payments (order_id, payment_id, status, status_detail, payment_type, payment_method_id, amount, currency, payer_email, payer_name, created_at, updated_at)
SELECT
  o.id,
  'MP-' || LPAD(o.id::text, 10, '0'),
  'approved',
  'accredited',
  CASE (o.id % 3) WHEN 0 THEN 'credit_card' WHEN 1 THEN 'debit_card' ELSE 'account_money' END,
  CASE (o.id % 5) WHEN 0 THEN 'visa' WHEN 1 THEN 'master' WHEN 2 THEN 'debcabal' WHEN 3 THEN 'amex' ELSE 'account_money' END,
  o.total,
  'CLP',
  c.email,
  c.name,
  o.created_at,
  o.updated_at
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.tenant_id = 2 AND o.status IN ('paid', 'preparing', 'ready', 'delivered')
ON CONFLICT DO NOTHING;

-- PASO 4: Actualizar estadísticas de customers
UPDATE customers c
SET
  total_orders = sub.order_count,
  total_spent = sub.total_revenue,
  last_order_at = sub.last_order,
  loyalty_points = FLOOR(sub.total_revenue / 1000)
FROM (
  SELECT customer_id, COUNT(*) as order_count, SUM(total) as total_revenue, MAX(created_at) as last_order
  FROM orders WHERE tenant_id = 2 AND status IN ('paid', 'preparing', 'ready', 'delivered')
  GROUP BY customer_id
) sub
WHERE c.id = sub.customer_id;

-- VERIFICACIÓN
SELECT
  'products' as tabla, COUNT(*) as total FROM products WHERE tenant_id = 2
UNION ALL SELECT 'customers', COUNT(*) FROM customers WHERE tenant_id = 2
UNION ALL SELECT 'orders', COUNT(*) FROM orders WHERE tenant_id = 2
UNION ALL SELECT 'payments', COUNT(*) FROM payments p JOIN orders o ON p.order_id = o.id WHERE o.tenant_id = 2
UNION ALL SELECT 'con_descuento', COUNT(*) FROM orders WHERE tenant_id = 2 AND discount_metadata IS NOT NULL;
