import { createClient } from "@/lib/supabase/server";
import { BillingActions } from "./billing-actions";
import { getBillingMonth, PLAN_INCLUDED_MINUTES, OVERAGE_RATE_USD } from "@/lib/billing/usage";
import { getInvoiceStatusLabel, type BillingInvoice } from "@/lib/billing/invoice-format";
import { listCustomerInvoices } from "@/lib/stripe";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: business } = await supabase
    .from("businesses")
    .select("id, subscription_status, stripe_customer_id")
    .eq("owner_user_id", user.id)
    .single();

  if (!business) return null;

  const billingMonth = getBillingMonth();

  const { data: usage } = await supabase
    .from("usage_billing")
    .select("*")
    .eq("business_id", business.id)
    .eq("month", billingMonth)
    .maybeSingle();

  const minutesUsed = Number(usage?.total_minutes ?? 0);
  const overageCostUsd = Number(usage?.overage_cost_usd ?? 0);
  const minutesLimit = PLAN_INCLUDED_MINUTES;
  const progressPercent = Math.min(100, Math.max(0, (minutesUsed / minutesLimit) * 100));
  const isOverLimit = minutesUsed > minutesLimit;
  
  const hasSubscription = business.subscription_status === "active" || business.subscription_status === "trialing";
  let invoices: BillingInvoice[] = [];

  if (business.stripe_customer_id) {
    try {
      invoices = await listCustomerInvoices(business.stripe_customer_id);
    } catch (error) {
      console.error("Stripe faturaları alınamadı:", error);
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold">Faturalandırma</h1>
      <p className="mt-1 text-sm text-gray-500">
        Abonelik durumunuzu ve kullanımınızı yönetin.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-medium text-gray-900">Mevcut Plan</h2>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">Pro</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              hasSubscription 
                ? "bg-green-100 text-green-800" 
                : business.subscription_status === "past_due" 
                  ? "bg-red-100 text-red-800" 
                  : "bg-gray-100 text-gray-800"
            }`}>
              {hasSubscription ? "Aktif" : business.subscription_status === "past_due" ? "Ödeme Gecikti" : "Aktif Değil"}
            </span>
          </div>
          
          <p className="mt-2 text-sm text-gray-500">
            $149/ay • 300 dakika dahil
          </p>
          
          <BillingActions hasSubscription={hasSubscription} />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-medium text-gray-900">Bu Ayki Kullanım</h2>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
              <span>Kullanılan: {minutesUsed} dk</span>
              <span>Limit: {minutesLimit} dk</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${isOverLimit ? 'bg-red-600' : 'bg-indigo-600'}`} 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          
          {isOverLimit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md">
              <p className="text-sm font-medium text-red-800">
                Aşım Ücreti: ${overageCostUsd.toFixed(2)}
              </p>
              <p className="text-xs text-red-600 mt-1">
                Aşım dakikaları {"$"}{OVERAGE_RATE_USD.toFixed(2)}/dk olarak ücretlendirilir.
              </p>
            </div>
          )}
          
          {!isOverLimit && (
            <p className="mt-4 text-xs text-gray-500">
              Kalan {Math.max(0, minutesLimit - minutesUsed)} dakikanız var.
              Aşım durumunda dakika başına {"$"}{OVERAGE_RATE_USD.toFixed(2)} ücretlendirilirsiniz.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-medium text-gray-900">Fatura Geçmişi</h2>
          <p className="mt-1 text-sm text-gray-500">
            Stripe tarafından oluşturulan son faturalar.
          </p>
        </div>

        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tutar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Durum</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Fatura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {new Date(invoice.createdAt).toLocaleDateString("tr-TR", {
                        dateStyle: "medium",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {invoice.amountDueUsd}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {getInvoiceStatusLabel(invoice.status)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      {invoice.hostedInvoiceUrl ? (
                        <a
                          href={invoice.hostedInvoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Aç
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-sm text-gray-500">
            Henüz Stripe faturası bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
}
