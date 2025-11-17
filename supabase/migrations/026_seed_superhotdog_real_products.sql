-- Migration 026: Seed SuperHotDog with real products from Google Sheets
-- Date: 2025-01-17
-- Author: Mentat
-- Purpose: Replace placeholder products with real SuperHotDog catalog
-- Data source: Google Sheets 10RySGKhWfMR0iJx7Iu4bSdZUaGF5q9hodUsQp29gfaU

-- 1. Delete existing placeholder products for SuperHotDog
DELETE FROM products
WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'superhotdog');

-- 2. Insert PANCHOS (Hot Dogs) - Active products only
INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Maldtio Perro Super',
  'Pancho de 26cm de largo, con salchicha Alemana con piel',
  8500,
  'PANCHOS',
  'https://lmqysqapqbttmyheuejo.supabase.co/storage/v1/object/public/assets/superhotdog/banner.png',
  true,
  1,
  '{"badges": ["popular"]}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Pancho Vegano Super',
  'Pancho de 26cm de largo, con salchicha vegana',
  8700,
  'PANCHOS',
  'https://lmqysqapqbttmyheuejo.supabase.co/storage/v1/object/public/assets/superhotdog/banner.png',
  true,
  2,
  '{"badges": ["veggie", "vegan"]}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Pancho Super Clásico',
  'Pancho de 26cm de largo, con salchicha paty viena',
  7000,
  'PANCHOS',
  'https://lmqysqapqbttmyheuejo.supabase.co/storage/v1/object/public/assets/superhotdog/banner.png',
  true,
  3,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

-- 3. Insert COMBOS
INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Sandwich de Milanesa c/Papas fritas',
  'Milanesa de Carne, lechuga, tomate, jamón, queso, huevo frito + porción de papas fritas',
  16000,
  'COMBOS',
  'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=800',
  true,
  10,
  '{"badges": ["promo"]}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Hamburguesa Doble completa c/papas fritas',
  '2 Medallónes de Carne (1/4 de libra), lechuga, tomate, jamón, queso, huevo frito + porción de papas fritas',
  12500,
  'COMBOS',
  'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=800',
  true,
  11,
  '{"badges": ["promo"]}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

-- 4. Insert BEBIDAS (Beverages)
INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Agua Mineral sin gas',
  'Agua mineral 500ml',
  3000,
  'BEBIDAS',
  'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=800',
  true,
  20,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Agua Saborizada Aquarius Naranja',
  'Saborizada Naranja sin gas 500ml',
  3000,
  'BEBIDAS',
  'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=800',
  true,
  21,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Agua Saborizada Aquarius Limonada',
  'Saborizada Limonada sin gas  500ml',
  3000,
  'BEBIDAS',
  'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=800',
  true,
  22,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Agua Saborizada Aquarius Pomelo',
  'Saborizada Pomelo Amarillo sin gas 500ml',
  3000,
  'BEBIDAS',
  'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=800',
  true,
  23,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Agua Saborizada Aquarius Manzana',
  'Saborizada Manzana sin gas 500ml',
  3000,
  'BEBIDAS',
  'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=800',
  true,
  24,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Sprite 500ml',
  'Lima-Limón con gas',
  3500,
  'BEBIDAS',
  'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=800',
  true,
  25,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Coca Cola 500ml',
  'Sabor Cola con gas',
  3500,
  'BEBIDAS',
  'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=800',
  true,
  26,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  '7 up 500ml',
  'Lima-Limón con gas ',
  3500,
  'BEBIDAS',
  'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=800',
  true,
  27,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Pepsi Lata 354ml',
  'Sabor Cola con gas',
  2500,
  'BEBIDAS',
  'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=800',
  true,
  28,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Mirinda Lata 354ml',
  'Sabor Naranja con gas',
  2500,
  'BEBIDAS',
  'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=800',
  true,
  29,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  '7 Up Lata 354ml',
  'Sabor Lima-Limón con gas',
  2500,
  'BEBIDAS',
  'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=800',
  true,
  30,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Coca Cola Lata 354ml',
  'Sabor Cola con gas',
  2500,
  'BEBIDAS',
  'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=800',
  true,
  31,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Pepsi 500ml',
  'Sabor Cola con gas',
  3500,
  'BEBIDAS',
  'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=800',
  true,
  32,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

-- 5. Insert CERVEZA (Beer)
INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Goose Island Lager Latón 710ml',
  'Cerveza Rubia',
  7000,
  'CERVEZA',
  'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800',
  true,
  40,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Stella Artois Latón 710 ml',
  'Cerveza Rubia',
  5000,
  'CERVEZA',
  'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800',
  true,
  41,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Corona Porrón 710ml',
  'Cerveza Rubia',
  5000,
  'CERVEZA',
  'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800',
  true,
  42,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Amstel Latón 710 ml',
  'Cerveza Rubia',
  6000,
  'CERVEZA',
  'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800',
  true,
  43,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Budweiser Latón 710 ml',
  'Cerveza Rubia',
  4000,
  'CERVEZA',
  'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800',
  true,
  44,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Quilmes Clásica Latón 710ml',
  'Cerveza Rubia',
  4000,
  'CERVEZA',
  'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800',
  true,
  45,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Brahma Latón 710ml',
  'Cerveza Rubia',
  4000,
  'CERVEZA',
  'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800',
  true,
  46,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog';

-- Verify product count
SELECT
  t.slug,
  COUNT(p.id) as product_count,
  COUNT(DISTINCT p.category) as category_count,
  array_agg(DISTINCT p.category ORDER BY p.category) as categories
FROM tenants t
LEFT JOIN products p ON p.tenant_id = t.id
WHERE t.slug = 'superhotdog'
GROUP BY t.slug;
