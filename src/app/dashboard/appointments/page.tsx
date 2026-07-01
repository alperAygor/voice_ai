import { createClient } from "@/lib/supabase/server";
import { AppointmentsList } from "./appointments-list";
import { ManualAppointmentForm } from "./manual-appointment-form";
import { ScheduleExceptionForm } from "./schedule-exception-form";
import { AppointmentsCalendar } from "./appointments-calendar";

export default async function AppointmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_user_id", user.id)
    .single();

  if (!business) return null;

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("business_id", business.id)
    .order("scheduled_at", { ascending: false });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);

  const { data: scheduleExceptions } = await supabase
    .from("schedule_exceptions")
    .select("*")
    .eq("business_id", business.id)
    .gte("date", today.toISOString().slice(0, 10))
    .lt("date", sevenDaysLater.toISOString().slice(0, 10))
    .order("date", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-semibold">Randevular</h1>
      <p className="mt-1 text-sm text-gray-500">
        AI ve manuel oluşturulan randevuları, kapalı günleri ve takvim akışını yönetin.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ManualAppointmentForm />
        <ScheduleExceptionForm />
      </div>

      <div className="mt-8">
        <AppointmentsCalendar
          appointments={appointments ?? []}
          scheduleExceptions={scheduleExceptions ?? []}
        />
      </div>

      <div className="mt-8">
        {(appointments?.length ?? 0) > 0 ? (
          <AppointmentsList initialAppointments={appointments ?? []} />
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            Henüz kayıtlı bir randevu yok.
          </div>
        )}
      </div>
    </div>
  );
}
