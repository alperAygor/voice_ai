import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveBusinessIdByAssistant } from "@/lib/agent-tools/calls";
import { parseVapiToolCallMessage } from "@/lib/vapi/tool-call-parser";

export async function parseFunctionCall(req: Request) {
  const body = await req.json();
  const parsed = parseVapiToolCallMessage(body);
  const supabase = createAdminClient();

  const businessId = parsed.assistantId
    ? await resolveBusinessIdByAssistant(supabase, parsed.assistantId)
    : null;

  return {
    supabase,
    businessId,
    vapiCallId: parsed.callId ?? undefined,
    callerNumber: parsed.callerNumber,
    functionName: parsed.functionName ?? undefined,
    toolCallId: parsed.toolCallId,
    parameters: parsed.parameters,
    rawMessage: body,
  };
}
