-- Migration: 050_social_media
-- Instagram publishing, scheduling, insights, and webhook events.

-- ---

create table if not exists public.ig_posts (
  id                uuid        primary key default gen_random_uuid(),
  tenant_id         bigint      not null references tenants(id) on delete cascade,
  generation_id     uuid        references content_generations(id) on delete set null,
  status            text        not null default 'draft'
                                check (status in ('draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled')),
  media_type        text        not null check (media_type in ('IMAGE', 'VIDEO', 'CAROUSEL', 'REELS')),
  caption           text,
  media_urls        jsonb       not null default '[]'::jsonb,  -- [{type: "IMAGE"|"VIDEO", url: "..."}]
  ig_media_id       text,                                      -- returned after publish
  ig_permalink      text,
  scheduled_at      timestamptz,
  published_at      timestamptz,
  error             text,
  publish_attempts  integer     not null default 0,
  metadata          jsonb       not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_ig_posts_tenant
  on public.ig_posts (tenant_id);

create index if not exists idx_ig_posts_status
  on public.ig_posts (tenant_id, status);

create index if not exists idx_ig_posts_scheduled
  on public.ig_posts (scheduled_at) where status = 'scheduled';

create index if not exists idx_ig_posts_generation
  on public.ig_posts (generation_id) where generation_id is not null;

create trigger ig_posts_updated_at
  before update on public.ig_posts for each row
  execute function update_updated_at_column();

-- ---

create table if not exists public.ig_post_insights (
  id                uuid        primary key default gen_random_uuid(),
  ig_post_id        uuid        not null references ig_posts(id) on delete cascade,
  tenant_id         bigint      not null references tenants(id) on delete cascade,
  reach             integer     not null default 0,
  likes             integer     not null default 0,
  comments          integer     not null default 0,
  shares            integer     not null default 0,
  saves             integer     not null default 0,
  impressions       integer     not null default 0,
  video_views       integer     not null default 0,  -- REELS/VIDEO only
  fetched_at        timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

create index if not exists idx_ig_post_insights_post
  on public.ig_post_insights (ig_post_id);

create index if not exists idx_ig_post_insights_tenant
  on public.ig_post_insights (tenant_id, fetched_at desc);

-- ---

create table if not exists public.ig_webhook_events (
  id                uuid        primary key default gen_random_uuid(),
  tenant_id         bigint      references tenants(id) on delete set null,
  event_type        text        not null,              -- 'comment', 'mention', 'reaction', etc.
  object_type       text        not null,              -- 'instagram' | 'page'
  field             text        not null,              -- 'comments', 'mentions', 'story_insights'
  ig_media_id       text,
  payload           jsonb       not null default '{}'::jsonb,
  processed         boolean     not null default false,
  received_at       timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

create index if not exists idx_ig_webhook_events_tenant
  on public.ig_webhook_events (tenant_id, received_at desc);

create index if not exists idx_ig_webhook_events_unprocessed
  on public.ig_webhook_events (processed, received_at) where processed = false;

-- RLS

alter table public.ig_posts enable row level security;
alter table public.ig_post_insights enable row level security;
alter table public.ig_webhook_events enable row level security;

create policy "service role manages ig_posts" on public.ig_posts
  for all
  using ((select auth.jwt()) ->> 'role' = 'service_role')
  with check ((select auth.jwt()) ->> 'role' = 'service_role');

create policy "owners view ig_posts" on public.ig_posts
  for select
  using (tenant_id in (
    select id from tenants where owner_id = (select auth.uid())
  ));

create policy "owners insert ig_posts" on public.ig_posts
  for insert
  with check (tenant_id in (
    select id from tenants where owner_id = (select auth.uid())
  ));

create policy "owners update ig_posts" on public.ig_posts
  for update
  using (tenant_id in (
    select id from tenants where owner_id = (select auth.uid())
  ))
  with check (tenant_id in (
    select id from tenants where owner_id = (select auth.uid())
  ));

create policy "service role manages ig_post_insights" on public.ig_post_insights
  for all
  using ((select auth.jwt()) ->> 'role' = 'service_role')
  with check ((select auth.jwt()) ->> 'role' = 'service_role');

create policy "owners view ig_post_insights" on public.ig_post_insights
  for select
  using (tenant_id in (
    select id from tenants where owner_id = (select auth.uid())
  ));

create policy "service role manages ig_webhook_events" on public.ig_webhook_events
  for all
  using ((select auth.jwt()) ->> 'role' = 'service_role')
  with check ((select auth.jwt()) ->> 'role' = 'service_role');

create policy "owners view ig_webhook_events" on public.ig_webhook_events
  for select
  using (tenant_id in (
    select id from tenants where owner_id = (select auth.uid())
  ));

-- Verify:
-- select count(*) from public.ig_posts;
-- select count(*) from public.ig_post_insights;
-- select count(*) from public.ig_webhook_events;
