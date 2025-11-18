-- Migration: Seed Sample Products
-- Purpose: Add test products for Phase 2 product page testing
-- Date: 2025-01-16

-- Get sky tenant ID
DO $$
DECLARE
  sky_tenant_id BIGINT;
BEGIN
  -- Find sky tenant (assuming it exists from previous migration)
  SELECT id INTO sky_tenant_id
  FROM tenants
  WHERE name = 'sky'
  LIMIT 1;

  -- If sky tenant exists, insert sample products
  IF sky_tenant_id IS NOT NULL THEN
    -- Insert sample products (only if not already present)
    INSERT INTO products (tenant_id, name, description, price, stock, category, image_url, active)
    VALUES
      (
        sky_tenant_id,
        'Premium Wireless Headphones',
        'High-quality wireless headphones with noise cancellation, 30-hour battery life, and premium sound quality. Perfect for music lovers and professionals.',
        12500.00,
        15,
        'Electronics',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        true
      ),
      (
        sky_tenant_id,
        'Smart Watch Series 5',
        'Advanced fitness tracking, heart rate monitoring, GPS, and water resistance up to 50m. Compatible with iOS and Android.',
        8900.00,
        8,
        'Electronics',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
        true
      ),
      (
        sky_tenant_id,
        'Leather Backpack',
        'Handcrafted genuine leather backpack with laptop compartment (fits up to 15"), multiple pockets, and adjustable straps.',
        6200.00,
        20,
        'Accessories',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
        true
      ),
      (
        sky_tenant_id,
        'Organic Coffee Beans 1kg',
        'Premium single-origin Colombian coffee beans, medium roast. Fair trade certified and sustainably sourced.',
        1850.00,
        50,
        'Food & Beverage',
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800',
        true
      ),
      (
        sky_tenant_id,
        'Minimalist Desk Lamp',
        'Modern LED desk lamp with adjustable brightness, USB charging port, and touch controls. Energy efficient and eye-friendly.',
        4500.00,
        0, -- Out of stock for testing
        'Home & Office',
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
        true
      )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Sample products seeded for sky tenant (ID: %)', sky_tenant_id;
  ELSE
    RAISE WARNING 'Sky tenant not found, skipping product seed';
  END IF;
END $$;
