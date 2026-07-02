"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { provisionAssistant } from "@/lib/vapi/provision";
import { LANGUAGE_LABELS, type SupportedLanguage } from "@/lib/vapi/languages";

export type AgentSettingsState = { error: string | null; success: boolean };

export async function updateAgentSettings(
  _prevState: AgentSettingsState,
  formData: FormData
): Promise<AgentSettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Oturum bulunamadı.", success: false };
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_user_id", user.id)
    .single();

  if (!business) {
    return { error: "İşletme bulunamadı.", success: false };
  }

  const requestedLanguage = String(formData.get("language") ?? "tr");
  const language = requestedLanguage in LANGUAGE_LABELS
    ? (requestedLanguage as SupportedLanguage)
    : "tr";
  const greetingMessage = String(formData.get("greeting_message") ?? "");
  const emergencyDefinition = String(formData.get("emergency_definition") ?? "");
  const transferRule = String(formData.get("transfer_rule") ?? "");
  const requestedResponseStyle = String(formData.get("response_style") ?? "concise");
  const responseStyle = requestedResponseStyle === "balanced" ? "balanced" : "concise";
  const customInstructions = String(formData.get("custom_instructions") ?? "");
  const smsAppointmentConfirmations = formData.get("sms_appointment_confirmations") === "on";
  const whatsappAppointmentConfirmations =
    formData.get("whatsapp_appointment_confirmations") === "on";
  const smsCallFollowups = formData.get("sms_call_followups") === "on";

  const { error: updateError } = await supabase
    .from("agent_config")
    .update({
      language,
      greeting_message: greetingMessage || null,
      escalation_rules: {
        emergency_definition: emergencyDefinition,
        transfer_rule: transferRule,
        response_style: responseStyle,
        custom_instructions: customInstructions,
        sms_appointment_confirmations: smsAppointmentConfirmations,
        whatsapp_appointment_confirmations: whatsappAppointmentConfirmations,
        sms_call_followups: smsCallFollowups,
      },
    })
    .eq("business_id", business.id);

  if (updateError) {
    return { error: updateError.message, success: false };
  }

  try {
    await provisionAssistant(business.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    revalidatePath("/dashboard/agent-settings");
    return {
      error: `Ayarlar kaydedildi ama Vapi'ye uygulanamadı: ${message}`,
      success: false,
    };
  }

  revalidatePath("/dashboard/agent-settings");
  return { error: null, success: true };
}
