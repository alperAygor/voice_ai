import { createAdminClient } from "@/lib/supabase/admin";
import { summarizeHealth, type HealthCheck, type HealthStatus } from "@/lib/monitoring/health";

export const dynamic = "force-dynamic";

const LEVEL_STYLE: Record<"info" | "warn" | "error", string> = {
  info: "bg-gray-100 text-gray-700",
  warn: "bg-amber-100 text-amber-800",
  error: "bg-red-100 text-red-800",
};

const STATUS_STYLE: Record<HealthStatus, { label: string; className: string }> = {
  ok: { label: "Sağlıklı", className: "bg-green-100 text-green-800" },
  degraded: { label: "Kısmi", className: "bg-amber-100 text-amber-800" },
  down: { label: "Kritik", className: "bg-red-100 text-red-800" },
};

type SystemEventRow = {
  id: string;
  level: "info" | "warn" | "error";
  event: string;
  message: string | null;
  business_id: string | null;
  created_at: string;
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// Date.now() render içinde saf-olmayan sayılıyor (React Compiler); modül
// kapsamında bir yardımcıya taşındı.
function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export default async function AdminMonitoringPage() {
  const supabase = createAdminClient();
  const since24h = isoHoursAgo(24);

  const [
    dbPing,
    recentEvents,
    errorCount,
    warnCount,
    webhookFailedCount,
    webhookTotalCount,
  ] = await Promise.all([
    supabase.from("businesses").select("id", { count: "exact", head: true }),
    supabase
      .from("system_events")
      .select("id, level, event, message, business_id, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("system_events")
      .select("id", { count: "exact", head: true })
      .eq("level", "error")
      .gte("created_at", since24h),
    supabase
      .from("system_events")
      .select("id", { count: "exact", head: true })
      .eq("level", "warn")
      .gte("created_at", since24h),
    supabase
      .from("webhook_events")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed")
      .gte("created_at", since24h),
    supabase
      .from("webhook_events")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since24h),
  ]);

  const database = !dbPing.error;
  const events = (recentEvents.data ?? []) as SystemEventRow[];

  const checks: HealthCheck[] = [
    { key: "database", ok: database, critical: true },
    { key: "env.supabaseUrl", ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL), critical: true },
    { key: "env.appUrl", ok: Boolean(process.env.NEXT_PUBLIC_APP_URL), critical: true },
    { key: "env.vapiApiKey", ok: Boolean(process.env.VAPI_API_KEY), critical: true },
    { key: "env.vapiWebhookSecret", ok: Boolean(process.env.VAPI_WEBHOOK_SECRET), critical: false },
    { key: "env.anthropicApiKey", ok: Boolean(process.env.ANTHROPIC_API_KEY), critical: false },
    {
      key: "env.twilio",
      ok: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      critical: false,
    },
    { key: "env.resend", ok: Boolean(process.env.RESEND_API_KEY), critical: false },
    { key: "env.stripeWebhookSecret", ok: Boolean(process.env.STRIPE_WEBHOOK_SECRET), critical: false },
  ];
  const status = summarizeHealth(checks);
  const statusBadge = STATUS_STYLE[status];

  const stats = [
    { label: "24s hata", value: errorCount.count ?? 0, tone: (errorCount.count ?? 0) > 0 },
    { label: "24s uyarı", value: warnCount.count ?? 0, tone: false },
    {
      label: "24s webhook (hatalı)",
      value: `${webhookTotalCount.count ?? 0} (${webhookFailedCount.count ?? 0})`,
      tone: (webhookFailedCount.count ?? 0) > 0,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Monitoring</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sistem sağlığı, son 24 saat metrikleri ve kalıcı olay günlüğü.
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusBadge.className}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* Metrikler */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p
              className={`mt-1 text-2xl font-semibold ${
                s.tone ? "text-red-600" : "text-gray-900"
              }`}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Sağlık kontrolleri */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-base font-medium text-gray-900">Sağlık kontrolleri</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {checks.map((c) => (
            <span
              key={c.key}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                c.ok
                  ? "bg-green-100 text-green-800"
                  : c.critical
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800"
              }`}
            >
              {c.key} {c.ok ? "✓" : c.critical ? "✕" : "—"}
            </span>
          ))}
        </div>
      </div>

      {/* Olay günlüğü */}
      <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-medium text-gray-900">Son olaylar</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            En yeni 50 kayıt. Yalnızca operatör görür.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Seviye</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Olay</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Mesaj</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Zaman</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${LEVEL_STYLE[e.level]}`}
                    >
                      {e.level}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 font-mono text-xs text-gray-700">
                    {e.event}
                  </td>
                  <td className="max-w-md truncate px-6 py-3 text-sm text-gray-600" title={e.message ?? ""}>
                    {e.message ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-xs text-gray-500">
                    {formatTime(e.created_at)}
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                    Henüz kayıtlı olay yok. Kritik hatalar burada görünür.
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
