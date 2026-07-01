import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { toAppSubscriptionStatus } from "@/lib/billing/stripe-status";
import { logAuditEvent } from "@/lib/audit-log";
import {
  claimWebhookEvent,
  markWebhookEventFailed,
  markWebhookEventProcessed,
} from "@/lib/webhooks/idempotency";
import Stripe from "stripe";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

function getCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | null {
  return typeof customer === "string" ? customer : customer?.id ?? null;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: unknown) {
    console.error("Webhook signature verification failed:", getErrorMessage(error));
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const claim = await claimWebhookEvent({
    provider: "stripe",
    eventId: event.id,
    eventType: event.type,
  });

  if (!claim.acquired) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const businessId = session.metadata?.businessId || session.client_reference_id;
        const customerId = getCustomerId(session.customer);

        if (businessId) {
          await supabase
            .from("businesses")
            .update({
              subscription_status: "active",
              stripe_customer_id: customerId,
            })
            .eq("id", businessId);

          await logAuditEvent({
            businessId,
            eventType: "stripe.checkout_completed",
            source: "stripe",
            metadata: {
              sessionId: session.id,
              customerId,
              subscriptionId: typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null,
            },
          });
        }
        break;
      }
      
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = getCustomerId(subscription.customer);
        if (!customerId) break;

        const { data: business } = await supabase
          .from("businesses")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        await supabase
          .from("businesses")
          .update({
            subscription_status: toAppSubscriptionStatus(subscription.status),
            stripe_subscription_id: subscription.id,
          })
          .eq("stripe_customer_id", customerId);

        await logAuditEvent({
          businessId: business?.id ?? null,
          eventType: `stripe.${event.type}`,
          source: "stripe",
          metadata: {
            customerId,
            subscriptionId: subscription.id,
            status: subscription.status,
          },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = getCustomerId(invoice.customer);
        if (!customerId) break;

        const { data: business } = await supabase
          .from("businesses")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        await supabase
          .from("businesses")
          .update({ subscription_status: "active" })
          .eq("stripe_customer_id", customerId);

        await logAuditEvent({
          businessId: business?.id ?? null,
          eventType: "stripe.invoice_payment_succeeded",
          source: "stripe",
          metadata: {
            customerId,
            invoiceId: invoice.id,
            amountPaid: invoice.amount_paid,
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = getCustomerId(invoice.customer);
        if (!customerId) break;

        const { data: business } = await supabase
          .from("businesses")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        await supabase
          .from("businesses")
          .update({ subscription_status: "past_due" })
          .eq("stripe_customer_id", customerId);

        await logAuditEvent({
          businessId: business?.id ?? null,
          eventType: "stripe.invoice_payment_failed",
          severity: "warning",
          source: "stripe",
          metadata: {
            customerId,
            invoiceId: invoice.id,
            amountDue: invoice.amount_due,
          },
        });
        break;
      }
    }
    if (claim.recordId) {
      await markWebhookEventProcessed(claim.recordId);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    if (claim.recordId) {
      await markWebhookEventFailed(claim.recordId);
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
