import "server-only";

export {
  calculateUsageTotals,
  getBillingMonth,
  OVERAGE_RATE_USD,
  PLAN_INCLUDED_MINUTES,
  type UsageSnapshot,
  type UsageTotals,
} from "./usage-calculations";

import {
  calculateUsageTotals,
  getBillingMonth,
  type PlanUsageTerms,
  type UsageSnapshot,
  type UsageTotals,
} from "./usage-calculations";
import { getPlanDefinition, isPlanId, DEFAULT_PLAN_ID } from "./plans";

type UsageStore = {
  from: (table: "usage_billing") => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        eq: (column: string, value: string) => {
          maybeSingle: () => Promise<{ data: UsageSnapshot | null; error?: { message: string } | null }>;
        };
      };
    };
    update: (payload: UsageTotals & { updated_at: string }) => {
      eq: (column: string, value: string) => Promise<{ error?: { message: string } | null }>;
    };
    insert: (payload: UsageTotals & { business_id: string; month: string }) => Promise<{ error?: { message: string } | null }>;
  };
};

// Bir işletmenin plan_id'sinden kullanım koşullarını (dahil dakika / aşım
// ücreti) çözer. Geçersizse varsayılan plana düşer.
export function resolvePlanTerms(planId: string | null | undefined): PlanUsageTerms {
  const def = getPlanDefinition(isPlanId(planId) ? planId : DEFAULT_PLAN_ID);
  return { includedMinutes: def.includedMinutes, overageRate: def.overageRateUsd };
}

export async function recordCallUsage(
  supabase: unknown,
  businessId: string,
  durationSeconds: number | null,
  costUsd: number,
  occurredAt = new Date(),
  plan?: PlanUsageTerms
): Promise<void> {
  if (!durationSeconds || durationSeconds <= 0) return;

  const usageStore = supabase as UsageStore;
  const callMinutes = Math.ceil(durationSeconds / 60);
  const month = getBillingMonth(occurredAt);

  const { data: currentUsage, error: readError } = await usageStore
    .from("usage_billing")
    .select("id, total_minutes, total_cost_usd")
    .eq("business_id", businessId)
    .eq("month", month)
    .maybeSingle();

  if (readError) {
    throw new Error(readError.message);
  }

  const totals = calculateUsageTotals(currentUsage, callMinutes, costUsd, plan);
  const writeResult = currentUsage?.id
    ? await usageStore
        .from("usage_billing")
        .update({ ...totals, updated_at: new Date().toISOString() })
        .eq("id", currentUsage.id)
    : await usageStore
        .from("usage_billing")
        .insert({ business_id: businessId, month, ...totals });

  if (writeResult.error) {
    throw new Error(writeResult.error.message);
  }
}
