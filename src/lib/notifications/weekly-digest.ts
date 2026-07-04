import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "./email";
import { buildWeeklyDigestEmail } from "./weekly-digest-format";
import { logEvent, getErrorMessage } from "@/lib/monitoring/logger";
import type { CallOutcome } from "@/lib/dashboard/types";

type AdminClient = ReturnType<typeof createAdminClient>;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

async function countCalls(
  supabase: AdminClient,
  businessId: string,
  sinceIso: string,
  outcomes?: CallOutcome[]
): Promise<number> {
  let query = supabase
    .from("calls")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .gte("started_at", sinceIso);
  if (outcomes) {
    query = query.in("outcome", outcomes);
  }
  const { count } = await query;
  return count ?? 0;
}

async function getOwnerEmail(
  supabase: AdminClient,
  ownerUserId: string | null
): Promise<string | null> {
  if (!ownerUserId) return null;
  const { data, error } = await supabase.auth.admin.getUserById(ownerUserId);
  if (error) return null;
  return data.user?.email ?? null;
}

function formatPeriod(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  return `${fmt(start)} – ${fmt(end)}`;
}

// Tüm işletmeler için haftalık özet e-postası gönderir. En az 1 çağrısı olmayan
// işletmeler atlanır (sessiz haftalarda spam olmasın). Best-effort: bir işletme
// hata verirse diğerleri etkilenmez.
export async function sendWeeklyDigests(
  now: Date = new Date()
): Promise<{ sent: number; skipped: number }> {
  const supabase = createAdminClient();
  const since = new Date(now.getTime() - WEEK_MS);
  const sinceIso = since.toISOString();
  const periodLabel = formatPeriod(since, now);

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, name, owner_user_id");

  if (error) {
    logEvent("warn", "weekly_digest.list_failed", { error: error.message });
    return { sent: 0, skipped: 0 };
  }

  let sent = 0;
  let skipped = 0;

  for (const business of businesses ?? []) {
    try {
      const totalCalls = await countCalls(supabase, business.id, sinceIso);
      if (totalCalls === 0) {
        skipped++;
        continue;
      }

      const email = await getOwnerEmail(supabase, business.owner_user_id);
      if (!email) {
        skipped++;
        continue;
      }

      const [appointmentsResult, missedCalls, emergencies] = await Promise.all([
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("business_id", business.id)
          .gte("created_at", sinceIso),
        countCalls(supabase, business.id, sinceIso, ["missed", "voicemail"]),
        countCalls(supabase, business.id, sinceIso, ["emergency_flagged"]),
      ]);

      const { subject, text, html } = buildWeeklyDigestEmail({
        businessName: business.name,
        periodLabel,
        totalCalls,
        appointmentsBooked: appointmentsResult.count ?? 0,
        missedCalls,
        emergencies,
      });

      const ok = await sendEmail({ to: email, subject, text, html });
      if (ok) sent++;
      else skipped++;
    } catch (err) {
      logEvent("warn", "weekly_digest.business_failed", {
        businessId: business.id,
        error: getErrorMessage(err),
      });
      skipped++;
    }
  }

  logEvent("info", "weekly_digest.completed", { sent, skipped });
  return { sent, skipped };
}
