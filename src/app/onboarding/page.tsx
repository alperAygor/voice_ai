import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "./wizard";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: existingBusiness } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (existingBusiness) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold">İşletmeni kur</h1>
      <p className="mt-1 text-sm text-gray-500">
        AI resepsiyonistin doğru çalışabilmesi için birkaç bilgiye ihtiyacımız
        var.
      </p>
      <div className="mt-8">
        <OnboardingWizard />
      </div>
    </div>
  );
}
