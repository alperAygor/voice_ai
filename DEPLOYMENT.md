# Deploy Rehberi — Sesli AI Resepsiyonist

Bu rehber projeyi sıfırdan production'a çıkarmak için uçtan uca adımları anlatır.
Hedef mimari (brief'e uygun): **Vercel** (Next.js frontend + API routes) + **Supabase**
(PostgreSQL + Auth). Sesli AI, telefon, takvim ve ödeme için dış servisler bağlanır.

> Acele edenler için özet checklist en altta ([Hızlı Checklist](#hızlı-checklist)).
> İlk kez deploy ediyorsan sırayla oku.

---

## 0. Mimari ve akış

```
Arayan ──► Twilio numarası ──► Vapi (STT + LLM + TTS)
                                  │
                                  ├─ function call ──► /api/agent-tools/*  (Next.js API)
                                  └─ çağrı bitince ──► /api/webhooks/vapi ──► Claude (özet+analiz)
                                                                                │
İşletme sahibi ──► Vercel'deki panel ──► Supabase (DB + Auth + RLS)  ◄──────────┘
                                             ▲
                        Stripe / Google Calendar / Twilio API
```

- **Frontend + API**: tek bir Next.js uygulaması, Vercel'de barınır.
- **DB + Auth**: Supabase. Her işletme yalnızca kendi verisini görür (RLS).
- **Dış servisler**: Vapi (ses), Twilio (hat + SMS), Google Calendar (randevu),
  Stripe (abonelik), Anthropic (görüşme analizi), Resend (opsiyonel email).

---

## 1. Ön koşullar

- **Node.js 20+** (Next.js 16 gereği). Lokal doğrulama için gerekli.
- Bir **GitHub** (veya GitLab/Bitbucket) hesabı — Vercel repodan deploy eder.
- Şu servislerde hesap: [Vercel](https://vercel.com), [Supabase](https://supabase.com),
  [Vapi](https://vapi.ai), [Twilio](https://twilio.com),
  [Google Cloud](https://console.cloud.google.com), [Stripe](https://stripe.com),
  [Anthropic](https://console.anthropic.com). (Resend opsiyonel.)

Deploy öncesi lokal doğrulama (hepsi yeşil olmalı):

```bash
npm install
npm test        # 28 birim test
npm run lint
npm run build
```

---

## 2. Kodu Git deposuna al

Uygulama `voice_ai/app` klasörünün kendisi bir git deposudur. En basiti bu klasörü
kendi başına push etmek:

```bash
cd voice_ai/app
git add -A
git commit -m "Voice AI receptionist MVP"
# GitHub'da boş bir repo aç, sonra:
git remote add origin https://github.com/<kullanici>/<repo>.git
git branch -M main
git push -u origin main
```

> `.env.local` ve tüm `.env*` dosyaları `.gitignore`'da — **sırlar repoya girmez**.
> Gerçek değerleri Vercel'in Environment Variables ekranına gireceksin (Adım 5).

**Root Directory notu:** Yukarıdaki gibi `voice_ai/app`'i doğrudan repo yaptıysan
Vercel'de Root Directory = `.` (varsayılan). Eğer `voice_ai`'ın tamamını monorepo
olarak push edersen Vercel'de Root Directory = `app` seçmelisin.

---

## 3. Supabase kurulumu

### 3.1 Proje oluştur
[supabase.com](https://supabase.com) → **New Project**. Bölge olarak kullanıcılarına
yakın bir yer seç. Proje hazır olunca **Project Settings → API**'den şunları not al:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (gizli, yalnızca server-side)

### 3.2 Migration'ları uygula
**SQL Editor**'de `supabase/migrations/` altındaki dosyaları **sırayla** çalıştır
(her birinin içeriğini kopyala-yapıştır, çalıştır, sonrakine geç):

```
0001_init.sql
0002_language_analysis_reminders.sql
0003_google_calendar_tokens.sql
0004_billing_twilio_hardening.sql
0005_audit_and_google_oauth_state.sql
0006_schedule_exceptions.sql
0007_customer_experience.sql
0008_webhook_idempotency.sql
```

Alternatif (CLI): `supabase link` sonrası `supabase db push`.

RLS politikaları migration'lar içinde geliyor — ayrıca bir şey yapmana gerek yok.

### 3.3 Google ile giriş (Supabase Auth)
Panel girişindeki "Google ile giriş" için: Supabase → **Authentication → Providers →
Google** → aç. Buraya bir Google OAuth Client ID/Secret girmen gerekir; Supabase
sana kendi callback URL'sini (`https://<ref>.supabase.co/auth/v1/callback`) verir —
onu Adım 4.3'te Google Cloud'da yetkili redirect olarak ekleyeceksin.

> Not: Supabase Auth'un Google login'i ile uygulamanın **Google Calendar** bağlantısı
> iki ayrı OAuth akışıdır. İkisi aynı Google Cloud projesindeki tek bir OAuth
> client'ı paylaşabilir — sadece her iki redirect URI'yi de o client'a eklemen yeter.

---

## 4. Dış servis anahtarlarını al

Aşağıdaki değerleri topla; Adım 5'te Vercel'e gireceksin.

### 4.1 Vapi (sesli AI)
[Vapi Dashboard](https://vapi.ai) → **API Keys** → `VAPI_API_KEY`.
Webhook doğrulaması için kendin bir gizli dize belirle → `VAPI_WEBHOOK_SECRET`
(aynısını Adım 6'da Vapi tarafına da gireceksin).
Vapi'nin desteklediği Anthropic model slug'larını kontrol et; gerekiyorsa
`VAPI_ANTHROPIC_MODEL_SIMPLE` / `VAPI_ANTHROPIC_MODEL_ESCALATED` değerlerini güncelle.

### 4.2 Twilio (telefon hattı + SMS)
[Twilio Console](https://console.twilio.com) → Account SID + Auth Token →
`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`. Bir telefon numarası satın al →
`TWILIO_PHONE_NUMBER` (E.164, örn. `+14155551234`). (Numara satın alma uygulama
içinden de yapılabilir; bu env başlangıç/varsayılan numaradır.)
WhatsApp onayları istiyorsan opsiyonel `TWILIO_WHATSAPP_FROM=whatsapp:+14155238886`.

### 4.3 Google Cloud (Calendar entegrasyonu)
[console.cloud.google.com](https://console.cloud.google.com) → yeni proje →
**APIs & Services**:
1. **Enable APIs** → "Google Calendar API"yi etkinleştir.
2. **OAuth consent screen** → External, uygulama adı vb. doldur, test kullanıcısı ekle.
3. **Credentials → Create Credentials → OAuth client ID → Web application**.
   - Authorized redirect URIs'e şunları ekle (domain'i Adım 6'da netleştireceksin):
     - `https://YOUR_DOMAIN/api/auth/google-calendar/callback`  (Calendar bağlantısı)
     - `https://<supabase-ref>.supabase.co/auth/v1/callback`  (Supabase Google login)
   - Çıkan Client ID/Secret → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

### 4.4 Stripe (abonelik)
[Stripe Dashboard](https://dashboard.stripe.com) (önce **Test mode**):
1. **Developers → API keys** → Secret key → `STRIPE_SECRET_KEY`.
2. **Products** → iki aylık recurring price oluştur:
   - Starter, $99/ay → `STRIPE_PRICE_ID_STARTER`
   - Pro, $199/ay → `STRIPE_PRICE_ID_PRO`
3. Webhook secret'ı Adım 6.2'de alacaksın → `STRIPE_WEBHOOK_SECRET`.

### 4.5 Anthropic (görüşme özeti/analiz)
[console.anthropic.com](https://console.anthropic.com) → **API Keys** →
`ANTHROPIC_API_KEY`. (Görüşme sonu özet + duygu/aciliyet analizi bunu kullanır;
prompt caching aktiftir.)

### 4.6 Diğer
- `CRON_SECRET` — rastgele güçlü bir dize üret (örn. `openssl rand -hex 32`).
  Vercel Cron, ayarlı olduğunda isteğe `Authorization: Bearer <CRON_SECRET>`
  header'ını otomatik ekler; endpoint bunu doğrular.
- `ADMIN_EMAILS` — `/support` sayfasına erişebilecek admin e-postaları
  (virgülle ayır).
- `RESEND_API_KEY` — opsiyonel, email bildirimleri için [resend.com](https://resend.com).
- `NEXT_PUBLIC_APP_URL` — deploy sonrası gerçek domain (Adım 6'da netleşir).

---

## 5. Vercel'e deploy

1. [Vercel](https://vercel.com) → **Add New → Project** → GitHub reponu import et.
2. **Framework Preset**: Next.js (otomatik algılanır).
3. **Root Directory**: repoyu nasıl push ettiğine göre `.` veya `app` (bkz. Adım 2).
4. **Environment Variables**: aşağıdaki tüm zorunlu değerleri gir. `NEXT_PUBLIC_APP_URL`
   için şimdilik tahmini domain'i gir; ilk deploy'dan sonra gerçek domain'le güncelle.
5. **Deploy**. Vercel build komutu `npm run build` (`next build --webpack`).

**Zorunlu environment değerleri:**

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=            # örn. https://voice-ai.vercel.app

VAPI_API_KEY=
VAPI_WEBHOOK_SECRET=
VAPI_ANTHROPIC_MODEL_SIMPLE=claude-3-5-haiku-20241022
VAPI_ANTHROPIC_MODEL_ESCALATED=claude-3-5-sonnet-20241022

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_STARTER=
STRIPE_PRICE_ID_PRO=

ANTHROPIC_API_KEY=
CRON_SECRET=
ADMIN_EMAILS=
```

Opsiyonel:

```bash
TWILIO_WHATSAPP_FROM=
RESEND_API_KEY=
```

---

## 6. Deploy sonrası: webhook & callback'leri bağla

Artık gerçek domain'in var (örn. `https://voice-ai.vercel.app`). Bunu her yerde kullan:

1. Vercel'de `NEXT_PUBLIC_APP_URL`'i gerçek domain'le güncelle ve **redeploy** et.

### 6.1 Vapi webhook
Vapi Dashboard → assistant/server ayarları → Server URL:
`https://YOUR_DOMAIN/api/webhooks/vapi`. Gizli anahtar olarak `VAPI_WEBHOOK_SECRET`
ile aynı değeri gir.

### 6.2 Stripe webhook
Stripe → **Developers → Webhooks → Add endpoint**:
`https://YOUR_DOMAIN/api/webhooks/stripe`. Şu eventleri seç:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Oluşan **Signing secret** (`whsec_...`) → Vercel'de `STRIPE_WEBHOOK_SECRET` → redeploy.

### 6.3 Google OAuth redirect
Adım 4.3'te placeholder girdiysen, gerçek domain'le
`https://YOUR_DOMAIN/api/auth/google-calendar/callback` redirect URI'sini Google
Cloud OAuth client'ında güncelle/ekle.

### 6.4 Vercel Cron
`vercel.json` zaten hazır: `/api/cron/appointment-reminders` **saatlik** çalışır
(`0 * * * *`). `CRON_SECRET` ayarlıysa Vercel `Authorization: Bearer` header'ını
otomatik ekler. Vercel → Project → **Settings → Cron Jobs**'tan çalıştığını gör.

---

## 7. Deploy sonrası smoke test

Sırayla elle doğrula:

1. Signup/login çalışıyor (e-posta + Google).
2. Onboarding işletme + servisleri oluşturuyor.
3. Agent Ayarları kaydedilince Vapi assistant oluşuyor ("Vapi'ye bağlı" rozeti).
4. Google Calendar bağlanıyor ve bağlantı kesilebiliyor.
5. Twilio numara aranıp satın alınabiliyor.
6. Stripe checkout ve müşteri portalı açılıyor (test kartı `4242 4242 4242 4242`).
7. Gerçek bir arama: Vapi `check_availability`/`book_appointment` webhook'ları çalışıyor.
8. Randevu SMS'indeki onay/iptal linki (`/api/appointments/respond`) çalışıyor.
9. Dashboard, Aramalar, Randevular, Faturalandırma sayfaları veri gösteriyor.
10. `ADMIN_EMAILS`'teki kullanıcı `/support` sayfasına erişebiliyor.

---

## 8. Sık karşılaşılan sorunlar

- **Panel açılıyor ama veri yok / RLS hatası** → migration'lar eksik ya da sırasız
  uygulanmış. SQL Editor'de 0001→0008 sırasını teyit et.
- **Vapi webhook'u düşmüyor** → `NEXT_PUBLIC_APP_URL` yanlış/eski, ya da Vapi'deki
  gizli anahtar `VAPI_WEBHOOK_SECRET` ile uyuşmuyor. Vapi Dashboard'daki webhook
  loglarına bak. (Vapi payload alan adları gerçek hesapla ilk testte doğrulanmalı —
  bkz. README "Notlar / doğrulanması gerekenler".)
- **Stripe webhook 400 (imza)** → `STRIPE_WEBHOOK_SECRET` yanlış; endpoint'in
  signing secret'ıyla birebir aynı olmalı, sonra redeploy.
- **Google Calendar "redirect_uri_mismatch"** → Google Cloud'daki redirect URI ile
  `https://YOUR_DOMAIN/api/auth/google-calendar/callback` birebir aynı değil (http/https,
  sondaki slash dahil).
- **Cron 401** → `CRON_SECRET` Vercel'de ayarlı değil ya da manuel çağırıyorsun;
  Vercel Cron dışında elle test edeceksen header'ı sen ekle:
  `Authorization: Bearer <CRON_SECRET>`.
- **Build başarısız (env)** → `NEXT_PUBLIC_*` değişkenleri build anında gömülür;
  eksikse ekleyip redeploy et.

---

## 9. Güvenlik & bakım

- **Sırlar** yalnızca Vercel env'de; repoda `.env*` yok. `service_role`, tüm
  `*_SECRET` ve API anahtarları sadece server-side kullanılır — client'a sızmaz.
- **Anahtar rotasyonu**: bir anahtar sızarsa ilgili serviste yenile, Vercel'de
  güncelle, redeploy et.
- **Stripe canlıya alma**: test yerine **live** anahtarlarına geç, live webhook
  endpoint'ini yeniden oluştur, `STRIPE_PRICE_ID_STARTER` ve
  `STRIPE_PRICE_ID_PRO` değerlerini live ürünlerle güncelle.
- **Migration'lar**: yeni migration eklendikçe production Supabase'e de sırayla uygula.

---

## Hızlı Checklist

- [ ] `npm test && npm run lint && npm run build` yeşil
- [ ] Kod GitHub'da; `.env*` commit edilmedi
- [ ] Supabase projesi + 0001→0008 migration'lar uygulandı
- [ ] Supabase Auth Google provider açık
- [ ] Vapi / Twilio / Google / Stripe / Anthropic anahtarları alındı
- [ ] Vercel'e import, Root Directory doğru, zorunlu env'ler girildi, deploy edildi
- [ ] `NEXT_PUBLIC_APP_URL` gerçek domain'le güncellendi + redeploy
- [ ] Vapi webhook URL + secret girildi
- [ ] Stripe webhook endpoint + 5 event + signing secret girildi
- [ ] Google redirect URI gerçek domain'le güncellendi
- [ ] Vercel Cron çalışıyor
- [ ] 10 maddelik smoke test geçti

---

### Deploy öncesi lokal doğrulama komutları

```bash
npm test        # birim testler
npm run lint    # eslint
npm run build   # production build
```
