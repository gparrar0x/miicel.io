-- =============================================================================
-- SEED DATA SCRIPT: demo_restaurant (tenant_id = 2)
-- =============================================================================
-- Genera datos de prueba completos para dashboards y analytics
-- Incluye: customers, orders, payments, categorías, métodos de pago, descuentos
--
-- USO: Cambiar @TENANT_ID al inicio para usar con otro tenant
-- =============================================================================

-- Configuración
DO $$
DECLARE
  TENANT_ID CONSTANT INT := 2;
  customer_ids INT[];
  product_data JSONB;
  i INT;
  order_id INT;
  customer_id INT;
  order_date TIMESTAMPTZ;
  order_total NUMERIC;
  order_status TEXT;
  order_items JSONB;
  payment_method TEXT;
  discount_meta JSONB;
BEGIN

-- =============================================================================
-- 1. CREAR CUSTOMERS (25)
-- =============================================================================
INSERT INTO customers (tenant_id, name, email, phone, created_at) VALUES
(TENANT_ID, 'María González', 'maria.gonzalez@email.com', '+56912345678', NOW() - INTERVAL '180 days'),
(TENANT_ID, 'Carlos Rodríguez', 'carlos.rod@email.com', '+56923456789', NOW() - INTERVAL '170 days'),
(TENANT_ID, 'Ana Martínez', 'ana.martinez@email.com', '+56934567890', NOW() - INTERVAL '160 days'),
(TENANT_ID, 'Pedro López', 'pedro.lopez@email.com', '+56945678901', NOW() - INTERVAL '150 days'),
(TENANT_ID, 'Sofía Hernández', 'sofia.h@email.com', '+56956789012', NOW() - INTERVAL '140 days'),
(TENANT_ID, 'Diego Morales', 'diego.morales@email.com', '+56967890123', NOW() - INTERVAL '130 days'),
(TENANT_ID, 'Valentina Castro', 'vale.castro@email.com', '+56978901234', NOW() - INTERVAL '120 days'),
(TENANT_ID, 'Sebastián Díaz', 'seba.diaz@email.com', '+56989012345', NOW() - INTERVAL '110 days'),
(TENANT_ID, 'Camila Rojas', 'camila.rojas@email.com', '+56990123456', NOW() - INTERVAL '100 days'),
(TENANT_ID, 'Matías Vargas', 'matias.v@email.com', '+56901234567', NOW() - INTERVAL '90 days'),
(TENANT_ID, 'Isidora Muñoz', 'isidora.m@email.com', '+56912345670', NOW() - INTERVAL '85 days'),
(TENANT_ID, 'Benjamín Torres', 'benja.torres@email.com', '+56923456780', NOW() - INTERVAL '80 days'),
(TENANT_ID, 'Antonia Soto', 'antonia.soto@email.com', '+56934567800', NOW() - INTERVAL '75 days'),
(TENANT_ID, 'Lucas Figueroa', 'lucas.f@email.com', '+56945678900', NOW() - INTERVAL '70 days'),
(TENANT_ID, 'Florencia Núñez', 'flor.nunez@email.com', '+56956789000', NOW() - INTERVAL '65 days'),
(TENANT_ID, 'Tomás Espinoza', 'tomas.esp@email.com', '+56967890100', NOW() - INTERVAL '60 days'),
(TENANT_ID, 'Martina Bravo', 'martina.b@email.com', '+56978901200', NOW() - INTERVAL '55 days'),
(TENANT_ID, 'Nicolás Contreras', 'nico.c@email.com', '+56989012300', NOW() - INTERVAL '50 days'),
(TENANT_ID, 'Agustina Vera', 'agus.vera@email.com', '+56990123400', NOW() - INTERVAL '45 days'),
(TENANT_ID, 'Felipe Reyes', 'felipe.reyes@email.com', '+56901234500', NOW() - INTERVAL '40 days'),
(TENANT_ID, 'Catalina Pizarro', 'cata.pizarro@email.com', '+56912345600', NOW() - INTERVAL '35 days'),
(TENANT_ID, 'Joaquín Fuentes', 'joaquin.f@email.com', '+56923456700', NOW() - INTERVAL '30 days'),
(TENANT_ID, 'Renata Sandoval', 'renata.s@email.com', '+56934567900', NOW() - INTERVAL '25 days'),
(TENANT_ID, 'Maximiliano Ortiz', 'max.ortiz@email.com', '+56945679000', NOW() - INTERVAL '20 days'),
(TENANT_ID, 'Isabella Paredes', 'isa.paredes@email.com', '+56956780000', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

RAISE NOTICE 'Customers creados';

END $$;

-- =============================================================================
-- 2. CREAR ORDERS (100 órdenes distribuidas en 7 meses)
-- =============================================================================
-- Obtener productos del tenant para crear items realistas
WITH tenant_products AS (
  SELECT id, name, price, category FROM products WHERE tenant_id = 2
),
tenant_customers AS (
  SELECT id FROM customers WHERE tenant_id = 2 ORDER BY id LIMIT 25
),
-- Generar órdenes con fechas distribuidas
generated_orders AS (
  SELECT
    generate_series(1, 100) as order_num,
    -- Distribución de fechas: más recientes = más órdenes
    NOW() - (INTERVAL '1 day' * (200 - (generate_series(1, 100) * 2))) as order_date
)
INSERT INTO orders (tenant_id, customer_id, status, total, items, payment_method, created_at, updated_at)
SELECT
  2 as tenant_id,
  (SELECT id FROM tenant_customers ORDER BY RANDOM() LIMIT 1) as customer_id,
  CASE
    WHEN go.order_num <= 88 THEN 'delivered'
    WHEN go.order_num <= 90 THEN 'ready'
    WHEN go.order_num <= 93 THEN 'preparing'
    WHEN go.order_num <= 97 THEN 'paid'
    ELSE 'pending'
  END as status,
  0 as total, -- Se calcula después
  '[]'::jsonb as items, -- Se actualiza después
  CASE (go.order_num % 3)
    WHEN 0 THEN 'mercadopago'
    WHEN 1 THEN 'cash'
    ELSE 'transfer'
  END as payment_method,
  go.order_date as created_at,
  go.order_date + INTERVAL '1 hour' as updated_at
FROM generated_orders go;

-- =============================================================================
-- 3. ACTUALIZAR ITEMS DE ÓRDENES CON PRODUCTOS REALES
-- =============================================================================
UPDATE orders o
SET items = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'product_id', p.id,
      'name', p.name,
      'category', COALESCE(p.category, 'Sin categoría'),
      'quantity', (1 + (RANDOM() * 3)::int),
      'unit_price', p.price,
      'total', p.price * (1 + (RANDOM() * 3)::int)
    )
  )
  FROM (
    SELECT id, name, price, category
    FROM products
    WHERE tenant_id = 2
    ORDER BY RANDOM()
    LIMIT (1 + (RANDOM() * 2)::int)
  ) p
)
WHERE o.tenant_id = 2 AND o.items = '[]'::jsonb;

