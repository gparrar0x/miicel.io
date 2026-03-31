-- Migration: 047_add_author_id_to_products
-- Adds optional author_id FK to products. ON DELETE SET NULL preserves products if author deleted.

alter table public.products
  add column if not exists author_id int references authors(id) on delete set null;

create index if not exists idx_products_author_id
  on public.products (author_id)
  where author_id is not null;
