import assert from "node:assert/strict";
import test from "node:test";
import { formatBusinessHours, type BusinessHours } from "../src/lib/business-hours";
import { DEFAULT_LOCALE, getLandingDictionary, normalizeLocale } from "../src/lib/i18n/landing";
import { DEFAULT_GREETING, industryLabel, VAPI_LOCALE } from "../src/lib/vapi/languages";

const weekdayHours: BusinessHours = {
  mon: { open: "09:00", close: "17:00", closed: false },
  tue: { open: "09:00", close: "17:00", closed: false },
  wed: { open: "09:00", close: "17:00", closed: false },
  thu: { open: "09:00", close: "17:00", closed: false },
  fri: { open: "09:00", close: "17:00", closed: false },
  sat: { open: "10:00", close: "14:00", closed: false },
  sun: { open: "00:00", close: "00:00", closed: true },
};

test("formatBusinessHours renders localized open and closed days", () => {
  const formatted = formatBusinessHours(weekdayHours, "tr");

  assert.match(formatted, /Pzt: 09:00-17:00/);
  assert.match(formatted, /Paz: Kapalı/);
});

test("normalizeLocale falls back to the default locale for unknown values", () => {
  assert.equal(normalizeLocale("en"), "en");
  assert.equal(normalizeLocale("de"), DEFAULT_LOCALE);
  assert.equal(normalizeLocale(undefined), DEFAULT_LOCALE);
});

test("landing dictionaries expose matching pricing plan ids across locales", () => {
  const tr = getLandingDictionary("tr");
  const en = getLandingDictionary("en");

  assert.deepEqual(
    tr.pricing.plans.map((plan) => plan.id),
    ["starter", "pro"]
  );
  assert.deepEqual(
    en.pricing.plans.map((plan) => plan.id),
    ["starter", "pro"]
  );
});

test("Vapi language metadata keeps locale, industry label, and greeting aligned", () => {
  assert.equal(VAPI_LOCALE.en, "en-US");
  assert.equal(industryLabel("tr", "hvac"), "HVAC/klima servisi");
  assert.match(DEFAULT_GREETING.fr("Demo"), /Demo/);
});
