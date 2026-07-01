import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

export type AuditSeverity = "info" | "warning" | "error";

export type AuditEventInput = {
  businessId?: string | null;
  actorUserId?: string | null;
  eventType: string;
  severity?: AuditSeverity;
  source: string;
  metadata?: Json;
};

export async function logAuditEvent(input: AuditEventInput): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("audit_events").insert({
    business_id: input.businessId ?? null,
    actor_user_id: input.actorUserId ?? null,
    event_type: input.eventType,
    severity: input.severity ?? "info",
    source: input.source,
    metadata: input.metadata ?? {},
  });

  if (error) {
    console.error("Audit event could not be written:", error.message);
  }
}
