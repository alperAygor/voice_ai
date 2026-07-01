"use client";

import React, { useState } from "react";
import { updateAppointmentStatus } from "./actions";
import type { AppointmentStatus, DashboardAppointment } from "@/lib/dashboard/types";

export function AppointmentsList({ initialAppointments }: { initialAppointments: DashboardAppointment[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: Extract<AppointmentStatus, "completed" | "cancelled">) => {
    setLoadingId(id);
    try {
      await updateAppointmentStatus(id, status);
    } catch (error) {
      console.error("Status update failed:", error);
      alert("Durum güncellenirken bir hata oluştu.");
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Onaylandı</span>;
      case "completed":
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Tamamlandı</span>;
      case "cancelled":
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">İptal Edildi</span>;
      default:
        return <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hizmet / Not</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih/Saat</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {initialAppointments.length > 0 ? (
              initialAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {apt.customer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {apt.customer_phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                    <div className="font-medium">{apt.service_type || "-"}</div>
                    {apt.notes && <div className="text-xs text-gray-400 mt-1 truncate">{apt.notes}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(apt.scheduled_at).toLocaleString("tr-TR", { 
                      dateStyle: "medium", 
                      timeStyle: "short" 
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(apt.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {apt.status === "confirmed" && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleStatusChange(apt.id, "completed")}
                          disabled={loadingId === apt.id}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          Tamamla
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleStatusChange(apt.id, "cancelled")}
                          disabled={loadingId === apt.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          İptal
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                  Henüz kayıtlı bir randevu yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
