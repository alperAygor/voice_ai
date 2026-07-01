import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BusinessHours } from "@/lib/business-hours";
import { isCalendarConnected, getCalendarEvents } from "@/lib/google-calendar";
import {
  APPOINTMENT_SLOT_MINUTES,
  isSlotBlockedByScheduleException,
  isSlotBusy,
  type BusyPeriod,
  type ScheduleException,
} from "./scheduling";

const DAY_KEYS: (keyof BusinessHours)[] = [
  "sun", "mon", "tue", "wed", "thu", "fri", "sat",
];

const SLOT_INTERVAL_HOURS = APPOINTMENT_SLOT_MINUTES / 60;

export async function checkAvailability(
  businessId: string,
  dateRangeStart: string,
  dateRangeEnd: string
): Promise<{ slots: string[] }> {
  const supabase = createAdminClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("business_hours")
    .eq("id", businessId)
    .single();

  const hours = (business?.business_hours ?? {}) as BusinessHours;

  const start = new Date(dateRangeStart);
  const end = new Date(dateRangeEnd);
  const rawSlots: Date[] = [];

  const { data: scheduleExceptions } = await supabase
    .from("schedule_exceptions")
    .select("date, type, start_time, end_time")
    .eq("business_id", businessId)
    .gte("date", start.toISOString().slice(0, 10))
    .lte("date", end.toISOString().slice(0, 10));

  const exceptions = (scheduleExceptions ?? []) as ScheduleException[];

  // Generate slots from business hours
  for (
    let day = new Date(start);
    day <= end && rawSlots.length < 30; // generate more since some might be filtered
    day.setDate(day.getDate() + 1)
  ) {
    const dayHours = hours[DAY_KEYS[day.getDay()]];
    if (!dayHours || dayHours.closed) continue;

    const [openHour] = dayHours.open.split(":").map(Number);
    const [closeHour] = dayHours.close.split(":").map(Number);

    for (let h = openHour; h < closeHour; h += SLOT_INTERVAL_HOURS) {
      const slot = new Date(day);
      slot.setHours(h, 0, 0, 0);
      const slotEnd = new Date(slot.getTime() + APPOINTMENT_SLOT_MINUTES * 60 * 1000);
      if (slot > new Date() && !isSlotBlockedByScheduleException(slot, slotEnd, exceptions)) {
        rawSlots.push(slot);
      }
    }
  }

  // Fetch existing appointments from our DB
  const { data: appointments } = await supabase
    .from("appointments")
    .select("scheduled_at")
    .eq("business_id", businessId)
    .gte("scheduled_at", start.toISOString())
    .lte("scheduled_at", end.toISOString())
    .in("status", ["confirmed"]);

  const busyPeriods: BusyPeriod[] = [];

  appointments?.forEach(apt => {
    const aptStart = new Date(apt.scheduled_at);
    const aptEnd = new Date(aptStart.getTime() + APPOINTMENT_SLOT_MINUTES * 60 * 1000);
    busyPeriods.push({ start: aptStart.toISOString(), end: aptEnd.toISOString() });
  });

  // Fetch Google Calendar events if connected
  const calendarConnected = await isCalendarConnected(businessId);
  if (calendarConnected) {
    try {
      const gEvents = await getCalendarEvents(businessId, start.toISOString(), end.toISOString());
      gEvents.forEach(e => {
        if (e.start && e.end) {
          busyPeriods.push({ start: e.start, end: e.end });
        }
      });
    } catch (err) {
      console.error("Failed to fetch Google Calendar events for availability check", err);
    }
  }

  // Filter slots
  const availableSlots: string[] = [];
  for (const slot of rawSlots) {
    const slotEnd = new Date(slot.getTime() + SLOT_INTERVAL_HOURS * 60 * 60 * 1000);
    if (!isSlotBusy(slot, slotEnd, busyPeriods)) {
      availableSlots.push(slot.toISOString());
    }
    if (availableSlots.length >= 10) break; // return max 10 slots to AI
  }

  return { slots: availableSlots };
}
