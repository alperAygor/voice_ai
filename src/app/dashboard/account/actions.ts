"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AccountPasswordState = { error: string | null; success: boolean };
export type AccountPasswordResetState = { error: string | null; success: boolean };

export async function updatePassword(
  _prevState: AccountPasswordState,
  formData: FormData
): Promise<AccountPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (password.length < 8) {
    return { error: "Şifre en az 8 karakter olmalı.", success: false };
  }

  if (password !== confirmPassword) {
    return { error: "Şifreler eşleşmiyor.", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message, success: false };
  }

  return { error: null, success: true };
}

export async function sendCurrentUserPasswordReset(
  _prevState: AccountPasswordResetState
): Promise<AccountPasswordResetState> {
  void _prevState;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "Oturum veya e-posta bilgisi bulunamadı.", success: false };
  }

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;
  const redirectTo = origin ? `${origin}/auth/callback?next=/dashboard/account` : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo,
  });

  if (error) {
    return { error: error.message, success: false };
  }

  return { error: null, success: true };
}
