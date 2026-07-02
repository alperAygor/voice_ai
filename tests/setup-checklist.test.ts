import assert from "node:assert/strict";
import test from "node:test";
import { buildSetupChecklist } from "../src/lib/onboarding/checklist";

test("buildSetupChecklist calculates completion percent and incomplete steps", () => {
  const checklist = buildSetupChecklist({
    businessName: "Acme",
    serviceCount: 1,
    hasBusinessHours: true,
    googleCalendarConnected: false,
    subscriptionStatus: "trialing",
  });

  assert.equal(checklist.completedCount, 3);
  assert.equal(checklist.totalCount, 4);
  assert.equal(checklist.percent, 75);
  assert.equal(checklist.isComplete, false);
  assert.deepEqual(
    checklist.items.filter((item) => !item.completed).map((item) => item.key),
    ["calendar"]
  );
});

test("buildSetupChecklist marks fully configured businesses complete", () => {
  const checklist = buildSetupChecklist({
    businessName: "Acme",
    serviceCount: 2,
    hasBusinessHours: true,
    googleCalendarConnected: true,
    subscriptionStatus: "active",
  });

  assert.equal(checklist.percent, 100);
  assert.equal(checklist.isComplete, true);
});
