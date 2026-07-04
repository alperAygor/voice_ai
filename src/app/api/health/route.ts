import { NextResponse } from "next/server";
import { logEvent } from "@/lib/monitoring/logger";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  summarizeHealth,
  healthHttpStatus,
  type HealthCheck,
} from "@/lib/monitoring/health";

export const dynamic = "force-dynamic";

// Veritabanına ucuz bir sorgu atarak bağlantıyı doğrular. Hata/timeout durumunda
// false döner — health asla exception fırlatmamalı.
async function pingDatabase(): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return false;
  }
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("businesses")
      .select("id", { count: "exact", head: true });
    return !error;
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const requestId = req.headers.get("x-vercel-id") ?? crypto.randomUUID();

  const env = {
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    serviceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    appUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    vapiApiKey: Boolean(process.env.VAPI_API_KEY),
    vapiWebhookSecret: Boolean(process.env.VAPI_WEBHOOK_SECRET),
    anthropicApiKey: Boolean(process.env.ANTHROPIC_API_KEY),
    twilio: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
    stripeSecret: Boolean(process.env.STRIPE_SECRET_KEY),
    stripeWebhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    resend: Boolean(process.env.RESEND_API_KEY),
  };

  const database = await pingDatabase();

  // Kritik: bunlarsız temel akış (arama karşılama, kayıt) çalışmaz. Diğerleri
  // opsiyonel/entegrasyona bağlı olduğundan yalnızca "degraded"a düşürür.
  const checks: HealthCheck[] = [
    { key: "database", ok: database, critical: true },
    { key: "env.supabaseUrl", ok: env.supabaseUrl, critical: true },
    { key: "env.serviceRoleKey", ok: env.serviceRoleKey, critical: true },
    { key: "env.appUrl", ok: env.appUrl, critical: true },
    { key: "env.vapiApiKey", ok: env.vapiApiKey, critical: true },
    { key: "env.vapiWebhookSecret", ok: env.vapiWebhookSecret, critical: false },
    { key: "env.anthropicApiKey", ok: env.anthropicApiKey, critical: false },
    { key: "env.twilio", ok: env.twilio, critical: false },
    { key: "env.stripeSecret", ok: env.stripeSecret, critical: false },
    { key: "env.stripeWebhookSecret", ok: env.stripeWebhookSecret, critical: false },
    { key: "env.resend", ok: env.resend, critical: false },
  ];

  const status = summarizeHealth(checks);
  const httpStatus = healthHttpStatus(status);

  logEvent(
    status === "ok" ? "info" : status === "degraded" ? "warn" : "error",
    "health.checked",
    { requestId, status, database }
  );

  return NextResponse.json(
    {
      ok: status === "ok",
      status,
      service: "voice-ai",
      timestamp: new Date().toISOString(),
      checks: {
        database,
        env,
        degraded: checks.filter((c) => !c.ok).map((c) => c.key),
      },
    },
    { status: httpStatus }
  );
}
