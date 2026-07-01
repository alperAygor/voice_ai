create type schedule_exception_type as enum ('closed', 'custom_hours');

create table schedule_exceptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  date date not null,
  type schedule_exception_type not null default 'closed',
  start_time time,
  end_time time,
  reason text,
  created_at timestamptz not null default now(),
  unique (business_id, date, start_time, end_time)
);

create index schedule_exceptions_business_date_idx
  on schedule_exceptions (business_id, date);

alter table schedule_exceptions enable row level security;

create policy "Owners manage their own schedule_exceptions"
  on schedule_exceptions for all
  using (
    business_id in (select id from businesses where owner_user_id = auth.uid())
  )
  with check (
    business_id in (select id from businesses where owner_user_id = auth.uid())
  );
