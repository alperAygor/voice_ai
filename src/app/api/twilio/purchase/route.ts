import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { purchaseNumber, releaseNumber } from "@/lib/twilio/client";
import {
  importPhoneNumberToVapi,
  assignPhoneNumberToAssistant,
  deletePhoneNumberFromVapi,
} from "@/lib/twilio/vapi-integration";
import { getTwilioNumberChangePlan } from "@/lib/twilio/number-management";
import { resolveNumberOpBusinessId } from "@/lib/twilio/target-business";
import { logAuditEvent } from "@/lib/audit-log";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Failed to purchase number";
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      phoneNumber?: string;
      replaceExisting?: boolean;
      businessId?: string;
    };
    const { phoneNumber } = body;
    if (!phoneNumber) {
      return NextResponse.json({ error: "phoneNumber is required" }, { status: 400 });
    }

    // Admin (ADMIN_EMAILS) başka tenant adına sağlayabilir; kullanıcı yalnızca kendi
    // işletmesi için. Operatör işlemi olduğundan okumalar admin client ile yapılır.
    const adminSupabase = createAdminClient();
    const businessId = await resolveNumberOpBusinessId(adminSupabase, user, body.businessId);

    if (!businessId) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const { data: business } = await adminSupabase
      .from("businesses")
      .select("id, twilio_phone_number_sid")
      .eq("id", businessId)
      .single();

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const { data: agentConfig } = await adminSupabase
      .from("agent_config")
      .select("id, vapi_assistant_id, vapi_phone_number_id")
      .eq("business_id", business.id)
      .single();

    const replacementPlan = getTwilioNumberChangePlan({
      currentNumberSid: business.twilio_phone_number_sid,
      replacingExistingNumber: Boolean(body.replaceExisting),
    });

    const previousVapiPhoneId = agentConfig?.vapi_phone_number_id ?? null;
    const { sid: twilioNumberSid, phoneNumber: purchasedNumber } = await purchaseNumber(phoneNumber);
    let vapiPhoneId: string | null = null;

    try {
      const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID!;
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN!;

      const imported = await importPhoneNumberToVapi(
        purchasedNumber,
        twilioAccountSid,
        twilioAuthToken
      );
      vapiPhoneId = imported.vapiPhoneId;

      if (agentConfig?.vapi_assistant_id) {
        await assignPhoneNumberToAssistant(vapiPhoneId, agentConfig.vapi_assistant_id);
      }

      await adminSupabase
        .from("businesses")
        .update({
          phone_number: purchasedNumber,
          twilio_phone_number_sid: twilioNumberSid,
        })
        .eq("id", business.id);

      if (agentConfig) {
        await adminSupabase
          .from("agent_config")
          .update({ vapi_phone_number_id: vapiPhoneId })
          .eq("id", agentConfig.id);
      }

      if (replacementPlan.shouldReleasePreviousNumber && replacementPlan.previousNumberSid) {
        try {
          await releaseNumber(replacementPlan.previousNumberSid);
          if (previousVapiPhoneId) {
            await deletePhoneNumberFromVapi(previousVapiPhoneId);
          }
        } catch (releaseError) {
          console.error("Previous Twilio/Vapi number cleanup failed:", releaseError);
          await logAuditEvent({
            businessId: business.id,
            actorUserId: user.id,
            eventType: "twilio.previous_number_cleanup_failed",
            severity: "warning",
            source: "twilio",
            metadata: {
              previousNumberSid: replacementPlan.previousNumberSid,
              previousVapiPhoneId,
              message: getErrorMessage(releaseError),
            },
          });
        }
      }

      await logAuditEvent({
        businessId: business.id,
        actorUserId: user.id,
        eventType: replacementPlan.shouldReleasePreviousNumber
          ? "twilio.number_replaced"
          : "twilio.number_purchased",
        source: "twilio",
        metadata: {
          twilioNumberSid,
          vapiPhoneId,
          phoneNumber: purchasedNumber,
          previousNumberSid: replacementPlan.previousNumberSid,
        },
      });

      return NextResponse.json({
        success: true,
        phoneNumber: purchasedNumber,
        vapiPhoneId,
      });
    } catch (error) {
      if (vapiPhoneId) {
        try {
          await deletePhoneNumberFromVapi(vapiPhoneId);
        } catch (cleanupError) {
          console.error("Vapi rollback failed:", cleanupError);
        }
      }

      try {
        await releaseNumber(twilioNumberSid);
      } catch (rollbackError) {
        console.error("Twilio rollback failed:", rollbackError);
        await logAuditEvent({
          businessId: business.id,
          actorUserId: user.id,
          eventType: "twilio.rollback_failed",
          severity: "error",
          source: "twilio",
          metadata: {
            twilioNumberSid,
            phoneNumber: purchasedNumber,
            message: getErrorMessage(rollbackError),
          },
        });
      }

      throw error;
    }
  } catch (error: unknown) {
    console.error("Twilio purchase error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
