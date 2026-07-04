export type ParsedVapiToolCall = {
  assistantId: string | null;
  callId: string | null;
  callerNumber: string | null;
  functionName: string | null;
  // Yeni "tool-calls" formatında her çağrının bir id'si var; yanıtı
  // { results: [{ toolCallId, result }] } şeklinde döndürmek için gerekli.
  toolCallId: string | null;
  parameters: Record<string, unknown>;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseArguments(value: unknown): Record<string, unknown> {
  if (isRecord(value)) return value;
  if (typeof value !== "string" || !value.trim()) return {};

  try {
    const parsed = JSON.parse(value);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function getToolCall(message: UnknownRecord): UnknownRecord | null {
  const candidates = [
    message.functionCall,
    message.toolCall,
    Array.isArray(message.toolCallList) ? message.toolCallList[0] : null,
    Array.isArray(message.toolCalls) ? message.toolCalls[0] : null,
  ];

  return candidates.find(isRecord) ?? null;
}

export function parseVapiToolCallMessage(rawBody: unknown): ParsedVapiToolCall {
  const body = isRecord(rawBody) ? rawBody : {};
  const message = isRecord(body.message) ? body.message : body;
  const call = isRecord(message.call) ? message.call : {};
  const customer = isRecord(call.customer) ? call.customer : {};
  const toolCall = getToolCall(message);
  const nestedFunction = toolCall && isRecord(toolCall.function) ? toolCall.function : null;

  return {
    assistantId: getString(call.assistantId),
    callId: getString(call.id),
    callerNumber: getString(customer.number),
    toolCallId: getString(toolCall?.id) ?? getString(toolCall?.toolCallId),
    functionName:
      getString(toolCall?.name) ??
      getString(nestedFunction?.name) ??
      getString(message.functionName),
    parameters: parseArguments(
      toolCall?.parameters ??
        toolCall?.arguments ??
        nestedFunction?.arguments ??
        message.parameters
    ),
  };
}
