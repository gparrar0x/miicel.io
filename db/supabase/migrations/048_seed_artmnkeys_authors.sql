-- Migration: 048_seed_artmnkeys_authors
-- Seeds authors for artmnkeys tenant (id=3) and assigns them to existing products.

-- Insert authors for artmnkeys
INSERT INTO public.authors (tenant_id, name, slug)
VALUES
  (3, 'Art Monkeys Studio', 'art-monkeys-studio'),
  (3, 'Collective Works', 'collective-works')
ON CONFLICT (tenant_id, slug) DO NOTHING;

-- Assign all artmnkeys products to the main studio author
UPDATE public.products
SET author_id = (
  SELECT id FROM public.authors
  WHERE tenant_id = 3 AND slug = 'art-monkeys-studio'
  LIMIT 1
)
WHERE tenant_id = 3 AND author_id IS NULL;
