ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dietary_tags TEXT[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(tenant_id, is_featured) WHERE is_featured = true;
COMMENT ON COLUMN products.is_featured IS 'Marca el producto como recomendado en la seccion Featured del template gastronomia';
COMMENT ON COLUMN products.dietary_tags IS 'Etiquetas dieteticas: vegetariano, sin_tacc, picante';
