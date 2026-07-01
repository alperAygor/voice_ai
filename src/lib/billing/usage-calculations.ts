export const PLAN_INCLUDED_MINUTES = 300;
export const OVERAGE_RATE_USD = 1.5;

export type UsageSnapshot = {
  id?: string;
  total_minutes?: number | string | null;
  total_cost_usd?: number | string | null;
};

export type UsageTotals = {
  total_minutes: number;
  total_cost_usd: number;
  plan_included_minutes: number;
  overage_minutes: number;
  overage_cost_usd: number;
};

function toNumber(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getBillingMonth(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

export function calculateUsageTotals(
  currentUsage: UsageSnapshot | null,
  callMinutes: number,
  callCostUsd: number
): UsageTotals {
  const totalMinutes = toNumber(currentUsage?.total_minutes) + callMinutes;
  const totalCostUsd = toNumber(currentUsage?.total_cost_usd) + callCostUsd;
  const overageMinutes = Math.max(0, totalMinutes - PLAN_INCLUDED_MINUTES);

  return {
    total_minutes: totalMinutes,
    total_cost_usd: Number(totalCostUsd.toFixed(4)),
    plan_included_minutes: PLAN_INCLUDED_MINUTES,
    overage_minutes: overageMinutes,
    overage_cost_usd: Number((overageMinutes * OVERAGE_RATE_USD).toFixed(2)),
  };
}
