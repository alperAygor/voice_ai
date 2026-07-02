"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_LABELS,
  type Locale,
} from "@/lib/i18n/landing";

function persistLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export function LanguageSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function select(locale: Locale) {
    if (locale === current) return;
    persistLocale(locale);
    startTransition(() => router.refresh());
  }

  return (
    <div
      className="inline-flex items-center rounded-full border border-gray-200 bg-white p-0.5 text-xs font-medium"
      aria-label="Language"
    >
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => select(locale)}
          disabled={pending}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            locale === current
              ? "bg-gray-900 text-white"
              : "text-gray-500 hover:text-gray-900"
          }`}
          aria-current={locale === current}
        >
          {locale.toUpperCase()}
          <span className="sr-only"> — {LOCALE_LABELS[locale]}</span>
        </button>
      ))}
    </div>
  );
}

function readPersistedLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${LOCALE_COOKIE}=`));
  const value = match?.split("=")[1];
  return LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;
}

export function AutoLanguageSwitcher({
  label = "Arayüz dili",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState<Locale>(() => readPersistedLocale());

  function select(locale: Locale) {
    if (locale === current) return;
    persistLocale(locale);
    setCurrent(locale);
    startTransition(() => router.refresh());
  }

  return (
    <div className={compact ? "space-y-2" : "flex items-center justify-between gap-3"}>
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <div
        className="inline-flex items-center rounded-full border border-gray-200 bg-white p-0.5 text-xs font-medium shadow-sm"
        aria-label={label}
      >
        {LOCALES.map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => select(locale)}
            disabled={pending}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              locale === current
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
            aria-current={locale === current}
          >
            {locale.toUpperCase()}
            <span className="sr-only"> — {LOCALE_LABELS[locale]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
