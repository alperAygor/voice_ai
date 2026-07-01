import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCalendarConnected, getCalendarEvents } from "@/lib/google-calendar";
import {
  APPOINTMENT_SLOT_MINUTES,
  addMinutes,
  getAppointmentWindow,
  isSlotBlockedByScheduleException,
  isSlotBusy,
  type BusyPeriod,
  type ScheduleException,
} from "@/lib/agent-tools/scheduling";

type AdminClient = ReturnType<typeof createAdminClient>;

export async function assertAppointmentSlotAvailable(
  supabase: AdminClient,
  businessId: string,
  scheduledAt: string
): Promise<{ start: Date; end: Date }> {
  const { start, end } = getAppointmentWindow(scheduledAt);
  const conflictSearchStart = addMinutes(start, -APPOINTMENT_SLOT_MINUTES + 1);

  const { data: scheduleExceptions } = await supabase
    .from("schedule_exceptions")
    .select("date, type, start_time, end_time")
    .eq("business_id", businessId)
    .eq("date", start.toISOString().slice(0, 10));

  if (
    isSlotBlockedByScheduleException(
      start,
      end,
      (scheduleExceptions ?? []) as ScheduleException[]
    )
  ) {
    throw new Error("Bu saat işletmenin özel kapalı saatleri dışında kalıyor.");
  }

  const { data: nearbyAppointments } = await supabase
    .from("appointments")
    .select("id, scheduled_at")
    .eq("business_id", businessId)
    .gte("scheduled_at", conflictSearchStart.toISOString())
    .lt("scheduled_at", end.toISOString())
    .in("status", ["confirmed"]);

  const busyPeriods: BusyPeriod[] = (nearbyAppointments ?? []).map((appointment) => {
    const appointmentStart = new Date(appointment.scheduled_at);
    return {
      start: appointmentStart.toISOString(),
      end: addMinutes(appointmentStart, APPOINTMENT_SLOT_MINUTES).toISOString(),
    };
  });

  if (await isCalendarConnected(businessId)) {
    try {
      const events = await getCalendarEvents(businessId, start.toISOString(), end.toISOString());
      events.forEach((event) => {
        if (event.start && event.end) busyPeriods.push({ start: event.start, end: event.end });
      });
    } catch (error) {
      console.error("Google Calendar conflicts could not be checked:", error);
    }
  }

  if (isSlotBusy(start, end, busyPeriods)) {
    throw new Error("Bu saat için zaten bir randevu bulunuyor. Lütfen başka bir saat seçin.");
  }

  return { start, end };
}
