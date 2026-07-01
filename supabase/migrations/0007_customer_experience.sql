create type appointment_action_token_type as enum ('confirm', 'cancel');
create type message_channel as enum ('sms', 'whatsapp');

alter table appointments
  add column if not exists customer_confirmed_at timestamptz,
  add column if not exists customer_cancelled_at timestamptz;

alter table sms_messages
  add column if not exists channel message_channel not null default 'sms';

create table appointment_action_tokens (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments (id) on delete cascade,
  business_id uuid not null references businesses (id) on delete cascade,
  token text not null unique,
  action appointment_action_token_type not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index appointment_action_tokens_token_idx
  on appointment_action_tokens (token);

create index appointment_action_tokens_appointment_idx
  on appointment_action_tokens (appointment_id);

alter table appointment_action_tokens enable row level security;

create policy "Owners read their own appointment_action_tokens"
  on appointment_action_tokens for select
  using (
    business_id in (select id from businesses where owner_user_id = auth.uid())
  );
