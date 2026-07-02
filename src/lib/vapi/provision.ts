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
    .select("id, vapi_assistant_id, language, greeting_message, escalation_rules")
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
