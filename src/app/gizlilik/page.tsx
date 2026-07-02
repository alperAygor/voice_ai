import Link from "next/link";

export const metadata = {
  title: "Gizlilik ve KVKK Aydınlatma Metni — Voxa",
};

export default function GizlilikPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
        ← Ana sayfa
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">
        Gizlilik ve KVKK Aydınlatma Metni
      </h1>
      <p className="mt-2 text-sm text-gray-500">Son güncelleme: {new Date().getFullYear()}</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
        <p>
          Bu metin, Voxa sesli AI resepsiyonist hizmeti (&quot;Hizmet&quot;)
          kapsamında kişisel verilerin 6698 sayılı Kişisel Verilerin Korunması
          Kanunu (&quot;KVKK&quot;) uyarınca işlenmesine ilişkin bilgilendirmedir.
        </p>

        <section>
          <h2 className="text-base font-medium text-gray-900">1. Veri Sorumlusu</h2>
          <p className="mt-2">
            Hizmeti kullanan işletme, kendi müşterilerinin verileri bakımından
            veri sorumlusudur. Voxa, işletme adına veriyi işleyen taraf olarak
            hareket eder.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900">2. İşlenen Veriler</h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Arayan telefon numarası, ad-soyad, adres</li>
            <li>Görüşme ses kaydı ve metne dönüştürülmüş transkripti</li>
            <li>Randevu bilgileri ve görüşme özeti/analizi</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900">3. İşleme Amaçları</h2>
          <p className="mt-2">
            Aramaların yanıtlanması, randevu oluşturulması, hizmet kalitesinin
            ölçülmesi ve işletmeye görüşme özeti sunulması.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900">4. Kayıt Bildirimi</h2>
          <p className="mt-2">
            Görüşmeler hizmet kalitesi amacıyla kaydedilmektedir. Bu durum,
            görüşmenin başında arayana sözlü olarak bildirilir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900">5. Saklama ve Aktarım</h2>
          <p className="mt-2">
            Veriler, hizmetin sağlanması için gerekli süre boyunca saklanır ve
            yalnızca hizmetin işlemesi için kullanılan altyapı sağlayıcılarıyla
            (bulut, telefon, yapay zeka) paylaşılır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-medium text-gray-900">6. Haklarınız</h2>
          <p className="mt-2">
            KVKK m.11 kapsamında; verilerinize erişme, düzeltilmesini veya
            silinmesini isteme haklarına sahipsiniz. Talepleriniz için ilgili
            işletmeyle iletişime geçebilirsiniz.
          </p>
        </section>

        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          Not: Bu metin bir şablondur; yayına almadan önce bir hukuk
          danışmanına gözden geçirtmeniz önerilir.
        </p>
      </div>
    </div>
  );
}
