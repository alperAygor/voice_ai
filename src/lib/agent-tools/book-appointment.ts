import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateCallRow } from "./calls";
import { dispatchCustomerMessage } from "@/lib/notifications/sms";
import { notifyOwnerOfAppointment } from "@/lib/notifications/owner";
import { isCalendarConnected, createCalendarEvent } from "@/lib/google-calendar";
import { assertAppointmentSlotAvailable } from "@/lib/appointments/conflicts";
import {
  buildAppointmentActionUrl,
  createAppointmentActionTokens,
} from "@/lib/appointments/action-tokens";
import { buildAppointmentConfirmationMessage } from "@/lib/appointments/notification-message";
import { getNotificationPreferencesForBusiness } from "@/lib/notifications/preferences-store";

export type BookAppointmentInput = {
  customer_name: string;
  customer_phone: string;
  address?: string;
  service_type?: string;
  scheduled_at: string;
  notes?: string;
};

export async function bookAppointment(
  businessId: string,
  vapiCallId: string,
  input: BookAppointmentInput
): Promise<{ appointmentId: string }> {
  const supabase = createAdminClient();

  const { start, end } = await assertAppointmentSlotAvailable(
    supabase,
    businessId,
    input.scheduled_at
  );

  const callId = await getOrCreateCallRow(
    supabase,
    businessId,
    vapiCallId,
    input.customer_phone
  );

  let googleEventId: string | null = null;
  const calendarConnected = await isCalendarConnected(businessId);

  if (calendarConnected) {
    try {
      googleEventId = await createCalendarEvent(businessId, {
        summary: `Randevu: ${input.customer_name} - ${input.service_type || 'Genel'}`,
        description: `Telefon: ${input.customer_phone}\nNotlar: ${input.notes || ''}`,
        location: input.address,
        start: start.toISOString(),
        end: end.toISOString()
      }) as string;
    } catch (err) {
      console.error("Failed to create Google Calendar event, proceeding without it", err);
    }
  }

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      business_id: businessId,
      call_id: callId,
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      address: input.address,
      service_type: input.service_type,
      scheduled_at: input.scheduled_at,
      notes: input.notes,
      google_calendar_event_id: googleEventId
    })
    .select("id")
    .single();

  if (error || !appointment) {
    throw new Error(error?.message ?? "Randevu oluşturulamadı.");
  }

  const when = new Date(input.scheduled_at).toLocaleString("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  try {
    const notificationPreferences = await getNotificationPreferencesForBusiness(businessId);
    const tokens = await createAppointmentActionTokens({
      appointmentId: appointment.id,
      businessId,
    });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const messageBody = buildAppointmentConfirmationMessage({
      whenText: when,
      confirmUrl: buildAppointmentActionUrl({
        appUrl,
        token: tokens.confirm,
        action: "confirm",
      }),
      cancelUrl: buildAppointmentActionUrl({
        appUrl,
        token: tokens.cancel,
        action: "cancel",
      }),
    });

    await dispatchCustomerMessage({
      businessId,
      callId,
      appointmentId: appointment.id,
      toPhone: input.customer_phone,
      body: messageBody,
      smsEnabled: notificationPreferences.smsAppointmentConfirmations,
      whatsappEnabled: notificationPreferences.whatsappAppointmentConfirmations,
    });
  } catch (err) {
    console.error("Müşteri randevu bildirimi gönderilemedi:", err);
  }

  try {
    await notifyOwnerOfAppointment(businessId, {
      customerName: input.customer_name,
      customerPhone: input.customer_phone,
      whenText: when,
      serviceType: input.service_type,
      address: input.address,
    });
  } catch (err) {
    console.error("İşletme sahibine randevu bildirimi gönderilemedi:", err);
  }

  return { appointmentId: appointment.id };
}
