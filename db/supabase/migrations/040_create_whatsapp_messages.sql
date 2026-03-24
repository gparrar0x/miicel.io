-- Migration: 040_create_whatsapp_messages
-- Creates storage for incoming WhatsApp webhook messages.

create table if not exists public.whatsapp_messages (
  id            uuid        primary key default gen_random_uuid(),
  wamid         text        not null unique,          -- WhatsApp message ID (dedup key)
  from_number   text        not null,                 -- sender E.164 phone number
  from_name     text,                                 -- sender profile name (nullable)
  message_type  text        not null,                 -- text | image | video | audio | document | sticker
  body          text,                                 -- text content (nullable for media msgs)
  media_url     text,                                 -- media_id or URL (nullable for text msgs)
  timestamp     timestamptz not null,                 -- original message timestamp
  raw_payload   jsonb       not null,                 -- full webhook payload for debugging
  created_at    timestamptz not null default now()
);

-- Index for querying by sender
create index if not exists whatsapp_messages_from_number_idx
  on public.whatsapp_messages (from_number);

-- Index for time-range queries
create index if not exists whatsapp_messages_timestamp_idx
  on public.whatsapp_messages (timestamp desc);

-- RLS: service role only (Edge Function uses service role key)
alter table public.whatsapp_messages enable row level security;

-- No public access — only service_role (bypasses RLS by default)
-- Add explicit policies when you need authenticated user access.
