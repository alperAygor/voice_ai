import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteCalendarEvent } from "@/lib/google-calendar";
import { logAuditEvent } from "@/lib/audit-log";

function responseHtml(title: string, message: string) {
  return `<!doctype html>
<html lang="tr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#f9fafb;color:#111827;margin:0;display:grid;min-height:100vh;place-items:center">
  <main style="max-width:520px;background:white;border:1px solid #e5e7eb;border-radius:12px;padding:28px;box-shadow:0 8px 24px rgba(15,23,42,.08)">
    <h1 style="font-size:22px;margin:0 0 8px">${title}</h1>
    <p style="font-size:15px;line-height:1.5;color:#4b5563;margin:0">${message}</p>
  </main>
</body>
</html>`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const action = url.searchParams.get("action");

  if (!token || (action !== "confirm" && action !== "cancel")) {
    return new NextResponse(responseHtml("Geçersiz bağlantı", "Randevu bağlantısı eksik veya geçersiz."), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: tokenRow } = await supabase
    .from("appointment_action_tokens")
    .select("id, appointment_id, business_id, action, expires_at, used_at")
    .eq("token", token)
    .eq("action", action)
    .maybeSingle();

  if (!tokenRow || tokenRow.used_at || tokenRow.expires_at <= now) {
    return new NextResponse(responseHtml("Bağlantı süresi dolmuş", "Bu randevu bağlantısı kullanılmış veya süresi dolmuş."), {
      status: 410,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, business_id, scheduled_at, google_calendar_event_id, status")
    .eq("id", tokenRow.appointment_id)
    .maybeSingle();

  if (!appointment) {
    return new NextResponse(responseHtml("Randevu bulunamadı", "Bu bağlantıya ait randevu artık mevcut değil."), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (action === "cancel" && appointment.google_calendar_event_id) {
    try {
      await deleteCalendarEvent(appointment.business_id, appointment.google_calendar_event_id);
    } catch (error) {
      console.error("Calendar event could not be deleted after customer cancellation:", error);
    }
  }

  await supabase
    .from("appointments")
    .update(
      action === "confirm"
        ? { customer_confirmed_at: now }
        : { status: "cancelled", customer_cancelled_at: now }
    )
    .eq("id", appointment.id);

  await supabase
    .from("appointment_action_tokens")
    .update({ used_at: now })
    .eq("id", tokenRow.id);

  await logAuditEvent({
    businessId: appointment.business_id,
    eventType: action === "confirm" ? "appointments.customer_confirmed" : "appointments.customer_cancelled",
    source: "appointment-response",
    metadata: { appointmentId: appointment.id },
  });

  const when = new Date(appointment.scheduled_at).toLocaleString("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return new NextResponse(
    responseHtml(
      action === "confirm" ? "Randevu onaylandı" : "Randevu iptal edildi",
      action === "confirm"
        ? `${when} tarihli randevunuz onaylandı. Teşekkürler.`
        : `${when} tarihli randevunuz iptal edildi.`
    ),
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
