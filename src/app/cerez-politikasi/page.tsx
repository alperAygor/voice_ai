import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata = {
  title: "Çerez Politikası — Voxa",
};

export default function CerezPolitikasiPage() {
  return (
    <LegalPage
      title="Çerez Politikası"
      description="Voxa web sitesi ve panelinde kullanılan çerez/benzeri teknolojilere ilişkin bilgilendirme."
    >
      <LegalSection title="1. Çerez nedir?">
        <p>
          Çerezler, web sitesini ziyaret ettiğinizde tarayıcınıza kaydedilen
          küçük metin dosyalarıdır. Oturumun sürdürülmesi, tercihlerin
          hatırlanması ve güvenliğin sağlanması için kullanılabilir.
        </p>
      </LegalSection>

      <LegalSection title="2. Kullanılan çerez türleri">
        <ul className="list-inside list-disc space-y-1">
          <li>Zorunlu çerezler: oturum açma, güvenlik ve panelin çalışması için gereklidir.</li>
          <li>Tercih çerezleri: seçilen dil gibi kullanıcı tercihlerini hatırlar.</li>
          <li>Performans/analitik çerezleri: ileride ürün performansını ölçmek için eklenebilir.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Mevcut kullanım">
        <p>
          Uygulama, Supabase oturum çerezleri ve dil tercihi için
          <code className="mx-1 rounded bg-gray-100 px-1 py-0.5">NEXT_LOCALE</code>
          gibi zorunlu/tercih çerezleri kullanabilir. Bu çerezler hesabınıza
          güvenli giriş yapılması ve arayüzün doğru dilde gösterilmesi için
          gereklidir.
        </p>
      </LegalSection>

      <LegalSection title="4. Çerezleri nasıl yönetebilirsiniz?">
        <p>
          Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz.
          Ancak zorunlu çerezlerin kapatılması halinde giriş, panel ve güvenli
          oturum özellikleri düzgün çalışmayabilir.
        </p>
      </LegalSection>

      <LegalSection title="5. Üçüncü taraflar">
        <p>
          Ödeme, kimlik doğrulama, takvim, telefon ve mesajlaşma sağlayıcıları
          kendi hizmetleri kapsamında çerez veya benzeri teknolojiler
          kullanabilir. Bu sağlayıcıların politikaları ayrıca incelenmelidir.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
