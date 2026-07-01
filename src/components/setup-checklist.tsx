import Link from "next/link";
import type { SetupChecklist } from "@/lib/onboarding/checklist";

export function SetupChecklistPanel({ checklist }: { checklist: SetupChecklist }) {
  if (checklist.isComplete) return null;

  return (
    <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-medium text-amber-950">Kurulum checklist&apos;i</h2>
          <p className="mt-1 text-sm text-amber-800">
            {checklist.completedCount}/{checklist.totalCount} adım tamamlandı.
          </p>
        </div>
        <div className="h-2 w-full rounded-full bg-amber-100 sm:w-48">
          <div
            className="h-2 rounded-full bg-amber-500"
            style={{ width: `${checklist.percent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {checklist.items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`rounded-md border px-3 py-2 text-sm ${
              item.completed
                ? "border-green-200 bg-white text-green-800"
                : "border-amber-200 bg-white text-amber-900 hover:bg-amber-100"
            }`}
          >
            <span className="font-medium">{item.completed ? "Tamam" : "Eksik"}</span>
            <span className="ml-2">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
