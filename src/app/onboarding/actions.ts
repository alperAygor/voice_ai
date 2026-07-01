"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { provisionAssistant } from "@/lib/vapi/provision";
import type { BusinessHours } from "@/lib/business-hours";

export type { BusinessHours, DayHours } from "@/lib/business-hours";

export type OnboardingInput = {
  businessName: string;
  industry: "plumbing" | "electrical" | "hvac" | "other";
  serviceArea: string;
  services: { serviceName: string; isEmergencyEligible: boolean }[];
  businessHours: BusinessHours;
};

export async function completeOnboarding(input: OnboardingInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .insert({
      name: input.businessName,
      industry: input.industry,
      service_area: input.serviceArea,
      business_hours: input.businessHours,
      owner_user_id: user.id,
    })
    .select("id")
    .single();

  if (businessError || !business) {
    return { error: businessError?.message ?? "İşletme oluşturulamadı." };
  }

  const services = input.services
    .filter((s) => s.serviceName.trim().length > 0)
    .map((s) => ({
      business_id: business.id,
      service_name: s.serviceName.trim(),
      is_emergency_eligible: s.isEmergencyEligible,
    }));

  if (services.length > 0) {
    const { error: servicesError } = await supabase
      .from("business_services")
      .insert(services);

    if (servicesError) {
      return { error: servicesError.message };
    }
  }

  const { error: agentConfigError } = await supabase.from("agent_config").insert({
    business_id: business.id,
  });

  if (agentConfigError) {
    return { error: agentConfigError.message };
  }

  try {
    await provisionAssistant(business.id);
  } catch (err) {
    // Vapi anahtarı henüz tanımlı değilse burada sessizce başarısız olur;
    // işletme sahibi Agent Ayarları sayfasından tekrar deneyebilir.
    console.error("Vapi assistant provisioning failed:", err);
  }

  redirect("/dashboard");
}
