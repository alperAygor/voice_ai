import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createGoogleOAuthStateToken,
  getGoogleOAuthStateExpiry,
} from "@/lib/google-calendar-oauth-state-calculations";

export {
  createGoogleOAuthStateToken,
  getGoogleOAuthStateExpiry,
  GOOGLE_OAUTH_STATE_TTL_MINUTES,
} from "@/lib/google-calendar-oauth-state-calculations";

export type GoogleOAuthStateRecord = {
  businessId: string;
  ownerUserId: string;
  redirectPath: string;
};

export async function createGoogleOAuthState(input: {
  businessId: string;
  ownerUserId: string;
  redirectPath?: string;
}): Promise<string> {
  const supabase = createAdminClient();
  const stateToken = createGoogleOAuthStateToken();

  const { error } = await supabase.from("google_oauth_states").insert({
    business_id: input.businessId,
    owner_user_id: input.ownerUserId,
    state_token: stateToken,
    redirect_path: input.redirectPath ?? "/dashboard/agent-settings",
    expires_at: getGoogleOAuthStateExpiry(),
  });

  if (error) {
    throw new Error(error.message);
  }

  return stateToken;
}

export async function consumeGoogleOAuthState(
  stateToken: string
): Promise<GoogleOAuthStateRecord | null> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("google_oauth_states")
    .select("business_id, owner_user_id, redirect_path, expires_at, used_at")
    .eq("state_token", stateToken)
    .maybeSingle();

  if (error || !data || data.used_at || data.expires_at <= now) {
    return null;
  }

  const { error: updateError } = await supabase
    .from("google_oauth_states")
    .update({ used_at: now })
    .eq("state_token", stateToken)
    .is("used_at", null);

  if (updateError) {
    return null;
  }

  return {
    businessId: data.business_id,
    ownerUserId: data.owner_user_id,
    redirectPath: data.redirect_path,
  };
}
