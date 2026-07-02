import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata = {
  title: "Kullanım Şartları — Voxa",
};

export default function KullanimSartlariPage() {
  return (
    <LegalPage
      title="Kullanım Şartları"
      description="Voxa hesabı açan işletmelerin hizmeti hangi koşullarla kullanacağını açıklar."
    >
      <LegalSection title="1. Hizmetin konusu">
        <p>
          Voxa; işletmeler için AI destekli telefon resepsiyonisti, çağrı
          karşılama, çağrı özeti, randevu oluşturma, takvim entegrasyonu ve
          SMS/WhatsApp bildirim özellikleri sunar.
        </p>
      </LegalSection>

      <LegalSection title="2. Hesap ve yetki">
        <p>
          Hesap açan kişi, ilgili işletme adına işlem yapmaya yetkili olduğunu
          kabul eder. Hesap bilgilerinin güvenliğinden kullanıcı sorumludur.
        </p>
      </LegalSection>

      <LegalSection title="3. Kullanıcı yükümlülükleri">
        <ul className="list-inside list-disc space-y-1">
          <li>Hizmeti hukuka uygun şekilde kullanmak.</li>
          <li>Yanlış, aldatıcı veya üçüncü kişilerin haklarını ihlal eden veri girmemek.</li>
          <li>Arayan kişilere yapılması gereken sektör özelindeki bildirimlerden sorumlu olmak.</li>
          <li>Takvim, telefon yönlendirme ve bildirim ayarlarını doğru yapılandırmak.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. AI çıktıları">
        <p>
          AI tarafından oluşturulan özet, analiz ve öneriler yardımcı niteliktedir.
          Tıbbi, hukuki, finansal veya benzeri uzmanlık gerektiren kararların
          yerine geçmez. İşletme, müşteriyle nihai ticari ilişkisinden sorumludur.
        </p>
      </LegalSection>

      <LegalSection title="5. Ücretlendirme">
        <p>
          Abonelik, kullanım ve aşım ücretleri seçilen plana göre uygulanır.
          Ödemeler Stripe gibi ödeme sağlayıcıları üzerinden işlenebilir.
        </p>
      </LegalSection>

      <LegalSection title="6. Hizmet sürekliliği">
        <p>
          Telefon, SMS, WhatsApp, takvim, ödeme ve yapay zeka sağlayıcıları gibi
          üçüncü taraf servislerdeki kesintiler hizmeti etkileyebilir. Voxa,
          makul teknik önlemleri almakla birlikte kesintisiz hizmet garantisi
          vermez.
        </p>
      </LegalSection>

      <LegalSection title="7. Fesih ve askıya alma">
        <p>
          Hukuka aykırı kullanım, ödeme sorunu, güvenlik riski veya üçüncü kişi
          haklarını ihlal eden kullanım halinde hesap askıya alınabilir veya
          hizmet sonlandırılabilir.
        </p>
      </LegalSection>

      <LegalSection title="8. Değişiklikler">
        <p>
          Kullanım şartları zaman zaman güncellenebilir. Önemli değişiklikler
          panel veya e-posta yoluyla bildirilebilir.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
