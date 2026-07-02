-- Rol bazlı tablo izinleri.
--
-- RLS hangi SATIRLARA erişileceğini kısıtlar; bu GRANT'ler ise rolün tabloya
-- temel erişimini sağlar. İkisi birlikte çalışır: izin olmadan RLS'in filtreleyeceği
-- bir şey yoktur ve Postgres "permission denied for table" döndürür.
--
-- Supabase normalde public şemasındaki yeni tabloları anon/authenticated/
-- service_role rollerine otomatik grant eder; migration'la oluşturulan tablolarda
-- bu devreye girmediyse bu dosya eksiği tamamlar. İdempotent — tekrar çalıştırılabilir.

grant usage on schema public to anon, authenticated, service_role;

-- Panel kullanıcısı (giriş yapmış) — RLS zaten yalnızca kendi verisini görmesini sağlar.
grant select, insert, update, delete on all tables in schema public to authenticated;

-- Server-side admin (webhook/agent-tools) — RLS'i baypas eder.
grant all on all tables in schema public to service_role;

-- UUID PK kullanıyoruz ama olası sequence'ler için de izin ver (zararsız).
grant usage, select on all sequences in schema public to authenticated, service_role;

-- Bundan sonra oluşturulacak tablolar da aynı izinleri otomatik alsın.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to authenticated, service_role;
