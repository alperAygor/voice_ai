import Link from "next/link";
import type { ReactNode } from "react";
import { AutoLanguageSwitcher } from "@/components/language-switcher";

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="flex flex-1 bg-slate-50">
      <section className="relative hidden w-[44%] overflow-hidden bg-gradient-to-b from-indigo-950 via-gray-950 to-black px-10 py-10 text-white lg:flex lg:flex-col">
        {/* Arka plan ışıltıları */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-sm text-gray-950">
              V
            </span>
            <span>Voxa</span>
          </Link>
          <div className="rounded-full bg-white/95 px-3 py-2 text-gray-900 shadow-lg shadow-black/10">
            <AutoLanguageSwitcher label="Dil" />
          </div>
        </div>

        <div className="relative mt-auto max-w-md">
          <p className="text-sm font-medium text-indigo-300">{eyebrow}</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
            Her arama cevaplanır, her randevu panelde görünür.
          </h2>

          {/* Müşteri akışı: kaçan arama → AI → randevu */}
          <div className="mt-8 space-y-3">
            {[
              { t: "Kaçırdığınız arama gelir", d: "Meşguldeyken, mesai dışında — hiçbiri boşa gitmez." },
              { t: "AI karşılar ve randevu alır", d: "Müşteriyle konuşur, uygun saati bulur, kaydeder." },
              { t: "Takvime yazılır, panelde görünür", d: "Google Takvim + özet ve analiz sizde." },
            ].map((step, i) => (
              <div key={step.t} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-indigo-500/90 text-xs font-semibold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{step.t}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{step.d}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
            {[
              { v: "7/24", l: "yanıtlama" },
              { v: "6 dil", l: "destek" },
              { v: "Takvim", l: "senkron" },
            ].map((s) => (
              <div key={s.l} className="rounded-lg border border-white/10 bg-white/5 p-3 text-center shadow-lg shadow-black/10">
                <p className="font-semibold">{s.v}</p>
                <p className="mt-1 text-xs text-gray-400">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-[calc(100vh-1px)] flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gray-900 text-sm text-white">
                V
              </span>
              <span>Voxa</span>
            </Link>
            <AutoLanguageSwitcher label="Dil" />
          </div>

          <div className="dashboard-card rounded-lg p-6 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                {eyebrow}
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
                {title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-gray-500">{subtitle}</p>
            </div>

            <div className="mt-6">{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs text-gray-400">veya</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.98 10.98 0 001 12c0 1.77.42 3.44 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
