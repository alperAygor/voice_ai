-- Çok dilli destek, görüşme özeti/duygu-aciliyet analizi ve
-- randevu hatırlatma/SMS takibi için şema genişletmesi.

create type supported_language as enum ('tr', 'en', 'es', 'fr', 'de', 'it');
create type call_direction as enum ('inbound', 'outbound');
create type call_sentiment as enum ('positive', 'neutral', 'negative');
create type call_urgency as enum ('low', 'medium', 'high', 'emergency');

-- agent_config: konuşma dili + outbound (geri arama/hatırlatma) için Vapi
-- telefon numarası ID'si (Vapi'nin kendi ID'si — Twilio numarasının kendisi
-- businesses.phone_number'da tutuluyor)
alter table agent_config
  add column language supported_language not null default 'tr',
  add column vapi_phone_number_id text;

-- calls: yön, duygu/aciliyet analizi (özet zaten `summary` kolonunda tutulur)
alter table calls
  add column direction call_direction not null default 'inbound',
  add column sentiment call_sentiment,
  add column urgency call_urgency,
  add column analysis_json jsonb,
  add column transfer_reason text,
  add column callback_of_call_id uuid references calls (id) on delete set null;

-- appointments: hatırlatma arama/SMS takibi
alter table appointments
  add column reminder_sent_at timestamptz,
  add column reminder_call_id uuid references calls (id) on delete set null;

-- sms_messages: çok kanallı iletişim (görüşme sonrası takip, randevu onayı)
create table sms_messages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  call_id uuid references calls (id) on delete set null,
  appointment_id uuid references appointments (id) on delete set null,
  to_phone text not null,
  body text not null,
  status text not null default 'queued',
  twilio_sid text,
  sent_at timestamptz not null default now()
);

create index sms_messages_business_id_idx on sms_messages (business_id);

alter table sms_messages enable row level security;

create policy "Owners manage their own sms_messages"
  on sms_messages for all
  using (
    business_id in (select id from businesses where owner_user_id = auth.uid())
  )
  with check (
    business_id in (select id from businesses where owner_user_id = auth.uid())
  );
