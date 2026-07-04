import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseAdminEmails } from "@/lib/admin/access";
import { sendEmail } from "@/lib/notifications/email";
import { logEvent, getErrorMessage, type LogLevel } from "./logger";
import type { Json } from "@/lib/supabase/database.types";

// Aynı olay için art arda alarm e-postası atmamak adına pencere.
const ALERT_WINDOW_MS = 15 * 60 * 1000;

export type SystemEventInput = {
  level: LogLevel;
  event: string;
  businessId?: string | null;
  requestId?: string | null;
  message?: string;
  context?: Record<string, unknown>;
};

// context içindeki ilkel değerleri konsol log'una taşır (nesne/dizi atlanır).
function toLogFields(
  context?: Record<string, unknown>
): Record<string, string | number | boolean | null> {
  const out: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(context ?? {})) {
    if (
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      out[key] = value;
    }
  }
  return out;
}

// Aynı olay penceredeyken ilk kayıt dışında alarm bastırılır. (İlk kayıt = bizim
// eklediğimiz satır olduğundan pencere içindeki toplam > 1 ise zaten alarm gitmiş.)
export function shouldSuppressAlert(sameEventCountInWindow: number): boolean {
  return sameEventCountInWindow > 1;
}

// Kalıcı olay kaydı. Best-effort: istek yolunu asla kırmaz.
export async function recordSystemEvent(input: SystemEventInput): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("system_events").insert({
      level: input.level,
      event: input.event,
      business_id: input.businessId ?? null,
      request_id: input.requestId ?? null,
      message: input.message ?? null,
      context: (input.context ?? {}) as Json,
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    logEvent("warn", "system_event.persist_failed", {
      event: input.event,
      error: getErrorMessage(err),
    });
  }
}

// Kritik hata: konsola yapısal log + kalıcı kayıt + (kısılmış) operatör alarmı.
export async function captureError(
  event: string,
  error: unknown,
  extra: Omit<SystemEventInput, "level" | "event" | "message"> = {}
): Promise<void> {
  const message = getErrorMessage(error);

  logEvent("error", event, {
    ...toLogFields(extra.context),
    error: message,
    businessId: extra.businessId ?? undefined,
    requestId: extra.requestId ?? undefined,
  });

  await recordSystemEvent({ level: "error", event, message, ...extra });
  await maybeAlertOperator({ event, message, businessId: extra.businessId ?? null });
}

async function maybeAlertOperator(params: {
  event: string;
  message: string;
  businessId: string | null;
}): Promise<void> {
  const recipients = parseAdminEmails(process.env.ADMIN_EMAILS);
  if (recipients.length === 0 || !process.env.RESEND_API_KEY) return;

  try {
    const supabase = createAdminClient();
    const since = new Date(Date.now() - ALERT_WINDOW_MS).toISOString();
    const { count } = await supabase
      .from("system_events")
      .select("id", { count: "exact", head: true })
      .eq("event", params.event)
      .eq("level", "error")
      .gte("created_at", since);

    if (shouldSuppressAlert(count ?? 1)) return;

    const whenText = new Date().toLocaleString("tr-TR", {
      dateStyle: "long",
      timeStyle: "short",
    });
    const lines = [
      "Voxa platformunda kritik bir hata kaydedildi.",
      `Olay: ${params.event}`,
      `Mesaj: ${params.message}`,
      params.businessId ? `İşletme: ${params.businessId}` : "",
      `Zaman: ${whenText}`,
      "Detaylar için Admin → Monitoring sayfasına bakın.",
    ].filter(Boolean);

    for (const to of recipients) {
      await sendEmail({
        to,
        subject: `⚠️ Voxa hata alarmı: ${params.event}`,
        text: lines.join("\n"),
      });
    }
  } catch (err) {
    logEvent("warn", "system_event.alert_failed", {
      event: params.event,
      error: getErrorMessage(err),
    });
  }
}
