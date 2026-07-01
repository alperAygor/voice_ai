"use client";

import React, { useEffect } from "react";
import type { DashboardCall } from "@/lib/dashboard/types";
import { calculateCallQualityScore, parseAnalysisJson } from "@/lib/dashboard/metrics";

interface CallDetailModalProps {
  call: DashboardCall;
  isOpen: boolean;
  onClose: () => void;
}

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

export function CallDetailModal({ call, isOpen, onClose }: CallDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const outcomeInfo = call.outcome ? OUTCOME_LABELS[call.outcome] : { label: call.outcome || "Bilinmiyor", color: "bg-gray-100 text-gray-800" };
  const dateStr = call.started_at ? new Date(call.started_at).toLocaleString("tr-TR") : "Bilinmiyor";
  const analysis = parseAnalysisJson(call.analysis_json);
  const qualityScore = calculateCallQualityScore(call);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all flex flex-col max-h-[90vh]">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {call.caller_number || "Bilinmeyen Numara"}
            </h3>
            <p className="text-sm text-gray-500">{dateStr}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-200 transition-colors text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${outcomeInfo.color}`}>
              {outcomeInfo.label}
            </span>
            {call.sentiment && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center gap-1">
                {SENTIMENT_EMOJIS[call.sentiment] || ""} {call.sentiment === "positive" ? "Olumlu" : call.sentiment === "negative" ? "Olumsuz" : "Nötr"}
              </span>
            )}
            {call.urgency === "emergency" && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                🚨 Acil Durum
              </span>
            )}
            {call.urgency === "high" && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Yüksek Öncelik
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Kalite {qualityScore}/100
            </span>
          </div>

          {call.summary && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Özet</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                {call.summary}
              </p>
            </div>
          )}

          {analysis?.key_points && analysis.key_points.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Önemli Noktalar</h4>
              <ul className="list-disc pl-5 space-y-1">
                {analysis.key_points.map((point, i) => (
                  <li key={i} className="text-sm text-gray-700">{point}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.objections && analysis.objections.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Müşteri İtirazları</h4>
              <ul className="list-disc pl-5 space-y-1">
                {analysis.objections.map((objection, i) => (
                  <li key={i} className="text-sm text-gray-700">{objection}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.coaching_opportunities && analysis.coaching_opportunities.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">AI İyileştirme Fırsatları</h4>
              <ul className="list-disc pl-5 space-y-1">
                {analysis.coaching_opportunities.map((opportunity, i) => (
                  <li key={i} className="text-sm text-gray-700">{opportunity}</li>
                ))}
              </ul>
            </div>
          )}

          {call.recording_url && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Ses Kaydı</h4>
              <audio controls src={call.recording_url} className="w-full max-w-md h-10" />
            </div>
          )}

          {call.transcript && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Tam Döküm (Transcript)</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm max-h-64 overflow-y-auto whitespace-pre-wrap font-mono">
                {call.transcript}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between text-sm text-gray-500">
          <div>
            Süre: <span className="font-medium text-gray-900">{call.duration_seconds ? `${Math.floor(call.duration_seconds / 60)} dk ${call.duration_seconds % 60} sn` : "-"}</span>
          </div>
          <div>
            Maliyet: <span className="font-medium text-gray-900">{call.cost_usd ? `$${Number(call.cost_usd).toFixed(3)}` : "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
