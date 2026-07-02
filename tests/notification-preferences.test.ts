import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  normalizeNotificationPreferences,
} from "../src/lib/notifications/preferences";

test("normalizeNotificationPreferences returns safe defaults for missing settings", () => {
  assert.deepEqual(normalizeNotificationPreferences(null), DEFAULT_NOTIFICATION_PREFERENCES);
});

test("normalizeNotificationPreferences reads explicit boolean settings only", () => {
  assert.deepEqual(
    normalizeNotificationPreferences({
      sms_appointment_confirmations: false,
      whatsapp_appointment_confirmations: true,
      sms_call_followups: false,
    }),
    {
      smsAppointmentConfirmations: false,
      whatsappAppointmentConfirmations: true,
      smsCallFollowups: false,
    }
  );

  assert.equal(
    normalizeNotificationPreferences({ sms_appointment_confirmations: "false" })
      .smsAppointmentConfirmations,
    true
  );
});
