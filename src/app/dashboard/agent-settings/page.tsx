import { createClient } from "@/lib/supabase/server";
import { AgentSettingsForm } from "./form";
import { PhoneNumberPicker } from "@/components/phone-number-picker";
import Link from "next/link";

export default async function AgentSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, phone_number, twilio_phone_number_sid, google_calendar_connected")
    .eq("owner_user_id", user!.id)
    .single();

  const { data: agentConfig } = await supabase
    .from("agent_config")
    .select("language, greeting_message, escalation_rules, system_prompt, vapi_assistant_id")
    .eq("business_id", business!.id)
    .single();

  return (
    <div>
      <h1 className="text-xl font-semibold">Agent Ayarları</h1>
      <p className="mt-1 text-sm text-gray-500">
        Konuşma dili, karşılama mesajı, acil durum tanımı ve transfer kuralını
        buradan yönet. Kaydettiğinde değişiklikler Vapi&apos;deki agent&apos;a
        otomatik uygulanır.
      </p>

      <div className="mt-2 text-xs">
        {agentConfig?.vapi_assistant_id ? (
          <span className="rounded-full bg-green-50 px-2 py-1 text-green-700">
            Vapi&apos;ye bağlı
          </span>
        ) : (
          <span className="rounded-full bg-yellow-50 px-2 py-1 text-yellow-700">
            Henüz Vapi&apos;ye bağlanmadı — kaydettiğinde denenecek
          </span>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8 max-w-xl">
          {/* Telefon Numarası Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Telefon Numarası</h2>
            <PhoneNumberPicker
              currentPhoneNumber={business?.phone_number}
              currentNumberSid={business?.twilio_phone_number_sid}
            />
          </div>

          {/* Google Takvim Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Google Takvim Bağlantısı</h2>
            <p className="text-sm text-gray-500 mb-4">
              Randevuların çakışmasını önlemek ve yeni randevuları takviminize eklemek için Google Takvim&apos;i bağlayın.
            </p>
            {business?.google_calendar_connected ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Google Takvim Bağlı ✓
                </span>
                <Link
                  href="/api/auth/google-calendar"
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Yeniden Bağla
                </Link>
                <form action="/api/auth/google-calendar/disconnect" method="post">
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50"
                  >
                    Bağlantıyı Kes
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/api/auth/google-calendar"
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Takvimi Bağla
              </Link>
            )}
          </div>
          
          <AgentSettingsForm
            initialLanguage={agentConfig?.language ?? "tr"}
            initialGreeting={agentConfig?.greeting_message ?? ""}
            initialEmergencyDefinition={
              (agentConfig?.escalation_rules as Record<string, string> | null)
                ?.emergency_definition ?? ""
            }
            initialTransferRule={
              (agentConfig?.escalation_rules as Record<string, string> | null)
                ?.transfer_rule ?? ""
            }
          />
        </div>

        {agentConfig?.system_prompt && (
          <div className="">
            <h2 className="text-sm font-medium text-gray-700">
              Oluşturulan sistem promptu (önizleme)
            </h2>
            <pre className="mt-2 w-full whitespace-pre-wrap rounded-lg border border-gray-200 bg-white p-4 text-xs text-gray-600">
              {agentConfig.system_prompt}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
