import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupportAdmin } from "@/lib/admin/access";

// Twilio numara işlemleri için hedef işletmeyi belirler.
// - Admin (ADMIN_EMAILS) + businessId verilmişse → o işletme (başka tenant adına).
// - Aksi halde → çağıran kullanıcının kendi işletmesi.
// Böylece numara sağlama operatör (admin) tarafından, herhangi bir tenant için
// yapılabilir; normal kullanıcı yalnızca kendi işletmesi üzerinde işlem yapar.
export async function resolveNumberOpBusinessId(
  adminSupabase: SupabaseClient,
  user: { id: string; email?: string | null },
  requestedBusinessId: string | null | undefined
): Promise<string | null> {
  if (requestedBusinessId && isSupportAdmin(user.email)) {
    return requestedBusinessId;
  }

  const { data } = await adminSupabase
    .from("businesses")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  return data?.id ?? null;
}
