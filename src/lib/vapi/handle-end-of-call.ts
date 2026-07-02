import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveBusinessIdByAssistant, getOrCreateCallRow } from "@/lib/agent-tools/calls";
import { triggerMissedCallCallback } from "@/lib/agent-tools/outbound";
import { sendAndLogSms } from "@/lib/notifications/sms";
import { notifyOwnerOfEmergency } from "@/lib/notifications/owner";
import { getNotificationPreferencesForBusiness } from "@/lib/notifications/preferences-store";
import { analyzeCallTranscript, type CallAnalysis } from "@/lib/anthropic/call-analysis";
import { recordCallUsage } from "@/lib/billing/usage";
import type { Json } from "@/lib/supabase/database.types";

const VOICEMAIL_REASONS = ["voicemail"];
const MISSED_REASONS = ["customer-did-not-answer", "no-answer", "silence-timed-out"];

export async function handleEndOfCallReport(message: Record<string, unknown>) {
  const call = (message.call ?? {}) as {
    id?: string;
    assistantId?: string;
    customer?: { number?: string };
  };

  if (!call.id || !call.assistantId) return;

  const supabase = createAdminClient();
  const businessId = await resolveBusinessIdByAssistant(supabase, call.assistantId);
  if (!businessId) return;

  const callerNumber = call.customer?.number ?? null;
  const callId = await getOrCreateCallRow(supabase, businessId, call.id, callerNumber);

  const transcript = String(message.transcript ?? "");
  const endedReason = String(message.endedReason ?? "");
  const startedAt = message.startedAt ? new Date(String(message.startedAt)) : null;
  const endedAt = message.endedAt ? new Date(String(message.endedAt)) : new Date();
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
      cost_usd: typeof message.cost === "number" ? message.cost : null,
      recording_url: (message.recordingUrl as string | undefined) ?? null,
    })
    .eq("id", callId);

  await recordCallUsage(
    supabase,
    businessId,
    durationSeconds,
    typeof message.cost === "number" ? message.cost : 0,
    endedAt
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
    if (!notificationPreferences.smsCallFollowups) return;

    await sendAndLogSms({
      businessId,
      callId,
      toPhone: callerNumber,
      body: `Aradığınız için teşekkürler. Özet: ${summary}`,
    });
  }
}
