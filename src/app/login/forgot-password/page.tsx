"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "../actions";
import { AuthLayout } from "@/components/auth-layout";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, {
    error: null,
    success: false,
  });

  return (
    <AuthLayout
      eyebrow="Hesap güvenliği"
      title="Şifrenizi sıfırlayın"
      subtitle="E-postanızı girin; hesabınız için güvenli bir sıfırlama bağlantısı gönderelim."
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
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {state.error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </div>
          )}
          {state.success && (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              Sıfırlama bağlantısı e-posta adresine gönderildi.
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-gray-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50"
          >
            {pending ? "Gönderiliyor..." : "Sıfırlama bağlantısı gönder"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          <Link href="/login" className="font-medium text-gray-900 underline underline-offset-4">
            Giriş sayfasına dön
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
