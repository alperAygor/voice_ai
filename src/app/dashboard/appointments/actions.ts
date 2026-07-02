"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { assertAppointmentSlotAvailable } from "@/lib/appointments/conflicts";
import { createCalendarEvent, isCalendarConnected } from "@/lib/google-calendar";
import { logAuditEvent } from "@/lib/audit-log";
import {
  buildAppointmentActionUrl,
  createAppointmentActionTokens,
} from "@/lib/appointments/action-tokens";
import { buildAppointmentConfirmationMessage } from "@/lib/appointments/notification-message";
import { sendAndLogMessage, sendAndLogSms } from "@/lib/notifications/sms";
import { getNotificationPreferencesForBusiness } from "@/lib/notifications/preferences-store";

export async function updateAppointmentStatus(
  appointmentId: string, 
  status: 'confirmed' | 'completed' | 'cancelled'
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");

  // Validate ownership
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_user_id", user.id)
    .single();

  if (!business) throw new Error("Business not found");

  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId)
    .eq("business_id", business.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
}

async function getOwnedBusinessId(userId: string): Promise<string> {
  const supabase = await createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_user_id", userId)
    .single();

  if (!business) throw new Error("Business not found");
  return business.id;
}

export async function createManualAppointment(
  _prevState: { error: string | null; success: boolean },
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const businessId = await getOwnedBusinessId(user.id);
  const scheduledAtRaw = String(formData.get("scheduled_at") ?? "");
  const customerName = String(formData.get("customer_name") ?? "").trim();
  const customerPhone = String(formData.get("customer_phone") ?? "").trim();
  const serviceType = String(formData.get("service_type") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!customerName || !scheduledAtRaw) {
    return { error: "Müşteri adı ve tarih/saat zorunlu.", success: false };
  }

  try {
    const scheduledAt = new Date(scheduledAtRaw).toISOString();
    const adminSupabase = createAdminClient();
    const { start, end } = await assertAppointmentSlotAvailable(
      adminSupabase,
      businessId,
      scheduledAt
    );

    let googleEventId: string | null = null;
    if (await isCalendarConnected(businessId)) {
      try {
        googleEventId = await createCalendarEvent(businessId, {
          summary: `Randevu: ${customerName} - ${serviceType || "Genel"}`,
          description: `Telefon: ${customerPhone || "-"}\nNotlar: ${notes || ""}`,
          location: address || undefined,
          start: start.toISOString(),
          end: end.toISOString(),
        }) as string;
      } catch (error) {
        console.error("Manual appointment Google Calendar event failed:", error);
      }
    }

    const { data: appointment, error } = await adminSupabase
      .from("appointments")
      .insert({
        business_id: businessId,
        customer_name: customerName,
        customer_phone: customerPhone || null,
        service_type: serviceType || null,
        scheduled_at: scheduledAt,
        address: address || null,
        notes: notes || null,
        google_calendar_event_id: googleEventId,
      })
      .select("id")
      .single();

    if (error || !appointment) throw new Error(error?.message ?? "Randevu oluşturulamadı.");

    if (customerPhone) {
      try {
        const notificationPreferences = await getNotificationPreferencesForBusiness(businessId);
        const tokens = await createAppointmentActionTokens({
          appointmentId: appointment.id,
          businessId,
        });
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const when = new Date(scheduledAt).toLocaleString("tr-TR", {
          dateStyle: "long",
          timeStyle: "short",
        });
        const body = buildAppointmentConfirmationMessage({
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

        if (notificationPreferences.smsAppointmentConfirmations) {
          await sendAndLogSms({
            businessId,
            appointmentId: appointment.id,
            toPhone: customerPhone,
            body,
          });
        }

        if (
          notificationPreferences.whatsappAppointmentConfirmations &&
          process.env.TWILIO_WHATSAPP_FROM
        ) {
          await sendAndLogMessage({
            businessId,
            appointmentId: appointment.id,
            toPhone: customerPhone,
            body,
            channel: "whatsapp",
          });
        }
      } catch (notificationError) {
        console.error("Manual appointment notification failed:", notificationError);
      }
    }

    await logAuditEvent({
      businessId,
      actorUserId: user.id,
      eventType: "appointments.manual_created",
      source: "dashboard",
      metadata: { scheduledAt, googleEventId, appointmentId: appointment.id },
    });

    revalidatePath("/dashboard/appointments");
    revalidatePath("/dashboard");
    return { error: null, success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Randevu oluşturulamadı.",
      success: false,
    };
  }
}

export async function createScheduleException(
  _prevState: { error: string | null; success: boolean },
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const businessId = await getOwnedBusinessId(user.id);
  const date = String(formData.get("date") ?? "");
  const type = String(formData.get("type") ?? "closed") as "closed" | "custom_hours";
  const startTime = String(formData.get("start_time") ?? "") || null;
  const endTime = String(formData.get("end_time") ?? "") || null;
  const reason = String(formData.get("reason") ?? "").trim();

  if (!date) {
    return { error: "Tarih zorunlu.", success: false };
  }

  if (type === "custom_hours" && (!startTime || !endTime)) {
    return { error: "Özel saat için başlangıç ve bitiş saati girilmeli.", success: false };
  }

  const { error } = await supabase.from("schedule_exceptions").insert({
    business_id: businessId,
    date,
    type,
    start_time: type === "custom_hours" ? startTime : null,
    end_time: type === "custom_hours" ? endTime : null,
    reason: reason || null,
  });

  if (error) {
    return { error: error.message, success: false };
  }

  await logAuditEvent({
    businessId,
    actorUserId: user.id,
    eventType: "schedule_exception.created",
    source: "dashboard",
    metadata: { date, type, startTime, endTime },
  });

  revalidatePath("/dashboard/appointments");
  return { error: null, success: true };
}

export async function deleteScheduleException(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const businessId = await getOwnedBusinessId(user.id);
  const exceptionId = String(formData.get("exception_id") ?? "");

  if (!exceptionId) throw new Error("Kural bulunamadı.");

  const { error } = await supabase
    .from("schedule_exceptions")
    .delete()
    .eq("id", exceptionId)
    .eq("business_id", businessId);

  if (error) throw new Error(error.message);

  await logAuditEvent({
    businessId,
    actorUserId: user.id,
    eventType: "schedule_exception.deleted",
    source: "dashboard",
    metadata: { exceptionId },
  });

  revalidatePath("/dashboard/appointments");
}
