import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/stats-cards";
import { SetupChecklistPanel } from "@/components/setup-checklist";
import { CallTrendChart, OutcomePieChart } from "@/components/charts";
import {
  calculateAverageQualityScore,
  calculateConversionRate,
  extractAiImprovementInsights,
} from "@/lib/dashboard/metrics";
import { buildSetupChecklist } from "@/lib/onboarding/checklist";
import { getDashboardDictionary } from "@/lib/i18n/dashboard";
import { getRequestLocale } from "@/lib/i18n/server";
import Link from "next/link";

export default async function DashboardOverviewPage() {
  const locale = await getRequestLocale();
  const dictionary = getDashboardDictionary(locale);
  const t = dictionary.overview;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, business_hours, phone_number, google_calendar_connected, subscription_status")
    .eq("owner_user_id", user.id)
    .single();

  if (!business) return null;

  const { count: serviceCount } = await supabase
    .from("business_services")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id);

  const checklist = buildSetupChecklist({
    businessName: business.name,
    serviceCount: serviceCount ?? 0,
    hasBusinessHours: Boolean(
      business.business_hours &&
      typeof business.business_hours === "object" &&
      Object.keys(business.business_hours).length > 0
    ),
    googleCalendarConnected: business.google_calendar_connected,
    subscriptionStatus: business.subscription_status,
  });

  // Bu ayın ilk günü
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Çağrıları çek
  const { data: monthCalls } = await supabase
    .from("calls")
    .select("id, duration_seconds, cost_usd, outcome, started_at, caller_number, summary, sentiment, urgency, transcript, analysis_json")
    .eq("business_id", business.id)
    .gte("started_at", firstDayOfMonth);

  const { data: thirtyDayCalls } = await supabase
    .from("calls")
    .select("started_at, outcome, sentiment, urgency, transcript, analysis_json")
    .eq("business_id", business.id)
    .gte("started_at", thirtyDaysAgo)
    .order("started_at", { ascending: true });

  const { data: recentCalls } = await supabase
    .from("calls")
    .select("id, started_at, caller_number, duration_seconds, outcome, summary, sentiment, urgency, transcript, analysis_json")
    .eq("business_id", business.id)
    .order("started_at", { ascending: false })
    .limit(5);

  const calls = monthCalls || [];
  
  // İstatistikleri hesapla
  const totalCalls = calls.length;
  const appointmentCalls = calls.filter(c => c.outcome === "appointment_booked").length;
  const totalSeconds = calls.reduce((acc, c) => acc + (c.duration_seconds || 0), 0);
  const totalMinutes = Math.ceil(totalSeconds / 60);
  const totalCost = calls.reduce((acc, c) => acc + (Number(c.cost_usd) || 0), 0);
  const conversionRate = calculateConversionRate(totalCalls, appointmentCalls);
  const qualityScore = calculateAverageQualityScore(calls);
  const aiInsights = extractAiImprovementInsights(thirtyDayCalls ?? []);

  // Grafik verilerini hazırla - Trend
  const trendMap = new Map<string, number>();
  // Son 30 günü 0 ile doldur
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    trendMap.set(d.toISOString().slice(0, 10), 0);
  }
  
  thirtyDayCalls?.forEach(c => {
    if (c.started_at) {
      const dateStr = c.started_at.slice(0, 10);
      if (trendMap.has(dateStr)) {
        trendMap.set(dateStr, trendMap.get(dateStr)! + 1);
      }
    }
  });

  const trendData = Array.from(trendMap.entries()).map(([date, count]) => ({
    date,
    count
  }));

  // Grafik verilerini hazırla - Dağılım
  const outcomeMap = new Map<string, number>();
  thirtyDayCalls?.forEach(c => {
    if (c.outcome) {
      outcomeMap.set(c.outcome, (outcomeMap.get(c.outcome) || 0) + 1);
    }
  });

  const outcomeData = Array.from(outcomeMap.entries())
    .map(([name, value]) => ({
      name: t.outcomes[name as keyof typeof t.outcomes] || name,
      value
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="pb-10">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-950">{t.title}</h1>
      <p className="mt-1 text-sm text-gray-500">
        {t.subtitle}
      </p>

      <SetupChecklistPanel checklist={checklist} dictionary={dictionary.setupChecklist} />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatsCard title={t.stats.monthlyCalls} value={totalCalls} />
        <StatsCard title={t.stats.conversionRate} value={`${conversionRate}%`} subtitle={t.stats.appointmentSubtitle(appointmentCalls)} />
        <StatsCard title={t.stats.qualityScore} value={qualityScore ? `${qualityScore}/100` : "-"} />
        <StatsCard title={t.stats.totalMinutes} value={totalMinutes} subtitle={t.stats.totalMinutesSubtitle} />
        <StatsCard title={t.stats.estimatedCost} value={`$${totalCost.toFixed(2)}`} />
        <StatsCard title={t.stats.aiImprovement} value={aiInsights.length} subtitle={t.stats.aiImprovementSubtitle} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Trend Grafiği */}
        <div className="dashboard-card rounded-lg p-5">
          <h2 className="text-base font-medium text-gray-900 mb-4">{t.charts.callTrend}</h2>
          {trendData.length > 0 && trendData.some(d => d.count > 0) ? (
            <CallTrendChart data={trendData} />
          ) : (
            <div className="flex h-72 items-center justify-center text-sm text-gray-500">
              {t.charts.noData}
            </div>
          )}
        </div>

        {/* Dağılım Grafiği */}
        <div className="dashboard-card rounded-lg p-5">
          <h2 className="text-base font-medium text-gray-900 mb-4">{t.charts.outcomes}</h2>
          {outcomeData.length > 0 ? (
            <OutcomePieChart data={outcomeData} />
          ) : (
            <div className="flex h-72 items-center justify-center text-sm text-gray-500">
              {t.charts.noData}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card mt-8 rounded-lg p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-medium text-gray-900">{t.aiInsights.title}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {t.aiInsights.subtitle}
            </p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            {t.aiInsights.quality} {qualityScore ? `${qualityScore}/100` : "-"}
          </span>
        </div>

        {aiInsights.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {aiInsights.map((insight) => (
              <div key={insight.text} className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-gray-900">{insight.text}</p>
                  <span className="shrink-0 rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-600">
                    {insight.count} {t.aiInsights.countSuffix}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-md border border-dashed border-gray-300 p-5 text-sm text-gray-500">
            {t.aiInsights.empty}
          </div>
        )}
      </div>

      <div className="dashboard-card mt-8 overflow-hidden rounded-lg">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-medium text-gray-900">{t.recentCalls.title}</h2>
          <Link href="/dashboard/calls" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            {t.recentCalls.viewAll} &rarr;
          </Link>
        </div>
        
        {recentCalls && recentCalls.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentCalls.map(call => {
              const outcomeLabel = call.outcome
                ? (t.outcomes[call.outcome as keyof typeof t.outcomes] || call.outcome)
                : t.outcomes.unknown;
              const isSuccess = call.outcome === "appointment_booked";
              
              return (
                <div key={call.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-gray-900">{call.caller_number || t.recentCalls.unknownNumber}</span>
                    <span className="text-sm text-gray-500">
                      {call.started_at ? new Date(call.started_at).toLocaleString(locale === "tr" ? "tr-TR" : "en-US") : ""}
                    </span>
                    {call.summary && (
                      <span className="text-sm text-gray-600 line-clamp-1 max-w-md mt-1">
                        {call.summary}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      isSuccess ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {outcomeLabel}
                    </span>
                    <span className="text-xs text-gray-500">
                      {call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)} ${t.recentCalls.minute} ${call.duration_seconds % 60} ${t.recentCalls.second}` : "-"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-gray-500">
            {t.recentCalls.empty}
          </div>
        )}
      </div>
    </div>
  );
}
