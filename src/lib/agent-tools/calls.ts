import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

export async function resolveBusinessIdByAssistant(
  supabase: AdminClient,
  vapiAssistantId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("agent_config")
    .select("business_id")
    .eq("vapi_assistant_id", vapiAssistantId)
    .maybeSingle();

  return data?.business_id ?? null;
}

export async function getOrCreateCallRow(
  supabase: AdminClient,
  businessId: string,
  vapiCallId: string,
  callerNumber: string | null
): Promise<string> {
  const { data: existing } = await supabase
    .from("calls")
    .select("id")
    .eq("vapi_call_id", vapiCallId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("calls")
    .insert({
      business_id: businessId,
      vapi_call_id: vapiCallId,
      caller_number: callerNumber,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Call kaydı oluşturulamadı.");
  }

  return created.id;
}
