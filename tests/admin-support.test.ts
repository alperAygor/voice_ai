import assert from "node:assert/strict";
import test from "node:test";
import { parseAdminEmails } from "../src/lib/admin/access";
import { getBusinessIntegrationHealth } from "../src/lib/admin/support-summary";

test("parseAdminEmails normalizes comma separated admin emails", () => {
  assert.deepEqual(parseAdminEmails(" A@EXAMPLE.com, b@example.com ,, "), [
    "a@example.com",
    "b@example.com",
  ]);
});

test("getBusinessIntegrationHealth marks complete integrations as healthy", () => {
  const health = getBusinessIntegrationHealth({
    id: "b1",
    name: "Acme",
    phone_number: "+15550000000",
    google_calendar_connected: true,
    subscription_status: "active",
    stripe_customer_id: "cus_123",
    twilio_phone_number_sid: "PN123",
    agent_config: {
      vapi_assistant_id: "asst_123",
      vapi_phone_number_id: "phone_123",
    },
  });

  assert.deepEqual(health.map((item) => item.status), [
    "healthy",
    "healthy",
    "healthy",
    "healthy",
  ]);
});

test("getBusinessIntegrationHealth distinguishes partial phone setup as warning", () => {
  const phone = getBusinessIntegrationHealth({
    id: "b1",
    name: "Acme",
    phone_number: "+15550000000",
    google_calendar_connected: false,
    subscription_status: "incomplete",
    stripe_customer_id: null,
    twilio_phone_number_sid: null,
    agent_config: null,
  }).find((item) => item.label === "Telefon");

  assert.equal(phone?.status, "warning");
});
