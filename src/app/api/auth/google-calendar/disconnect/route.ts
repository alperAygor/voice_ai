import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOAuth2Client } from "@/lib/google-calendar";
import { logAuditEvent } from "@/lib/audit-log";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_user_id", user.id)
    .single();

  if (!business) {
    return NextResponse.redirect(new URL("/dashboard/agent-settings?error=business_not_found", process.env.NEXT_PUBLIC_APP_URL));
  }

  const adminSupabase = createAdminClient();
  const { data: tokenData } = await adminSupabase
    .from("google_calendar_tokens")
    .select("access_token")
    .eq("business_id", business.id)
    .maybeSingle();

  if (tokenData?.access_token) {
    try {
      await getOAuth2Client().revokeToken(tokenData.access_token);
    } catch (error) {
      console.error("Google Calendar token revoke failed:", error);
    }
  }

  await adminSupabase
    .from("google_calendar_tokens")
    .delete()
    .eq("business_id", business.id);

  await adminSupabase
    .from("businesses")
    .update({ google_calendar_connected: false })
    .eq("id", business.id);

  await logAuditEvent({
    businessId: business.id,
    actorUserId: user.id,
    eventType: "google_calendar.disconnected",
    source: "google-calendar",
  });

  return NextResponse.redirect(new URL("/dashboard/agent-settings?calendar=disconnected", process.env.NEXT_PUBLIC_APP_URL));
}
