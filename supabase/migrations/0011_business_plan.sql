-- Abonelik planı (starter | pro). Checkout ve webhook bu kolonu günceller;
-- kullanım/limit hesabı ve özellik gating buna göre yapılır.
alter table businesses
  add column plan_id text not null default 'starter'
  check (plan_id in ('starter', 'pro'));
