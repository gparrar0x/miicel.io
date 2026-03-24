-- Migration: 041_create_agent_tables
-- Creates agent conversation persistence + usage tracking tables.

create table if not exists public.agent_conversations (
  id            uuid        primary key default gen_random_uuid(),
  tenant_id     bigint      not null references tenants(id) on delete cascade,
  thread_id     text        not null,
  from_channel  text        not null default 'api',  -- api | whatsapp | dashboard
  messages      jsonb       not null default '[]'::jsonb,
  agent_name    text,                                -- last agent that responded
  status        text        not null default 'active'
                            check (status in ('active', 'completed', 'abandoned')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_agent_conversations_tenant
  on public.agent_conversations (tenant_id);

create index if not exists idx_agent_conversations_thread
  on public.agent_conversations (thread_id);

create unique index if not exists idx_agent_conversations_tenant_thread
  on public.agent_conversations (tenant_id, thread_id);

create table if not exists public.agent_usage_logs (
  id              uuid        primary key default gen_random_uuid(),
  tenant_id       bigint      not null references tenants(id) on delete cascade,
  conversation_id uuid        references agent_conversations(id) on delete set null,
  agent_name      text        not null,
  model           text        not null,
  tokens_in       integer     not null default 0,
  tokens_out      integer     not null default 0,
  cost_usd        numeric(10, 6) not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists idx_agent_usage_tenant
  on public.agent_usage_logs (tenant_id);

create index if not exists idx_agent_usage_created
  on public.agent_usage_logs (created_at);

-- RLS: enabled; API routes use service role (bypasses RLS).
-- Add tenant-scoped policies when dashboard access is needed.
alter table public.agent_conversations enable row level security;
alter table public.agent_usage_logs enable row level security;
