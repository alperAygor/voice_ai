import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  summarizeCustomerContext,
  type CustomerAppointmentContext,
  type CustomerCallContext,
  type CustomerContext,
} from "@/lib/customers/context-format";

export async function getCustomerContext(
  businessId: string,
  customerPhone: string | null
): Promise<CustomerContext & { summary: string }> {
  if (!customerPhone) {
    const emptyContext: CustomerContext = {
      isReturningCustomer: false,
      appointmentCount: 0,
      callCount: 0,
      upcomingAppointment: null,
      recentAppointments: [],
      recentCalls: [],
    };
    return { ...emptyContext, summary: summarizeCustomerContext(emptyContext) };
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: appointments } = await supabase
    .from("appointments")
    .select("scheduled_at, status, service_type, notes")
    .eq("business_id", businessId)
    .eq("customer_phone", customerPhone)
    .order("scheduled_at", { ascending: false })
    .limit(5);

  const { data: calls } = await supabase
    .from("calls")
    .select("started_at, outcome, summary")
    .eq("business_id", businessId)
    .eq("caller_number", customerPhone)
    .order("started_at", { ascending: false })
    .limit(5);

  const recentAppointments = (appointments ?? []) as CustomerAppointmentContext[];
  const recentCalls = (calls ?? []) as CustomerCallContext[];
  const upcomingAppointment =
    recentAppointments
      .filter((appointment) => appointment.status === "confirmed" && appointment.scheduled_at >= now)
      .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))[0] ?? null;

  const context: CustomerContext = {
    isReturningCustomer: recentAppointments.length > 0 || recentCalls.length > 0,
    appointmentCount: recentAppointments.length,
    callCount: recentCalls.length,
    upcomingAppointment,
    recentAppointments,
    recentCalls,
  };

  return { ...context, summary: summarizeCustomerContext(context) };
}
