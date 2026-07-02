"use client";

import { useActionState } from "react";
import { updatePassword } from "./actions";

export function AccountPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, {
    error: null,
    success: false,
  });

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-900">
          Yeni şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-900">
          Yeni şifre tekrar
        </label>
        <input
          id="confirm_password"
          name="confirm_password"
          type="password"
          minLength={8}
          required
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700">Şifreniz güncellendi.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Güncelleniyor..." : "Şifreyi güncelle"}
      </button>
    </form>
  );
}
