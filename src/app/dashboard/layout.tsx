import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { isSupportAdmin } from "@/lib/admin/access";
import { getRequestLocale } from "@/lib/i18n/server";
import { getDashboardDictionary } from "@/lib/i18n/dashboard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (!business) {
    redirect("/onboarding");
  }

  const locale = await getRequestLocale();
  const dictionary = getDashboardDictionary(locale);

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <Sidebar
        businessName={business.name}
        dictionary={dictionary.sidebar}
        isAdmin={isSupportAdmin(user.email)}
      />
      <main className="min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
