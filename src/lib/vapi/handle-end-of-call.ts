import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveBusinessIdByAssistant, getOrCreateCallRow } from "@/lib/agent-tools/calls";
import { triggerMissedCallCallback } from "@/lib/agent-tools/outbound";
import { dispatchCustomerMessage } from "@/lib/notifications/sms";
import { notifyOwnerOfEmergency } from "@/lib/notifications/owner";
import { getNotificationPreferencesForBusiness } from "@/lib/notifications/preferences-store";
import { analyzeCallTranscript, type CallAnalysis } from "@/lib/anthropic/call-analysis";
import { parseEndOfCallReport } from "@/lib/vapi/end-of-call-parser";
import { recordCallUsage, resolvePlanTerms } from "@/lib/billing/usage";
import type { Json } from "@/lib/supabase/database.types";

const VOICEMAIL_REASONS = ["voicemail"];
const MISSED_REASONS = ["customer-did-not-answer", "no-answer", "silence-timed-out"];

export async function handleEndOfCallReport(message: Record<string, unknown>) {
  const parsed = parseEndOfCallReport(message);

  if (!parsed.callId || !parsed.assistantId) return;

  const supabase = createAdminClient();
  const businessId = await resolveBusinessIdByAssistant(supabase, parsed.assistantId);
  if (!businessId) return;

  const callerNumber = parsed.callerNumber;
  const callId = await getOrCreateCallRow(supabase, businessId, parsed.callId, callerNumber);

  const transcript = parsed.transcript;
  const endedReason = parsed.endedReason;
  const startedAt = parsed.startedAt ? new Date(parsed.startedAt) : null;
  const endedAt = parsed.endedAt ? new Date(parsed.endedAt) : new Date();
  const durationSeconds = startedAt
    ? Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 1000))
    : null;

  let summary: string | null = null;
  let sentiment: CallAnalysis["sentiment"] | null = null;
  let urgency: CallAnalysis["urgency"] | null = null;
  let analysisJson: Json | null = null;

  if (transcript.trim().length > 0) {
    try {
      const analysis = await analyzeCallTranscript(transcript);
      summary = analysis.summary;
      sentiment = analysis.sentiment;
      urgency = analysis.urgency;
      analysisJson = {
        summary: analysis.summary,
        sentiment: analysis.sentiment,
        urgency: analysis.urgency,
        key_points: analysis.key_points,
        objections: analysis.objections,
        coaching_opportunities: analysis.coaching_opportunities,
      };
    } catch (err) {
      console.error("Görüşme analizi başarısız:", err);
    }
  }

  const { data: existingCall } = await supabase
    .from("calls")
    .select("transfer_reason")
    .eq("id", callId)
    .single();

  const { data: appointment } = await supabase
    .from("appointments")
    .select("id")
    .eq("call_id", callId)
    .maybeSingle();

  let outcome:
    | "appointment_booked"
    | "info_provided"
    | "transferred_to_human"
    | "missed"
    | "emergency_flagged"
    | "voicemail" = "info_provided";

  if (appointment) {
    outcome = "appointment_booked";
  } else if (existingCall?.transfer_reason) {
    outcome = "transferred_to_human";
  } else if (VOICEMAIL_REASONS.includes(endedReason)) {
    outcome = "voicemail";
  } else if (MISSED_REASONS.includes(endedReason)) {
    outcome = "missed";
  } else if (urgency === "emergency") {
    outcome = "emergency_flagged";
  }

  await supabase
    .from("calls")
    .update({
      transcript: transcript || null,
      summary,
      sentiment,
      urgency,
      analysis_json: analysisJson,
      outcome,
      ended_at: endedAt.toISOString(),
      duration_seconds: durationSeconds,
      cost_usd: parsed.costUsd,
      recording_url: parsed.recordingUrl,
    })
    .eq("id", callId);

  const { data: planRow } = await supabase
    .from("businesses")
    .select("plan_id")
    .eq("id", businessId)
    .maybeSingle();

  await recordCallUsage(
    supabase,
    businessId,
    durationSeconds,
    parsed.costUsd ?? 0,
    endedAt,
    resolvePlanTerms(planRow?.plan_id ?? null)
  );

  // Görüşme acil olarak işaretlendiyse işletme sahibine anlık uyarı (e-posta).
  if (outcome === "emergency_flagged") {
    try {
      await notifyOwnerOfEmergency(businessId, {
        callerNumber,
        summary,
        whenText: endedAt.toLocaleString("tr-TR", {
          dateStyle: "long",
          timeStyle: "short",
        }),
      });
    } catch (err) {
      console.error("İşletme sahibine acil durum bildirimi gönderilemedi:", err);
    }
  }

  if (!callerNumber) return;

  if (outcome === "missed" || outcome === "voicemail") {
    try {
      await triggerMissedCallCallback(businessId, callId, callerNumber);
    } catch (err) {
      console.error("Kaçırılan arama geri araması başlatılamadı:", err);
    }
    return;
  }

  if (outcome !== "appointment_booked" && summary) {
    const notificationPreferences = await getNotificationPreferencesForBusiness(businessId);
    await dispatchCustomerMessage({
      businessId,
      callId,
      toPhone: callerNumber,
      body: `Aradığınız için teşekkürler. Özet: ${summary}`,
      smsEnabled: notificationPreferences.smsCallFollowups,
      whatsappEnabled: notificationPreferences.whatsappCallFollowups,
    });
  }
}
