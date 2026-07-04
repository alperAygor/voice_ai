import assert from "node:assert/strict";
import test from "node:test";
import { getErrorMessage } from "../src/lib/monitoring/logger";

test("getErrorMessage keeps known error messages and hides unknown shapes", () => {
  assert.equal(getErrorMessage(new Error("boom")), "boom");
  assert.equal(getErrorMessage({ message: "not trusted" }), "Unknown error");
});
