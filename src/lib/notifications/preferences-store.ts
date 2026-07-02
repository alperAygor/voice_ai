import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeNotificationPreferences } from "@/lib/notifications/preferences";

export async function getNotificationPreferencesForBusiness(businessId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("agent_config")
    .select("escalation_rules")
    .eq("business_id", businessId)
    .maybeSingle();

  return normalizeNotificationPreferences(data?.escalation_rules);
}
