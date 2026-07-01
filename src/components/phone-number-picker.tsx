"use client";

import React, { useState } from "react";
import type { TwilioNumber } from "@/lib/twilio/client";

export function PhoneNumberPicker({
  currentPhoneNumber,
  currentNumberSid,
}: {
  currentPhoneNumber?: string | null;
  currentNumberSid?: string | null;
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [countryCode, setCountryCode] = useState("US");
  const [areaCode, setAreaCode] = useState("");
  const [results, setResults] = useState<TwilioNumber[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [releasing, setReleasing] = useState(false);

  const handleSearch = async () => {
    setLoadingSearch(true);
    try {
      const url = `/api/twilio/available-numbers?countryCode=${countryCode}${areaCode ? `&areaCode=${areaCode}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok) {
        setResults(data.numbers || []);
      } else {
        alert("Arama başarısız: " + (data.error || "Bilinmeyen hata"));
      }
    } catch (error) {
      console.error(error);
      alert("Bağlantı hatası");
    } finally {
      setLoadingSearch(false);
    }
  };

  const handlePurchase = async (phoneNumber: string) => {
    setPurchasing(phoneNumber);
    try {
      const res = await fetch("/api/twilio/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, replaceExisting: Boolean(currentNumberSid) })
      });
      const data = await res.json();
      
      if (res.ok) {
        alert("Numara başarıyla satın alındı ve bağlandı!");
        window.location.reload();
      } else {
        alert("Satın alma başarısız: " + (data.error || "Bilinmeyen hata"));
      }
    } catch (error) {
      console.error(error);
      alert("Bağlantı hatası");
    } finally {
      setPurchasing(null);
    }
  };

  const handleRelease = async () => {
    if (!window.confirm("Bu numara Twilio hesabınızdan bırakılacak. Devam edilsin mi?")) {
      return;
    }

    setReleasing(true);
    try {
      const res = await fetch("/api/twilio/release", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        alert("Numara başarıyla bırakıldı.");
        window.location.reload();
      } else {
        alert("Numara bırakılamadı: " + (data.error || "Bilinmeyen hata"));
      }
    } catch (error) {
      console.error(error);
      alert("Bağlantı hatası");
    } finally {
      setReleasing(false);
    }
  };

  if (currentPhoneNumber && !isSearching) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Mevcut Numaranız</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{currentPhoneNumber}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Aktif
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => setIsSearching(true)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Yeni Numara Satın Al
          </button>
          {currentNumberSid && (
            <button
              onClick={handleRelease}
              disabled={releasing}
              className="text-sm font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
            >
              {releasing ? "Bırakılıyor..." : "Numarayı Bırak"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-gray-900">Numara Ara</h3>
        {currentPhoneNumber && (
          <button
            onClick={() => setIsSearching(false)}
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            İptal
          </button>
        )}
      </div>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Ülke</label>
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          >
            <option value="US">Amerika Birleşik Devletleri (+1)</option>
            <option value="GB">İngiltere (+44)</option>
            <option value="CA">Kanada (+1)</option>
            <option value="TR">Türkiye (+90)</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Alan Kodu (Opsiyonel)</label>
          <input
            type="text"
            value={areaCode}
            onChange={(e) => setAreaCode(e.target.value)}
            placeholder="Örn: 212"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loadingSearch}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loadingSearch ? "Aranıyor..." : "Ara"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Uygun Numaralar (Maliyet: $1.15/ay)</h4>
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-200 border rounded-md">
            {results.map((num, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{num.friendlyName}</p>
                  {(num.locality || num.region) && (
                    <p className="text-xs text-gray-500">{num.locality} {num.region}</p>
                  )}
                </div>
                <button
                  onClick={() => handlePurchase(num.phoneNumber)}
                  disabled={purchasing === num.phoneNumber}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {purchasing === num.phoneNumber ? "Alınıyor..." : "Satın Al"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
