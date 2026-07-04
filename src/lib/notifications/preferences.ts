export type NotificationPreferences = {
  smsAppointmentConfirmations: boolean;
  whatsappAppointmentConfirmations: boolean;
  smsCallFollowups: boolean;
  whatsappCallFollowups: boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  smsAppointmentConfirmations: true,
  whatsappAppointmentConfirmations: true,
  smsCallFollowups: true,
  whatsappCallFollowups: true,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function normalizeNotificationPreferences(value: unknown): NotificationPreferences {
  const rules = isRecord(value) ? value : {};

  return {
    smsAppointmentConfirmations: readBoolean(
      rules.sms_appointment_confirmations,
      DEFAULT_NOTIFICATION_PREFERENCES.smsAppointmentConfirmations
    ),
    whatsappAppointmentConfirmations: readBoolean(
      rules.whatsapp_appointment_confirmations,
      DEFAULT_NOTIFICATION_PREFERENCES.whatsappAppointmentConfirmations
    ),
    smsCallFollowups: readBoolean(
      rules.sms_call_followups,
      DEFAULT_NOTIFICATION_PREFERENCES.smsCallFollowups
    ),
    whatsappCallFollowups: readBoolean(
      rules.whatsapp_call_followups,
      DEFAULT_NOTIFICATION_PREFERENCES.whatsappCallFollowups
    ),
  };
}
