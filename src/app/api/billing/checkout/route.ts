import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateStripeCustomer, createCheckoutSession } from "@/lib/stripe";
import { logAuditEvent } from "@/lib/audit-log";
import { DEFAULT_PLAN_ID, getPlanPriceId, isPlanId, PLANS } from "@/lib/billing/plans";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_user_id", user.id)
      .single();

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const requestedPlanId = await req
      .json()
      .then((body) => (body as { planId?: unknown })?.planId)
      .catch(() => undefined);
    const planId = isPlanId(requestedPlanId) ? requestedPlanId : DEFAULT_PLAN_ID;

    const priceId = getPlanPriceId(planId, process.env);
    if (!priceId) {
      return NextResponse.json(
        { error: `${PLANS[planId].stripePriceEnvVar} not configured` },
        { status: 500 }
      );
    }

    const customerId = await getOrCreateStripeCustomer(business.id, user.email!);
    const session = await createCheckoutSession(customerId, priceId, business.id, planId);

    await logAuditEvent({
      businessId: business.id,
      actorUserId: user.id,
      eventType: "stripe.checkout_started",
      source: "stripe",
      metadata: { sessionId: session.id, planId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
