import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMessage, type MessageChannel } from "@/lib/twilio/client";

export async function sendAndLogMessage(params: {
  businessId: string;
  callId?: string;
  appointmentId?: string;
  toPhone: string;
  body: string;
  channel?: MessageChannel;
}) {
  const supabase = createAdminClient();
  const channel = params.channel ?? "sms";

  try {
    const { sid } = await sendMessage(params.toPhone, params.body, channel);
    await supabase.from("sms_messages").insert({
      business_id: params.businessId,
      call_id: params.callId ?? null,
      appointment_id: params.appointmentId ?? null,
      to_phone: params.toPhone,
      body: params.body,
      status: "sent",
      twilio_sid: sid,
      channel,
    });
  } catch (err) {
    console.error("Mesaj gönderimi başarısız:", err);
    await supabase.from("sms_messages").insert({
      business_id: params.businessId,
      call_id: params.callId ?? null,
      appointment_id: params.appointmentId ?? null,
      to_phone: params.toPhone,
      body: params.body,
      status: "failed",
      channel,
    });
  }
}

export async function sendAndLogSms(params: Omit<Parameters<typeof sendAndLogMessage>[0], "channel">) {
  return sendAndLogMessage({ ...params, channel: "sms" });
}

// Tek bir mesaj gövdesini, ilgili bildirim türü için etkin olan tüm kanallara
// (SMS ve/veya WhatsApp) gönderir. WhatsApp yalnızca hem tercih açıksa hem de
// TWILIO_WHATSAPP_FROM tanımlıysa gönderilir. Kanal seçim mantığını tek yerde
// toplar; çağıranlar yalnızca hangi tercihlerin geçerli olduğunu bildirir.
export async function dispatchCustomerMessage(params: {
  businessId: string;
  callId?: string;
  appointmentId?: string;
  toPhone: string;
  body: string;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
}): Promise<{ sms: boolean; whatsapp: boolean }> {
  const whatsappAvailable = Boolean(process.env.TWILIO_WHATSAPP_FROM);
  const sendSms = params.smsEnabled;
  const sendWhatsapp = params.whatsappEnabled && whatsappAvailable;

  const shared = {
    businessId: params.businessId,
    callId: params.callId,
    appointmentId: params.appointmentId,
    toPhone: params.toPhone,
    body: params.body,
  };

  if (sendSms) {
    await sendAndLogMessage({ ...shared, channel: "sms" });
  }
  if (sendWhatsapp) {
    await sendAndLogMessage({ ...shared, channel: "whatsapp" });
  }

  return { sms: sendSms, whatsapp: sendWhatsapp };
}
