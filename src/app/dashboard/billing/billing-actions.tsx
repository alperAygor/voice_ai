"use client";

import React, { useState } from "react";
import { PLANS, type PlanId } from "@/lib/billing/plans";

// window.location mutasyonu component gövdesinde React Compiler tarafından
// yasaklanıyor; modül kapsamındaki bu yardımcıya taşındı.
function redirectTo(url: string) {
  window.location.href = url;
}

export function BillingActions({
  hasSubscription,
  currentPlanId,
}: {
  hasSubscription: boolean;
  currentPlanId: PlanId;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const checkout = async (planId: PlanId) => {
    setLoading(planId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.url) {
        redirectTo(data.url);
      } else {
        alert("Bir hata oluştu: " + (data.error || "Bilinmeyen hata"));
        setLoading(null);
      }
    } catch (error) {
      console.error(error);
      alert("Bağlantı hatası");
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    setLoading("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        redirectTo(data.url);
      } else {
        alert("Bir hata oluştu: " + (data.error || "Bilinmeyen hata"));
        setLoading(null);
      }
    } catch (error) {
      console.error(error);
      alert("Bağlantı hatası");
      setLoading(null);
    }
  };

  if (hasSubscription) {
    return (
      <button
        onClick={handlePortal}
        disabled={loading !== null}
        className="mt-4 inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 sm:w-auto"
      >
        {loading === "portal" ? "Yükleniyor..." : "Aboneliği ve planı yönet (Stripe)"}
      </button>
    );
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {Object.values(PLANS).map((plan) => (
        <div
          key={plan.id}
          className={`rounded-lg border p-4 ${
            plan.id === currentPlanId ? "border-indigo-500 ring-1 ring-indigo-500" : "border-gray-200"
          }`}
        >
          <div className="flex items-baseline justify-between">
            <span className="font-medium text-gray-900">{plan.name}</span>
            <span className="text-lg font-bold text-gray-900">
              ${plan.priceUsd}
              <span className="text-xs font-normal text-gray-500">/ay</span>
            </span>
          </div>
          <ul className="mt-3 space-y-1 text-xs text-gray-600">
            <li>{plan.includedMinutes} dakika dahil</li>
            <li>{plan.features.whatsappSms ? "WhatsApp + SMS bildirimleri" : "Sadece SMS bildirimleri"}</li>
            <li>
              {plan.features.callbacksReminders
                ? "Otomatik geri arama + hatırlatma"
                : "Temel çağrı yönetimi"}
            </li>
            {plan.features.prioritySupport && <li>Öncelikli destek</li>}
          </ul>
          <button
            onClick={() => checkout(plan.id)}
            disabled={loading !== null}
            className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading === plan.id ? "Yönlendiriliyor..." : `${plan.name} planını seç`}
          </button>
        </div>
      ))}
    </div>
  );
}
