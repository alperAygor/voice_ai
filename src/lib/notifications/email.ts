import "server-only";

// Resend ile e-posta gönderimi (SDK yok, ince fetch). RESEND_API_KEY yoksa
// sessizce atlar (uyarı loglar) — böylece anahtar girilmeden de akış kırılmaz.
export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY tanımlı değil — e-posta gönderilmedi:", params.subject);
    return false;
  }

  const from = process.env.RESEND_FROM ?? "Voxa <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: params.to,
        subject: params.subject,
        text: params.text,
        ...(params.html ? { html: params.html } : {}),
      }),
    });

    if (!res.ok) {
      console.error("Resend e-posta hatası:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("Resend e-posta gönderilemedi:", err);
    return false;
  }
}
