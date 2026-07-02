"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useActionState } from "react";
import { useState } from "react";
import Link from "next/link";
import { signUp, signUpWithGoogle } from "./actions";
import { AuthDivider, AuthLayout, GoogleIcon } from "@/components/auth-layout";

function SignupContent() {
  const searchParams = useSearchParams();
  const pageError = searchParams.get("error");
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [state, formAction, pending] = useActionState(signUp, {
    error: null,
    success: false,
  });

  return (
    <AuthLayout
      eyebrow="Ücretsiz başlayın"
      title="İşletme hesabınızı oluşturun"
      subtitle="AI resepsiyonistinizi kurmak için güvenli hesabınızı oluşturun."
    >
      <div className="space-y-5">
        {state?.success ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-900">Kayıt başarılı</p>
            <p className="mt-1 text-sm leading-6 text-green-800">
              Devam etmek için e-postana gelen doğrulama bağlantısına tıkla.
              Sonrasında kurulum paneline yönlendirileceksin.
            </p>
          </div>
        ) : (
          <>
            <form action={formAction} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                  E-posta
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ornek@isletme.com"
                  required
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                  Şifre
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="En az 8 karakter"
                  required
                  minLength={8}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  En az 8 karakter kullanın.
                </p>
              </div>
              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-900">
                  Şifre tekrar
                </label>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Şifrenizi tekrar girin"
                  required
                  minLength={8}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <label className="flex gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm leading-6 text-gray-700">
                <input
                  type="checkbox"
                  name="legal_accept"
                  checked={legalAccepted}
                  onChange={(event) => setLegalAccepted(event.target.checked)}
                  required
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />
                <span>
                  <Link href="/kvkk" className="font-medium text-gray-900 underline underline-offset-4">
                    KVKK Aydınlatma Metni
                  </Link>
                  ,{" "}
                  <Link href="/gizlilik" className="font-medium text-gray-900 underline underline-offset-4">
                    Gizlilik Politikası
                  </Link>
                  ,{" "}
                  <Link href="/kullanim-sartlari" className="font-medium text-gray-900 underline underline-offset-4">
                    Kullanım Şartları
                  </Link>
                  {" "}ve{" "}
                  <Link href="/cerez-politikasi" className="font-medium text-gray-900 underline underline-offset-4">
                    Çerez Politikası
                  </Link>
                  &apos;nı okudum ve kabul ediyorum.
                </span>
              </label>

              {(state?.error || pageError) && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {state?.error ?? pageError}
                </div>
              )}

              <button
                type="submit"
                disabled={pending || !legalAccepted}
                className="w-full rounded-md bg-gray-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50"
              >
                {pending ? "Kayıt oluşturuluyor..." : "Kayıt ol"}
              </button>
            </form>

            <AuthDivider />

            <form action={signUpWithGoogle}>
              <input
                type="hidden"
                name="legal_accept"
                value={legalAccepted ? "on" : ""}
              />
              <button
                type="submit"
                disabled={!legalAccepted}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-50"
              >
                <GoogleIcon />
                Google ile kayıt ol
              </button>
            </form>

            <ul className="grid gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
              <li>• Kurulum checklist&apos;iyle hızlı başlangıç</li>
              <li>• Google Takvim bağlantısı kullanıcı hesabınızla yapılır</li>
              <li>• Agent ayarları panelden güncellenir</li>
            </ul>
          </>
        )}

        <p className="text-center text-sm text-gray-500">
          Zaten hesabın var mı?{" "}
          <Link href="/login" className="font-medium text-gray-900 underline underline-offset-4">
            Giriş yap
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupContent />
    </Suspense>
  );
}
