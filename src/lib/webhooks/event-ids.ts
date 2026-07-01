export function getVapiEndOfCallEventId(callId: string): string {
  return `${callId}:end-of-call-report`;
}