-- Recalcular totales basado en items
UPDATE orders o
SET total = (
  SELECT COALESCE(SUM((item->>'total')::numeric), 0)
  FROM jsonb_array_elements(o.items) as item
)
WHERE o.tenant_id = 2;

-- =============================================================================
-- 4. AGREGAR DESCUENTOS (~40% de órdenes pagadas)
-- =============================================================================
UPDATE orders
SET discount_metadata = CASE
  WHEN (id % 10) = 0 THEN jsonb_build_object(
    'source', 'PROMO10', 'code', 'PROMO10', 'type', 'percentage', 'value', 10, 'amount', (total * 0.10)::int
  )
  WHEN (id % 10) = 3 THEN jsonb_build_object(
    'source', 'BIENVENIDO', 'code', 'BIENVENIDO', 'type', 'percentage', 'value', 15, 'amount', (total * 0.15)::int
  )
  WHEN (id % 10) = 6 THEN jsonb_build_object(
    'source', 'FIDELIDAD', 'code', 'FIDELIDAD', 'type', 'fixed', 'value', 5000, 'amount', 5000
  )
  WHEN (id % 10) = 9 THEN jsonb_build_object(
    'source', 'PRIMERA_COMPRA', 'code', 'WELCOME20', 'type', 'percentage', 'value', 20, 'amount', (total * 0.20)::int
  )
  ELSE NULL
