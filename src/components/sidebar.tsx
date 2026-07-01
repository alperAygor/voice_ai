"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth-actions";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Genel Bakış" },
  { href: "/dashboard/calls", label: "Aramalar" },
  { href: "/dashboard/appointments", label: "Randevular" },
  { href: "/dashboard/agent-settings", label: "Agent Ayarları" },
  { href: "/dashboard/billing", label: "Faturalandırma" },
];

export function Sidebar({ businessName, isAdmin }: { businessName: string; isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-4">
        <p className="text-sm font-semibold truncate">{businessName}</p>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                active
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/support"
            className="block rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Support
          </Link>
        )}
      </nav>
      <div className="border-t border-gray-200 p-2">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Çıkış yap
          </button>
        </form>
      </div>
    </aside>
  );
}
