-- Migration: 045_create_authors
-- Creates authors table with tenant isolation and RLS.

create table if not exists public.authors (
  id          serial      primary key,
  tenant_id   bigint      not null references tenants(id) on delete cascade,
  name        text        not null,
  slug        text        not null,
  image_url   text,
  created_at  timestamptz not null default now(),

  constraint authors_tenant_slug_unique unique (tenant_id, slug)
);

create index if not exists idx_authors_tenant_id
  on public.authors (tenant_id);

-- RLS: tenant isolation
alter table public.authors enable row level security;

create policy "authors: tenant read"
  on public.authors for select
  using (
    tenant_id in (
      select id from tenants where owner_id = (select auth.uid())
    )
  );

create policy "authors: tenant write"
  on public.authors for insert
  with check (
    tenant_id in (
      select id from tenants where owner_id = (select auth.uid())
    )
  );

create policy "authors: tenant update"
  on public.authors for update
  using (
    tenant_id in (
      select id from tenants where owner_id = (select auth.uid())
    )
  );

create policy "authors: tenant delete"
  on public.authors for delete
  using (
    tenant_id in (
      select id from tenants where owner_id = (select auth.uid())
    )
  );
