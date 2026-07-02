import { createClient } from "@/lib/supabase/server";
import { AgentSettingsForm } from "./form";
import Link from "next/link";
import { normalizeNotificationPreferences } from "@/lib/notifications/preferences";

export default async function AgentSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, phone_number, google_calendar_connected")
    .eq("owner_user_id", user!.id)
    .single();

  const { data: agentConfig } = await supabase
    .from("agent_config")
    .select("language, greeting_message, escalation_rules, system_prompt")
    .eq("business_id", business!.id)
    .single();

  const escalationRules =
    (agentConfig?.escalation_rules as {
      emergency_definition?: string;
      transfer_rule?: string;
      response_style?: "concise" | "balanced";
      custom_instructions?: string;
      sms_appointment_confirmations?: boolean;
      whatsapp_appointment_confirmations?: boolean;
      sms_call_followups?: boolean;
    } | null) ?? {};
  const notificationPreferences = normalizeNotificationPreferences(escalationRules);

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold">Agent Ayarları</h1>
      <p className="mt-1 text-sm text-gray-500">
        AI resepsiyonistinizin konuşma dili, karşılama mesajı ve kuralları.
        Kaydettiğinizde değişiklikler otomatik uygulanır.
      </p>

      <div className="mt-8 space-y-8">
        {/* AI Numarası — salt okunur */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-medium text-gray-900">AI Telefon Numaranız</h2>
          {business?.phone_number ? (
            <>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {business.phone_number}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                İşletme hattınızı bu numaraya yönlendirin (meşgulde/cevapsızda).
                Cevaplanmayan aramalar AI resepsiyonistinize düşer.
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              Numaranız henüz hazırlanıyor. Kısa süre içinde burada görünecek —
              bir sorun olursa bizimle iletişime geçin.
            </p>
          )}
        </div>

        {/* Google Takvim — kullanıcı kendi hesabını bağlar */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-medium text-gray-900">Google Takvim</h2>
          <p className="mt-1 text-sm text-gray-500">
            Randevuların çakışmasını önlemek ve yeni randevuları takviminize
            eklemek için Google Takvim&apos;i bağlayın.
          </p>
          <div className="mt-4">
            {business?.google_calendar_connected ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  Bağlı ✓
                </span>
                <Link
                  href="/api/auth/google-calendar"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Yeniden bağla
                </Link>
                <form action="/api/auth/google-calendar/disconnect" method="post">
                  <button
                    type="submit"
                    className="text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    Bağlantıyı kes
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/api/auth/google-calendar"
                className="inline-flex justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Takvimi Bağla
              </Link>
            )}
          </div>
        </div>

        {/* Konuşma ayarları */}
        <AgentSettingsForm
          initialLanguage={agentConfig?.language ?? "tr"}
          initialGreeting={agentConfig?.greeting_message ?? ""}
          initialEmergencyDefinition={escalationRules.emergency_definition ?? ""}
          initialTransferRule={escalationRules.transfer_rule ?? ""}
          initialResponseStyle={escalationRules.response_style ?? "concise"}
          initialCustomInstructions={escalationRules.custom_instructions ?? ""}
          initialSmsAppointmentConfirmations={
            notificationPreferences.smsAppointmentConfirmations
          }
          initialWhatsappAppointmentConfirmations={
            notificationPreferences.whatsappAppointmentConfirmations
          }
          initialSmsCallFollowups={notificationPreferences.smsCallFollowups}
          whatsappConfigured={Boolean(process.env.TWILIO_WHATSAPP_FROM)}
          currentSystemPrompt={agentConfig?.system_prompt ?? ""}
        />
      </div>
    </div>
  );
}
