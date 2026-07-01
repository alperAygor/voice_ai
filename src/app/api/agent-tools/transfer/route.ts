import { NextResponse } from "next/server";
import { parseFunctionCall } from "@/lib/vapi/parse-function-call";
import { markTransferred } from "@/lib/agent-tools/transfer";

export async function POST(req: Request) {
  const { businessId, vapiCallId, callerNumber, parameters } = await parseFunctionCall(req);

  if (!businessId || !vapiCallId) {
    return NextResponse.json({ result: "İşletme veya çağrı bulunamadı." }, { status: 404 });
  }

  await markTransferred(
    businessId,
    vapiCallId,
    callerNumber,
    String(parameters.reason ?? "Belirtilmedi")
  );

  return NextResponse.json({ result: "Görüşme bir çalışana aktarılıyor." });
}
