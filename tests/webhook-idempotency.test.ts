import assert from "node:assert/strict";
import test from "node:test";
import { getVapiEndOfCallEventId } from "../src/lib/webhooks/event-ids";

test("getVapiEndOfCallEventId creates stable duplicate-detection keys", () => {
  assert.equal(getVapiEndOfCallEventId("call_123"), "call_123:end-of-call-report");
});
