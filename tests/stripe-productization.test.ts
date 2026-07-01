import assert from "node:assert/strict";
import test from "node:test";
import {
  formatStripeAmountUsd,
  formatUnixTimestampDate,
  getInvoiceStatusLabel,
} from "../src/lib/billing/invoice-format";

test("formatStripeAmountUsd formats cents into dashboard currency text", () => {
  assert.equal(formatStripeAmountUsd(14900), "$149.00");
  assert.equal(formatStripeAmountUsd(0), "$0.00");
  assert.equal(formatStripeAmountUsd(null), "$0.00");
});

test("formatUnixTimestampDate converts Stripe seconds into ISO dates", () => {
  assert.equal(
    formatUnixTimestampDate(1782907200),
    "2026-07-01T12:00:00.000Z"
  );
});

test("getInvoiceStatusLabel maps Stripe invoice statuses into Turkish labels", () => {
  assert.equal(getInvoiceStatusLabel("paid"), "Ödendi");
  assert.equal(getInvoiceStatusLabel("open"), "Bekliyor");
  assert.equal(getInvoiceStatusLabel(null), "Bilinmiyor");
});
