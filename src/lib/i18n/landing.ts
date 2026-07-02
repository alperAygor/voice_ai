// Landing sayfası için hafif i18n (client-safe: next/headers importu YOK).
// Route yapısını (/en, /tr) değiştirmeden cookie (NEXT_LOCALE) ile dil seçimi.
// Şimdilik TR/EN; agent'ın desteklediği 6 dile (es, fr, de, it) sözlük
// eklenerek genişletilebilir. Cookie okuma server tarafı: ./server.ts

export const LOCALES = ["tr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_LABELS: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
};

const tr = {
  nav: { features: "Özellikler", how: "Nasıl çalışır", pricing: "Fiyatlar", login: "Giriş yap", signup: "Ücretsiz başla" },
  hero: {
    badge: "Ev hizmetleri için sesli AI resepsiyonist",
    title: "Hiçbir aramayı bir daha kaçırmayın",
    subtitle:
      "AI resepsiyonistiniz 7/24 telefonu açar, müşteriyi niteler, randevu alır ve takviminize yazar. Siz işinize odaklanın, aramaları o karşılasın.",
    ctaPrimary: "Ücretsiz başla",
    ctaSecondary: "Nasıl çalışır?",
    stats: [
      { value: "7/24", label: "her zaman açık" },
      { value: "6 dil", label: "çok dilli görüşme" },
      { value: "<1 dk", label: "kurulum sonrası hazır" },
    ],
  },
  how: {
    title: "Üç adımda çalışır",
    subtitle: "Teknik bilgi gerektirmez. Numaranı bağla, gerisini AI halleder.",
    steps: [
      { title: "Numaranı bağla", desc: "Sana bir AI numarası veririz ya da mevcut işletme hattını cevapsızda AI'a yönlendirirsin. Numaranı değiştirmezsin." },
      { title: "AI cevaplar", desc: "Arayan kişiyle doğal konuşur, ihtiyacını anlar, uygun saatleri sunar ve randevuyu Google Takvim'e yazar." },
      { title: "Panelden takip et", desc: "Her görüşmenin özeti, duygu ve aciliyet analizi, randevular ve kullanım tek panelde." },
    ],
  },
  features: {
    title: "İşinizi büyüten özellikler",
    subtitle: "Sadece telefonu açmakla kalmaz — her görüşmeyi bir fırsata çevirir.",
    items: [
      { title: "Kaçırılan aramaları yanıtlar", desc: "Meşgulken, mesai dışında, tatildeyken — her arama karşılanır. Kaçan müşteri, kaçan iş demektir." },
      { title: "Randevu alır ve takvime yazar", desc: "Müsaitliği kontrol eder, randevu oluşturur ve Google Takvim'e otomatik ekler. Çakışma olmaz." },
      { title: "Çok dilli görüşme", desc: "Türkçe, İngilizce, İspanyolca, Fransızca, Almanca, İtalyanca. Müşterinin dilinde konuşur." },
      { title: "Özet + duygu/aciliyet analizi", desc: "Her görüşme sonunda: kim aradı, ne istedi, ne kadar acil, ne yapıldı. İçgörüye dönüşen aramalar." },
      { title: "Geri arama ve hatırlatma", desc: "Kaçırılan aramaları otomatik geri arar; randevu öncesi müşteriye hatırlatma/onay araması yapar." },
      { title: "SMS takip", desc: "Görüşme ve randevu sonrası müşteriye otomatik SMS ile onay ve bilgilendirme." },
    ],
  },
  pricing: {
    title: "Size uygun planı seçin",
    subtitle: "Gizli ücret yok. İstediğiniz zaman iptal edin.",
    per: "/ay",
    popularLabel: "En popüler",
    plans: [
      {
        id: "starter",
        name: "Starter",
        price: "$99",
        includes: "200 dakika dahil",
        features: ["7/24 AI resepsiyonist", "Google Takvim entegrasyonu", "Çok dilli görüşme", "Görüşme özeti + analiz", "Aşım: dakika başına"],
        cta: "Starter ile başla",
        popular: false,
      },
      {
        id: "pro",
        name: "Pro",
        price: "$199",
        includes: "500 dakika dahil",
        features: ["Starter'daki her şey", "WhatsApp + SMS entegrasyonu", "Kaçırılan arama geri araması", "Randevu hatırlatma aramaları", "Öncelikli destek"],
        cta: "Pro ile başla",
        popular: true,
      },
    ],
  },
  ctaBand: { title: "Bir sonraki aramayı kaçırmayın", subtitle: "Dakikalar içinde kurun, ilk günden aramaları AI karşılasın.", cta: "Hemen başla" },
  footer: { tagline: "Ev hizmetleri için sesli AI resepsiyonist.", rights: "Tüm hakları saklıdır." },
};

