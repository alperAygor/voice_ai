import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { PhoneNumberPicker } from "@/components/phone-number-picker";
import {
  getBusinessIntegrationHealth,
  type BusinessSupportRow,
} from "@/lib/admin/support-summary";

const HEALTH_STYLE = {
  healthy: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  missing: "bg-gray-100 text-gray-600",
};

export default async function AdminBusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const adminSupabase = createAdminClient();

  const { data: business } = await adminSupabase
    .from("businesses")
    .select(
      "id, name, industry, service_area, phone_number, twilio_phone_number_sid, google_calendar_connected, subscription_status, stripe_customer_id"
    )
    .eq("id", id)
    .maybeSingle();

  if (!business) notFound();

  const { data: agentConfig } = await adminSupabase
    .from("agent_config")
    .select("vapi_assistant_id, vapi_phone_number_id, system_prompt, language")
    .eq("business_id", id)
    .maybeSingle();

  const healthRow: BusinessSupportRow = {
    id: business.id,
    name: business.name,
    phone_number: business.phone_number,
    google_calendar_connected: business.google_calendar_connected,
    subscription_status: business.subscription_status,
    stripe_customer_id: business.stripe_customer_id,
    twilio_phone_number_sid: business.twilio_phone_number_sid,
    agent_config: agentConfig
      ? {
          vapi_assistant_id: agentConfig.vapi_assistant_id,
          vapi_phone_number_id: agentConfig.vapi_phone_number_id,
        }
      : null,
  };

  return (
    <div>
      <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900">
        ← Genel Bakış
      </Link>
      <div className="mt-2 flex items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-900">{business.name}</h1>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {business.industry}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-500">{business.service_area ?? "-"}</p>

      {/* Entegrasyon sağlığı */}
      <div className="mt-6 flex flex-wrap gap-2">
        {getBusinessIntegrationHealth(healthRow).map((h) => (
          <span
            key={h.label}
            className={`rounded-full px-3 py-1 text-xs font-medium ${HEALTH_STYLE[h.status]}`}
          >
            {h.label}: {h.status}
          </span>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Numara sağlama (operatör) */}
        <div>
          <h2 className="mb-3 text-base font-medium text-gray-900">Telefon Numarası</h2>
          <PhoneNumberPicker
            businessId={business.id}
            currentPhoneNumber={business.phone_number}
            currentNumberSid={business.twilio_phone_number_sid}
          />
        </div>

        {/* Teknik durum */}
        <div className="space-y-4">
          <h2 className="text-base font-medium text-gray-900">Teknik Durum</h2>
          <dl className="rounded-lg border border-gray-200 bg-white p-5 text-sm shadow-sm">
            <div className="flex justify-between py-1.5">
              <dt className="text-gray-500">Vapi assistant</dt>
              <dd className="font-mono text-xs text-gray-900">
                {agentConfig?.vapi_assistant_id ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-gray-500">Vapi numara ID</dt>
              <dd className="font-mono text-xs text-gray-900">
                {agentConfig?.vapi_phone_number_id ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-gray-500">Dil</dt>
              <dd className="text-gray-900">{agentConfig?.language ?? "—"}</dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-gray-500">Google Takvim</dt>
              <dd className="text-gray-900">
                {business.google_calendar_connected ? "Bağlı" : "Bağlı değil"}
              </dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-gray-500">Abonelik</dt>
              <dd className="text-gray-900">{business.subscription_status}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* System prompt */}
      <div className="mt-8">
        <h2 className="mb-3 text-base font-medium text-gray-900">System Prompt</h2>
        {agentConfig?.system_prompt ? (
          <pre className="w-full overflow-x-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-white p-4 text-xs text-gray-600">
            {agentConfig.system_prompt}
          </pre>
        ) : (
          <p className="text-sm text-gray-500">Henüz oluşturulmadı.</p>
        )}
      </div>
    </div>
  );
}
