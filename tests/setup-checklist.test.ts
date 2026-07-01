import assert from "node:assert/strict";
import test from "node:test";
import { buildSetupChecklist } from "../src/lib/onboarding/checklist";

test("buildSetupChecklist calculates completion percent and incomplete steps", () => {
  const checklist = buildSetupChecklist({
    businessName: "Acme",
    serviceCount: 1,
    hasBusinessHours: true,
    vapiAssistantId: "asst_123",
    phoneNumber: null,
    vapiPhoneNumberId: null,
    googleCalendarConnected: false,
    subscriptionStatus: "trialing",
  });

  assert.equal(checklist.completedCount, 4);
  assert.equal(checklist.totalCount, 6);
  assert.equal(checklist.percent, 67);
  assert.equal(checklist.isComplete, false);
  assert.deepEqual(
    checklist.items.filter((item) => !item.completed).map((item) => item.key),
    ["phone_number", "calendar"]
  );
});

test("buildSetupChecklist marks fully configured businesses complete", () => {
  const checklist = buildSetupChecklist({
    businessName: "Acme",
    serviceCount: 2,
    hasBusinessHours: true,
    vapiAssistantId: "asst_123",
    phoneNumber: "+15550000000",
    vapiPhoneNumberId: "phone_123",
    googleCalendarConnected: true,
    subscriptionStatus: "active",
  });

  assert.equal(checklist.percent, 100);
  assert.equal(checklist.isComplete, true);
});
