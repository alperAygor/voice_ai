"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, signInWithGoogle } from "./actions";
import { AuthDivider, AuthLayout, GoogleIcon } from "@/components/auth-layout";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, { error: null });

  return (
    <AuthLayout
      eyebrow="Tekrar hoş geldiniz"
      title="Hesabınıza giriş yapın"
      subtitle="Aramaları, randevuları ve agent ayarlarınızı tek panelden yönetin."
    >
      <div className="space-y-5">
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
              className="form-input mt-1"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                Şifre
              </label>
              <Link
                href="/login/forgot-password"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                Şifremi unuttum
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              className="form-input mt-1"
            />
          </div>

          {state?.error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="primary-action w-full px-3 py-2.5"
          >
            {pending ? "Giriş yapılıyor..." : "Giriş yap"}
          </button>
        </form>

        <AuthDivider />

        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="secondary-action flex w-full items-center justify-center gap-2 px-3 py-2.5"
          >
            <GoogleIcon />
            Google ile giriş yap
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Hesabın yok mu?{" "}
          <Link href="/signup" className="font-medium text-gray-900 underline underline-offset-4">
            Kayıt ol
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
