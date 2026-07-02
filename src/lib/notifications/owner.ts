import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "./email";

// İşletme sahibinin e-postasını auth kaydından çözer.
async function getOwnerEmail(businessId: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("owner_user_id")
    .eq("id", businessId)
    .maybeSingle();

  if (!business?.owner_user_id) return null;

  const { data, error } = await supabase.auth.admin.getUserById(business.owner_user_id);
  if (error) {
    console.error("İşletme sahibi e-postası alınamadı:", error.message);
    return null;
  }
  return data.user?.email ?? null;
}

async function notifyOwner(businessId: string, subject: string, lines: string[]): Promise<void> {
  const email = await getOwnerEmail(businessId);
  if (!email) return;

  const clean = lines.filter(Boolean);
  const text = clean.join("\n");
  const html = `<div style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;color:#111">${clean
    .map((l) => `<p style="margin:0 0 8px">${l}</p>`)
    .join("")}</div>`;

  await sendEmail({ to: email, subject, text, html });
}

// Yeni randevu alındığında işletme sahibine bildirim.
export async function notifyOwnerOfAppointment(
  businessId: string,
  a: {
    customerName: string;
    customerPhone: string;
    whenText: string;
    serviceType?: string;
    address?: string;
  }
): Promise<void> {
  await notifyOwner(businessId, `Yeni randevu: ${a.customerName}`, [
    "AI resepsiyonistiniz yeni bir randevu aldı.",
    `Müşteri: ${a.customerName} (${a.customerPhone})`,
    a.serviceType ? `Hizmet: ${a.serviceType}` : "",
    a.address ? `Adres: ${a.address}` : "",
    `Zaman: ${a.whenText}`,
  ]);
}

// Görüşme acil olarak işaretlendiğinde işletme sahibine anlık uyarı.
export async function notifyOwnerOfEmergency(
  businessId: string,
  a: { callerNumber?: string | null; summary?: string | null; whenText: string }
): Promise<void> {
  await notifyOwner(businessId, "⚠️ Acil durum araması", [
    "AI resepsiyonistiniz bir aramayı ACİL olarak işaretledi.",
    a.callerNumber ? `Arayan: ${a.callerNumber}` : "",
    a.summary ? `Özet: ${a.summary}` : "",
    `Zaman: ${a.whenText}`,
  ]);
}
