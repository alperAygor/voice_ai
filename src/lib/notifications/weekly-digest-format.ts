// Haftalık özet e-postasının metni — saf ve test edilebilir (I/O yok).
export type WeeklyDigestData = {
  businessName: string;
  periodLabel: string;
  totalCalls: number;
  appointmentsBooked: number;
  missedCalls: number;
  emergencies: number;
};

export function buildWeeklyDigestEmail(d: WeeklyDigestData): {
  subject: string;
  text: string;
  html: string;
} {
  const lines = [
    `Merhaba, AI resepsiyonistinizin son 7 günlük (${d.periodLabel}) özeti:`,
    `• Toplam çağrı: ${d.totalCalls}`,
    `• Alınan randevu: ${d.appointmentsBooked}`,
    `• Kaçırılan / sesli mesaj: ${d.missedCalls}`,
    `• Acil olarak işaretlenen: ${d.emergencies}`,
    "Tüm detaylar ve dökümler için panelinize göz atın.",
  ];

  const html = `<div style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;color:#111">${lines
    .map((l) => `<p style="margin:0 0 8px">${l}</p>`)
    .join("")}</div>`;

  return {
    subject: `Haftalık özet — ${d.businessName}`,
    text: lines.join("\n"),
    html,
  };
}
