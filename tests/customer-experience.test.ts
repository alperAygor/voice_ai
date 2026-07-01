import assert from "node:assert/strict";
import test from "node:test";
import { buildAppointmentActionUrl } from "../src/lib/appointments/action-token-format";
import { buildAppointmentConfirmationMessage } from "../src/lib/appointments/notification-message";
import { summarizeCustomerContext } from "../src/lib/customers/context-format";

test("buildAppointmentActionUrl creates public response links with action and token", () => {
  assert.equal(
    buildAppointmentActionUrl({
      appUrl: "https://example.com",
      token: "abc123",
      action: "cancel",
    }),
    "https://example.com/api/appointments/respond?token=abc123&action=cancel"
  );
});

test("buildAppointmentConfirmationMessage includes confirmation and cancellation links", () => {
  const message = buildAppointmentConfirmationMessage({
    whenText: "1 Temmuz 2026 13:00",
    confirmUrl: "https://example.com/confirm",
    cancelUrl: "https://example.com/cancel",
  });

  assert.match(message, /Randevunuz oluşturuldu/);
  assert.match(message, /Onaylamak için: https:\/\/example.com\/confirm/);
  assert.match(message, /İptal için: https:\/\/example.com\/cancel/);
});

test("summarizeCustomerContext describes returning callers with appointment and call history", () => {
  const summary = summarizeCustomerContext({
    isReturningCustomer: true,
    appointmentCount: 2,
    callCount: 3,
    upcomingAppointment: {
      scheduled_at: "2026-07-01T10:00:00.000Z",
      status: "confirmed",
      service_type: "Bakım",
      notes: null,
    },
    recentAppointments: [
      {
        scheduled_at: "2026-06-01T10:00:00.000Z",
        status: "completed",
        service_type: "Kontrol",
        notes: null,
      },
    ],
    recentCalls: [
      {
        started_at: "2026-06-10T10:00:00.000Z",
        outcome: "info_provided",
        summary: "Müşteri bakım sürecini sordu.",
      },
    ],
  });

  assert.match(summary, /Tekrar arayan müşteri/);
  assert.match(summary, /Yaklaşan randevu/);
  assert.match(summary, /Son görüşme özeti/);
});
