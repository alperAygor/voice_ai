import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOAuth2Client } from "@/lib/google-calendar";
import { createGoogleOAuthState } from "@/lib/google-calendar-oauth-state";
import { logAuditEvent } from "@/lib/audit-log";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_user_id", user.id)
    .single();

  if (!business) {
    return NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL));
  }

  const oauth2Client = getOAuth2Client();
  const stateToken = await createGoogleOAuthState({
    businessId: business.id,
    ownerUserId: user.id,
  });

  await logAuditEvent({
    businessId: business.id,
    actorUserId: user.id,
    eventType: "google_calendar.oauth_started",
    source: "google-calendar",
  });

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.readonly"
    ],
    state: stateToken,
    prompt: "consent",
  });

  return NextResponse.redirect(url);
}
