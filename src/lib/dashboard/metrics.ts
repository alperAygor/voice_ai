import type { CallOutcome, CallSentiment, CallUrgency } from "./types";

export type AnalysisJson = {
  key_points?: string[];
  objections?: string[];
  coaching_opportunities?: string[];
};

export type DashboardMetricCall = {
  outcome: CallOutcome | null;
  sentiment: CallSentiment | null;
  urgency: CallUrgency | null;
  transcript?: string | null;
  analysis_json?: unknown;
};

export type AiImprovementInsight = {
  text: string;
  count: number;
};

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function parseAnalysisJson(value: unknown): AnalysisJson {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const record = value as Record<string, unknown>;
  return {
    key_points: Array.isArray(record.key_points)
      ? record.key_points.filter((item): item is string => typeof item === "string")
      : [],
    objections: Array.isArray(record.objections)
      ? record.objections.filter((item): item is string => typeof item === "string")
      : [],
    coaching_opportunities: Array.isArray(record.coaching_opportunities)
      ? record.coaching_opportunities.filter((item): item is string => typeof item === "string")
      : [],
  };
}

export function calculateConversionRate(totalCalls: number, appointmentCalls: number): number {
  if (totalCalls <= 0) return 0;
  return Math.round((appointmentCalls / totalCalls) * 100);
}

export function calculateCallQualityScore(call: DashboardMetricCall): number {
  const analysis = parseAnalysisJson(call.analysis_json);
  let score = 70;

  switch (call.outcome) {
    case "appointment_booked":
      score += 20;
      break;
    case "info_provided":
      score += 10;
      break;
    case "transferred_to_human":
      score += 5;
      break;
    case "emergency_flagged":
      score += 5;
      break;
    case "missed":
    case "voicemail":
      score -= 25;
      break;
    default:
      score -= 5;
  }

  if (call.sentiment === "positive") score += 10;
  if (call.sentiment === "negative") score -= 15;

  if ((call.urgency === "high" || call.urgency === "emergency") && call.outcome === "info_provided") {
    score -= 10;
  }

  if (!call.transcript?.trim()) score -= 8;
  score -= Math.min(20, (analysis.coaching_opportunities?.length ?? 0) * 5);
  score -= Math.min(10, (analysis.objections?.length ?? 0) * 3);

  return clampScore(score);
}

export function calculateAverageQualityScore(calls: DashboardMetricCall[]): number {
  if (calls.length === 0) return 0;
  const total = calls.reduce((sum, call) => sum + calculateCallQualityScore(call), 0);
  return Math.round(total / calls.length);
}

export function extractAiImprovementInsights(
  calls: DashboardMetricCall[],
  limit = 5
): AiImprovementInsight[] {
  const counts = new Map<string, number>();

  calls.forEach((call) => {
    const analysis = parseAnalysisJson(call.analysis_json);
    analysis.coaching_opportunities?.forEach((item) => {
      const normalized = item.trim();
      if (!normalized) return;
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    });

    if (call.sentiment === "negative") {
      counts.set("Olumsuz görüşmelerde daha erken güven verme ve net çözüm sunma", (counts.get("Olumsuz görüşmelerde daha erken güven verme ve net çözüm sunma") ?? 0) + 1);
    }

    if ((call.urgency === "high" || call.urgency === "emergency") && call.outcome === "info_provided") {
      counts.set("Yüksek aciliyetli çağrılarda insan transferi veya hızlı aksiyon kuralını güçlendirme", (counts.get("Yüksek aciliyetli çağrılarda insan transferi veya hızlı aksiyon kuralını güçlendirme") ?? 0) + 1);
    }
  });

  return Array.from(counts.entries())
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count || a.text.localeCompare(b.text))
    .slice(0, limit);
}
