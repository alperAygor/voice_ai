"use client";

import { useState, useTransition } from "react";
import {
  completeOnboarding,
  type BusinessHours,
  type OnboardingInput,
} from "./actions";

const INDUSTRIES: { value: OnboardingInput["industry"]; label: string }[] = [
  { value: "plumbing", label: "Tesisatçı" },
  { value: "electrical", label: "Elektrikçi" },
  { value: "hvac", label: "HVAC / Klima" },
  { value: "other", label: "Diğer" },
];

const DAYS: { key: keyof BusinessHours; label: string }[] = [
  { key: "mon", label: "Pazartesi" },
  { key: "tue", label: "Salı" },
  { key: "wed", label: "Çarşamba" },
  { key: "thu", label: "Perşembe" },
  { key: "fri", label: "Cuma" },
  { key: "sat", label: "Cumartesi" },
  { key: "sun", label: "Pazar" },
];

const DEFAULT_HOURS: BusinessHours = DAYS.reduce((acc, day) => {
  acc[day.key] = {
    open: "09:00",
    close: "17:00",
    closed: day.key === "sat" || day.key === "sun",
  };
  return acc;
}, {} as BusinessHours);

const STEPS = ["İşletme", "Hizmetler", "Çalışma saatleri", "Gözden geçir"];

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] =
    useState<OnboardingInput["industry"]>("plumbing");
  const [serviceArea, setServiceArea] = useState("");
  const [services, setServices] = useState<
    { serviceName: string; isEmergencyEligible: boolean }[]
  >([{ serviceName: "", isEmergencyEligible: false }]);
  const [businessHours, setBusinessHours] =
    useState<BusinessHours>(DEFAULT_HOURS);

  const canGoNext = () => {
    if (step === 0) return businessName.trim().length > 0;
    if (step === 1)
      return services.some((s) => s.serviceName.trim().length > 0);
    return true;
  };

  const next = () => step < STEPS.length - 1 && setStep(step + 1);
  const back = () => step > 0 && setStep(step - 1);

  const updateService = (
    index: number,
    patch: Partial<{ serviceName: string; isEmergencyEligible: boolean }>
  ) => {
    setServices((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s))
    );
  };

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await completeOnboarding({
        businessName,
        industry,
        serviceArea,
        services,
        businessHours,
      });
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div>
      <ol className="mb-8 flex gap-2 text-xs">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`flex-1 rounded-full px-2 py-1 text-center ${
              i === step
                ? "bg-gray-900 text-white"
                : i < step
                ? "bg-gray-300 text-gray-700"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">İşletme adı</label>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Örn. Yılmaz Tesisat"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Sektör</label>
            <select
              value={industry}
              onChange={(e) =>
                setIndustry(e.target.value as OnboardingInput["industry"])
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {INDUSTRIES.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">
              Hizmet bölgesi
            </label>
            <input
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Örn. Kadıköy, Üsküdar, Ataşehir"
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Sunduğun hizmetleri ekle, acil durum kapsamına giriyorsa
            işaretle.
          </p>
          {services.map((service, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={service.serviceName}
                onChange={(e) =>
                  updateService(i, { serviceName: e.target.value })
                }
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Örn. Su kaçağı tamiri"
              />
              <label className="flex items-center gap-1 text-xs text-gray-500">
                <input
                  type="checkbox"
                  checked={service.isEmergencyEligible}
                  onChange={(e) =>
                    updateService(i, { isEmergencyEligible: e.target.checked })
                  }
                />
                Acil
              </label>
              <button
                type="button"
                onClick={() =>
                  setServices((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="text-xs text-gray-400 hover:text-red-600"
                disabled={services.length === 1}
              >
                Sil
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setServices((prev) => [
                ...prev,
                { serviceName: "", isEmergencyEligible: false },
              ])
            }
            className="text-sm font-medium text-gray-900 underline"
          >
            + Hizmet ekle
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2">
          {DAYS.map((day) => {
            const hours = businessHours[day.key];
            return (
              <div key={day.key} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0">{day.label}</span>
                <label className="flex items-center gap-1 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={!hours.closed}
                    onChange={(e) =>
                      setBusinessHours((prev) => ({
                        ...prev,
                        [day.key]: { ...hours, closed: !e.target.checked },
                      }))
                    }
                  />
                  Açık
                </label>
                <input
                  type="time"
                  value={hours.open}
                  disabled={hours.closed}
                  onChange={(e) =>
                    setBusinessHours((prev) => ({
                      ...prev,
                      [day.key]: { ...hours, open: e.target.value },
                    }))
                  }
                  className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-40"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="time"
                  value={hours.close}
                  disabled={hours.closed}
                  onChange={(e) =>
                    setBusinessHours((prev) => ({
                      ...prev,
                      [day.key]: { ...hours, close: e.target.value },
                    }))
                  }
                  className="rounded-md border border-gray-300 px-2 py-1 text-sm disabled:opacity-40"
                />
              </div>
            );
          })}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium">İşletme:</span> {businessName} (
            {INDUSTRIES.find((i) => i.value === industry)?.label})
          </div>
          <div>
            <span className="font-medium">Hizmet bölgesi:</span>{" "}
            {serviceArea || "-"}
          </div>
          <div>
            <span className="font-medium">Hizmetler:</span>{" "}
            {services
              .filter((s) => s.serviceName.trim())
              .map((s) => s.serviceName)
              .join(", ") || "-"}
          </div>
          <div>
            <span className="font-medium">Çalışma saatleri:</span>
            <ul className="mt-1 list-inside list-disc text-gray-600">
              {DAYS.map((day) => {
                const hours = businessHours[day.key];
                return (
                  <li key={day.key}>
                    {day.label}:{" "}
                    {hours.closed ? "Kapalı" : `${hours.open} – ${hours.close}`}
                  </li>
                );
              })}
            </ul>
          </div>
          {error && <p className="text-red-600">{error}</p>}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 0 || pending}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          Geri
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            disabled={!canGoNext()}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            İleri
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Kaydediliyor..." : "Kurulumu tamamla"}
          </button>
        )}
      </div>
    </div>
  );
}
