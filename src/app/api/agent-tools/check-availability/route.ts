import { NextResponse } from "next/server";
import { parseFunctionCall } from "@/lib/vapi/parse-function-call";
import { checkAvailability } from "@/lib/agent-tools/check-availability";

export async function POST(req: Request) {
  const { businessId, parameters } = await parseFunctionCall(req);

  if (!businessId) {
    return NextResponse.json({ result: "İşletme bulunamadı." }, { status: 404 });
  }

  const { slots } = await checkAvailability(
    businessId,
    String(parameters.date_range_start),
    String(parameters.date_range_end)
  );

  return NextResponse.json({ result: { slots } });
}