const en: typeof tr = {
  nav: { features: "Features", how: "How it works", pricing: "Pricing", login: "Log in", signup: "Start free" },
  hero: {
    badge: "AI voice receptionist for home services",
    title: "Never miss another call",
    subtitle:
      "Your AI receptionist answers 24/7, qualifies the caller, books appointments and writes them to your calendar. Focus on the job — let it handle the phone.",
    ctaPrimary: "Start free",
    ctaSecondary: "How it works",
    stats: [
      { value: "24/7", label: "always on" },
      { value: "6 langs", label: "multilingual calls" },
      { value: "<1 min", label: "ready after setup" },
    ],
  },
  how: {
    title: "Works in three steps",
    subtitle: "No technical skills needed. Connect a number, the AI does the rest.",
    steps: [
      { title: "Connect your number", desc: "We give you an AI number, or you forward your existing business line on no-answer. You keep your number." },
      { title: "The AI answers", desc: "It talks naturally with the caller, understands the need, offers open slots and writes the booking to Google Calendar." },
      { title: "Track from the dashboard", desc: "Every call's summary, sentiment and urgency analysis, appointments and usage — all in one place." },
    ],
  },
  features: {
    title: "Features that grow your business",
    subtitle: "It doesn't just answer — it turns every call into an opportunity.",
    items: [
      { title: "Answers missed calls", desc: "When you're busy, after hours, on holiday — every call is answered. A missed caller is a missed job." },
      { title: "Books and writes to calendar", desc: "Checks availability, creates the appointment and adds it to Google Calendar automatically. No double-booking." },
      { title: "Multilingual calls", desc: "Turkish, English, Spanish, French, German, Italian. It speaks the customer's language." },
      { title: "Summary + sentiment/urgency", desc: "After each call: who called, what they wanted, how urgent, what was done. Calls that become insights." },
      { title: "Callbacks and reminders", desc: "Automatically calls missed callers back; makes reminder/confirmation calls before appointments." },
      { title: "SMS follow-up", desc: "Automatic confirmation and info via SMS after calls and appointments." },
    ],
  },
  pricing: {
    title: "Choose the plan that fits",
    subtitle: "No hidden fees. Cancel anytime.",
    per: "/mo",
    popularLabel: "Most popular",
    plans: [
      {
        id: "starter",
        name: "Starter",
        price: "$99",
        includes: "200 minutes included",
        features: ["24/7 AI receptionist", "Google Calendar integration", "Multilingual calls", "Call summary + analysis", "Overage: per minute"],
        cta: "Start with Starter",
        popular: false,
      },
      {
        id: "pro",
        name: "Pro",
        price: "$199",
        includes: "500 minutes included",
        features: ["Everything in Starter", "WhatsApp + SMS integration", "Missed-call callbacks", "Appointment reminder calls", "Priority support"],
        cta: "Start with Pro",
        popular: true,
      },
    ],
  },
  ctaBand: { title: "Don't miss the next call", subtitle: "Set up in minutes, let the AI answer from day one.", cta: "Get started" },
  footer: { tagline: "AI voice receptionist for home services.", rights: "All rights reserved." },
};

const DICTIONARIES: Record<Locale, typeof tr> = { tr, en };

export type LandingDictionary = typeof tr;

export function getLandingDictionary(locale: Locale): LandingDictionary {
  return DICTIONARIES[locale];
}

export function normalizeLocale(value: string | undefined): Locale {
  return LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;
}
