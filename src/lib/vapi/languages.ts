export type SupportedLanguage = "tr" | "en" | "es" | "fr" | "de" | "it";

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  tr: "Türkçe",
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
};

// Vapi transcriber (Deepgram Nova-3) + voice (Deepgram Aura) language codes.
export const VAPI_LOCALE: Record<SupportedLanguage, string> = {
  tr: "tr",
  en: "en-US",
  es: "es",
  fr: "fr",
  de: "de",
  it: "it",
};

const INDUSTRY_LABELS: Record<
  SupportedLanguage,
  Record<"plumbing" | "electrical" | "hvac" | "other", string>
> = {
  tr: {
    plumbing: "tesisatçı",
    electrical: "elektrikçi",
    hvac: "HVAC/klima servisi",
    other: "ev hizmetleri",
  },
  en: {
    plumbing: "plumbing",
    electrical: "electrical",
    hvac: "HVAC",
    other: "home services",
  },
  es: {
    plumbing: "fontanería",
    electrical: "electricidad",
    hvac: "climatización (HVAC)",
    other: "servicios para el hogar",
  },
  fr: {
    plumbing: "plomberie",
    electrical: "électricité",
    hvac: "chauffage/climatisation (HVAC)",
    other: "services à domicile",
  },
  de: {
    plumbing: "Sanitär",
    electrical: "Elektrik",
    hvac: "HLK/Klima",
    other: "Haushaltsdienstleistungen",
  },
  it: {
    plumbing: "idraulica",
    electrical: "elettricità",
    hvac: "climatizzazione (HVAC)",
    other: "servizi per la casa",
  },
};

export function industryLabel(
  language: SupportedLanguage,
  industry: "plumbing" | "electrical" | "hvac" | "other"
) {
  return INDUSTRY_LABELS[language][industry];
}

export const DEFAULT_GREETING: Record<SupportedLanguage, (businessName: string) => string> = {
  tr: (name) => `Merhaba, ${name}'i aradınız. Size nasıl yardımcı olabilirim?`,
  en: (name) => `Hello, you've reached ${name}. How can I help you today?`,
  es: (name) => `Hola, ha llamado a ${name}. ¿En qué puedo ayudarle?`,
  fr: (name) => `Bonjour, vous êtes bien chez ${name}. Comment puis-je vous aider ?`,
  de: (name) => `Hallo, hier ist ${name}. Wie kann ich Ihnen helfen?`,
  it: (name) => `Salve, ha chiamato ${name}. Come posso aiutarla?`,
};
