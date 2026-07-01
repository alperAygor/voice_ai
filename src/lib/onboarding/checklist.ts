export type SetupChecklistInput = {
  businessName?: string | null;
  serviceCount: number;
  hasBusinessHours: boolean;
  vapiAssistantId?: string | null;
  phoneNumber?: string | null;
  vapiPhoneNumberId?: string | null;
  googleCalendarConnected: boolean;
  subscriptionStatus?: string | null;
};

export type SetupChecklistItem = {
  key: string;
  label: string;
  completed: boolean;
  href: string;
};

export type SetupChecklist = {
  items: SetupChecklistItem[];
  completedCount: number;
  totalCount: number;
  percent: number;
  isComplete: boolean;
};

export function buildSetupChecklist(input: SetupChecklistInput): SetupChecklist {
  const items: SetupChecklistItem[] = [
    {
      key: "business_profile",
      label: "İşletme profili",
      completed: Boolean(input.businessName && input.hasBusinessHours),
      href: "/dashboard/agent-settings",
    },
    {
      key: "services",
      label: "Hizmetler",
      completed: input.serviceCount > 0,
      href: "/onboarding",
    },
    {
      key: "vapi_assistant",
      label: "Vapi agent",
      completed: Boolean(input.vapiAssistantId),
      href: "/dashboard/agent-settings",
    },
    {
      key: "phone_number",
      label: "Telefon numarası",
      completed: Boolean(input.phoneNumber && input.vapiPhoneNumberId),
      href: "/dashboard/agent-settings",
    },
    {
      key: "calendar",
      label: "Google Takvim",
      completed: input.googleCalendarConnected,
      href: "/dashboard/agent-settings",
    },
    {
      key: "billing",
      label: "Faturalandırma",
      completed: input.subscriptionStatus === "active" || input.subscriptionStatus === "trialing",
      href: "/dashboard/billing",
    },
  ];

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;

  return {
    items,
    completedCount,
    totalCount,
    percent: Math.round((completedCount / totalCount) * 100),
    isComplete: completedCount === totalCount,
  };
}
