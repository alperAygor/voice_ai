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
}: {
  initialLanguage: SupportedLanguage;
  initialGreeting: string;
  initialEmergencyDefinition: string;
  initialTransferRule: string;
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
    </form>
  );
}
