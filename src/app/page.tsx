import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getLandingDictionary } from "@/lib/i18n/landing";
import { getRequestLocale } from "@/lib/i18n/server";

// Özellik kartları için ikonlar (sözlükteki 6 özelliğin sırasıyla eşleşir):
// aramaları yanıtla · takvim · çok dil · analiz · hatırlatma · SMS
const FEATURE_ICON_PATHS = [
  "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
  "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418",
  "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0",
  "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
];

export default async function Home() {
  const locale = await getRequestLocale();
  const t = getLandingDictionary(locale);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/85 shadow-sm shadow-gray-950/5 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="flex items-center gap-2 font-semibold hover:-translate-y-0.5">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 text-sm text-white shadow-lg shadow-indigo-600/25">
              V
            </span>
            <span>Voxa</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-gray-600 md:flex">
            <a href="#features" className="hover:-translate-y-0.5 hover:text-gray-900">{t.nav.features}</a>
            <a href="#how" className="hover:-translate-y-0.5 hover:text-gray-900">{t.nav.how}</a>
            <a href="#pricing" className="hover:-translate-y-0.5 hover:text-gray-900">{t.nav.pricing}</a>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher current={locale} />
            <Link href="/login" className="hidden text-sm font-medium text-gray-600 hover:-translate-y-0.5 hover:text-gray-900 sm:block">
              {t.nav.login}
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-gray-900/15 hover:-translate-y-0.5 hover:bg-gray-800"
            >
              {t.nav.signup}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 -top-40 h-80 bg-gradient-to-b from-indigo-100/70 to-transparent blur-3xl" />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <span className="reveal-up inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 shadow-sm shadow-indigo-900/5">
            {t.hero.badge}
          </span>
          <h1 className="reveal-up mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl" style={{ animationDelay: "80ms" }}>
            {t.hero.title}
          </h1>
          <p className="reveal-up mx-auto mt-5 max-w-2xl text-lg text-gray-600" style={{ animationDelay: "160ms" }}>
            {t.hero.subtitle}
          </p>
          <div className="reveal-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: "240ms" }}>
            <Link
              href="/signup"
              className="button-glow w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:-translate-y-0.5 hover:bg-indigo-700 sm:w-auto"
            >
              {t.hero.ctaPrimary}
            </Link>
            <a
              href="#how"
              className="w-full rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm shadow-gray-950/5 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-md sm:w-auto"
            >
              {t.hero.ctaSecondary}
            </a>
          </div>
          <dl className="reveal-up mx-auto mt-14 grid max-w-xl grid-cols-3 gap-4 sm:gap-6" style={{ animationDelay: "320ms" }}>
            {t.hero.stats.map((s, index) => (
              <div
                key={s.label}
                className="interactive-lift rounded-lg border border-gray-100 bg-white/80 px-3 py-4 shadow-sm shadow-gray-950/5 backdrop-blur"
                style={{ animationDelay: `${360 + index * 70}ms` }}
              >
                <dt className="text-2xl font-semibold text-gray-900 sm:text-3xl">{s.value}</dt>
                <dd className="mt-1 text-xs text-gray-500">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-gray-100 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold text-gray-900">{t.how.title}</h2>
            <p className="mt-3 text-gray-600">{t.how.subtitle}</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {t.how.steps.map((step, i) => (
              <div
                key={step.title}
                className="interactive-lift relative rounded-lg border border-gray-100 bg-gray-50 p-6 shadow-sm shadow-gray-950/5"
              >
                <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-medium text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold text-gray-900">{t.features.title}</h2>
            <p className="mt-3 text-gray-600">{t.features.subtitle}</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {t.features.items.map((f, i) => (
              <div key={f.title} className="interactive-lift rounded-lg border border-gray-100 bg-white p-6 soft-panel-shadow">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={FEATURE_ICON_PATHS[i % FEATURE_ICON_PATHS.length]}
                    />
                  </svg>
                </div>
                <h3 className="mt-4 font-medium text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-gray-100 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold text-gray-900">{t.pricing.title}</h2>
            <p className="mt-3 text-gray-600">{t.pricing.subtitle}</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
            {t.pricing.plans.map((plan) => (
              <div
                key={plan.id}
                className={`interactive-lift relative rounded-lg border bg-white p-8 ${
                  plan.popular ? "border-indigo-300 shadow-2xl shadow-indigo-900/10 ring-1 ring-indigo-200" : "border-gray-200 soft-panel-shadow"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 right-6 rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white shadow-lg shadow-indigo-600/25">
                    {t.pricing.popularLabel}
                  </span>
                )}
                <p className="text-sm font-medium text-indigo-600">{plan.name}</p>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-semibold text-gray-900">{plan.price}</span>
                  <span className="mb-1 text-gray-500">{t.pricing.per}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{plan.includes}</p>
                <ul className="mt-6 space-y-3 text-sm text-gray-700">
                  {plan.features.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 10.1a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-8 block rounded-full px-6 py-3 text-center text-sm font-medium ${
                    plan.popular
                      ? "button-glow bg-indigo-600 text-white hover:-translate-y-0.5 hover:bg-indigo-700"
                      : "border border-gray-300 text-gray-800 shadow-sm hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-md"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-gray-900 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-semibold text-white">{t.ctaBand.title}</h2>
          <p className="mt-3 text-gray-300">{t.ctaBand.subtitle}</p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-900 shadow-xl shadow-black/20 hover:-translate-y-0.5 hover:bg-gray-100"
          >
            {t.ctaBand.cta}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 text-sm text-gray-500 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 font-semibold text-gray-900">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-indigo-600 text-xs text-white shadow-lg shadow-indigo-600/20">
                V
              </span>
              <span>Voxa</span>
            </Link>
            <p className="mt-3 max-w-xs leading-6">{t.footer.tagline}</p>
            <p className="mt-4 text-xs">
              © {new Date().getFullYear()} Voxa. {t.footer.rights}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900">{t.footer.product}</h3>
            <div className="mt-3 grid gap-2">
              <a href="#features" className="hover:text-gray-900">{t.nav.features}</a>
              <a href="#how" className="hover:text-gray-900">{t.nav.how}</a>
              <a href="#pricing" className="hover:text-gray-900">{t.nav.pricing}</a>
              <Link href="/signup" className="hover:text-gray-900">{t.nav.signup}</Link>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900">{t.footer.accountSupport}</h3>
            <div className="mt-3 grid gap-2">
              <Link href="/login" className="hover:text-gray-900">{t.nav.login}</Link>
              <Link href="/dashboard" className="hover:text-gray-900">{t.footer.dashboard}</Link>
              <Link href="/dashboard/guide" className="hover:text-gray-900">{t.footer.setupGuide}</Link>
              <Link href="/support" className="hover:text-gray-900">{t.footer.support}</Link>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900">{t.footer.legal}</h3>
            <div className="mt-3 grid gap-2">
              <Link href="/gizlilik" className="hover:text-gray-900">{t.footer.privacy}</Link>
              <Link href="/kvkk" className="hover:text-gray-900">{t.footer.kvkk}</Link>
              <Link href="/kullanim-sartlari" className="hover:text-gray-900">{t.footer.terms}</Link>
              <Link href="/cerez-politikasi" className="hover:text-gray-900">{t.footer.cookies}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
