import { NextResponse } from "next/server";
import { parseFunctionCall } from "@/lib/vapi/parse-function-call";
import { buildToolCallResponse } from "@/lib/vapi/tool-response";
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
import { logEvent } from "@/lib/monitoring/logger";
import { captureError } from "@/lib/monitoring/events";

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
    logEvent("warn", "vapi.webhook.secret_missing");
  }

  const clone = req.clone();
  const body = await req.json();
  const message = body.message ?? body;

  switch (message.type) {
    case "function-call":
    case "tool-call":
    case "tool-calls": {
      const { businessId, vapiCallId, callerNumber, functionName, toolCallId, parameters } =
        await parseFunctionCall(clone);

      if (!businessId) {
        logEvent("warn", "vapi.tool_call.business_missing", { functionName });
        return NextResponse.json(
          buildToolCallResponse("İşletme bulunamadı.", toolCallId),
          { status: 404 }
        );
      }

      try {
        logEvent("info", "vapi.tool_call.received", {
          businessId,
          vapiCallId,
          functionName,
        });
        switch (functionName) {
          case "get_customer_context": {
            const phone = parameters.customer_phone
              ? String(parameters.customer_phone)
              : callerNumber;
            const context = await getCustomerContext(businessId, phone);
            return NextResponse.json(buildToolCallResponse(context, toolCallId));
          }
          case "check_availability": {
            const { slots } = await checkAvailability(
              businessId,
              String(parameters.date_range_start),
              String(parameters.date_range_end)
            );
            return NextResponse.json(buildToolCallResponse({ slots }, toolCallId));
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
            return NextResponse.json(
              buildToolCallResponse({ appointmentId, status: "confirmed" }, toolCallId)
            );
          }
          case "transfer_to_human": {
            if (!vapiCallId) break;
            const { transferNumber } = await markTransferred(
              businessId,
              vapiCallId,
              callerNumber,
              String(parameters.reason ?? "Belirtilmedi")
            );
            return NextResponse.json(
              buildToolCallResponse(
                {
                  message: "Görüşme bir çalışana aktarılıyor.",
                  ...(transferNumber ? { transferNumber } : {}),
                },
                toolCallId
              )
            );
          }
        }
      } catch (err) {
        await captureError("vapi.tool_call.failed", err, {
          businessId,
          context: { vapiCallId: vapiCallId ?? null, functionName },
        });
        return NextResponse.json(
          buildToolCallResponse("İşlem sırasında bir hata oluştu.", toolCallId),
          { status: 500 }
        );
      }

      return NextResponse.json(
        buildToolCallResponse("Bilinmeyen fonksiyon.", toolCallId),
        { status: 400 }
      );
    }

    case "end-of-call-report": {
      const callId = message.call?.id as string | undefined;
      if (!callId) {
        logEvent("warn", "vapi.end_of_call.call_id_missing");
        return NextResponse.json({ received: true });
      }

      const claim = await claimWebhookEvent({
        provider: "vapi",
        eventId: getVapiEndOfCallEventId(callId),
        eventType: "end-of-call-report",
      });

      if (!claim.acquired) {
        logEvent("info", "vapi.end_of_call.duplicate", { callId });
        return NextResponse.json({ received: true, duplicate: true });
      }

      try {
        logEvent("info", "vapi.end_of_call.received", { callId });
        await handleEndOfCallReport(message);
        if (claim.recordId) {
          await markWebhookEventProcessed(claim.recordId);
        }
      } catch (err) {
        await captureError("vapi.end_of_call.failed", err, {
          context: { callId },
        });
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
