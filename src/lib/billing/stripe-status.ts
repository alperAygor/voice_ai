import type Stripe from "stripe";

export type AppSubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete";

const ACTIVE_STATUSES = new Set<Stripe.Subscription.Status>(["trialing", "active"]);

export function toAppSubscriptionStatus(
  status: Stripe.Subscription.Status
): AppSubscriptionStatus {
  if (ACTIVE_STATUSES.has(status)) return status as AppSubscriptionStatus;
  if (status === "past_due") return "past_due";
  if (status === "canceled" || status === "unpaid" || status === "paused") {
    return "canceled";
  }
  return "incomplete";
}
