create type audit_event_severity as enum ('info', 'warning', 'error');

create table audit_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses (id) on delete set null,
  actor_user_id uuid references auth.users (id) on delete set null,
  event_type text not null,
  severity audit_event_severity not null default 'info',
  source text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_events_business_id_created_at_idx
  on audit_events (business_id, created_at desc);

alter table audit_events enable row level security;

create policy "Owners read their own audit_events"
  on audit_events for select
  using (
    business_id in (select id from businesses where owner_user_id = auth.uid())
  );

create table google_oauth_states (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  state_token text not null unique,
  redirect_path text not null default '/dashboard/agent-settings',
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index google_oauth_states_token_idx on google_oauth_states (state_token);
create index google_oauth_states_expires_at_idx on google_oauth_states (expires_at);

alter table google_oauth_states enable row level security;
-- OAuth state rows are intentionally service-role only. They contain security
-- tokens and are created/consumed by trusted route handlers.
