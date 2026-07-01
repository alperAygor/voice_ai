-- Align billing usage writes with dashboard reads and keep purchased
-- Twilio metadata so numbers can be audited or released later.

alter table usage_billing
  add column if not exists updated_at timestamptz not null default now();

alter table businesses
  add column if not exists twilio_phone_number_sid text,
  add column if not exists stripe_subscription_id text;

create index if not exists businesses_stripe_customer_id_idx
  on businesses (stripe_customer_id);

create index if not exists businesses_twilio_phone_number_sid_idx
  on businesses (twilio_phone_number_sid);
