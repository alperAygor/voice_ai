import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata = {
  title: "Gizlilik Politikası — Voxa",
};

export default function GizlilikPage() {
  return (
    <LegalPage
      title="Gizlilik Politikası"
      description="Voxa hesabı, panel kullanımı, çağrı kayıtları ve randevu süreçlerinde hangi verilerin işlendiğini açıklar."
    >
      <LegalSection title="1. Kapsam">
        <p>
          Bu politika, Voxa AI sesli resepsiyonist hizmetini kullanan işletme
          hesabı sahipleri ve bu işletmeleri arayan müşteriler bakımından geçerlidir.
        </p>
      </LegalSection>

      <LegalSection title="2. Toplanan veri kategorileri">
        <ul className="list-inside list-disc space-y-1">
          <li>Hesap verileri: e-posta, kimlik doğrulama bilgileri ve oturum kayıtları.</li>
          <li>İşletme verileri: işletme adı, hizmetler, çalışma saatleri, servis bölgesi.</li>
          <li>Çağrı verileri: arayan numara, çağrı zamanı, süre, ses kaydı, transkript, özet ve analiz.</li>
          <li>Randevu verileri: ad-soyad, telefon, adres, hizmet türü, tarih/saat ve notlar.</li>
          <li>Bildirim verileri: SMS/WhatsApp gönderim durumu, alıcı numarası ve mesaj içeriği.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Verileri neden işleriz?">
        <p>
          Veriler; hesabın açılması, AI resepsiyonistin çalışması, çağrıların
          yanıtlanması, randevuların oluşturulması, Google Takvim entegrasyonu,
          SMS/WhatsApp bildirimi, faturalandırma ve hizmet kalitesinin ölçülmesi
          amaçlarıyla işlenir.
        </p>
      </LegalSection>

      <LegalSection title="4. Üçüncü taraf hizmet sağlayıcılar">
        <p>
          Hizmetin çalışması için Supabase, Vapi, Twilio, Stripe, Google Calendar,
          Anthropic ve e-posta/SMS sağlayıcıları gibi altyapı hizmetlerinden
          yararlanılabilir. Bu sağlayıcılarla yalnızca hizmetin çalışması için
          gerekli veriler paylaşılır.
        </p>
      </LegalSection>

      <LegalSection title="5. Saklama">
        <p>
          Veriler, hizmetin sağlanması, sözleşmesel yükümlülükler, hukuki
          yükümlülükler ve uyuşmazlıkların çözümü için gerekli süre boyunca
          saklanır. Saklama süresi dolan veriler silinir, yok edilir veya anonim
          hale getirilir.
        </p>
      </LegalSection>

      <LegalSection title="6. Güvenlik">
        <p>
          Erişim kontrolleri, satır bazlı yetkilendirme, servis anahtarlarının
          sunucu tarafında tutulması, webhook doğrulama ve audit kayıtları gibi
          teknik/organizasyonel önlemler uygulanır.
        </p>
      </LegalSection>

      <LegalSection title="7. İlgili kişi hakları">
        <p>
          KVKK kapsamındaki talepler için hesabınızın bağlı olduğu işletme veya
          veri sorumlusu ile iletişime geçebilirsiniz. Talepler; erişim,
          düzeltme, silme, işleme itiraz ve mevzuatta sayılan diğer hakları
          kapsayabilir.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
