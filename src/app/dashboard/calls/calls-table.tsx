"use client";

import React, { useState } from "react";
import { CallDetailModal } from "@/components/call-detail-modal";
import type { DashboardCall } from "@/lib/dashboard/types";

const OUTCOME_LABELS: Record<NonNullable<DashboardCall["outcome"]>, { label: string; color: string }> = {
  appointment_booked: { label: "Randevu", color: "bg-green-100 text-green-800" },
  info_provided: { label: "Bilgi verildi", color: "bg-blue-100 text-blue-800" },
  transferred_to_human: { label: "İnsana aktarıldı", color: "bg-yellow-100 text-yellow-800" },
  missed: { label: "Cevapsız", color: "bg-red-100 text-red-800" },
  emergency_flagged: { label: "Acil", color: "bg-orange-100 text-orange-800" },
  voicemail: { label: "Sesli mesaj", color: "bg-gray-100 text-gray-800" },
};

const SENTIMENT_EMOJIS: Record<NonNullable<DashboardCall["sentiment"]>, string> = {
  positive: "😊",
  neutral: "😐",
  negative: "😞",
};

type CallFilter = "all" | NonNullable<DashboardCall["outcome"]>;

export function CallsTable({ initialCalls }: { initialCalls: DashboardCall[] }) {
  const [filter, setFilter] = useState<CallFilter>("all");
  const [selectedCall, setSelectedCall] = useState<DashboardCall | null>(null);

  const filteredCalls = filter === "all" 
    ? initialCalls 
    : initialCalls.filter(c => c.outcome === filter);

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as CallFilter)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Tüm Aramalar</option>
          {Object.entries(OUTCOME_LABELS).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        
        <span className="text-sm text-gray-500">{filteredCalls.length} arama</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arayan</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Süre</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sonuç</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Duygu</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Maliyet</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCalls.length > 0 ? (
              filteredCalls.map((call) => {
                const outcomeInfo = call.outcome ? OUTCOME_LABELS[call.outcome] : { label: "Bilinmiyor", color: "bg-gray-100 text-gray-800" };
                
                return (
                  <tr 
                    key={call.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedCall(call)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {call.started_at ? new Date(call.started_at).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" }) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {call.caller_number || "Bilinmeyen Numara"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)}:${(call.duration_seconds % 60).toString().padStart(2, '0')}` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${outcomeInfo?.color}`}>
                        {outcomeInfo?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span title={call.sentiment === 'positive' ? 'Olumlu' : call.sentiment === 'negative' ? 'Olumsuz' : 'Nötr'}>
                        {call.sentiment ? SENTIMENT_EMOJIS[call.sentiment] || "😐" : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {call.cost_usd ? `$${Number(call.cost_usd).toFixed(3)}` : "-"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                  Kriterlere uygun kayıtlı arama bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedCall && (
        <CallDetailModal 
          call={selectedCall} 
          isOpen={!!selectedCall} 
          onClose={() => setSelectedCall(null)} 
        />
      )}
    </div>
  );
}
