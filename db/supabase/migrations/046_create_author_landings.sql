-- Migration: 046_create_author_landings
-- Creates author_landings table for generated landing page content.

create table if not exists public.author_landings (
  id            serial      primary key,
  author_id     int         not null references authors(id) on delete cascade,
  content       jsonb       not null,
  status        text        not null default 'draft'
                            check (status in ('draft', 'published')),
  generated_at  timestamptz not null default now(),
  published_at  timestamptz
);

create index if not exists idx_author_landings_author_id
  on public.author_landings (author_id);

create index if not exists idx_author_landings_status
  on public.author_landings (status);

-- RLS: access through authors (join to tenants via authors.tenant_id)
alter table public.author_landings enable row level security;

create policy "author_landings: tenant read"
  on public.author_landings for select
  using (
    author_id in (
      select a.id from authors a
      join tenants t on t.id = a.tenant_id
      where t.owner_id = (select auth.uid())
    )
  );

create policy "author_landings: tenant write"
  on public.author_landings for insert
  with check (
    author_id in (
      select a.id from authors a
      join tenants t on t.id = a.tenant_id
      where t.owner_id = (select auth.uid())
    )
  );

create policy "author_landings: tenant update"
  on public.author_landings for update
  using (
    author_id in (
      select a.id from authors a
      join tenants t on t.id = a.tenant_id
      where t.owner_id = (select auth.uid())
    )
  );

create policy "author_landings: tenant delete"
  on public.author_landings for delete
  using (
    author_id in (
      select a.id from authors a
      join tenants t on t.id = a.tenant_id
      where t.owner_id = (select auth.uid())
    )
  );
