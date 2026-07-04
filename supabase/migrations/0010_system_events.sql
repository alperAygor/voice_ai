-- Kalıcı olay günlüğü (operatör görünürlüğü). Vercel Runtime Logs kısa ömürlü
-- ve panelden görünmez; kritik hatalar/uyarılar buraya da yazılır ki admin
-- monitoring sayfası son olayları gösterebilsin ve alarm eşiği hesaplanabilsin.
create table system_events (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('info', 'warn', 'error')),
  event text not null,
  business_id uuid references businesses(id) on delete set null,
  request_id text,
  message text,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index system_events_created_at_idx on system_events (created_at desc);
create index system_events_level_created_at_idx on system_events (level, created_at desc);
-- Alarm eşiği sorgusu (event + level + zaman penceresi) için.
create index system_events_event_level_created_at_idx
  on system_events (event, level, created_at desc);

alter table system_events enable row level security;
-- Yalnızca service_role. Operatör paneli admin (service_role) client ile okur;
-- işletme sahiplerine açık değildir.
grant select, insert on system_events to service_role;
