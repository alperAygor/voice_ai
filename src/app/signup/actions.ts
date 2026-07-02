"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignupState = { error: string | null; success: boolean };

export async function signUp(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");
  const legalAccepted = formData.get("legal_accept") === "on";

  if (!legalAccepted) {
    return {
      error: "Devam etmek için KVKK, Gizlilik Politikası ve Kullanım Şartları'nı kabul etmelisiniz.",
      success: false,
    };
  }

  if (password.length < 8) {
    return { error: "Şifre en az 8 karakter olmalı.", success: false };
  }

  if (password !== confirmPassword) {
    return { error: "Şifreler eşleşmiyor.", success: false };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    return { error: error.message, success: false };
  }

  return { error: null, success: true };
}

export async function signUpWithGoogle(formData: FormData) {
  const legalAccepted = formData.get("legal_accept") === "on";
  if (!legalAccepted) {
    redirect(
      `/signup?error=${encodeURIComponent(
        "Devam etmek için KVKK, Gizlilik Politikası ve Kullanım Şartları'nı kabul etmelisiniz."
      )}`
    );
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect(data.url);
}
