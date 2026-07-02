import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata = {
  title: "KVKK Aydınlatma Metni — Voxa",
};

export default function KvkkPage() {
  return (
    <LegalPage
      title="KVKK Aydınlatma Metni"
      description="6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verilerin işlenmesine ilişkin bilgilendirme."
    >
      <LegalSection title="1. Veri sorumlusu ve veri işleyen rolü">
        <p>
          Voxa panelini kullanan işletme, kendi müşterilerinden gelen çağrılar
          ve randevu bilgileri bakımından veri sorumlusu olabilir. Voxa ise
          işletmenin talimatları doğrultusunda hizmeti sağlayan veri işleyen
          konumunda hareket edebilir.
        </p>
        <p>
          Voxa hesabı açan işletme kullanıcısının hesap ve faturalandırma
          verileri bakımından veri sorumlusu bilgileri şirket unvanı, adres ve
          iletişim bilgileri netleştirilerek bu metne eklenmelidir.
        </p>
      </LegalSection>

      <LegalSection title="2. İşlenen kişisel veriler">
        <ul className="list-inside list-disc space-y-1">
          <li>Kimlik/iletişim: ad-soyad, e-posta, telefon numarası.</li>
          <li>Müşteri işlem: çağrı kayıtları, transkriptler, randevu talepleri ve notlar.</li>
          <li>Lokasyon/adres: randevu için iletilen servis adresi.</li>
          <li>Finans: abonelik ve ödeme sağlayıcısından gelen faturalandırma bilgileri.</li>
          <li>İşlem güvenliği: oturum kayıtları, webhook kayıtları, audit log kayıtları.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. İşleme amaçları">
        <p>
          Kişisel veriler; hesap oluşturma, kimlik doğrulama, çağrı yanıtlama,
          randevu oluşturma, takvim entegrasyonu, SMS/WhatsApp bilgilendirme,
          çağrı kalite analizi, müşteri destek süreçleri, faturalandırma ve
          mevzuattan doğan yükümlülüklerin yerine getirilmesi amaçlarıyla işlenir.
        </p>
      </LegalSection>

      <LegalSection title="4. Hukuki sebepler">
        <p>
          Veriler; sözleşmenin kurulması ve ifası, hukuki yükümlülüklerin yerine
          getirilmesi, meşru menfaat, bir hakkın tesisi/kullanılması/korunması ve
          gerekli hallerde açık rıza hukuki sebeplerine dayanılarak işlenebilir.
        </p>
      </LegalSection>

      <LegalSection title="5. Aktarım">
        <p>
          Hizmetin sağlanması için kişisel veriler; bulut altyapısı, telefon ve
          mesajlaşma sağlayıcıları, ödeme sağlayıcıları, takvim sağlayıcıları,
          yapay zeka/transkripsiyon sağlayıcıları ve yetkili kamu kurumlarıyla
          mevzuata uygun şekilde paylaşılabilir.
        </p>
      </LegalSection>

      <LegalSection title="6. Çağrı kaydı bildirimi">
        <p>
          AI resepsiyonist görüşmenin başında arayana görüşmenin hizmet kalitesi
          amacıyla kaydedildiğini bildirir. İşletme, kendi sektörüne ve çağrı
          içeriğine göre ek açık rıza veya bilgilendirme gerekip gerekmediğini
          ayrıca değerlendirmelidir.
        </p>
      </LegalSection>

      <LegalSection title="7. İlgili kişi hakları">
        <p>
          KVKK m.11 kapsamında kişisel verilerinizin işlenip işlenmediğini
          öğrenme, işlenmişse bilgi talep etme, amacına uygun kullanılıp
          kullanılmadığını öğrenme, eksik/yanlış işlenen verilerin düzeltilmesini
          isteme, şartları varsa silinmesini/yok edilmesini isteme ve mevzuatta
          sayılan diğer haklara sahipsiniz.
        </p>
      </LegalSection>

      <LegalSection title="8. Başvuru yöntemi">
        <p>
          Başvurular için veri sorumlusunun e-posta, adres ve kep bilgileri bu
          alana eklenmelidir. Yayın öncesi: [Şirket e-postası], [Şirket adresi]
          ve [varsa KEP adresi] alanlarını doldurun.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
