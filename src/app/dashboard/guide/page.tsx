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

function StepList({ items }: { items: string[] }) {
  return (
    <ol className="mt-3 space-y-2 text-sm leading-6 text-gray-600">
      {items.map((item, index) => (
        <li key={item} className="flex gap-3">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gray-900 text-[11px] font-semibold text-white">
            {index + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

function CheckBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      <ul className="mt-2 space-y-1.5 text-sm leading-6 text-gray-600">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
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

  const checklist = buildSetupChecklist({
    businessName: business.name,
    serviceCount: serviceCount ?? 0,
    hasBusinessHours: Boolean(
      business.business_hours &&
        typeof business.business_hours === "object" &&
        Object.keys(business.business_hours).length > 0
    ),
    googleCalendarConnected: business.google_calendar_connected,
    subscriptionStatus: business.subscription_status,
  });

  const aiNumber = business.phone_number;
  const forwardTarget = aiNumber ?? "<AI numaranız>";
  const whatsappConfigured = Boolean(process.env.TWILIO_WHATSAPP_FROM);

  const done = {
    profile:
      checklist.items.find((i) => i.key === "business_profile")?.completed ?? false,
    number: Boolean(aiNumber),
    calendar: business.google_calendar_connected,
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold">Kurulum Rehberi</h1>
      <p className="mt-1 text-sm text-gray-500">
        Hiç teknik bilgin olmasa bile buradaki adımları sırayla uygula. Amaç:
        işletme hattına gelen kaçan aramaların AI&apos;a düşmesi, randevuların
        takvime yazılması ve müşteriye SMS/WhatsApp bildirimi gitmesi.
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
          <StepList
            items={[
              "Agent Ayarları sayfasını aç.",
              "Konuşma dilini seç. Türkiye’de hizmet veriyorsan genelde Türkçe bırak.",
              "Karşılama mesajını boş bırakırsan sistem otomatik bir karşılama kullanır.",
              "Acil durum tanımına gerçekten acil saydığın durumları yaz: su baskını, gaz kokusu, elektrik kıvılcımı gibi.",
              "Kaydet ve Vapi’ye uygula butonuna bas. Bu butona basmadan değişiklikler canlı agent’a geçmez.",
            ]}
          />
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
            <>
              <p className="mt-2 text-sm text-gray-600">
                Numaranız hazır:{" "}
                <span className="font-semibold text-gray-900">{aiNumber}</span>.
                Bu numara müşteriye vermek zorunda olduğun yeni ana numara değil.
                En sağlıklı kullanım: mevcut işletme hattını cevaplanmadığında bu
                numaraya yönlendirmek.
              </p>
              <CheckBlock
                title="Bu numara ne işe yarar?"
                items={[
                  "Sen telefonu açarsan müşteri direkt seninle konuşur.",
                  "Sen açmazsan, meşgulsen veya telefon çekmiyorsa arama AI resepsiyoniste düşer.",
                  "AI görüşmeyi yapar, uygunsa randevu oluşturur ve panelde kayda geçirir.",
                ]}
              />
            </>
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
          <StepList
            items={[
              "İşletme hattının takılı olduğu telefonu eline al.",
              "Aşağıdaki ilk kodu telefonun arama ekranına yaz ve ara tuşuna bas.",
              "Ekranda işlem başarılı/onaylandı benzeri bir mesaj görürsen işlem tamamdır.",
              "Aynı işlemi ikinci ve üçüncü kod için de yap.",
              "Üç kodu da girince kaçan aramalar AI numarasına yönlenir.",
            ]}
          />

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

          <CheckBlock
            title="Doğru çalıştığını nasıl test edersin?"
            items={[
              "Başka bir telefondan işletme hattını ara.",
              "İşletme hattını bilerek açma.",
              "Birkaç çalmadan sonra AI resepsiyonistin telefonu açmalı.",
              "AI açmazsa operatör yönlendirmesi aktif olmamış olabilir; kodları tekrar gir veya operatör müşteri hizmetlerinden koşullu yönlendirmeyi iste.",
            ]}
          />

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
          <StepList
            items={[
              "Takvimi bağla butonuna bas.",
              "Google hesabını seç. Randevuları hangi takvimde görmek istiyorsan o hesabı seçmelisin.",
              "Google izin ekranında devam et ve erişime izin ver.",
              "Panele dönünce Google Takvim bölümünde Bağlı yazmalı.",
              "Randevu testi yapınca Google Takvim’de aynı saat için etkinlik oluşmalı.",
            ]}
          />
          <CheckBlock
            title="Neden kullanıcı kendi takvimini bağlıyor?"
            items={[
              "Çünkü randevular senin gerçek Google hesabındaki takvime yazılacak.",
              "Biz API altyapısını bağlıyoruz; hangi takvimin kullanılacağını işletme sahibi seçiyor.",
              "İstersen daha sonra bağlantıyı kesip başka Google hesabıyla yeniden bağlayabilirsin.",
            ]}
          />
          <Link
            href="/dashboard/agent-settings"
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Takvimi bağla →
          </Link>
        </section>

        {/* Adım 5 — SMS / WhatsApp */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-medium text-gray-900">
              5. SMS / WhatsApp bildirimlerini ayarlayın
            </h2>
            <span
              className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${
                whatsappConfigured
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              WhatsApp {whatsappConfigured ? "aktif" : "altyapısı bekliyor"}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Randevu oluşunca müşteriye onay ve iptal linkleri gönderilebilir.
            Bunu Agent Ayarları sayfasındaki SMS / WhatsApp bildirimleri
            bölümünden açıp kapatabilirsin.
          </p>
          <StepList
            items={[
              "Agent Ayarları sayfasına git.",
              "SMS / WhatsApp bildirimleri bölümünü bul.",
              "Randevu onayını SMS gönder seçeneği açıksa müşteri SMS alır.",
              "Randevu onayını WhatsApp gönder seçeneği açıksa ve WhatsApp altyapısı aktifse müşteri WhatsApp da alır.",
              "Randevu dışı görüşme sonrası özet SMS seçeneği açıksa bilgi görüşmelerinden sonra kısa takip SMS’i gider.",
              "Değişiklikten sonra Kaydet ve Vapi’ye uygula butonuna bas.",
            ]}
          />
          <CheckBlock
            title="Müşteri mesajında ne görür?"
            items={[
              "Randevu tarihi ve saati.",
              "Randevuyu onaylamak için link.",
              "Randevuyu iptal etmek için link.",
              "Bu linkler paneldeki randevu durumunu otomatik günceller.",
            ]}
          />
          <CheckBlock
            title="WhatsApp çalışmıyorsa ilk kontrol edilecekler"
            items={[
              "Agent Ayarları’nda WhatsApp aktif rozeti görünüyor mu?",
              "Müşteri numarası ülke koduyla yazıldı mı? Örnek: +905551112233.",
              "Twilio WhatsApp gönderen numarası production ortamında tanımlı mı?",
              "SMS gidiyor ama WhatsApp gitmiyorsa büyük ihtimalle WhatsApp gönderen altyapısı eksiktir.",
            ]}
          />
          <Link
            href="/dashboard/agent-settings"
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            SMS / WhatsApp ayarlarına git →
          </Link>
        </section>

        {/* Adım 6 — Test */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-medium text-gray-900">6. Baştan sona test edin</h2>
          <p className="mt-2 text-sm text-gray-600">
            Yönlendirmeyi tanımladıktan sonra, işletme hattınız çalarken
            açmayın — arama AI&apos;a düşmeli ve karşılamalı. Ardından{" "}
            <Link href="/dashboard/calls" className="font-medium text-indigo-600 hover:text-indigo-500">
              Aramalar
            </Link>{" "}
            sayfasında görüşmeyi, özeti ve analizi görürsünüz.
          </p>
          <StepList
            items={[
              "Başka bir telefondan işletme hattını ara.",
              "Telefonu açma; arama AI’a düşsün.",
              "AI’a gerçek müşteri gibi konuş: isim, telefon, adres ve istediğin zamanı söyle.",
              "AI müsaitlik kontrolü yaptıktan sonra bir saati onayla.",
              "Görüşme bittikten sonra Randevular sayfasını aç.",
              "Randevu listede görünmeli; Google Takvim bağlıysa takvimde de görünmeli.",
              "SMS/WhatsApp açıksa müşteri telefonuna onay/iptal linki gelmeli.",
              "Aramalar sayfasında görüşme özeti ve kalite analizi görünmeli.",
            ]}
          />
          <CheckBlock
            title="Bir şey görünmüyorsa hızlı teşhis"
            items={[
              "Aramalar sayfasında çağrı yoksa Vapi webhook veya numara yönlendirmesi kopuktur.",
              "Arama var ama randevu yoksa AI konuşmada net saat onayı almamış veya takvim müsaitlik kontrolünde çakışma bulmuş olabilir.",
              "Randevu var ama takvimde yoksa Google Takvim bağlantısını kesip yeniden bağla.",
              "Randevu var ama mesaj yoksa SMS/WhatsApp ayarlarını ve müşteri telefon formatını kontrol et.",
            ]}
          />
        </section>
      </div>
    </div>
  );
}
