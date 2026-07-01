import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

type WebhookClaimResult = {
  acquired: boolean;
  recordId: string | null;
};

export async function claimWebhookEvent(input: {
  provider: string;
  eventId: string;
  eventType: string;
}): Promise<WebhookClaimResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("webhook_events")
    .insert({
      provider: input.provider,
      event_id: input.eventId,
      event_type: input.eventType,
      status: "processing",
    })
    .select("id")
    .single();

  if (!error && data) {
    return { acquired: true, recordId: data.id };
  }

  if (error?.code === "23505") {
    return { acquired: false, recordId: null };
  }

  throw new Error(error?.message ?? "Webhook event could not be claimed.");
}

export async function markWebhookEventProcessed(recordId: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("webhook_events")
    .update({
      status: "processed",
      processed_at: new Date().toISOString(),
    })
    .eq("id", recordId);

  if (error) throw new Error(error.message);
}

export async function markWebhookEventFailed(recordId: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("webhook_events")
    .update({ status: "failed" })
    .eq("id", recordId);

  if (error) throw new Error(error.message);
}
