export type BusinessSupportRow = {
  id: string;
  name: string;
  phone_number: string | null;
  google_calendar_connected: boolean;
  subscription_status: string;
  stripe_customer_id: string | null;
  twilio_phone_number_sid: string | null;
  agent_config?: {
    vapi_assistant_id: string | null;
    vapi_phone_number_id: string | null;
  } | null;
};

export type IntegrationHealth = {
  label: string;
  status: "healthy" | "warning" | "missing";
};

export function getBusinessIntegrationHealth(row: BusinessSupportRow): IntegrationHealth[] {
  const agent = row.agent_config;

  return [
    {
      label: "Vapi",
      status: agent?.vapi_assistant_id ? "healthy" : "missing",
    },
    {
      label: "Telefon",
      status: row.phone_number && row.twilio_phone_number_sid && agent?.vapi_phone_number_id
        ? "healthy"
        : row.phone_number || row.twilio_phone_number_sid
          ? "warning"
          : "missing",
    },
    {
      label: "Takvim",
      status: row.google_calendar_connected ? "healthy" : "missing",
    },
    {
      label: "Stripe",
      status: row.subscription_status === "active" || row.subscription_status === "trialing"
        ? "healthy"
        : row.stripe_customer_id
          ? "warning"
          : "missing",
    },
  ];
}
