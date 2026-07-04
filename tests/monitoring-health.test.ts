import assert from "node:assert/strict";
import test from "node:test";
import {
  summarizeHealth,
  healthHttpStatus,
  type HealthCheck,
} from "../src/lib/monitoring/health";

test("summarizeHealth returns ok when every check passes", () => {
  const checks: HealthCheck[] = [
    { key: "database", ok: true, critical: true },
    { key: "env.resend", ok: true, critical: false },
  ];
  assert.equal(summarizeHealth(checks), "ok");
});

test("summarizeHealth returns degraded when only non-critical checks fail", () => {
  const checks: HealthCheck[] = [
    { key: "database", ok: true, critical: true },
    { key: "env.resend", ok: false, critical: false },
  ];
  assert.equal(summarizeHealth(checks), "degraded");
});

test("summarizeHealth returns down when a critical check fails", () => {
  const checks: HealthCheck[] = [
    { key: "database", ok: false, critical: true },
    { key: "env.resend", ok: false, critical: false },
  ];
  assert.equal(summarizeHealth(checks), "down");
});

test("healthHttpStatus maps down to 503 and everything else to 200", () => {
  assert.equal(healthHttpStatus("down"), 503);
  assert.equal(healthHttpStatus("degraded"), 200);
  assert.equal(healthHttpStatus("ok"), 200);
});
