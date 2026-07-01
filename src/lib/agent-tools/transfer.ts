import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateCallRow } from "./calls";

export async function markTransferred(
  businessId: string,
  vapiCallId: string,
  callerNumber: string | null,
  reason: string
): Promise<void> {
  const supabase = createAdminClient();

  const callId = await getOrCreateCallRow(supabase, businessId, vapiCallId, callerNumber);

  await supabase
    .from("calls")
    .update({ transfer_reason: reason, outcome: "transferred_to_human" })
    .eq("id", callId);
}
