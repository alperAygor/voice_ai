import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOutboundCall } from "@/lib/vapi/client";

type AdminClient = ReturnType<typeof createAdminClient>;
type OutboundConfig = {
  vapi_assistant_id: string;
  vapi_phone_number_id: string;
};

async function getOutboundConfig(supabase: AdminClient, businessId: string): Promise<OutboundConfig> {
  const { data } = await supabase
    .from("agent_config")
    .select("vapi_assistant_id, vapi_phone_number_id")
    .eq("business_id", businessId)
    .single();

  if (!data?.vapi_assistant_id || !data?.vapi_phone_number_id) {
    throw new Error(
      "Bu işletme için Vapi assistant veya telefon numarası ID'si tanımlı değil."
    );
  }

  return {
    vapi_assistant_id: data.vapi_assistant_id,
    vapi_phone_number_id: data.vapi_phone_number_id,
  };
}

// Özellik: Kaçırılan arama geri araması. Bir çağrı "missed" veya "voicemail"
// sonucuyla bittiğinde, aynı numarayı otomatik olarak geri arar.
export async function triggerMissedCallCallback(
  businessId: string,
  originalCallId: string,
  callerNumber: string
) {
  const supabase = createAdminClient();
  const { vapi_assistant_id, vapi_phone_number_id } = await getOutboundConfig(
    supabase,
    businessId
  );

  const outboundCall = await createOutboundCall({
    assistantId: vapi_assistant_id,
    phoneNumberId: vapi_phone_number_id,
    customerNumber: callerNumber,
  });

  await supabase.from("calls").insert({
    business_id: businessId,
    vapi_call_id: outboundCall.id,
    caller_number: callerNumber,
    direction: "outbound",
    callback_of_call_id: originalCallId,
    started_at: new Date().toISOString(),
  });
}

// Özellik: Randevu hatırlatma / onay aramaları (outbound).
export async function triggerAppointmentReminderCall(appointmentId: string) {
  const supabase = createAdminClient();

  const { data: appointment, error } = await supabase
    .from("appointments")
    .select("id, business_id, customer_phone, scheduled_at, reminder_sent_at, status")
    .eq("id", appointmentId)
    .single();

  if (error || !appointment) {
    throw new Error(error?.message ?? "Randevu bulunamadı.");
  }

  if (appointment.reminder_sent_at || appointment.status !== "confirmed") {
    return;
  }

  if (!appointment.customer_phone) {
    throw new Error("Randevu için müşteri telefonu tanımlı değil.");
  }

  const { vapi_assistant_id, vapi_phone_number_id } = await getOutboundConfig(
    supabase,
    appointment.business_id
  );

  const outboundCall = await createOutboundCall({
    assistantId: vapi_assistant_id,
    phoneNumberId: vapi_phone_number_id,
    customerNumber: appointment.customer_phone,
  });

  const { data: callRow } = await supabase
    .from("calls")
    .insert({
      business_id: appointment.business_id,
      vapi_call_id: outboundCall.id,
      caller_number: appointment.customer_phone,
      direction: "outbound",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  await supabase
    .from("appointments")
    .update({
      reminder_sent_at: new Date().toISOString(),
      reminder_call_id: callRow?.id ?? null,
    })
    .eq("id", appointmentId);
}
