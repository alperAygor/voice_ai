// Sağlık durumu özeti — saf ve test edilebilir tutulur (I/O yok).
export type HealthCheck = {
  key: string;
  ok: boolean;
  // Kritik kontroller düşerse servis "down" sayılır (503). Kritik olmayanlar
  // yalnızca "degraded"a düşürür (örn. opsiyonel bir entegrasyon anahtarı yok).
  critical: boolean;
};

export type HealthStatus = "ok" | "degraded" | "down";

export function summarizeHealth(checks: HealthCheck[]): HealthStatus {
  if (checks.some((c) => c.critical && !c.ok)) return "down";
  if (checks.some((c) => !c.ok)) return "degraded";
  return "ok";
}

export function healthHttpStatus(status: HealthStatus): number {
  return status === "down" ? 503 : 200;
}
