"use client";

import { useActionState } from "react";
import { createManualAppointment } from "./actions";

export function ManualAppointmentForm() {
  const [state, formAction, pending] = useActionState(createManualAppointment, {
    error: null,
    success: false,
  });

  return (
    <form action={formAction} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-medium text-gray-900">Manuel Randevu Ekle</h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Müşteri adı</label>
          <input name="customer_name" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Telefon</label>
          <input name="customer_phone" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Hizmet</label>
          <input name="service_type" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tarih / saat</label>
          <input name="scheduled_at" type="datetime-local" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Adres</label>
          <input name="address" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Not</label>
          <textarea name="notes" rows={2} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>

      {state.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="mt-3 text-sm text-green-700">Randevu oluşturuldu.</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Kaydediliyor..." : "Randevu Ekle"}
      </button>
    </form>
  );
}
