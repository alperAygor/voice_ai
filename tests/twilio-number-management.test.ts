import assert from "node:assert/strict";
import test from "node:test";
import { getTwilioNumberChangePlan } from "../src/lib/twilio/number-management";

test("getTwilioNumberChangePlan keeps first-time purchases from releasing anything", () => {
  assert.deepEqual(
    getTwilioNumberChangePlan({
      currentNumberSid: null,
      replacingExistingNumber: false,
    }),
    {
      shouldReleasePreviousNumber: false,
      previousNumberSid: null,
    }
  );
});

test("getTwilioNumberChangePlan releases the previous number only for replacements", () => {
  assert.deepEqual(
    getTwilioNumberChangePlan({
      currentNumberSid: " PN123 ",
      replacingExistingNumber: true,
    }),
    {
      shouldReleasePreviousNumber: true,
      previousNumberSid: "PN123",
    }
  );
});
