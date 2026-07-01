import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupportAdmin } from "@/lib/admin/access";
import { getBusinessIntegrationHealth, type BusinessSupportRow } from "@/lib/admin/support-summary";

const HEALTH_STYLE = {
  healthy: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  missing: "bg-gray-100 text-gray-700",
};

export default async function SupportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!isSupportAdmin(user.email)) redirect("/dashboard");

  const adminSupabase = createAdminClient();

  const [
    businessesResult,
    callsResult,
    appointmentsResult,
    auditResult,
  ] = await Promise.all([
    adminSupabase
      .from("businesses")
      .select("id, name, phone_number, google_calendar_connected, subscription_status, stripe_customer_id, twilio_phone_number_sid, agent_config(vapi_assistant_id, vapi_phone_number_id)")
      .order("created_at", { ascending: false })
      .limit(25),
    adminSupabase
      .from("calls")
      .select("id", { count: "exact", head: true }),
    adminSupabase
      .from("appointments")
      .select("id", { count: "exact", head: true }),
    adminSupabase
      .from("audit_events")
      .select("id, business_id, event_type, severity, source, created_at")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  const businesses = (businessesResult.data ?? []) as unknown as BusinessSupportRow[];
  const auditEvents = auditResult.data ?? [];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Support Panel</h1>
            <p className="mt-1 text-sm text-gray-500">
              İşletme kurulumları, entegrasyon sağlığı ve son sistem olayları.
            </p>
          </div>
          <Link href="/dashboard" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
            Dashboard
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">İşletme</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{businesses.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Toplam arama</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{callsResult.count ?? 0}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Toplam randevu</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{appointmentsResult.count ?? 0}</p>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-medium text-gray-900">İşletmeler</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">İşletme</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Telefon</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Abonelik</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Entegrasyonlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {businesses.map((business) => (
                  <tr key={business.id}>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{business.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{business.phone_number ?? "-"}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{business.subscription_status}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {getBusinessIntegrationHealth(business).map((item) => (
                          <span key={item.label} className={`rounded-full px-2 py-1 text-xs font-medium ${HEALTH_STYLE[item.status]}`}>
                            {item.label}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-medium text-gray-900">Son Audit Olayları</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {auditEvents.length > 0 ? auditEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{event.event_type}</p>
                  <p className="text-gray-500">{event.source} • {event.business_id ?? "global"}</p>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    event.severity === "error" ? "bg-red-100 text-red-800" : event.severity === "warning" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-700"
                  }`}>
                    {event.severity}
                  </span>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(event.created_at).toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>
            )) : (
              <div className="px-5 py-8 text-sm text-gray-500">Henüz audit olayı yok.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
