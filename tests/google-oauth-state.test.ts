import assert from "node:assert/strict";
import test from "node:test";
import {
  createGoogleOAuthStateToken,
  getGoogleOAuthStateExpiry,
  GOOGLE_OAUTH_STATE_TTL_MINUTES,
} from "../src/lib/google-calendar-oauth-state-calculations";

test("createGoogleOAuthStateToken returns URL-safe high-entropy tokens", () => {
  const first = createGoogleOAuthStateToken();
  const second = createGoogleOAuthStateToken();

  assert.notEqual(first, second);
  assert.match(first, /^[A-Za-z0-9_-]+$/);
  assert.ok(first.length >= 40);
});

test("getGoogleOAuthStateExpiry applies the configured short TTL", () => {
  const now = new Date("2026-07-01T12:00:00.000Z");
  const expiry = new Date(getGoogleOAuthStateExpiry(now));

  assert.equal(
    expiry.getTime() - now.getTime(),
    GOOGLE_OAUTH_STATE_TTL_MINUTES * 60 * 1000
  );
});