END
WHERE tenant_id = 2 AND status IN ('paid', 'preparing', 'ready', 'delivered');

-- =============================================================================
-- 5. CREAR PAYMENTS PARA ÓRDENES PAGADAS
-- =============================================================================
INSERT INTO payments (order_id, payment_id, status, status_detail, payment_type, payment_method_id, amount, currency, payer_email, payer_name, created_at, updated_at)
SELECT
  o.id as order_id,
  'MP-' || LPAD(o.id::text, 10, '0') as payment_id,
  'approved' as status,
  'accredited' as status_detail,
  CASE (o.id % 3)
    WHEN 0 THEN 'credit_card'
    WHEN 1 THEN 'debit_card'
    ELSE 'account_money'
  END as payment_type,
  CASE (o.id % 5)
    WHEN 0 THEN 'visa'
    WHEN 1 THEN 'master'
    WHEN 2 THEN 'debcabal'
    WHEN 3 THEN 'amex'
    ELSE 'account_money'
  END as payment_method_id,
  o.total as amount,
  'CLP' as currency,
  c.email as payer_email,
  c.name as payer_name,
  o.created_at as created_at,
  o.updated_at as updated_at
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.tenant_id = 2 AND o.status IN ('paid', 'preparing', 'ready', 'delivered')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 6. ACTUALIZAR ESTADÍSTICAS DE CUSTOMERS
-- =============================================================================
UPDATE customers c
SET
  total_orders = sub.order_count,
  total_spent = sub.total_revenue,
  last_order_at = sub.last_order,
  loyalty_points = FLOOR(sub.total_revenue / 1000)
FROM (
  SELECT
    customer_id,
    COUNT(*) as order_count,
    SUM(total) as total_revenue,
    MAX(created_at) as last_order
  FROM orders
  WHERE tenant_id = 2 AND status IN ('paid', 'preparing', 'ready', 'delivered')
  GROUP BY customer_id
) sub
WHERE c.id = sub.customer_id AND c.tenant_id = 2;

-- =============================================================================
-- 7. VERIFICACIÓN FINAL
-- =============================================================================
DO $$
DECLARE
  v_products INT;
  v_customers INT;
  v_orders INT;
  v_payments INT;
  v_discounts INT;
BEGIN
  SELECT COUNT(*) INTO v_products FROM products WHERE tenant_id = 2;
  SELECT COUNT(*) INTO v_customers FROM customers WHERE tenant_id = 2;
  SELECT COUNT(*) INTO v_orders FROM orders WHERE tenant_id = 2;
  SELECT COUNT(*) INTO v_payments FROM payments p JOIN orders o ON p.order_id = o.id WHERE o.tenant_id = 2;
  SELECT COUNT(*) INTO v_discounts FROM orders WHERE tenant_id = 2 AND discount_metadata IS NOT NULL;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'SEED COMPLETADO PARA TENANT 2';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Productos: %', v_products;
  RAISE NOTICE 'Customers: %', v_customers;
  RAISE NOTICE 'Orders: %', v_orders;
  RAISE NOTICE 'Payments: %', v_payments;
  RAISE NOTICE 'Orders con descuento: %', v_discounts;
  RAISE NOTICE '========================================';
END $$;
