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
import Link from "next/link";

export default async function DashboardOverviewPage() {
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

  const { data: agentConfig } = await supabase
    .from("agent_config")
    .select("vapi_assistant_id, vapi_phone_number_id")
    .eq("business_id", business.id)
    .maybeSingle();

  const checklist = buildSetupChecklist({
    businessName: business.name,
    serviceCount: serviceCount ?? 0,
    hasBusinessHours: Boolean(
      business.business_hours &&
      typeof business.business_hours === "object" &&
      Object.keys(business.business_hours).length > 0
    ),
    vapiAssistantId: agentConfig?.vapi_assistant_id,
    phoneNumber: business.phone_number,
    vapiPhoneNumberId: agentConfig?.vapi_phone_number_id,
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

  const OUTCOME_LABELS: Record<string, string> = {
    appointment_booked: "Randevu",
    info_provided: "Bilgi verildi",
    transferred_to_human: "İnsana aktarıldı",
    missed: "Cevapsız",
    emergency_flagged: "Acil",
    voicemail: "Sesli mesaj"
  };

  const outcomeData = Array.from(outcomeMap.entries())
    .map(([name, value]) => ({
      name: OUTCOME_LABELS[name] || name,
      value
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div>
      <h1 className="text-xl font-semibold">Genel Bakış</h1>
      <p className="mt-1 text-sm text-gray-500">
        İşletmenizin VoiceAI performansı.
      </p>

      <SetupChecklistPanel checklist={checklist} />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatsCard title="Bu ay gelen arama" value={totalCalls} />
        <StatsCard title="Dönüşüm oranı" value={`${conversionRate}%`} subtitle={`${appointmentCalls} randevu`} />
        <StatsCard title="Çağrı kalite skoru" value={qualityScore ? `${qualityScore}/100` : "-"} />
        <StatsCard title="Toplam dakika" value={totalMinutes} subtitle="Bu ay kullanılan" />
        <StatsCard title="Tahmini maliyet" value={`$${totalCost.toFixed(2)}`} />
        <StatsCard title="AI iyileştirme" value={aiInsights.length} subtitle="Son 30 gün sinyali" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Trend Grafiği */}
        <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-medium text-gray-900 mb-4">Arama Trendi (Son 30 Gün)</h2>
          {trendData.length > 0 && trendData.some(d => d.count > 0) ? (
            <CallTrendChart data={trendData} />
          ) : (
            <div className="flex h-72 items-center justify-center text-sm text-gray-500">
              Yeterli veri yok
            </div>
          )}
        </div>

        {/* Dağılım Grafiği */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-medium text-gray-900 mb-4">Arama Sonuçları</h2>
          {outcomeData.length > 0 ? (
            <OutcomePieChart data={outcomeData} />
          ) : (
            <div className="flex h-72 items-center justify-center text-sm text-gray-500">
              Yeterli veri yok
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-medium text-gray-900">AI İyileştirme Alanları</h2>
            <p className="mt-1 text-sm text-gray-500">
              Son 30 gündeki analizlerden tekrarlayan koçluk fırsatları.
            </p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            Kalite {qualityScore ? `${qualityScore}/100` : "-"}
          </span>
        </div>

        {aiInsights.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {aiInsights.map((insight) => (
              <div key={insight.text} className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-gray-900">{insight.text}</p>
                  <span className="shrink-0 rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-600">
                    {insight.count} kez
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-md border border-dashed border-gray-300 p-5 text-sm text-gray-500">
            Henüz belirgin bir AI iyileştirme sinyali yok.
          </div>
        )}
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-medium text-gray-900">Son Aramalar</h2>
          <Link href="/dashboard/calls" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Tümünü Gör &rarr;
          </Link>
        </div>
        
        {recentCalls && recentCalls.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentCalls.map(call => {
              const outcomeLabel = call.outcome ? (OUTCOME_LABELS[call.outcome] || call.outcome) : "Bilinmiyor";
              const isSuccess = call.outcome === "appointment_booked";
              
              return (
                <div key={call.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-gray-900">{call.caller_number || "Bilinmeyen numara"}</span>
                    <span className="text-sm text-gray-500">
                      {call.started_at ? new Date(call.started_at).toLocaleString("tr-TR") : ""}
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
                      {call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)} dk ${call.duration_seconds % 60} sn` : "-"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-gray-500">
            Henüz bağlı bir sesli AI agent&apos;ın yok. Agent Ayarları sayfasından kurulumu tamamladığında aramalar burada görünecek.
          </div>
        )}
      </div>
    </div>
  );
}
