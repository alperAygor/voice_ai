import { NextResponse } from "next/server";
import { parseFunctionCall } from "@/lib/vapi/parse-function-call";
import { checkAvailability } from "@/lib/agent-tools/check-availability";
import { bookAppointment } from "@/lib/agent-tools/book-appointment";
import { markTransferred } from "@/lib/agent-tools/transfer";
import { handleEndOfCallReport } from "@/lib/vapi/handle-end-of-call";
import { getCustomerContext } from "@/lib/agent-tools/customer-context";
import {
  claimWebhookEvent,
  markWebhookEventFailed,
  markWebhookEventProcessed,
} from "@/lib/webhooks/idempotency";
import { getVapiEndOfCallEventId } from "@/lib/webhooks/event-ids";

export async function POST(req: Request) {
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  if (secret) {
    if (req.headers.get("x-vapi-secret") !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    // Secret ayarlı değilse webhook doğrulanmıyor — sahte veri POST edilebilir.
    // Production'da VAPI_WEBHOOK_SECRET mutlaka ayarlanmalı (assistant da bunu
    // gönderecek şekilde yeniden provision edilmeli).
    console.warn(
      "GÜVENLİK: VAPI_WEBHOOK_SECRET ayarlı değil — Vapi webhook'u doğrulanmadan işleniyor."
    );
  }

  const clone = req.clone();
  const body = await req.json();
  const message = body.message ?? body;

  switch (message.type) {
    case "function-call": {
      const { businessId, vapiCallId, callerNumber, functionName, parameters } =
        await parseFunctionCall(clone);

      if (!businessId) {
        return NextResponse.json({ result: "İşletme bulunamadı." }, { status: 404 });
      }

      try {
        switch (functionName) {
          case "get_customer_context": {
            const phone = parameters.customer_phone
              ? String(parameters.customer_phone)
              : callerNumber;
            const context = await getCustomerContext(businessId, phone);
            return NextResponse.json({ result: context });
          }
          case "check_availability": {
            const { slots } = await checkAvailability(
              businessId,
              String(parameters.date_range_start),
              String(parameters.date_range_end)
            );
            return NextResponse.json({ result: { slots } });
          }
          case "book_appointment": {
            if (!vapiCallId) break;
            const { appointmentId } = await bookAppointment(businessId, vapiCallId, {
              customer_name: String(parameters.customer_name ?? ""),
              customer_phone: String(parameters.customer_phone ?? ""),
              address: parameters.address ? String(parameters.address) : undefined,
              service_type: parameters.service_type
                ? String(parameters.service_type)
                : undefined,
              scheduled_at: String(parameters.scheduled_at),
              notes: parameters.notes ? String(parameters.notes) : undefined,
            });
            return NextResponse.json({ result: { appointmentId, status: "confirmed" } });
          }
          case "transfer_to_human": {
            if (!vapiCallId) break;
            await markTransferred(
              businessId,
              vapiCallId,
              callerNumber,
              String(parameters.reason ?? "Belirtilmedi")
            );
            return NextResponse.json({ result: "Görüşme bir çalışana aktarılıyor." });
          }
        }
      } catch (err) {
        console.error(`Vapi function-call (${functionName}) hatası:`, err);
        return NextResponse.json({ result: "İşlem sırasında bir hata oluştu." }, { status: 500 });
      }

      return NextResponse.json({ result: "Bilinmeyen fonksiyon." }, { status: 400 });
    }

    case "end-of-call-report": {
      const callId = message.call?.id as string | undefined;
      if (!callId) {
        return NextResponse.json({ received: true });
      }

      const claim = await claimWebhookEvent({
        provider: "vapi",
        eventId: getVapiEndOfCallEventId(callId),
        eventType: "end-of-call-report",
      });

      if (!claim.acquired) {
        return NextResponse.json({ received: true, duplicate: true });
      }

      try {
        await handleEndOfCallReport(message);
        if (claim.recordId) {
          await markWebhookEventProcessed(claim.recordId);
        }
      } catch (err) {
        console.error("end-of-call-report işlenemedi:", err);
        if (claim.recordId) {
          await markWebhookEventFailed(claim.recordId);
        }
      }
      return NextResponse.json({ received: true });
    }

    default:
      return NextResponse.json({ received: true });
  }
}
