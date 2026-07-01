export const APPOINTMENT_SLOT_MINUTES = 120;

export type BusyPeriod = {
  start: string;
  end: string;
};

export type ScheduleException = {
  date: string;
  type: "closed" | "custom_hours";
  start_time: string | null;
  end_time: string | null;
};

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function getAppointmentWindow(scheduledAt: string): { start: Date; end: Date } {
  const start = new Date(scheduledAt);
  return { start, end: addMinutes(start, APPOINTMENT_SLOT_MINUTES) };
}

export function isSlotBusy(slotStart: Date, slotEnd: Date, busyPeriods: BusyPeriod[]): boolean {
  return busyPeriods.some((busy) => {
    const busyStart = new Date(busy.start);
    const busyEnd = new Date(busy.end);
    return slotStart < busyEnd && slotEnd > busyStart;
  });
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getMinutesSinceLocalMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function isSlotBlockedByScheduleException(
  slotStart: Date,
  slotEnd: Date,
  exceptions: ScheduleException[]
): boolean {
  const dateKey = getLocalDateKey(slotStart);
  const matchingExceptions = exceptions.filter((exception) => exception.date === dateKey);

  if (matchingExceptions.some((exception) => exception.type === "closed")) {
    return true;
  }

  const customHourExceptions = matchingExceptions.filter(
    (exception) => exception.type === "custom_hours"
  );

  if (customHourExceptions.length === 0) return false;

  const slotStartMinutes = getMinutesSinceLocalMidnight(slotStart);
  const slotEndMinutes = getMinutesSinceLocalMidnight(slotEnd);

  return !customHourExceptions.some((exception) => {
    if (!exception.start_time || !exception.end_time) return false;
    return (
      slotStartMinutes >= timeToMinutes(exception.start_time) &&
      slotEndMinutes <= timeToMinutes(exception.end_time)
    );
  });
}
