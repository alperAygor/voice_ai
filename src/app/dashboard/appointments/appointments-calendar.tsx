import type {
  DashboardAppointment,
  DashboardScheduleException,
} from "@/lib/dashboard/types";
import { deleteScheduleException } from "./actions";

const DAY_COUNT = 7;

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function AppointmentsCalendar({
  appointments,
  scheduleExceptions,
}: {
  appointments: DashboardAppointment[];
  scheduleExceptions: DashboardScheduleException[];
}) {
  const start = startOfToday();
  const days = Array.from({ length: DAY_COUNT }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-base font-medium text-gray-900">7 Günlük Takvim</h2>
      </div>
      <div className="grid grid-cols-1 divide-y divide-gray-200 lg:grid-cols-7 lg:divide-x lg:divide-y-0">
        {days.map((day) => {
          const key = dateKey(day);
          const dayAppointments = appointments.filter(
            (appointment) => appointment.scheduled_at.slice(0, 10) === key
          );
          const dayExceptions = scheduleExceptions.filter((exception) => exception.date === key);

          return (
            <div key={key} className="min-h-48 p-3">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  {day.toLocaleDateString("tr-TR", { weekday: "short" })}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {day.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                </p>
              </div>

              <div className="mt-3 space-y-2">
                {dayExceptions.map((exception) => (
                  <div key={exception.id} className="rounded-md border border-red-100 bg-red-50 px-2 py-1 text-xs text-red-700">
                    <div>
                      {exception.type === "closed"
                        ? "Kapalı"
                        : `${exception.start_time?.slice(0, 5)}-${exception.end_time?.slice(0, 5)} açık`}
                      {exception.reason ? ` • ${exception.reason}` : ""}
                    </div>
                    <form action={deleteScheduleException} className="mt-1">
                      <input type="hidden" name="exception_id" value={exception.id} />
                      <button type="submit" className="font-medium text-red-800 hover:text-red-600">
                        Sil
                      </button>
                    </form>
                  </div>
                ))}

                {dayAppointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-md border border-indigo-100 bg-indigo-50 px-2 py-2 text-xs">
                    <p className="font-medium text-indigo-950">
                      {new Date(appointment.scheduled_at).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      {appointment.customer_name}
                    </p>
                    <p className="mt-1 truncate text-indigo-700">
                      {appointment.service_type || appointment.customer_phone || "Genel"}
                    </p>
                  </div>
                ))}

                {dayAppointments.length === 0 && dayExceptions.length === 0 && (
                  <p className="pt-2 text-xs text-gray-400">Boş</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
