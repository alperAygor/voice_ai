import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAssistant, updateAssistant } from "./client";
import { AGENT_FUNCTIONS } from "./functions";
import { buildSystemPrompt } from "./system-prompt";
import { formatBusinessHours, type BusinessHours } from "@/lib/business-hours";
import { DEFAULT_GREETING, type SupportedLanguage } from "./languages";

const EXTRA_INSTRUCTIONS_LABEL: Record<SupportedLanguage, string> = {
  tr: "Ek talimatlar",
  en: "Additional instructions",
  es: "Instrucciones adicionales",
  fr: "Instructions supplémentaires",
  de: "Zusätzliche Anweisungen",
  it: "Istruzioni aggiuntive",
};

export async function provisionAssistant(businessId: string) {
  const supabase = createAdminClient();

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, name, industry, service_area, business_hours")
    .eq("id", businessId)
    .single();

  if (businessError || !business) {
    throw new Error(businessError?.message ?? "İşletme bulunamadı.");
  }

  const { data: services } = await supabase
    .from("business_services")
    .select("service_name, is_emergency_eligible")
    .eq("business_id", businessId);

  const { data: agentConfig, error: agentConfigError } = await supabase
    .from("agent_config")
    .select("id, vapi_assistant_id, language, greeting_message, escalation_rules, voice_id")
    .eq("business_id", businessId)
    .single();

  if (agentConfigError || !agentConfig) {
    throw new Error(agentConfigError?.message ?? "Agent config bulunamadı.");
  }

  const language = (agentConfig.language ?? "tr") as SupportedLanguage;
  const escalationRules =
    (agentConfig.escalation_rules as {
      emergency_definition?: string;
      transfer_rule?: string;
      response_style?: "concise" | "balanced";
      custom_instructions?: string;
      after_hours_behavior?: "book_anytime" | "restricted";
      transfer_phone_number?: string;
    } | null) ?? {};

  const servicesList = (services ?? []).map((s) => s.service_name).join(", ") || "-";
  const emergencyKeywords =
    [
      ...(services ?? [])
        .filter((s) => s.is_emergency_eligible)
        .map((s) => s.service_name),
      escalationRules.emergency_definition,
    ]
      .filter(Boolean)
      .join(", ") || "-";

  let systemPrompt = buildSystemPrompt({
    businessName: business.name,
    industry: business.industry,
    serviceArea: business.service_area ?? "-",
    businessHoursText: formatBusinessHours(
      (business.business_hours ?? {}) as BusinessHours,
      language
    ),
    servicesList,
    emergencyKeywords,
    language,
    responseStyle: escalationRules.response_style ?? "concise",
    customInstructions: escalationRules.custom_instructions,
  });

  if (escalationRules.transfer_rule) {
    systemPrompt += `\n\n${EXTRA_INSTRUCTIONS_LABEL[language]}: ${escalationRules.transfer_rule}`;
  }

  // Aktarım hedef numarası tanımlıysa: asistan transfer_to_human'ı çağırırken
  // arayana bu numaradan bir yetkiliye aktarılacağını söylesin.
  if (escalationRules.transfer_phone_number) {
    const TRANSFER_TARGET: Record<SupportedLanguage, string> = {
      tr: `Aktarım gerektiğinde arayana bir yetkiliye (${escalationRules.transfer_phone_number}) aktarıldığını söyle ve transfer_to_human aracını çağır.`,
      en: `When a transfer is needed, tell the caller they are being connected to a representative (${escalationRules.transfer_phone_number}) and call the transfer_to_human tool.`,
      es: `Cuando se necesite una transferencia, dile a la persona que la conectas con un representante (${escalationRules.transfer_phone_number}) y llama a la herramienta transfer_to_human.`,
      fr: `Lorsqu'un transfert est nécessaire, indiquez à l'appelant qu'il est mis en relation avec un représentant (${escalationRules.transfer_phone_number}) et appelez l'outil transfer_to_human.`,
      de: `Wenn eine Weiterleitung nötig ist, teilen Sie dem Anrufer mit, dass er mit einem Mitarbeiter (${escalationRules.transfer_phone_number}) verbunden wird, und rufen Sie das Tool transfer_to_human auf.`,
      it: `Quando serve un trasferimento, di' al chiamante che viene collegato a un operatore (${escalationRules.transfer_phone_number}) e richiama lo strumento transfer_to_human.`,
    };
    systemPrompt += `\n\n${TRANSFER_TARGET[language]}`;
  }

  // Mesai dışı davranışı: "restricted" ise çalışma saatleri dışında randevu verme.
  if (escalationRules.after_hours_behavior === "restricted") {
    const AFTER_HOURS_RESTRICTED: Record<SupportedLanguage, string> = {
      tr: "Çalışma saatleri dışında randevu oluşturma. Arayana mesai saatlerini söyle, acil değilse mesai içinde geri arayacağınızı belirt. Acil durumda transfer/kayıt kurallarını uygula.",
      en: "Do not book appointments outside business hours. Tell the caller your hours and that you'll call back during hours unless it's urgent. For emergencies, apply the transfer/record rules.",
      es: "No agendes citas fuera del horario. Indica el horario y di que devolverás la llamada en horario, salvo urgencias. En emergencias, aplica las reglas de transferencia.",
      fr: "Ne planifiez pas de rendez-vous en dehors des heures d'ouverture. Indiquez les horaires et proposez de rappeler pendant les heures, sauf urgence. En cas d'urgence, appliquez les règles de transfert.",
      de: "Vereinbaren Sie außerhalb der Geschäftszeiten keine Termine. Nennen Sie die Zeiten und bieten Sie einen Rückruf während der Geschäftszeiten an, außer bei Notfällen. Bei Notfällen die Transferregeln anwenden.",
      it: "Non fissare appuntamenti fuori orario. Comunica gli orari e proponi di richiamare in orario, salvo urgenze. Per le emergenze applica le regole di trasferimento.",
    };
    systemPrompt += `\n\n${AFTER_HOURS_RESTRICTED[language]}`;
  }

  const greeting = agentConfig.greeting_message || DEFAULT_GREETING[language](business.name);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL tanımlı değil — Vapi webhook'unun ulaşabileceği genel bir URL gerekli."
    );
  }

  const assistantConfig = {
    name: `${business.name} — AI Resepsiyonist`,
    systemPrompt,
    firstMessage: greeting,
    language,
    serverUrl: `${appUrl}/api/webhooks/vapi`,
    functions: AGENT_FUNCTIONS,
    voiceId: agentConfig.voice_id ?? undefined,
  };

  const result = agentConfig.vapi_assistant_id
    ? await updateAssistant(agentConfig.vapi_assistant_id, assistantConfig)
    : await createAssistant(assistantConfig);

  const { error: updateError } = await supabase
    .from("agent_config")
    .update({
      system_prompt: systemPrompt,
      greeting_message: greeting,
      vapi_assistant_id: result.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", agentConfig.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return result;
}
