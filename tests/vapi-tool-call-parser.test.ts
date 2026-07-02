import assert from "node:assert/strict";
import test from "node:test";
import { parseVapiToolCallMessage } from "../src/lib/vapi/tool-call-parser";

test("parseVapiToolCallMessage supports legacy functionCall parameters", () => {
  const parsed = parseVapiToolCallMessage({
    message: {
      call: {
        id: "call_123",
        assistantId: "asst_123",
        customer: { number: "+15550000000" },
      },
      functionCall: {
        name: "book_appointment",
        parameters: { customer_name: "Ada", scheduled_at: "2026-07-02T10:00:00Z" },
      },
    },
  });

  assert.equal(parsed.callId, "call_123");
  assert.equal(parsed.assistantId, "asst_123");
  assert.equal(parsed.callerNumber, "+15550000000");
  assert.equal(parsed.functionName, "book_appointment");
  assert.equal(parsed.parameters.customer_name, "Ada");
});

test("parseVapiToolCallMessage supports toolCallList JSON arguments", () => {
  const parsed = parseVapiToolCallMessage({
    message: {
      call: { id: "call_456", assistantId: "asst_456" },
      toolCallList: [
        {
          function: {
            name: "check_availability",
            arguments: JSON.stringify({
              date_range_start: "2026-07-02",
              date_range_end: "2026-07-03",
            }),
          },
        },
      ],
    },
  });

  assert.equal(parsed.functionName, "check_availability");
  assert.equal(parsed.parameters.date_range_start, "2026-07-02");
});
