"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { provisionAssistant } from "@/lib/vapi/provision";
import type { SupportedLanguage } from "@/lib/vapi/languages";

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

  const language = String(formData.get("language") ?? "tr") as SupportedLanguage;
  const greetingMessage = String(formData.get("greeting_message") ?? "");
  const emergencyDefinition = String(formData.get("emergency_definition") ?? "");
  const transferRule = String(formData.get("transfer_rule") ?? "");

  const { error: updateError } = await supabase
    .from("agent_config")
    .update({
      language,
      greeting_message: greetingMessage || null,
      escalation_rules: {
        emergency_definition: emergencyDefinition,
        transfer_rule: transferRule,
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
