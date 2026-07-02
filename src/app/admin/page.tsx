import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getBusinessIntegrationHealth,
  type BusinessSupportRow,
} from "@/lib/admin/support-summary";

const HEALTH_STYLE = {
  healthy: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  missing: "bg-gray-100 text-gray-600",
};

export default async function AdminOverviewPage() {
  const adminSupabase = createAdminClient();

  const [businessesResult, callsResult, appointmentsResult] = await Promise.all([
    adminSupabase
      .from("businesses")
      .select(
        "id, name, phone_number, google_calendar_connected, subscription_status, stripe_customer_id, twilio_phone_number_sid, agent_config(vapi_assistant_id, vapi_phone_number_id)"
      )
      .order("created_at", { ascending: false })
      .limit(50),
    adminSupabase.from("calls").select("id", { count: "exact", head: true }),
    adminSupabase.from("appointments").select("id", { count: "exact", head: true }),
  ]);

  const businesses = (businessesResult.data ?? []) as unknown as BusinessSupportRow[];

  const stats = [
    { label: "İşletme", value: businesses.length },
    { label: "Toplam arama", value: callsResult.count ?? 0 },
    { label: "Toplam randevu", value: appointmentsResult.count ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Genel Bakış</h1>
      <p className="mt-1 text-sm text-gray-500">
        Tüm işletmeler, entegrasyon sağlığı ve operatör kontrolleri.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-medium text-gray-900">İşletmeler</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">İşletme</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Numara</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Entegrasyonlar</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {businesses.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{b.name}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {b.phone_number ?? "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {getBusinessIntegrationHealth(b).map((h) => (
                        <span
                          key={h.label}
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${HEALTH_STYLE[h.status]}`}
                        >
                          {h.label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <Link
                      href={`/admin/businesses/${b.id}`}
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Yönet
                    </Link>
                  </td>
                </tr>
              ))}
              {businesses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                    Henüz işletme yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
