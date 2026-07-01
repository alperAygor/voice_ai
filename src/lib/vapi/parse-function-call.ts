import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveBusinessIdByAssistant } from "@/lib/agent-tools/calls";

// Vapi'nin fonksiyon çağrısı webhook zarfı. Vapi dashboard'undaki gerçek
// payload loglarıyla karşılaştırıp gerekirse alan adlarını güncelle.
export async function parseFunctionCall(req: Request) {
  const body = await req.json();
  const message = body.message ?? body;
  const call = message.call ?? {};
  const supabase = createAdminClient();

  const businessId = call.assistantId
    ? await resolveBusinessIdByAssistant(supabase, call.assistantId)
    : null;

  return {
    supabase,
    businessId,
    vapiCallId: call.id as string | undefined,
    callerNumber: (call.customer?.number as string | undefined) ?? null,
    functionName: message.functionCall?.name as string | undefined,
    parameters: (message.functionCall?.parameters ?? {}) as Record<string, unknown>,
    rawMessage: message,
  };
}
