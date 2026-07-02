import { createClient } from "@/lib/supabase/server";
import { AccountPasswordForm } from "./password-form";
import { AccountPasswordResetForm } from "./password-reset-form";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">Hesap Ayarları</h1>
      <p className="mt-1 text-sm text-gray-500">
        Giriş bilgileriniz ve hesap güvenliği.
      </p>

      <div className="mt-8 space-y-6">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-medium text-gray-900">E-posta</h2>
          <p className="mt-2 text-sm text-gray-600">{user.email}</p>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-medium text-gray-900">Şifre</h2>
          <p className="mt-1 text-sm text-gray-500">
            Oturumunuz açıksa şifrenizi direkt değiştirebilir veya e-postanıza
            güvenli sıfırlama bağlantısı gönderebilirsiniz.
          </p>
          <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <h3 className="text-sm font-medium text-gray-900">Şifreyi şimdi değiştir</h3>
            <p className="mt-1 text-xs text-gray-500">
              En az 8 karakterli güçlü bir şifre kullanın.
            </p>
            <div className="mt-4">
              <AccountPasswordForm />
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-gray-100 bg-white p-4">
            <h3 className="text-sm font-medium text-gray-900">Şifremi unuttum</h3>
            <div className="mt-3">
              <AccountPasswordResetForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
