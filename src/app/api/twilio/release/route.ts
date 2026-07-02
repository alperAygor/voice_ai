import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { releaseNumber } from "@/lib/twilio/client";
import { deletePhoneNumberFromVapi } from "@/lib/twilio/vapi-integration";
import { resolveNumberOpBusinessId } from "@/lib/twilio/target-business";
import { logAuditEvent } from "@/lib/audit-log";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Failed to release number";
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as { businessId?: string };

    // Admin başka tenant adına bırakabilir; kullanıcı yalnızca kendi işletmesi.
    const adminSupabase = createAdminClient();
    const businessId = await resolveNumberOpBusinessId(adminSupabase, user, body.businessId);

    if (!businessId) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const { data: business } = await adminSupabase
      .from("businesses")
      .select("id, phone_number, twilio_phone_number_sid")
      .eq("id", businessId)
      .single();

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    if (!business.twilio_phone_number_sid) {
      return NextResponse.json({ error: "No Twilio number to release" }, { status: 400 });
    }

    const { data: agentConfig } = await adminSupabase
      .from("agent_config")
      .select("id, vapi_phone_number_id")
      .eq("business_id", business.id)
      .single();

    await releaseNumber(business.twilio_phone_number_sid);

    if (agentConfig?.vapi_phone_number_id) {
      try {
        await deletePhoneNumberFromVapi(agentConfig.vapi_phone_number_id);
      } catch (error) {
        console.error("Vapi number cleanup failed:", error);
        await logAuditEvent({
          businessId: business.id,
          actorUserId: user.id,
          eventType: "twilio.vapi_number_cleanup_failed",
          severity: "warning",
          source: "twilio",
          metadata: {
            vapiPhoneId: agentConfig.vapi_phone_number_id,
            message: getErrorMessage(error),
          },
        });
      }
    }

    await adminSupabase
      .from("businesses")
      .update({
        phone_number: null,
        twilio_phone_number_sid: null,
      })
      .eq("id", business.id);

    if (agentConfig) {
      await adminSupabase
        .from("agent_config")
        .update({ vapi_phone_number_id: null })
        .eq("id", agentConfig.id);
    }

    await logAuditEvent({
      businessId: business.id,
      actorUserId: user.id,
      eventType: "twilio.number_released",
      source: "twilio",
      metadata: {
        phoneNumber: business.phone_number,
        twilioNumberSid: business.twilio_phone_number_sid,
        vapiPhoneId: agentConfig?.vapi_phone_number_id ?? null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Twilio release error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
