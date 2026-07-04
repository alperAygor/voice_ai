// İki abonelik planının kanonik tanımı. Landing kopya metinleri i18n
// sözlüğünde; burada fiyat/limit/özellik-gating ve Stripe price eşlemesi var.

export type PlanId = "starter" | "pro";

export type PlanDefinition = {
  id: PlanId;
  name: string;
  priceUsd: number;
  includedMinutes: number;
  overageRateUsd: number;
  features: {
    whatsappSms: boolean;
    callbacksReminders: boolean;
    prioritySupport: boolean;
  };
  // Stripe fiyat ID'sinin okunacağı ortam değişkeni adı.
  stripePriceEnvVar: string;
};

export const PLANS: Record<PlanId, PlanDefinition> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceUsd: 99,
    includedMinutes: 200,
    overageRateUsd: 0.5,
    features: { whatsappSms: false, callbacksReminders: false, prioritySupport: false },
    stripePriceEnvVar: "STRIPE_PRICE_ID_STARTER",
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceUsd: 199,
    includedMinutes: 500,
    overageRateUsd: 0.5,
    features: { whatsappSms: true, callbacksReminders: true, prioritySupport: true },
    stripePriceEnvVar: "STRIPE_PRICE_ID_PRO",
  },
};

export const DEFAULT_PLAN_ID: PlanId = "starter";
export const DEFAULT_PLAN = PLANS[DEFAULT_PLAN_ID];

export function isPlanId(value: unknown): value is PlanId {
  return value === "starter" || value === "pro";
}

export function getPlanDefinition(planId: PlanId = DEFAULT_PLAN_ID): PlanDefinition {
  return PLANS[planId];
}

export function getPlanPriceId(
  planId: PlanId,
  env: Record<string, string | undefined>
): string | null {
  const priceId = env[PLANS[planId].stripePriceEnvVar];
  return priceId && priceId.trim() ? priceId : null;
}

// WhatsApp/SMS gibi özelliklerin plana göre açık olup olmadığını döndürür.
export function planHasWhatsappSms(planId: PlanId): boolean {
  return PLANS[planId].features.whatsappSms;
}

// Stripe price ID'sinden plana geri eşleme (portal üzerinden plan değişimini
// webhook'ta yakalamak için). Eşleşme yoksa null.
export function getPlanIdByPriceId(
  priceId: string | null | undefined,
  env: Record<string, string | undefined>
): PlanId | null {
  if (!priceId) return null;
  for (const plan of Object.values(PLANS)) {
    const configured = env[plan.stripePriceEnvVar];
    if (configured && configured.trim() === priceId) return plan.id;
  }
  return null;
}
