import { NextResponse } from "next/server";
import { getOAuth2Client } from "@/lib/google-calendar";
import { createAdminClient } from "@/lib/supabase/admin";
import { consumeGoogleOAuthState } from "@/lib/google-calendar-oauth-state";
import { logAuditEvent } from "@/lib/audit-log";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(new URL("/dashboard/agent-settings?error=missing_params", process.env.NEXT_PUBLIC_APP_URL));
  }

  const oauthState = await consumeGoogleOAuthState(state);
  if (!oauthState) {
    return NextResponse.redirect(new URL("/dashboard/agent-settings?error=invalid_calendar_state", process.env.NEXT_PUBLIC_APP_URL));
  }

  const businessId = oauthState.businessId;

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
      throw new Error("Invalid tokens received from Google");
    }

    const supabase = createAdminClient();

    const { error: tokenError } = await supabase
      .from("google_calendar_tokens")
      .upsert({
        business_id: businessId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: new Date(tokens.expiry_date).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'business_id' });

    if (tokenError) {
      console.error("Token save error:", tokenError);
      throw new Error("Failed to save tokens");
    }

    const { error: businessError } = await supabase
      .from("businesses")
      .update({ google_calendar_connected: true })
      .eq("id", businessId);

    if (businessError) {
      console.error("Business update error:", businessError);
      throw new Error("Failed to update business status");
    }

    await logAuditEvent({
      businessId,
      actorUserId: oauthState.ownerUserId,
      eventType: "google_calendar.connected",
      source: "google-calendar",
    });

    return NextResponse.redirect(new URL("/dashboard/agent-settings?calendar=success", process.env.NEXT_PUBLIC_APP_URL));
  } catch (error) {
    console.error("Google Calendar OAuth error:", error);
    await logAuditEvent({
      businessId,
      actorUserId: oauthState.ownerUserId,
      eventType: "google_calendar.oauth_failed",
      severity: "error",
      source: "google-calendar",
      metadata: {
        message: error instanceof Error ? error.message : "Unknown Google Calendar OAuth error",
      },
    });
    return NextResponse.redirect(new URL("/dashboard/agent-settings?error=calendar_oauth_failed", process.env.NEXT_PUBLIC_APP_URL));
  }
}
