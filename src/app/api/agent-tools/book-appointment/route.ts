import { NextResponse } from "next/server";
import { parseFunctionCall } from "@/lib/vapi/parse-function-call";
import { bookAppointment } from "@/lib/agent-tools/book-appointment";

export async function POST(req: Request) {
  const { businessId, vapiCallId, parameters } = await parseFunctionCall(req);

  if (!businessId || !vapiCallId) {
    return NextResponse.json({ result: "İşletme veya çağrı bulunamadı." }, { status: 404 });
  }

  try {
    const { appointmentId } = await bookAppointment(businessId, vapiCallId, {
      customer_name: String(parameters.customer_name ?? ""),
      customer_phone: String(parameters.customer_phone ?? ""),
      address: parameters.address ? String(parameters.address) : undefined,
      service_type: parameters.service_type ? String(parameters.service_type) : undefined,
      scheduled_at: String(parameters.scheduled_at),
      notes: parameters.notes ? String(parameters.notes) : undefined,
    });

    return NextResponse.json({ result: { appointmentId, status: "confirmed" } });
  } catch (err) {
    console.error("book_appointment error:", err);
    return NextResponse.json(
      { result: "Randevu oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}
