import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
        ← Ana sayfa
      </Link>
      <div className="mt-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
          Hukuki Bilgilendirme
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
        <p className="mt-1 text-xs text-gray-400">
          Son güncelleme: 2 Temmuz 2026
        </p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-gray-700">
          {children}

          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            Bu metin ürün için hazırlanmış genel bir şablondur. Şirket unvanı,
            adres, veri sorumlusu, saklama süreleri ve ticari model netleştiğinde
            hukuk danışmanı tarafından gözden geçirilmelidir.
          </div>
        </div>
      </div>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}
