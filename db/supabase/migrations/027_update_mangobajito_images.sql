-- Migration 027: Update MangoBajito product images with generated assets
-- Date: 2025-11-21
-- Author: Forge
-- Purpose: Replace placeholder images with custom generated ones for tenant 40 (MangoBajito)

-- Update Arepa de Queso (57)
UPDATE products SET image_url = '/tenants/mangobajito/product_57.png' WHERE id = 57;

-- Update Arepa Reina Pepiada (58)
UPDATE products SET image_url = '/tenants/mangobajito/product_58.png' WHERE id = 58;

-- Update Arepa Domino (59)
UPDATE products SET image_url = '/tenants/mangobajito/product_59.png' WHERE id = 59;

-- Update Arepa Pelua (60)
UPDATE products SET image_url = '/tenants/mangobajito/product_60.png' WHERE id = 60;

-- Update Arepa Catira (61)
UPDATE products SET image_url = '/tenants/mangobajito/product_61.png' WHERE id = 61;

-- Update Arepa de Pabellon (62)
UPDATE products SET image_url = '/tenants/mangobajito/product_62.png' WHERE id = 62;

-- Update Cachapa con Queso (63)
UPDATE products SET image_url = '/tenants/mangobajito/product_63.png' WHERE id = 63;

-- Update Cachapa con Pernil (64)
UPDATE products SET image_url = '/tenants/mangobajito/product_64.png' WHERE id = 64;

-- Update Cachapa Mixta (65)
UPDATE products SET image_url = '/tenants/mangobajito/product_65.png' WHERE id = 65;

-- Update Tequenos (66)
UPDATE products SET image_url = '/tenants/mangobajito/product_66.png' WHERE id = 66;

-- Update Pastelitos (67)
UPDATE products SET image_url = '/tenants/mangobajito/product_67.png' WHERE id = 67;

-- Update Pepito Sandwich (68)
UPDATE products SET image_url = '/tenants/mangobajito/product_68.png' WHERE id = 68;

-- Update Sandwich Bondiola (69)
UPDATE products SET image_url = '/tenants/mangobajito/product_69.png' WHERE id = 69;

