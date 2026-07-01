import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Bu blok her görüşme analizinde birebir aynı kalır (işletmeden/görüşmeden
// bağımsız) — cache_control ile işaretleyerek Anthropic prompt caching'i
// devreye sokuyoruz: sadece bu talimat bloğu bir kere "yazılır", sonraki her
// çağrıda ~%90 daha ucuza "okunur". Sadece transkript (messages) her seferinde
// değişir ve cache'in dışında kalır.
const ANALYSIS_INSTRUCTIONS = `
Sen bir ev hizmetleri işletmesi için telefon görüşmesi analistisin. Sana bir
sesli AI resepsiyonist ile bir müşteri arasındaki görüşmenin transkripti
verilecek. Görevin bu transkripti analiz edip yapılandırılmış bir çıktı
üretmek.

Çıktıda şunlar olmalı:

1. summary — İşletme sahibinin 5 saniyede okuyup anlayacağı, 2-3 cümlelik
   özet: kim aradı, ne istedi, ne yapıldı (randevu alındı mı, bilgi mi
   verildi, insana mı aktarıldı).
2. sentiment — Arayan kişinin görüşme boyunca genel duygu durumu:
   "positive" (memnun/sakin), "neutral" (standart/nötr), "negative"
   (sinirli/hayal kırıklığına uğramış/şikayetçi).
3. urgency — Talebin aciliyeti:
   - "low": acil olmayan, planlanabilir bir talep
   - "medium": bir-iki gün içinde çözülmesi beklenen
   - "high": aynı gün müdahale gerektiren
   - "emergency": can/mal güvenliği riski taşıyan (su baskını, gaz kaçağı,
     elektrik yangını riski vb.)
4. key_points — Görüşmede geçen önemli noktaların kısa madde listesi
   (maksimum 5 madde).
5. objections — Varsa müşterinin dile getirdiği itirazlar/tereddütler
   (fiyat endişesi, güven sorunu, zamanlama çakışması vb.). Yoksa boş liste.
6. coaching_opportunities — İşletme sahibi ya da AI agent için koçluk
   fırsatları: agent'ın kaçırdığı bir satış fırsatı, yanlış anladığı bir
   talep, ya da işletmenin süreçlerinde iyileştirilebilecek bir nokta. Yoksa
   boş liste.

Görüşme dili ne olursa olsun (Türkçe, İngilizce, İspanyolca, Fransızca,
Almanca, İtalyanca), çıktıyı her zaman bu alanlarla ve Türkçe metinle üret —
işletme sahipleri bu paneli Türkçe kullanıyor.

Sadece transkripte dayan, spekülasyon yapma. Emin olmadığın bir şeyi kesin gibi
sunma.
`.trim();

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
    urgency: { type: "string", enum: ["low", "medium", "high", "emergency"] },
    key_points: { type: "array", items: { type: "string" } },
    objections: { type: "array", items: { type: "string" } },
    coaching_opportunities: { type: "array", items: { type: "string" } },
  },
  required: [
    "summary",
    "sentiment",
    "urgency",
    "key_points",
    "objections",
    "coaching_opportunities",
  ],
  additionalProperties: false,
} as const;

export type CallAnalysis = {
  summary: string;
  sentiment: "positive" | "neutral" | "negative";
  urgency: "low" | "medium" | "high" | "emergency";
  key_points: string[];
  objections: string[];
  coaching_opportunities: string[];
};

export async function analyzeCallTranscript(transcript: string): Promise<CallAnalysis> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: ANALYSIS_INSTRUCTIONS,
        cache_control: { type: "ephemeral" },
      },
    ],
    output_config: {
      format: { type: "json_schema", schema: OUTPUT_SCHEMA },
    },
    messages: [{ role: "user", content: transcript }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude analiz yanıtında metin bloğu yok.");
  }

  return JSON.parse(textBlock.text) as CallAnalysis;
}
