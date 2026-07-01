import assert from "node:assert/strict";
import test from "node:test";
import {
  APPOINTMENT_SLOT_MINUTES,
  addMinutes,
  getAppointmentWindow,
  isSlotBlockedByScheduleException,
  isSlotBusy,
} from "../src/lib/agent-tools/scheduling";

test("getAppointmentWindow uses the shared appointment slot duration", () => {
  const { start, end } = getAppointmentWindow("2026-07-01T09:00:00.000Z");

  assert.equal(start.toISOString(), "2026-07-01T09:00:00.000Z");
  assert.equal(end.toISOString(), "2026-07-01T11:00:00.000Z");
  assert.equal(APPOINTMENT_SLOT_MINUTES, 120);
});

test("isSlotBusy treats touching endpoints as available and true overlaps as busy", () => {
  const slotStart = new Date(2026, 6, 1, 9, 0, 0, 0);
  const slotEnd = addMinutes(slotStart, 120);

  assert.equal(
    isSlotBusy(slotStart, slotEnd, [
      { start: slotEnd.toISOString(), end: addMinutes(slotEnd, 60).toISOString() },
    ]),
    false
  );

  assert.equal(
    isSlotBusy(slotStart, slotEnd, [
      { start: addMinutes(slotEnd, -1).toISOString(), end: addMinutes(slotEnd, 60).toISOString() },
    ]),
    true
  );
});

test("isSlotBlockedByScheduleException blocks full closed days", () => {
  const slotStart = new Date(2026, 6, 1, 9, 0, 0, 0);
  const slotEnd = addMinutes(slotStart, 120);

  assert.equal(
    isSlotBlockedByScheduleException(slotStart, slotEnd, [
      { date: "2026-07-01", type: "closed", start_time: null, end_time: null },
    ]),
    true
  );
});

test("isSlotBlockedByScheduleException allows only custom open-hour windows", () => {
  const allowedStart = new Date(2026, 6, 1, 9, 0, 0, 0);
  const blockedStart = new Date(2026, 6, 1, 15, 0, 0, 0);
  const exceptions = [
    { date: "2026-07-01", type: "custom_hours" as const, start_time: "09:00", end_time: "13:00" },
  ];

  assert.equal(
    isSlotBlockedByScheduleException(allowedStart, addMinutes(allowedStart, 120), exceptions),
    false
  );
  assert.equal(
    isSlotBlockedByScheduleException(blockedStart, addMinutes(blockedStart, 120), exceptions),
    true
  );
});
