import type { VapiFunctionDef } from "./client";

export const AGENT_FUNCTIONS: VapiFunctionDef[] = [
  {
    name: "get_customer_context",
    description: "Arayan numaranın önceki arama/randevu geçmişini kısaca döndürür",
    parameters: {
      type: "object",
      properties: {
        customer_phone: { type: "string", description: "Arayan kişinin telefon numarası" },
      },
      required: [],
    },
  },
  {
    name: "check_availability",
    description: "Belirtilen tarih aralığında takvimde müsait saatleri döndürür",
    parameters: {
      type: "object",
      properties: {
        date_range_start: { type: "string", description: "ISO date" },
        date_range_end: { type: "string", description: "ISO date" },
      },
      required: ["date_range_start", "date_range_end"],
    },
  },
  {
    name: "book_appointment",
    description: "Randevuyu takvime kaydeder",
    parameters: {
      type: "object",
      properties: {
        customer_name: { type: "string" },
        customer_phone: { type: "string" },
        address: { type: "string" },
        service_type: { type: "string" },
        scheduled_at: { type: "string", description: "ISO datetime" },
        notes: { type: "string" },
      },
      required: ["customer_name", "customer_phone", "scheduled_at"],
    },
  },
  {
    name: "transfer_to_human",
    description: "Görüşmeyi canlı bir çalışana aktarır",
    parameters: {
      type: "object",
      properties: {
        reason: { type: "string" },
      },
      required: ["reason"],
    },
  },
];
