import "server-only";
import { google } from "googleapis";
import { createAdminClient } from "@/lib/supabase/admin";

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google-calendar/callback`
  );
}

export async function isCalendarConnected(businessId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("google_calendar_tokens")
    .select("id")
    .eq("business_id", businessId)
    .single();
  
  return !!data;
}

export async function getValidAccessToken(businessId: string): Promise<string> {
  const supabase = createAdminClient();
  const { data: tokenData } = await supabase
    .from("google_calendar_tokens")
    .select("*")
    .eq("business_id", businessId)
    .single();

  if (!tokenData) throw new Error("Google Calendar not connected");

  const expiry = new Date(tokenData.token_expiry);
  const now = new Date();

  // If token is still valid (with 5 min buffer)
  if (expiry.getTime() > now.getTime() + 5 * 60 * 1000) {
    return tokenData.access_token;
  }

  // Refresh token
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: tokenData.refresh_token,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  if (!credentials.access_token || !credentials.expiry_date) {
    throw new Error("Failed to refresh Google Calendar token");
  }

  await supabase
    .from("google_calendar_tokens")
    .update({
      access_token: credentials.access_token,
      token_expiry: new Date(credentials.expiry_date).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("business_id", businessId);

  return credentials.access_token;
}

export async function getCalendarEvents(businessId: string, timeMin: string, timeMax: string) {
  const accessToken = await getValidAccessToken(businessId);
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  
  // Get calendar ID from DB
  const supabase = createAdminClient();
  const { data: tokenData } = await supabase
    .from("google_calendar_tokens")
    .select("calendar_id")
    .eq("business_id", businessId)
    .single();
    
  const calendarId = tokenData?.calendar_id || "primary";

  const res = await calendar.events.list({
    calendarId,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
  });

  return (res.data.items || []).map(event => ({
    summary: event.summary,
    start: event.start?.dateTime || event.start?.date,
    end: event.end?.dateTime || event.end?.date,
  }));
}

export async function createCalendarEvent(
  businessId: string, 
  event: { summary: string; description?: string; start: string; end: string; location?: string }
) {
  const accessToken = await getValidAccessToken(businessId);
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  
  const supabase = createAdminClient();
  const { data: tokenData } = await supabase
    .from("google_calendar_tokens")
    .select("calendar_id")
    .eq("business_id", businessId)
    .single();
    
  const calendarId = tokenData?.calendar_id || "primary";

  const res = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: { dateTime: event.start, timeZone: "Europe/Istanbul" },
      end: { dateTime: event.end, timeZone: "Europe/Istanbul" },
    },
  });

  return res.data.id;
}

export async function deleteCalendarEvent(businessId: string, eventId: string) {
  const accessToken = await getValidAccessToken(businessId);
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  
  const supabase = createAdminClient();
  const { data: tokenData } = await supabase
    .from("google_calendar_tokens")
    .select("calendar_id")
    .eq("business_id", businessId)
    .single();
    
  const calendarId = tokenData?.calendar_id || "primary";

  await calendar.events.delete({
    calendarId,
    eventId,
  });
}
