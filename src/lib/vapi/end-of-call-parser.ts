// Vapi end-of-call-report payload'ından alanları dayanıklı biçimde okur.
// Vapi bazı alanları köke, bazılarını `artifact`/`call` altına koyabiliyor;
// alan adları sürümler arası değişebildiğinden fallback zinciriyle okuruz.
// Saf fonksiyon — test edilebilir, I/O yok.

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstString(...values: unknown[]): string | null {
  for (const v of values) {
    if (typeof v === "string" && v) return v;
  }
  return null;
}

function firstNumber(...values: unknown[]): number | null {
  for (const v of values) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

export type ParsedEndOfCall = {
  callId: string | null;
  assistantId: string | null;
  callerNumber: string | null;
  transcript: string;
  endedReason: string;
  recordingUrl: string | null;
  costUsd: number | null;
  startedAt: string | null;
  endedAt: string | null;
};

export function parseEndOfCallReport(rawMessage: unknown): ParsedEndOfCall {
  const message = isRecord(rawMessage) ? rawMessage : {};
  const call = isRecord(message.call) ? message.call : {};
  const customer = isRecord(call.customer) ? call.customer : {};
  const artifact = isRecord(message.artifact) ? message.artifact : {};
  const recording = isRecord(artifact.recording) ? artifact.recording : {};

  return {
    callId: firstString(call.id, message.callId),
    assistantId: firstString(call.assistantId, message.assistantId),
    callerNumber: firstString(customer.number, message.customerNumber),
    transcript: firstString(message.transcript, artifact.transcript) ?? "",
    endedReason: firstString(message.endedReason, call.endedReason) ?? "",
    recordingUrl: firstString(
      message.recordingUrl,
      artifact.recordingUrl,
      recording.url,
      artifact.stereoRecordingUrl
    ),
    costUsd: firstNumber(message.cost, call.cost),
    startedAt: firstString(message.startedAt, call.startedAt),
    endedAt: firstString(message.endedAt, call.endedAt),
  };
}
