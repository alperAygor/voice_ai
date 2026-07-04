"use client";

import { useEffect, useRef, useState } from "react";
import type Vapi from "@vapi-ai/web";

type CallStatus = "idle" | "connecting" | "active" | "ended" | "error";

function readVapiError(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const maybe = error as { message?: string; errorMsg?: string };
    return maybe.message ?? maybe.errorMsg ?? "Bağlantı hatası";
  }
  return "Bağlantı hatası";
}

// AI resepsiyonisti tarayıcıda test etme — telefonla aynı asistanı WebRTC ile
// (mikrofon) çağırır. Gerçek numara/uluslararası arama gerektirmez.
export function AgentWebTest({
  assistantId,
  publicKey,
}: {
  assistantId: string | null;
  publicKey: string | null;
}) {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    // Ayrılırken aktif çağrıyı kapat.
    return () => {
      vapiRef.current?.stop();
      vapiRef.current = null;
    };
  }, []);

  async function startCall() {
    if (!assistantId || !publicKey) return;
    setErrorMsg(null);
    setStatus("connecting");
    try {
      const { default: VapiClient } = await import("@vapi-ai/web");
      const vapi = new VapiClient(publicKey);
      vapiRef.current = vapi;

      vapi.on("call-start", () => setStatus("active"));
      vapi.on("call-end", () => {
        setStatus("ended");
        setIsSpeaking(false);
      });
      vapi.on("speech-start", () => setIsSpeaking(true));
      vapi.on("speech-end", () => setIsSpeaking(false));
      vapi.on("error", (error: unknown) => {
        setErrorMsg(readVapiError(error));
        setStatus("error");
      });

      await vapi.start(assistantId);
    } catch (error) {
      setErrorMsg(readVapiError(error));
      setStatus("error");
    }
  }

  function stopCall() {
    vapiRef.current?.stop();
  }

  function toggleMute() {
    const next = !muted;
    vapiRef.current?.setMuted(next);
    setMuted(next);
  }

  const isBusy = status === "connecting" || status === "active";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-medium text-gray-900">
            AI&apos;ı tarayıcıda test et
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gerçek telefon aramasıyla aynı asistanla konuşun. Mikrofon izni
            gerekir; numara veya uluslararası arama gerekmez.
          </p>
        </div>
        {status === "active" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            Bağlı
          </span>
        )}
      </div>

      {!publicKey ? (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Tarayıcı testi için <code>NEXT_PUBLIC_VAPI_PUBLIC_KEY</code> henüz
          ayarlanmamış. Operatör bu anahtarı ekledikten sonra test etkinleşir.
        </p>
      ) : !assistantId ? (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Önce ayarları kaydedin — asistan Vapi&apos;de oluşturulunca test
          butonu etkinleşir.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {isBusy ? (
            <>
              <button
                type="button"
                onClick={stopCall}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
              >
                {status === "connecting" ? "Bağlanıyor…" : "Görüşmeyi bitir"}
              </button>
              {status === "active" && (
                <button
                  type="button"
                  onClick={toggleMute}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {muted ? "Sesi aç" : "Sustur"}
                </button>
              )}
              {status === "active" && (
                <span className="text-sm text-gray-500">
                  {isSpeaking ? "🔊 AI konuşuyor…" : "🎙️ Sizi dinliyor…"}
                </span>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={startCall}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              {status === "ended" || status === "error"
                ? "Tekrar test et"
                : "Testi başlat"}
            </button>
          )}

          {status === "ended" && (
            <span className="text-sm text-gray-500">Görüşme sona erdi.</span>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="mt-3 text-sm text-red-600">Hata: {errorMsg}</p>
      )}
    </div>
  );
}
