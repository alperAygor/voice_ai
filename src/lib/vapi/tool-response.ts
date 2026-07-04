// Vapi tool-call yanıt gövdesini üretir. İki format desteklenir:
//  - Legacy "function-call": { result }
//  - Yeni "tool-calls": { results: [{ toolCallId, result }] }
// toolCallId varsa yeni formatı kullanırız; ayrıca geriye dönük uyum için
// düz `result` alanını da ekleriz (fazladan alan zararsız).
export function buildToolCallResponse(
  result: unknown,
  toolCallId: string | null
): Record<string, unknown> {
  if (toolCallId) {
    return { results: [{ toolCallId, result }], result };
  }
  return { result };
}
