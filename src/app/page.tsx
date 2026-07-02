import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getLandingDictionary } from "@/lib/i18n/landing";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function Home() {
  const locale = await getRequestLocale();
  const t = getLandingDictionary(locale);

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 text-sm text-white">
              V
            </span>
            <span>Voxa</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-gray-600 md:flex">
            <a href="#features" className="hover:text-gray-900">{t.nav.features}</a>
            <a href="#how" className="hover:text-gray-900">{t.nav.how}</a>
            <a href="#pricing" className="hover:text-gray-900">{t.nav.pricing}</a>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher current={locale} />
            <Link href="/login" className="hidden text-sm font-medium text-gray-600 hover:text-gray-900 sm:block">
              {t.nav.login}
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
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
          <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            {t.hero.badge}
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
            {t.hero.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
            {t.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 sm:w-auto"
            >
              {t.hero.ctaPrimary}
            </Link>
            <a
              href="#how"
              className="w-full rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
            >
              {t.hero.ctaSecondary}
            </a>
          </div>
          <dl className="mx-auto mt-14 grid max-w-xl grid-cols-3 gap-6">
            {t.hero.stats.map((s) => (
              <div key={s.label}>
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
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {t.how.steps.map((step, i) => (
              <div key={step.title} className="relative rounded-2xl border border-gray-100 bg-gray-50 p-6">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
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
            {t.features.items.map((f) => (
              <div key={f.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-indigo-50" />
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
                className={`relative rounded-3xl border bg-white p-8 shadow-sm ${
                  plan.popular ? "border-indigo-300 ring-1 ring-indigo-200" : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 right-6 rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white">
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
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "border border-gray-300 text-gray-800 hover:bg-gray-50"
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
            className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100"
          >
            {t.ctaBand.cta}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-gray-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-indigo-600 text-xs text-white">V</span>
            <span className="font-medium text-gray-900">Voxa</span>
            <span className="hidden sm:inline">— {t.footer.tagline}</span>
          </div>
          <span>© {new Date().getFullYear()} Voxa. {t.footer.rights}</span>
        </div>
      </footer>
    </div>
  );
}
