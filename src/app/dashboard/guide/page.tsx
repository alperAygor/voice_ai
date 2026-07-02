import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buildSetupChecklist } from "@/lib/onboarding/checklist";

function StatusChip({ done }: { done: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        done ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      {done ? "Tamam ✓" : "Yapılacak"}
    </span>
  );
}

function ForwardCode({ label, code }: { label: string; code: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <code className="rounded bg-white px-2 py-1 font-mono text-sm text-gray-900 ring-1 ring-gray-200">
        {code}
      </code>
    </div>
  );
}

export default async function GuidePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, business_hours, phone_number, google_calendar_connected, subscription_status")
    .eq("owner_user_id", user.id)
    .single();

  if (!business) return null;

  const { count: serviceCount } = await supabase
    .from("business_services")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id);

  const { data: agentConfig } = await supabase
    .from("agent_config")
    .select("vapi_assistant_id, vapi_phone_number_id")
    .eq("business_id", business.id)
    .maybeSingle();

  const checklist = buildSetupChecklist({
    businessName: business.name,
    serviceCount: serviceCount ?? 0,
    hasBusinessHours: Boolean(
      business.business_hours &&
        typeof business.business_hours === "object" &&
        Object.keys(business.business_hours).length > 0
    ),
    vapiAssistantId: agentConfig?.vapi_assistant_id,
    phoneNumber: business.phone_number,
    vapiPhoneNumberId: agentConfig?.vapi_phone_number_id,
    googleCalendarConnected: business.google_calendar_connected,
    subscriptionStatus: business.subscription_status,
  });

  const aiNumber = business.phone_number;
  const forwardTarget = aiNumber ?? "<AI numaranız>";

  const done = {
    profile:
      checklist.items.find((i) => i.key === "business_profile")?.completed ?? false,
    number: Boolean(aiNumber),
    calendar: business.google_calendar_connected,
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold">Kurulum Rehberi</h1>
      <p className="mt-1 text-sm text-gray-500">
        AI resepsiyonistinizi çalışır hale getirmek için birkaç adım.
      </p>

      {/* İlerleme */}
      <div className="mt-6 flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="h-2 flex-1 rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-indigo-600"
            style={{ width: `${checklist.percent}%` }}
          />
        </div>
        <span className="shrink-0 text-sm font-medium text-gray-700">
          {checklist.completedCount}/{checklist.totalCount} adım
        </span>
      </div>

      <div className="mt-8 space-y-6">
        {/* Adım 1 */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-gray-900">1. İşletme bilgileriniz</h2>
            <StatusChip done={done.profile} />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            İşletme adı, hizmetler ve çalışma saatleri AI&apos;ın doğru konuşması
            için gerekli.
          </p>
          <Link
            href="/dashboard/agent-settings"
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Agent Ayarları&apos;na git →
          </Link>
        </section>

        {/* Adım 2 — AI numarası */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-gray-900">2. AI telefon numaranız</h2>
            <StatusChip done={done.number} />
          </div>
          {aiNumber ? (
            <p className="mt-2 text-sm text-gray-600">
              Numaranız hazır:{" "}
              <span className="font-semibold text-gray-900">{aiNumber}</span>. Bu
              numarayı değiştirmezsiniz — mevcut hattınızı buraya yönlendirirsiniz
              (bir sonraki adım).
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              Numaranız hazırlanıyor. Hazır olunca burada ve Agent Ayarları&apos;nda
              görünecek.
            </p>
          )}
        </section>

        {/* Adım 3 — Çağrı yönlendirme (merkez) */}
        <section className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-gray-900">
              3. İşletme hattınızı yönlendirin
            </h2>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Mevcut işletme telefonunuzu <strong>değiştirmenize gerek yok.</strong>{" "}
            Cevaplayamadığınız aramaların AI resepsiyonistinize düşmesi için
            hattınızda <strong>koşullu çağrı yönlendirme</strong> tanımlayın.
            Aşağıdaki kodları <strong>işletme telefonunuzdan</strong> çevirin
            (Turkcell / Vodafone / Türk Telekom&apos;da çalışır):
          </p>

          <div className="mt-4 space-y-2">
            <ForwardCode label="Cevapsız kaldığında" code={`**61*${forwardTarget}#`} />
            <ForwardCode label="Meşgulken" code={`**67*${forwardTarget}#`} />
            <ForwardCode label="Telefon kapalı / çekmiyorken" code={`**62*${forwardTarget}#`} />
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Bu üçünü tanımlarsan: bizzat açtığın aramalar sana kalır, yalnızca{" "}
            <strong>kaçırdıkların</strong> AI&apos;a düşer. Her kodu çevirip{" "}
            <strong>ara</strong> tuşuna bas; onay mesajı görürsün.
          </p>

          <div className="mt-4 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
            Yönlendirmeyi kaldırmak için:{" "}
            <code className="font-mono text-gray-900">##61#</code>,{" "}
            <code className="font-mono text-gray-900">##67#</code>,{" "}
            <code className="font-mono text-gray-900">##62#</code> — ya da tümünü
            birden: <code className="font-mono text-gray-900">##002#</code>
          </div>
          {!aiNumber && (
            <p className="mt-3 text-xs text-amber-700">
              Not: Numaranız hazır olunca kodlardaki{" "}
              <code className="font-mono">&lt;AI numaranız&gt;</code> otomatik
              dolacak.
            </p>
          )}
        </section>

        {/* Adım 4 — Takvim */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-gray-900">4. Google Takvim&apos;i bağlayın</h2>
            <StatusChip done={done.calendar} />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            AI&apos;ın uygun saatleri görüp randevuları takviminize yazması için
            kendi Google hesabınızı bağlayın.
          </p>
          <Link
            href="/dashboard/agent-settings"
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Takvimi bağla →
          </Link>
        </section>

        {/* Adım 5 — Test */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-medium text-gray-900">5. Test edin</h2>
          <p className="mt-2 text-sm text-gray-600">
            Yönlendirmeyi tanımladıktan sonra, işletme hattınız çalarken
            açmayın — arama AI&apos;a düşmeli ve karşılamalı. Ardından{" "}
            <Link href="/dashboard/calls" className="font-medium text-indigo-600 hover:text-indigo-500">
              Aramalar
            </Link>{" "}
            sayfasında görüşmeyi, özeti ve analizi görürsünüz.
          </p>
        </section>
      </div>
    </div>
  );
}
