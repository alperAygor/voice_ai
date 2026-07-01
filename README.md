# Sesli AI Resepsiyonist

Ev hizmetleri işletmeleri için sesli AI resepsiyonist SaaS platformu.

Production'a çıkmadan önce [DEPLOYMENT.md](./DEPLOYMENT.md) dosyasındaki
minimum checklist'i uygula.

## Kurulum

1. Bağımlılıkları yükle:
   ```bash
   npm install
   ```

2. Bir [Supabase](https://supabase.com) projesi oluştur.

3. `supabase/migrations` altındaki migration dosyalarını sırayla uygula.

4. Supabase Authentication ayarlarından Google OAuth sağlayıcısını aktif et
   (Google ile giriş için).

5. `.env.example` dosyasını `.env.local` olarak kopyala. En azından şu üçü
   Supabase proje ayarlarından (Project Settings → API) doldur:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```
   Sesli AI'ı gerçek bir telefon hattıyla test etmek için ayrıca:
   - `VAPI_API_KEY` — [vapi.ai](https://vapi.ai) Dashboard → API Keys
   - `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER` — [twilio.com](https://www.twilio.com) Console
   - `ANTHROPIC_API_KEY` — [console.anthropic.com](https://console.anthropic.com) (görüşme özeti/duygu analizi için)
   - `NEXT_PUBLIC_APP_URL` — Vapi'nin webhook gönderebileceği genel bir URL.
     Localde test için [ngrok](https://ngrok.com) ya da `cloudflared tunnel`
     ile `localhost:3000`'i dışa aç ve o URL'i buraya yaz.

6. Geliştirme sunucusunu başlat:
   ```bash
   npm run dev
   ```

## Bu fazlarda tamamlananlar

**Faz A — Temel iskelet**
- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Supabase auth + multi-tenant RLS, onboarding sihirbazı, dashboard iskeleti

**Faz B — Sesli AI entegrasyonu**
- Vapi assistant otomatik oluşturma/güncelleme (`src/lib/vapi/provision.ts`) —
  işletme kaydolduğunda ve Agent Ayarları'ndan kaydedildiğinde tetiklenir
- **Çok dilli destek**: Türkçe, İngilizce, İspanyolca, Fransızca, Almanca,
  İtalyanca — her dil için ayrı sistem prompt şablonu (`src/lib/vapi/system-prompt.ts`)
- Vapi webhook (`/api/webhooks/vapi`): fonksiyon çağrılarını işler
  (`check_availability`, `book_appointment`, `transfer_to_human`) ve görüşme
  bitince analiz tetikler
- **Görüşme özeti + duygu/aciliyet analizi**: her görüşme sonunda Claude
  Sonnet 4.6 ile transkript analiz edilir (`src/lib/anthropic/call-analysis.ts`).
  **Prompt caching aktif**: sabit analiz talimatları `cache_control: {type:
  "ephemeral"}` ile işaretli — her görüşmede tekrar tekrar "yazılmak" yerine
  ucuza "okunur"
- **Kaçırılan arama geri araması**: çağrı "missed"/"voicemail" sonucuyla
  bitince otomatik outbound arama başlatılır (`src/lib/agent-tools/outbound.ts`)
- **Randevu hatırlatma/onay araması**: saatlik cron (`vercel.json` →
  `/api/cron/appointment-reminders`) randevusuna ~24 saat kalan ve
  hatırlatılmamış randevular için otomatik arama başlatır
- **SMS takip**: görüşme/randevu sonrası Twilio ile SMS gönderimi ve kaydı
  (`sms_messages` tablosu, `src/lib/notifications/sms.ts`)

## Deploy

MVP deploy adımları için [DEPLOYMENT.md](./DEPLOYMENT.md) dosyasına bak.

## Notlar / doğrulanması gerekenler

- `src/lib/vapi/client.ts` ve `src/lib/vapi/handle-end-of-call.ts` içindeki
  Vapi payload alan adları (`endedReason` değerleri, fonksiyon çağrısı zarfı)
  genel Vapi dokümantasyonuna göre yazıldı — gerçek bir Vapi hesabıyla ilk
  testte Dashboard'daki webhook loglarıyla karşılaştırıp gerekirse düzelt.
