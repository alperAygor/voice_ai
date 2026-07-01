import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { triggerAppointmentReminderCall } from "@/lib/agent-tools/outbound";

const REMINDER_WINDOW_HOURS = 24;

// Vercel Cron her saat başı bu route'u çağırır (bkz. vercel.json).
// Randevusuna ~24 saat kalan ve henüz hatırlatma araması yapılmamış
// randevular için otomatik hatırlatma/onay araması başlatır.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const windowStart = new Date();
  const windowEnd = new Date(Date.now() + REMINDER_WINDOW_HOURS * 60 * 60 * 1000);

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("id")
    .eq("status", "confirmed")
    .is("reminder_sent_at", null)
    .gte("scheduled_at", windowStart.toISOString())
    .lte("scheduled_at", windowEnd.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = await Promise.allSettled(
    (appointments ?? []).map((a) => triggerAppointmentReminderCall(a.id))
  );

  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({
    processed: results.length,
    failed,
  });
}
