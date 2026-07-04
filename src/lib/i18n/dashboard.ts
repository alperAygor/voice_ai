import type { Locale } from "./landing";

const tr = {
  sidebar: {
    nav: {
      overview: "Genel Bakış",
      calls: "Aramalar",
      appointments: "Randevular",
      agentSettings: "Agent Ayarları",
      setup: "Kurulum",
      billing: "Faturalandırma",
      account: "Hesap",
    },
    business: "İşletme",
    adminPanel: "Admin Panel",
    language: "Arayüz dili",
    logout: "Çıkış yap",
  },
  setupChecklist: {
    title: "Kurulum checklist'i",
    progress: (completed: number, total: number) => `${completed}/${total} adım tamamlandı.`,
    complete: "Tamam",
    incomplete: "Eksik",
    items: {
      business_profile: "İşletme profili",
      services: "Hizmetler",
      calendar: "Google Takvim",
      billing: "Faturalandırma",
    },
  },
  overview: {
    title: "Genel Bakış",
    subtitle: "İşletmenizin VoiceAI performansı.",
    stats: {
      monthlyCalls: "Bu ay gelen arama",
      conversionRate: "Dönüşüm oranı",
      appointmentSubtitle: (count: number) => `${count} randevu`,
      qualityScore: "Çağrı kalite skoru",
      totalMinutes: "Toplam dakika",
      totalMinutesSubtitle: "Bu ay kullanılan",
      estimatedCost: "Tahmini maliyet",
      aiImprovement: "AI iyileştirme",
      aiImprovementSubtitle: "Son 30 gün sinyali",
    },
    charts: {
      callTrend: "Arama Trendi (Son 30 Gün)",
      outcomes: "Arama Sonuçları",
      noData: "Yeterli veri yok",
    },
    outcomes: {
      appointment_booked: "Randevu",
      info_provided: "Bilgi verildi",
      transferred_to_human: "İnsana aktarıldı",
      missed: "Cevapsız",
      emergency_flagged: "Acil",
      voicemail: "Sesli mesaj",
      unknown: "Bilinmiyor",
    },
    aiInsights: {
      title: "AI İyileştirme Alanları",
      subtitle: "Son 30 gündeki analizlerden tekrarlayan koçluk fırsatları.",
      quality: "Kalite",
      countSuffix: "kez",
      empty: "Henüz belirgin bir AI iyileştirme sinyali yok.",
    },
    recentCalls: {
      title: "Son Aramalar",
      viewAll: "Tümünü Gör",
      unknownNumber: "Bilinmeyen numara",
      empty:
        "Henüz bağlı bir sesli AI agent'ın yok. Agent Ayarları sayfasından kurulumu tamamladığında aramalar burada görünecek.",
      minute: "dk",
      second: "sn",
    },
  },
};

const en: typeof tr = {
  sidebar: {
    nav: {
      overview: "Overview",
      calls: "Calls",
      appointments: "Appointments",
      agentSettings: "Agent Settings",
      setup: "Setup",
      billing: "Billing",
      account: "Account",
    },
    business: "Business",
    adminPanel: "Admin Panel",
    language: "Interface language",
    logout: "Log out",
  },
  setupChecklist: {
    title: "Setup checklist",
    progress: (completed: number, total: number) => `${completed}/${total} steps complete.`,
    complete: "Done",
    incomplete: "Missing",
    items: {
      business_profile: "Business profile",
      services: "Services",
      calendar: "Google Calendar",
      billing: "Billing",
    },
  },
  overview: {
    title: "Overview",
    subtitle: "Your VoiceAI performance at a glance.",
    stats: {
      monthlyCalls: "Calls this month",
      conversionRate: "Conversion rate",
      appointmentSubtitle: (count: number) => `${count} appointments`,
      qualityScore: "Call quality score",
      totalMinutes: "Total minutes",
      totalMinutesSubtitle: "Used this month",
      estimatedCost: "Estimated cost",
      aiImprovement: "AI improvements",
      aiImprovementSubtitle: "Signals from last 30 days",
    },
    charts: {
      callTrend: "Call Trend (Last 30 Days)",
      outcomes: "Call Outcomes",
      noData: "Not enough data",
    },
    outcomes: {
      appointment_booked: "Appointment",
      info_provided: "Info provided",
      transferred_to_human: "Transferred",
      missed: "Missed",
      emergency_flagged: "Urgent",
      voicemail: "Voicemail",
      unknown: "Unknown",
    },
    aiInsights: {
      title: "AI Improvement Areas",
      subtitle: "Recurring coaching opportunities from the last 30 days of analysis.",
      quality: "Quality",
      countSuffix: "times",
      empty: "No clear AI improvement signal yet.",
    },
    recentCalls: {
      title: "Recent Calls",
      viewAll: "View all",
      unknownNumber: "Unknown number",
      empty:
        "You do not have a connected voice AI agent yet. Calls will appear here after setup is completed from Agent Settings.",
      minute: "min",
      second: "sec",
    },
  },
};

const DICTIONARIES: Record<Locale, typeof tr> = { tr, en };

export type DashboardDictionary = typeof tr;

export function getDashboardDictionary(locale: Locale): DashboardDictionary {
  return DICTIONARIES[locale];
}
