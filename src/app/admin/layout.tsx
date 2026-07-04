import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupportAdmin } from "@/lib/admin/access";

// Admin (platform operatörü) paneli. ADMIN_EMAILS ile yetkilendirilir.
// Kullanıcı (işletme sahibi) panelinden ayrıdır — operatör işleri buradadır.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!isSupportAdmin(user.email)) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gray-900 text-sm text-white">
                A
              </span>
              <span>Voxa Admin</span>
            </Link>
            <nav className="hidden items-center gap-4 text-sm text-gray-600 sm:flex">
              <Link href="/admin" className="hover:text-gray-900">
                Genel Bakış
              </Link>
              <Link href="/admin/monitoring" className="hover:text-gray-900">
                Monitoring
              </Link>
            </nav>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            Kullanıcı paneli →
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
