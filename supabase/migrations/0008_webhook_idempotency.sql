create table webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  event_type text not null,
  status text not null default 'processing',
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, event_id)
);

create index webhook_events_provider_created_at_idx
  on webhook_events (provider, created_at desc);

alter table webhook_events enable row level security;
-- Service role only. Webhook idempotency records should not be user-readable.
