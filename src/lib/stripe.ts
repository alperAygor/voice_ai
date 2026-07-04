import "server-only";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  formatStripeAmountUsd,
  formatUnixTimestampDate,
  type BillingInvoice,
} from "@/lib/billing/invoice-format";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2026-06-24.dahlia",
  appInfo: {
    name: "VoiceAI",
    version: "0.1.0",
  },
});

export async function getOrCreateStripeCustomer(businessId: string, email: string) {
  const supabase = createAdminClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("stripe_customer_id, name")
    .eq("id", businessId)
    .single();

  if (business?.stripe_customer_id) {
    return business.stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    email,
    name: business?.name,
    metadata: {
      businessId,
    },
  });

  await supabase
    .from("businesses")
    .update({ stripe_customer_id: customer.id })
    .eq("id", businessId);

  return customer.id;
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  businessId: string,
  planId: string
) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    client_reference_id: businessId,
    metadata: {
      businessId,
      planId,
    },
    // Aboneliğe de plan bilgisini iliştir — subscription webhook'larında okunur.
    subscription_data: {
      metadata: { businessId, planId },
    },
  });

  return session;
}

export async function createBillingPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  });

  return session;
}

export async function listCustomerInvoices(customerId: string): Promise<BillingInvoice[]> {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit: 5,
  });

  return invoices.data.map((invoice) => ({
    id: invoice.id,
    amountDueUsd: formatStripeAmountUsd(invoice.amount_due),
    status: invoice.status,
    hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
    createdAt: formatUnixTimestampDate(invoice.created),
  }));
}
