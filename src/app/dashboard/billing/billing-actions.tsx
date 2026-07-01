"use client";

import React, { useState } from "react";

export function BillingActions({ hasSubscription }: { hasSubscription: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Bir hata oluştu: " + (data.error || "Bilinmeyen hata"));
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("Bağlantı hatası");
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Bir hata oluştu: " + (data.error || "Bilinmeyen hata"));
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("Bağlantı hatası");
      setLoading(false);
    }
  };

  if (hasSubscription) {
    return (
      <button
        onClick={handlePortal}
        disabled={loading}
        className="mt-4 w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? "Yükleniyor..." : "Abonelik Yönet (Stripe)"}
      </button>
    );
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="mt-4 w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {loading ? "Yönlendiriliyor..." : "Plan Seç ($149/ay)"}
    </button>
  );
}
