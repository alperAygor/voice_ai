import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateCallRow } from "./calls";

export async function markTransferred(
  businessId: string,
  vapiCallId: string,
  callerNumber: string | null,
  reason: string
): Promise<{ transferNumber: string | null }> {
  const supabase = createAdminClient();

  const callId = await getOrCreateCallRow(supabase, businessId, vapiCallId, callerNumber);

  await supabase
    .from("calls")
    .update({ transfer_reason: reason, outcome: "transferred_to_human" })
    .eq("id", callId);

  // Yapılandırılmış aktarım hedefi numarasını döndür (varsa). Vapi bunu yanıt
  // gövdesinde alır; asistan arayana bu numaraya aktarıldığını söyleyebilir.
  const { data: agentConfig } = await supabase
    .from("agent_config")
    .select("escalation_rules")
    .eq("business_id", businessId)
    .maybeSingle();

  const rules = (agentConfig?.escalation_rules ?? {}) as {
    transfer_phone_number?: string;
  };

  return { transferNumber: rules.transfer_phone_number || null };
}
