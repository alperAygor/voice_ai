import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateUsageTotals,
  getBillingMonth,
  OVERAGE_RATE_USD,
  PLAN_INCLUDED_MINUTES,
} from "../src/lib/billing/usage-calculations";
import {
  DEFAULT_PLAN,
  DEFAULT_PLAN_ID,
  getPlanDefinition,
  getPlanPriceId,
  isPlanId,
  planHasWhatsappSms,
} from "../src/lib/billing/plans";
import { toAppSubscriptionStatus } from "../src/lib/billing/stripe-status";

test("getBillingMonth returns the UTC month bucket used by usage_billing.month", () => {
  assert.equal(getBillingMonth(new Date("2026-07-31T23:59:59.000Z")), "2026-07-01");
  assert.equal(getBillingMonth(new Date("2026-08-01T00:00:00.000Z")), "2026-08-01");
});

test("calculateUsageTotals rolls minutes, cost, included minutes, and overage forward", () => {
  const totals = calculateUsageTotals(
    { total_minutes: "198", total_cost_usd: "12.3456" },
    5,
    1.2345
  );

  assert.deepEqual(totals, {
    total_minutes: 203,
    total_cost_usd: 13.5801,
    plan_included_minutes: PLAN_INCLUDED_MINUTES,
    overage_minutes: 3,
    overage_cost_usd: 3 * OVERAGE_RATE_USD,
  });
});

test("usage calculation defaults stay aligned with the canonical starter plan", () => {
  assert.equal(DEFAULT_PLAN_ID, "starter");
  assert.equal(PLAN_INCLUDED_MINUTES, DEFAULT_PLAN.includedMinutes);
  assert.equal(OVERAGE_RATE_USD, DEFAULT_PLAN.overageRateUsd);
});

test("plan helpers validate plan ids, feature gates, and Stripe price envs", () => {
  assert.equal(isPlanId("starter"), true);
  assert.equal(isPlanId("enterprise"), false);
  assert.equal(planHasWhatsappSms("starter"), false);
  assert.equal(planHasWhatsappSms("pro"), true);
  assert.equal(getPlanDefinition("pro").includedMinutes, 500);
  assert.equal(
    getPlanPriceId("starter", {
      STRIPE_PRICE_ID_STARTER: "price_starter",
      STRIPE_PRICE_ID_PRO: "price_pro",
    }),
    "price_starter"
  );
  assert.equal(getPlanPriceId("pro", { STRIPE_PRICE_ID_PRO: "   " }), null);
});

test("toAppSubscriptionStatus maps Stripe-only statuses into database enum values", () => {
  assert.equal(toAppSubscriptionStatus("active"), "active");
  assert.equal(toAppSubscriptionStatus("trialing"), "trialing");
  assert.equal(toAppSubscriptionStatus("past_due"), "past_due");
  assert.equal(toAppSubscriptionStatus("unpaid"), "canceled");
  assert.equal(toAppSubscriptionStatus("paused"), "canceled");
  assert.equal(toAppSubscriptionStatus("incomplete_expired"), "incomplete");
});
