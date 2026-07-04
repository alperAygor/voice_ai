import assert from "node:assert/strict";
import test from "node:test";
import { buildToolCallResponse } from "../src/lib/vapi/tool-response";
import { parseEndOfCallReport } from "../src/lib/vapi/end-of-call-parser";
import { parseVapiToolCallMessage } from "../src/lib/vapi/tool-call-parser";

test("buildToolCallResponse uses legacy shape when no toolCallId", () => {
  assert.deepEqual(buildToolCallResponse("ok", null), { result: "ok" });
});

test("buildToolCallResponse uses results array when toolCallId present", () => {
  assert.deepEqual(buildToolCallResponse({ slots: [] }, "tc_1"), {
    results: [{ toolCallId: "tc_1", result: { slots: [] } }],
    result: { slots: [] },
  });
});

test("parseVapiToolCallMessage captures toolCallId from tool-calls format", () => {
  const parsed = parseVapiToolCallMessage({
    message: {
      call: { id: "call_1", assistantId: "asst_1" },
      toolCallList: [
        { id: "tc_9", name: "check_availability", arguments: '{"date_range_start":"x"}' },
      ],
    },
  });
  assert.equal(parsed.toolCallId, "tc_9");
  assert.equal(parsed.functionName, "check_availability");
  assert.equal(parsed.parameters.date_range_start, "x");
});

test("parseEndOfCallReport reads root-level fields", () => {
  const parsed = parseEndOfCallReport({
    call: { id: "c1", assistantId: "a1", customer: { number: "+900" } },
    transcript: "merhaba",
    endedReason: "customer-ended-call",
    recordingUrl: "https://rec/1.mp3",
    cost: 0.12,
    startedAt: "2026-07-03T10:00:00Z",
    endedAt: "2026-07-03T10:02:00Z",
  });
  assert.equal(parsed.callId, "c1");
  assert.equal(parsed.assistantId, "a1");
  assert.equal(parsed.callerNumber, "+900");
  assert.equal(parsed.transcript, "merhaba");
  assert.equal(parsed.recordingUrl, "https://rec/1.mp3");
  assert.equal(parsed.costUsd, 0.12);
});

test("parseEndOfCallReport falls back to artifact-nested fields", () => {
  const parsed = parseEndOfCallReport({
    call: { id: "c2", assistantId: "a2" },
    artifact: {
      transcript: "artifact transcript",
      recording: { url: "https://rec/2.mp3" },
    },
  });
  assert.equal(parsed.transcript, "artifact transcript");
  assert.equal(parsed.recordingUrl, "https://rec/2.mp3");
  assert.equal(parsed.endedReason, "");
  assert.equal(parsed.costUsd, null);
});
