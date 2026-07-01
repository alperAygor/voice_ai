import "server-only";
import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppointmentAction } from "@/lib/appointments/action-token-format";

export const APPOINTMENT_ACTION_TOKEN_TTL_DAYS = 14;

export { buildAppointmentActionUrl, type AppointmentAction } from "@/lib/appointments/action-token-format";

export function createAppointmentActionTokenValue(): string {
  return randomBytes(32).toString("base64url");
}

export function getAppointmentActionTokenExpiry(now = new Date()): string {
  const expiry = new Date(now);
  expiry.setDate(expiry.getDate() + APPOINTMENT_ACTION_TOKEN_TTL_DAYS);
  return expiry.toISOString();
}

export async function createAppointmentActionTokens(input: {
  appointmentId: string;
  businessId: string;
}): Promise<Record<AppointmentAction, string>> {
  const supabase = createAdminClient();
  const confirmToken = createAppointmentActionTokenValue();
  const cancelToken = createAppointmentActionTokenValue();
  const expiresAt = getAppointmentActionTokenExpiry();

  const { error } = await supabase.from("appointment_action_tokens").insert([
    {
      appointment_id: input.appointmentId,
      business_id: input.businessId,
      token: confirmToken,
      action: "confirm",
      expires_at: expiresAt,
    },
    {
      appointment_id: input.appointmentId,
      business_id: input.businessId,
      token: cancelToken,
      action: "cancel",
      expires_at: expiresAt,
    },
  ]);

  if (error) throw new Error(error.message);

  return { confirm: confirmToken, cancel: cancelToken };
}
