"use client";

import { useActionState, useState } from "react";
import { createScheduleException } from "./actions";

export function ScheduleExceptionForm() {
  const [type, setType] = useState<"closed" | "custom_hours">("closed");
  const [state, formAction, pending] = useActionState(createScheduleException, {
    error: null,
    success: false,
  });

  return (
    <form action={formAction} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-medium text-gray-900">Özel Kapalı Gün / Saat</h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tarih</label>
          <input name="date" type="date" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Kural</label>
          <select
            name="type"
            value={type}
            onChange={(event) => setType(event.target.value as "closed" | "custom_hours")}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="closed">Tüm gün kapalı</option>
            <option value="custom_hours">Sadece bu saatlerde açık</option>
          </select>
        </div>
        {type === "custom_hours" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Başlangıç</label>
              <input name="start_time" type="time" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bitiş</label>
              <input name="end_time" type="time" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </>
        )}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Açıklama</label>
          <input name="reason" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>

      {state.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="mt-3 text-sm text-green-700">Takvim kuralı eklendi.</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
      >
        {pending ? "Kaydediliyor..." : "Kural Ekle"}
      </button>
    </form>
  );
}
