import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { isSupportAdmin } from "@/lib/admin/access";

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

  return (
    <div className="flex flex-1">
      <Sidebar businessName={business.name} isAdmin={isSupportAdmin(user.email)} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
