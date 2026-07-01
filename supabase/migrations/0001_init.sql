-- Voice AI Receptionist - initial schema
-- Tables per proje brief bölüm 3, with multi-tenant RLS (bölüm 8).

create extension if not exists "pgcrypto";

create type industry_type as enum ('plumbing', 'electrical', 'hvac', 'other');
create type call_outcome as enum (
  'appointment_booked',
  'info_provided',
  'transferred_to_human',
  'missed',
  'emergency_flagged',
  'voicemail'
);
create type appointment_status as enum ('confirmed', 'cancelled', 'completed');
create type subscription_status_type as enum (
  'trialing', 'active', 'past_due', 'canceled', 'incomplete'
);

-- businesses ----------------------------------------------------------

create table businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry industry_type not null default 'other',
  phone_number text,
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  business_hours jsonb not null default '{}'::jsonb,
  service_area text,
  google_calendar_connected boolean not null default false,
  stripe_customer_id text,
  subscription_status subscription_status_type not null default 'trialing',
  created_at timestamptz not null default now()
);

create index businesses_owner_user_id_idx on businesses (owner_user_id);

-- business_services -----------------------------------------------------

create table business_services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  service_name text not null,
  description text,
  is_emergency_eligible boolean not null default false,
  created_at timestamptz not null default now()
);

create index business_services_business_id_idx on business_services (business_id);

-- agent_config ------------------------------------------------------------

create table agent_config (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references businesses (id) on delete cascade,
  system_prompt text,
  voice_id text,
  greeting_message text,
  escalation_rules jsonb not null default '{}'::jsonb,
  vapi_assistant_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- calls ---------------------------------------------------------------

create table calls (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  vapi_call_id text,
  caller_number text,
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer,
  transcript text,
  summary text,
  outcome call_outcome,
  cost_usd numeric(10, 4),
  recording_url text,
  created_at timestamptz not null default now()
);

create index calls_business_id_idx on calls (business_id);
create index calls_vapi_call_id_idx on calls (vapi_call_id);

-- appointments ----------------------------------------------------------

create table appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  call_id uuid references calls (id) on delete set null,
  customer_name text not null,
  customer_phone text,
  service_type text,
  scheduled_at timestamptz not null,
  address text,
  notes text,
  google_calendar_event_id text,
  status appointment_status not null default 'confirmed',
  created_at timestamptz not null default now()
);

create index appointments_business_id_idx on appointments (business_id);
create index appointments_scheduled_at_idx on appointments (scheduled_at);

-- usage_billing -----------------------------------------------------------

create table usage_billing (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  month date not null,
  total_minutes numeric(10, 2) not null default 0,
  total_cost_usd numeric(10, 2) not null default 0,
  plan_included_minutes numeric(10, 2) not null default 0,
  overage_minutes numeric(10, 2) not null default 0,
  overage_cost_usd numeric(10, 2) not null default 0,
  unique (business_id, month)
);

create index usage_billing_business_id_idx on usage_billing (business_id);

-- Row Level Security ------------------------------------------------------
-- Multi-tenant: an owner can only see/modify rows belonging to their own
-- business(es). Server-side webhook/agent-tool routes use the service role
-- key (src/lib/supabase/admin.ts) and bypass RLS entirely.

alter table businesses enable row level security;
alter table business_services enable row level security;
alter table agent_config enable row level security;
alter table calls enable row level security;
alter table appointments enable row level security;
alter table usage_billing enable row level security;

create policy "Owners manage their own businesses"
  on businesses for all
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

create policy "Owners manage their own business_services"
  on business_services for all
  using (
    business_id in (select id from businesses where owner_user_id = auth.uid())
  )
  with check (
    business_id in (select id from businesses where owner_user_id = auth.uid())
  );

create policy "Owners manage their own agent_config"
  on agent_config for all
  using (
    business_id in (select id from businesses where owner_user_id = auth.uid())
  )
  with check (
    business_id in (select id from businesses where owner_user_id = auth.uid())
  );

create policy "Owners manage their own calls"
  on calls for all
  using (
    business_id in (select id from businesses where owner_user_id = auth.uid())
  )
  with check (
    business_id in (select id from businesses where owner_user_id = auth.uid())
  );

create policy "Owners manage their own appointments"
  on appointments for all
  using (
    business_id in (select id from businesses where owner_user_id = auth.uid())
  )
  with check (
    business_id in (select id from businesses where owner_user_id = auth.uid())
  );

create policy "Owners manage their own usage_billing"
  on usage_billing for all
  using (
    business_id in (select id from businesses where owner_user_id = auth.uid())
  )
  with check (
    business_id in (select id from businesses where owner_user_id = auth.uid())
  );
