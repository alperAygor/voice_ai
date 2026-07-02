import assert from "node:assert/strict";
import test from "node:test";
import { buildSystemPrompt } from "../src/lib/vapi/system-prompt";

const baseInput = {
  businessName: "Acme Plumbing",
  industry: "plumbing" as const,
  serviceArea: "Istanbul",
  businessHoursText: "Pzt: 09:00-17:00",
  servicesList: "Tesisat, bakım",
  emergencyKeywords: "su baskını",
  language: "tr" as const,
};

test("buildSystemPrompt includes concise booking and call-cost guardrails", () => {
  const prompt = buildSystemPrompt(baseInput);

  assert.match(prompt, /Çok kısa konuş/);
  assert.match(prompt, /Aynı anda yalnızca bir soru sor/);
  assert.match(prompt, /book_appointment çağır/);
});

test("buildSystemPrompt includes dashboard custom instructions", () => {
  const prompt = buildSystemPrompt({
    ...baseInput,
    responseStyle: "balanced",
    customInstructions: "Önce posta kodunu sor.",
  });

  assert.match(prompt, /Denge modu/);
  assert.match(prompt, /Önce posta kodunu sor/);
});
