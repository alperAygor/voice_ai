"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, signInWithGoogle } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, { error: null });

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Giriş yap</h1>
          <p className="mt-1 text-sm text-gray-500">
            Hesabına giriş yaparak devam et.
          </p>
        </div>

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
            {pending ? "Giriş yapılıyor..." : "Giriş yap"}
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
            Google ile giriş yap
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Hesabın yok mu?{" "}
          <Link href="/signup" className="font-medium text-gray-900 underline">
            Kayıt ol
          </Link>
        </p>
      </div>
    </div>
  );
}
