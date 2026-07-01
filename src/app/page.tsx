import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold sm:text-4xl">
        Sesli AI Resepsiyonist
      </h1>
      <p className="mt-3 max-w-md text-gray-500">
        Ev hizmetleri işletmeleri için kaçırılan aramaları yanıtlayan,
        müşteriyi niteleyen ve randevu takvimine otomatik kaydeden AI
        resepsiyonist.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/signup"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Kayıt ol
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Giriş yap
        </Link>
      </div>
    </div>
  );
}
