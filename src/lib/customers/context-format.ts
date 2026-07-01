export type CustomerAppointmentContext = {
  scheduled_at: string;
  status: "confirmed" | "cancelled" | "completed";
  service_type: string | null;
  notes: string | null;
};

export type CustomerCallContext = {
  started_at: string | null;
  outcome: string | null;
  summary: string | null;
};

export type CustomerContext = {
  isReturningCustomer: boolean;
  appointmentCount: number;
  callCount: number;
  upcomingAppointment: CustomerAppointmentContext | null;
  recentAppointments: CustomerAppointmentContext[];
  recentCalls: CustomerCallContext[];
};

export function summarizeCustomerContext(context: CustomerContext): string {
  if (!context.isReturningCustomer) {
    return "Bu numara için daha önce kayıtlı arama veya randevu bulunmuyor.";
  }

  const parts = [
    `Tekrar arayan müşteri. Toplam ${context.callCount} arama, ${context.appointmentCount} randevu kaydı var.`,
  ];

  if (context.upcomingAppointment) {
    parts.push(
      `Yaklaşan randevu: ${new Date(context.upcomingAppointment.scheduled_at).toLocaleString("tr-TR")} (${context.upcomingAppointment.service_type || "Genel"}).`
    );
  }

  const lastAppointment = context.recentAppointments[0];
  if (lastAppointment) {
    parts.push(
      `Son randevu: ${new Date(lastAppointment.scheduled_at).toLocaleString("tr-TR")} - ${lastAppointment.status}${lastAppointment.service_type ? `, ${lastAppointment.service_type}` : ""}.`
    );
  }

  const lastCall = context.recentCalls[0];
  if (lastCall?.summary) {
    parts.push(`Son görüşme özeti: ${lastCall.summary}`);
  }

  return parts.join(" ");
}
