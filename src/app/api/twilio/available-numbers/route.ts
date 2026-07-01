import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchAvailableNumbers } from "@/lib/twilio/client";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Failed to search numbers";
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const countryCode = url.searchParams.get("countryCode") || "US";
    const areaCode = url.searchParams.get("areaCode") || undefined;

    const numbers = await searchAvailableNumbers(countryCode, areaCode);
    return NextResponse.json({ numbers });
  } catch (error: unknown) {
    console.error("Twilio search error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
