import assert from "node:assert/strict";
import test from "node:test";
import { buildWeeklyDigestEmail } from "../src/lib/notifications/weekly-digest-format";

test("buildWeeklyDigestEmail puts the business name in the subject", () => {
  const { subject } = buildWeeklyDigestEmail({
    businessName: "Acar Tesisat",
    periodLabel: "23 Haziran – 30 Haziran",
    totalCalls: 12,
    appointmentsBooked: 4,
    missedCalls: 2,
    emergencies: 1,
  });
  assert.equal(subject, "Haftalık özet — Acar Tesisat");
});

test("buildWeeklyDigestEmail lists every metric in the body", () => {
  const { text } = buildWeeklyDigestEmail({
    businessName: "Acar Tesisat",
    periodLabel: "23 Haziran – 30 Haziran",
    totalCalls: 12,
    appointmentsBooked: 4,
    missedCalls: 2,
    emergencies: 1,
  });
  assert.match(text, /Toplam çağrı: 12/);
  assert.match(text, /Alınan randevu: 4/);
  assert.match(text, /Kaçırılan \/ sesli mesaj: 2/);
  assert.match(text, /Acil olarak işaretlenen: 1/);
  assert.match(text, /23 Haziran – 30 Haziran/);
});
