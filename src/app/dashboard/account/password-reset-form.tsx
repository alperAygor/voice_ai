"use client";

import { useActionState } from "react";
import { sendCurrentUserPasswordReset } from "./actions";

export function AccountPasswordResetForm() {
  const [state, formAction, pending] = useActionState(sendCurrentUserPasswordReset, {
    error: null,
    success: false,
  });

  return (
    <form action={formAction} className="space-y-3">
      <p className="text-sm leading-6 text-gray-500">
        Şifrenizi hatırlamıyorsanız veya daha güvenli şekilde yenilemek
        istiyorsanız hesabınıza bağlı e-postaya sıfırlama bağlantısı gönderin.
      </p>

      {state.error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
      >
        {pending ? "Gönderiliyor..." : "Sıfırlama bağlantısı gönder"}
      </button>
    </form>
  );
}
