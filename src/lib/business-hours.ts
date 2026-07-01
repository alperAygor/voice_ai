import type { SupportedLanguage } from "./vapi/languages";

export type DayHours = { open: string; close: string; closed: boolean };
export type BusinessHours = Record<
  "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
  DayHours
>;

const DAY_ORDER: (keyof BusinessHours)[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

const DAY_LABELS: Record<SupportedLanguage, Record<keyof BusinessHours, string>> = {
  tr: { mon: "Pzt", tue: "Sal", wed: "Çar", thu: "Per", fri: "Cum", sat: "Cmt", sun: "Paz" },
  en: { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" },
  es: { mon: "Lun", tue: "Mar", wed: "Mié", thu: "Jue", fri: "Vie", sat: "Sáb", sun: "Dom" },
  fr: { mon: "Lun", tue: "Mar", wed: "Mer", thu: "Jeu", fri: "Ven", sat: "Sam", sun: "Dim" },
  de: { mon: "Mo", tue: "Di", wed: "Mi", thu: "Do", fri: "Fr", sat: "Sa", sun: "So" },
  it: { mon: "Lun", tue: "Mar", wed: "Mer", thu: "Gio", fri: "Ven", sat: "Sab", sun: "Dom" },
};

const CLOSED_LABEL: Record<SupportedLanguage, string> = {
  tr: "Kapalı",
  en: "Closed",
  es: "Cerrado",
  fr: "Fermé",
  de: "Geschlossen",
  it: "Chiuso",
};

export function formatBusinessHours(
  hours: BusinessHours,
  language: SupportedLanguage
): string {
  return DAY_ORDER.map((day) => {
    const d = hours[day];
    const label = DAY_LABELS[language][day];
    if (!d || d.closed) return `${label}: ${CLOSED_LABEL[language]}`;
    return `${label}: ${d.open}-${d.close}`;
  }).join(", ");
}
