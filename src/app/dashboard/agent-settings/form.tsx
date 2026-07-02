"use client";

import { useActionState } from "react";
import { updateAgentSettings } from "./actions";
import { LANGUAGE_LABELS, type SupportedLanguage } from "@/lib/vapi/languages";

const LANGUAGES = Object.keys(LANGUAGE_LABELS) as SupportedLanguage[];

export function AgentSettingsForm({
  initialLanguage,
  initialGreeting,
  initialEmergencyDefinition,
  initialTransferRule,
  initialResponseStyle,
  initialCustomInstructions,
  initialSmsAppointmentConfirmations,
  initialWhatsappAppointmentConfirmations,
  initialSmsCallFollowups,
  whatsappConfigured,
  currentSystemPrompt,
}: {
  initialLanguage: SupportedLanguage;
  initialGreeting: string;
  initialEmergencyDefinition: string;
  initialTransferRule: string;
  initialResponseStyle: "concise" | "balanced";
  initialCustomInstructions: string;
  initialSmsAppointmentConfirmations: boolean;
  initialWhatsappAppointmentConfirmations: boolean;
  initialSmsCallFollowups: boolean;
  whatsappConfigured: boolean;
  currentSystemPrompt: string;
}) {
  const [state, formAction, pending] = useActionState(updateAgentSettings, {
    error: null,
    success: false,
  });

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="block text-sm font-medium">Konuşma dili</label>
        <select
          name="language"
          defaultValue={initialLanguage}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {LANGUAGE_LABELS[lang]}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          AI resepsiyonist bu dilde konuşur ve dinler (Deepgram Nova-3 STT +
          Aura TTS).
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium">Konuşma uzunluğu</label>
        <select
          name="response_style"
          defaultValue={initialResponseStyle}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="concise">Kısa ve hızlı</option>
          <option value="balanced">Dengeli</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Kısa mod maliyeti düşürür: AI tek soru sorar, gereksiz tekrar yapmaz
          ve randevu onayında hızlıca kaydeder.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium">Karşılama mesajı</label>
        <textarea
          name="greeting_message"
          defaultValue={initialGreeting}
          rows={2}
          placeholder="Boş bırakırsan dile göre otomatik bir karşılama mesajı kullanılır."
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">İşletmeye özel ek talimat</label>
        <textarea
          name="custom_instructions"
          defaultValue={initialCustomInstructions}
          rows={3}
          placeholder="Örn. fiyat konuşmasını kısa tut, garanti sorularında ofise yönlendir, önce posta kodu sor."
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Acil durum tanımı</label>
        <textarea
          name="emergency_definition"
          defaultValue={initialEmergencyDefinition}
          rows={2}
          placeholder="Örn. su baskını, gaz kokusu, elektrik kıvılcımı"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Transfer kuralı</label>
        <textarea
          name="transfer_rule"
          defaultValue={initialTransferRule}
          rows={2}
          placeholder="Örn. arayan ısrarla insan isterse ya da acil durum varsa hemen aktar"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">SMS / WhatsApp bildirimleri</h2>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Randevu onayı ve çağrı sonrası takip mesajlarının müşteriye nasıl
              gönderileceğini seçin.
            </p>
          </div>
          <span
            className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
              whatsappConfigured
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            WhatsApp {whatsappConfigured ? "aktif" : "altyapısı bekliyor"}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex gap-3 rounded-md border border-gray-200 p-3 text-sm">
            <input
              type="checkbox"
              name="sms_appointment_confirmations"
              defaultChecked={initialSmsAppointmentConfirmations}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <span>
              <span className="font-medium text-gray-900">Randevu onayını SMS gönder</span>
              <span className="mt-0.5 block text-xs leading-5 text-gray-500">
                AI veya panel randevu oluşturunca müşteriye onay/iptal linkleri gider.
              </span>
            </span>
          </label>

          <label className="flex gap-3 rounded-md border border-gray-200 p-3 text-sm">
            <input
              type="checkbox"
              name="whatsapp_appointment_confirmations"
              defaultChecked={initialWhatsappAppointmentConfirmations}
              disabled={!whatsappConfigured}
              className="mt-1 h-4 w-4 rounded border-gray-300 disabled:opacity-40"
            />
            <span>
              <span className="font-medium text-gray-900">Randevu onayını WhatsApp gönder</span>
              <span className="mt-0.5 block text-xs leading-5 text-gray-500">
                Twilio WhatsApp gönderen numarası bağlıysa SMS&apos;e ek olarak WhatsApp gider.
              </span>
            </span>
          </label>

          <label className="flex gap-3 rounded-md border border-gray-200 p-3 text-sm">
            <input
              type="checkbox"
              name="sms_call_followups"
              defaultChecked={initialSmsCallFollowups}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <span>
              <span className="font-medium text-gray-900">Randevu dışı görüşme sonrası özet SMS gönder</span>
              <span className="mt-0.5 block text-xs leading-5 text-gray-500">
                Müşteri randevu almadan bilgi aldıysa kısa bir teşekkür/özet SMS&apos;i gönderilir.
              </span>
            </span>
          </label>
        </div>
      </section>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-700">
          Kaydedildi ve Vapi&apos;deki agent güncellendi.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Kaydediliyor..." : "Kaydet ve Vapi'ye uygula"}
      </button>

      {currentSystemPrompt && (
        <details className="rounded-lg border border-gray-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-900">
            Vapi sistem prompt önizlemesi
          </summary>
          <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-xs leading-5 text-gray-700">
            {currentSystemPrompt}
          </pre>
        </details>
      )}
    </form>
  );
}
