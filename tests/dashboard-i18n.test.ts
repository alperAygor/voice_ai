import assert from "node:assert/strict";
import test from "node:test";
import { getDashboardDictionary } from "../src/lib/i18n/dashboard";

test("getDashboardDictionary returns localized dashboard navigation", () => {
  const tr = getDashboardDictionary("tr");
  const en = getDashboardDictionary("en");

  assert.equal(tr.sidebar.nav.overview, "Genel Bakış");
  assert.equal(en.sidebar.nav.overview, "Overview");
  assert.equal(en.sidebar.logout, "Log out");
});

test("getDashboardDictionary localizes setup checklist labels", () => {
  const en = getDashboardDictionary("en");

  assert.equal(en.setupChecklist.progress(2, 4), "2/4 steps complete.");
  assert.equal(en.setupChecklist.items.business_profile, "Business profile");
});
