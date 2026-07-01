import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createBillingPortalSession } from "@/lib/stripe";
import { logAuditEvent } from "@/lib/audit-log";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("id, stripe_customer_id")
      .eq("owner_user_id", user.id)
      .single();

    if (!business || !business.stripe_customer_id) {
      return NextResponse.json({ error: "Stripe customer not found" }, { status: 400 });
    }

    const session = await createBillingPortalSession(business.stripe_customer_id);

    await logAuditEvent({
      businessId: business.id,
      actorUserId: user.id,
      eventType: "stripe.portal_opened",
      source: "stripe",
      metadata: { sessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Portal error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
