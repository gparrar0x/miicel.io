-- Migration 023: Seed restaurant data for MangoBajito and SuperHotdog
-- Date: 2025-01-17
-- Author: Kokoro
-- Purpose: Create sample restaurant products with badges (SKY-42)

-- 1. Update MangoBajito to restaurant template
UPDATE tenants
SET
  template = 'restaurant',
  updated_at = now()
WHERE slug = 'mangobajito';

-- 2. Update SuperHotdog to restaurant template
UPDATE tenants
SET
  template = 'restaurant',
  updated_at = now()
WHERE slug = 'superhotdog';

-- 3. Seed MangoBajito products (hot dogs)
INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Hot Dog Clásico',
  'Salchicha premium, pan tostado, salsas caseras',
  4500,
  'Hot Dogs',
  'https://images.unsplash.com/photo-1612392062422-ef19b42f74df?w=800',
  true,
  1,
  '{"badges": ["popular"]}'::jsonb
FROM tenants t WHERE t.slug = 'mangobajito'
ON CONFLICT DO NOTHING;

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Hot Dog Premium',
  'Salchicha gourmet, cebolla caramelizada, queso cheddar',
  6500,
  'Hot Dogs',
  'https://images.unsplash.com/photo-1612392062422-ef19b42f74df?w=800',
  true,
  2,
  '{"badges": ["nuevo", "spicy-mild"]}'::jsonb
FROM tenants t WHERE t.slug = 'mangobajito'
ON CONFLICT DO NOTHING;

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Hot Dog Veggie',
  'Salchicha vegetal, vegetales asados, salsa verde',
  5500,
  'Hot Dogs',
  'https://images.unsplash.com/photo-1612392062422-ef19b42f74df?w=800',
  true,
  3,
  '{"badges": ["veggie"]}'::jsonb
FROM tenants t WHERE t.slug = 'mangobajito'
ON CONFLICT DO NOTHING;

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Combo Familiar',
  '4 hot dogs clásicos + papas + 4 bebidas',
  15000,
  'Combos',
  'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=800',
  true,
  4,
  '{"badges": ["promo"]}'::jsonb
FROM tenants t WHERE t.slug = 'mangobajito'
ON CONFLICT DO NOTHING;

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Papas Fritas',
  'Papas crujientes con sal marina',
  2500,
  'Acompañamientos',
  'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800',
  true,
  5,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'mangobajito'
ON CONFLICT DO NOTHING;

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Limonada Natural',
  'Limonada fresca del día',
  2000,
  'Bebidas',
  'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=800',
  true,
  6,
  '{"badges": []}'::jsonb
FROM tenants t WHERE t.slug = 'mangobajito'
ON CONFLICT DO NOTHING;

-- 4. Seed SuperHotdog products
INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Super Hot Dog Original',
  'El hot dog que te hará volver',
  5000,
  'Hot Dogs',
  'https://images.unsplash.com/photo-1612392062422-ef19b42f74df?w=800',
  true,
  1,
  '{"badges": ["popular"]}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog'
ON CONFLICT DO NOTHING;

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Hot Dog Picante',
  'Con jalapeños y salsa picante especial',
  5500,
  'Hot Dogs',
  'https://images.unsplash.com/photo-1612392062422-ef19b42f74df?w=800',
  true,
  2,
  '{"badges": ["spicy-hot"]}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog'
ON CONFLICT DO NOTHING;

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Hot Dog BBQ',
  'Salsa BBQ casera, cebolla crispy',
  5500,
  'Hot Dogs',
  'https://images.unsplash.com/photo-1612392062422-ef19b42f74df?w=800',
  true,
  3,
  '{"badges": ["nuevo"]}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog'
ON CONFLICT DO NOTHING;

INSERT INTO products (tenant_id, name, description, price, category, image_url, active, display_order, metadata)
SELECT
  t.id,
  'Combo Pareja',
  '2 hot dogs + papas + 2 bebidas',
  9500,
  'Combos',
  'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=800',
  true,
  4,
  '{"badges": ["promo"]}'::jsonb
FROM tenants t WHERE t.slug = 'superhotdog'
ON CONFLICT DO NOTHING;

-- Verify counts
SELECT
  t.slug,
  t.template,
  COUNT(p.id) as product_count,
  COUNT(CASE WHEN jsonb_array_length(p.metadata -> 'badges') > 0 THEN 1 END) as products_with_badges
FROM tenants t
LEFT JOIN products p ON p.tenant_id = t.id
WHERE t.slug IN ('mangobajito', 'superhotdog')
GROUP BY t.slug, t.template;
