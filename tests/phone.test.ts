import assert from "node:assert/strict";
import test from "node:test";
import { normalizePhoneNumber } from "../src/lib/phone";

test("normalizePhoneNumber strips formatting and keeps leading plus", () => {
  assert.equal(normalizePhoneNumber("+90 (532) 123-45-67"), "+905321234567");
  assert.equal(normalizePhoneNumber("532 123 45 67"), "5321234567");
});

test("normalizePhoneNumber rejects too-short or empty input", () => {
  assert.equal(normalizePhoneNumber(""), null);
  assert.equal(normalizePhoneNumber("   "), null);
  assert.equal(normalizePhoneNumber("12345"), null);
  assert.equal(normalizePhoneNumber(null), null);
});

test("normalizePhoneNumber rejects too-long input", () => {
  assert.equal(normalizePhoneNumber("+1234567890123456"), null);
});
