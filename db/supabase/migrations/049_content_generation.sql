-- Migration: 049_content_generation
-- Content pipeline tables: generations, assets, usage tracking.

create table if not exists public.content_generations (
  id          uuid        primary key default gen_random_uuid(),
  tenant_id   bigint      not null references tenants(id) on delete cascade,
  product_id  bigint      not null references products(id) on delete cascade,
  status      text        not null default 'pending'
                          check (status in ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  provider    text        not null,                   -- gemini-flash-image | gemini-imagen
  prompt      text        not null,
  options     jsonb       not null default '{}'::jsonb,
  error       text,
  started_at  timestamptz,
  completed_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_content_generations_tenant
  on public.content_generations (tenant_id);

create index if not exists idx_content_generations_product
  on public.content_generations (product_id);

create index if not exists idx_content_generations_status
  on public.content_generations (tenant_id, status) where status in ('pending', 'processing');

create trigger content_generations_updated_at
  before update on public.content_generations for each row
  execute function update_updated_at_column();

-- ---

create table if not exists public.generated_assets (
  id              uuid        primary key default gen_random_uuid(),
  generation_id   uuid        not null references content_generations(id) on delete cascade,
  asset_type      text        not null check (asset_type in ('image', 'video', 'reel')),
  storage_path    text        not null,
  public_url      text,
  mime_type       text        not null default 'image/png',
  size_bytes      bigint,
  duration_ms     integer,                            -- video/reel only
  metadata        jsonb       not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists idx_generated_assets_generation
  on public.generated_assets (generation_id);

create index if not exists idx_generated_assets_type
  on public.generated_assets (generation_id, asset_type);

-- ---

create table if not exists public.generation_usage (
  id            uuid        primary key default gen_random_uuid(),
  tenant_id     bigint      not null references tenants(id) on delete cascade,
  period_start  date        not null,                 -- first day of billing month
  images_used   integer     not null default 0,
  videos_used   integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (tenant_id, period_start)
);

create index if not exists idx_generation_usage_tenant_period
  on public.generation_usage (tenant_id, period_start);

create trigger generation_usage_updated_at
  before update on public.generation_usage for each row
  execute function update_updated_at_column();

-- RLS

alter table public.content_generations enable row level security;
alter table public.generated_assets enable row level security;
alter table public.generation_usage enable row level security;

create policy "service role manages content_generations" on public.content_generations
  for all
  using ((select auth.jwt()) ->> 'role' = 'service_role')
  with check ((select auth.jwt()) ->> 'role' = 'service_role');

create policy "owners view content_generations" on public.content_generations
  for select
  using (tenant_id in (
    select id from tenants where owner_id = (select auth.uid())
  ));

create policy "service role manages generated_assets" on public.generated_assets
  for all
  using ((select auth.jwt()) ->> 'role' = 'service_role')
  with check ((select auth.jwt()) ->> 'role' = 'service_role');

create policy "owners view generated_assets" on public.generated_assets
  for select
  using (generation_id in (
    select cg.id from content_generations cg
    join tenants t on t.id = cg.tenant_id
    where t.owner_id = (select auth.uid())
  ));

create policy "service role manages generation_usage" on public.generation_usage
  for all
  using ((select auth.jwt()) ->> 'role' = 'service_role')
  with check ((select auth.jwt()) ->> 'role' = 'service_role');

create policy "owners view generation_usage" on public.generation_usage
  for select
  using (tenant_id in (
    select id from tenants where owner_id = (select auth.uid())
  ));

-- Verify:
-- select count(*) from public.content_generations;
-- select count(*) from public.generated_assets;
-- select count(*) from public.generation_usage;
