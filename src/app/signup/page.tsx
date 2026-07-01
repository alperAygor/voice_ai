"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "./actions";
import { signInWithGoogle } from "../login/actions";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, {
    error: null,
    success: false,
  });

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Kayıt ol</h1>
          <p className="mt-1 text-sm text-gray-500">
            İşletmen için birkaç dakikada hesap oluştur.
          </p>
        </div>

        {state?.success ? (
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            Kayıt başarılı. Devam etmek için e-postana gelen doğrulama
            bağlantısına tıkla.
          </p>
        ) : (
          <>
            <form action={formAction} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  E-posta
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Şifre
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                />
              </div>

              {state?.error && (
                <p className="text-sm text-red-600">{state.error}</p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {pending ? "Kayıt oluşturuluyor..." : "Kayıt ol"}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">veya</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <form action={signInWithGoogle}>
              <button
                type="submit"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Google ile kayıt ol
              </button>
            </form>
          </>
        )}

        <p className="text-center text-sm text-gray-500">
          Zaten hesabın var mı?{" "}
          <Link href="/login" className="font-medium text-gray-900 underline">
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  );
}
