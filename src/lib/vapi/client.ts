import "server-only";
import { VAPI_LOCALE, type SupportedLanguage } from "./languages";

const VAPI_BASE_URL = "https://api.vapi.ai";

// Vapi maintains its own allow-list of supported model slugs per provider,
// which can trail the latest Anthropic releases — verify these against the
// current Vapi dashboard before relying on them in production.
const SIMPLE_MODEL = process.env.VAPI_ANTHROPIC_MODEL_SIMPLE ?? "claude-3-5-haiku-20241022";
const ESCALATED_MODEL = process.env.VAPI_ANTHROPIC_MODEL_ESCALATED ?? "claude-3-5-sonnet-20241022";

function vapiFetch(path: string, init: RequestInit) {
  const apiKey = process.env.VAPI_API_KEY;
  if (!apiKey) {
    throw new Error("VAPI_API_KEY ortam değişkeni tanımlı değil.");
  }
  return fetch(`${VAPI_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

export type VapiFunctionDef = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type VapiAssistantConfig = {
  name: string;
  systemPrompt: string;
  firstMessage: string;
  language: SupportedLanguage;
  serverUrl: string;
  functions: VapiFunctionDef[];
  escalate?: boolean;
};

function assistantPayload(config: VapiAssistantConfig) {
  return {
    name: config.name,
    firstMessage: config.firstMessage,
    model: {
      provider: "anthropic",
      model: config.escalate ? ESCALATED_MODEL : SIMPLE_MODEL,
      messages: [{ role: "system", content: config.systemPrompt }],
    },
    transcriber: {
      provider: "deepgram",
      model: "nova-3",
      language: VAPI_LOCALE[config.language],
    },
    voice: {
      provider: "deepgram",
      voiceId: "aura-athena-en",
    },
    server: {
      url: config.serverUrl,
    },
    functions: config.functions,
  };
}

export async function createAssistant(config: VapiAssistantConfig): Promise<{ id: string }> {
  const res = await vapiFetch("/assistant", {
    method: "POST",
    body: JSON.stringify(assistantPayload(config)),
  });
  if (!res.ok) {
    throw new Error(`Vapi assistant oluşturulamadı: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function updateAssistant(
  assistantId: string,
  config: VapiAssistantConfig
): Promise<{ id: string }> {
  const res = await vapiFetch(`/assistant/${assistantId}`, {
    method: "PATCH",
    body: JSON.stringify(assistantPayload(config)),
  });
  if (!res.ok) {
    throw new Error(`Vapi assistant güncellenemedi: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function createOutboundCall(params: {
  assistantId: string;
  phoneNumberId: string;
  customerNumber: string;
}): Promise<{ id: string }> {
  const res = await vapiFetch("/call", {
    method: "POST",
    body: JSON.stringify({
      assistantId: params.assistantId,
      phoneNumberId: params.phoneNumberId,
      customer: { number: params.customerNumber },
    }),
  });
  if (!res.ok) {
    throw new Error(`Vapi outbound call başlatılamadı: ${res.status} ${await res.text()}`);
  }
  return res.json();
}
