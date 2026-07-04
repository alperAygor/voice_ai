export type LogLevel = "info" | "warn" | "error";

type LogFields = Record<string, string | number | boolean | null | undefined>;

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export function logEvent(level: LogLevel, event: string, fields: LogFields = {}) {
  const payload = {
    level,
    event,
    service: "voice-ai",
    timestamp: new Date().toISOString(),
    ...compact(fields),
  };

  // Vercel Runtime Logs parse JSON payloads well, so keep each event single-line.
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.info(line);
  }
}

function compact(fields: LogFields): LogFields {
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined)
  ) as LogFields;
}
