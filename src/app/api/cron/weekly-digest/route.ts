import { NextResponse } from "next/server";
import { sendWeeklyDigests } from "@/lib/notifications/weekly-digest";

// Vercel Cron bunu günde bir kez çağırır (Hobby yalnızca günlük cron'a izin verir),
// ama özet HAFTALIK: yalnızca Pazartesi (UTC) gönderilir. Manuel test için
// ?force=1 ile gün kontrolü atlanır (yine de CRON_SECRET gerekir).
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const force = new URL(req.url).searchParams.get("force") === "1";
  const now = new Date();

  if (!force && now.getUTCDay() !== 1) {
    return NextResponse.json({ skipped: true, reason: "not-monday" });
  }

  const result = await sendWeeklyDigests(now);
  return NextResponse.json(result);
}
