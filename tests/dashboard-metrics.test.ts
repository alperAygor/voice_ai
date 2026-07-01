import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateAverageQualityScore,
  calculateCallQualityScore,
  calculateConversionRate,
  extractAiImprovementInsights,
  parseAnalysisJson,
} from "../src/lib/dashboard/metrics";

test("calculateConversionRate returns rounded appointment conversion percentage", () => {
  assert.equal(calculateConversionRate(0, 0), 0);
  assert.equal(calculateConversionRate(7, 2), 29);
});

test("calculateCallQualityScore rewards successful positive calls and penalizes missed calls", () => {
  const goodScore = calculateCallQualityScore({
    outcome: "appointment_booked",
    sentiment: "positive",
    urgency: "low",
    transcript: "Customer booked a visit.",
    analysis_json: { coaching_opportunities: [], objections: [] },
  });
  const missedScore = calculateCallQualityScore({
    outcome: "missed",
    sentiment: "negative",
    urgency: "high",
    transcript: "",
    analysis_json: { coaching_opportunities: ["Follow up sooner"], objections: ["Long wait"] },
  });

  assert.ok(goodScore > 90);
  assert.ok(missedScore < 40);
});

test("calculateAverageQualityScore averages individual call scores", () => {
  const average = calculateAverageQualityScore([
    { outcome: "appointment_booked", sentiment: "positive", urgency: "low", transcript: "ok" },
    { outcome: "missed", sentiment: "negative", urgency: "medium", transcript: "" },
  ]);

  assert.ok(average > 50);
  assert.ok(average < 80);
});

test("extractAiImprovementInsights groups coaching opportunities and inferred risks", () => {
  const insights = extractAiImprovementInsights([
    {
      outcome: "info_provided",
      sentiment: "negative",
      urgency: "high",
      transcript: "x",
      analysis_json: { coaching_opportunities: ["Ask for appointment earlier"] },
    },
    {
      outcome: "info_provided",
      sentiment: "neutral",
      urgency: "low",
      transcript: "x",
      analysis_json: { coaching_opportunities: ["Ask for appointment earlier"] },
    },
  ]);

  assert.equal(insights[0].text, "Ask for appointment earlier");
  assert.equal(insights[0].count, 2);
  assert.ok(insights.some((insight) => insight.text.includes("Yüksek aciliyetli")));
});

test("parseAnalysisJson ignores malformed analysis payloads", () => {
  assert.deepEqual(parseAnalysisJson(null), {});
  assert.deepEqual(parseAnalysisJson({ coaching_opportunities: ["x", 1] }), {
    key_points: [],
    objections: [],
    coaching_opportunities: ["x"],
  });
});
