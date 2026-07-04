// İşletmenin seçebileceği AI sesleri (ElevenLabs premade sesler).
// Bu sesler ElevenLabs hesabının ses kütüphanesinde bulunur; seçilen id
// agent_config.voice_id'ye kaydedilir ve Vapi assistant'ına uygulanır.

export type VoiceOption = {
  id: string;
  label: string;
  description: string;
};

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: "21m00Tcm4TlvDq8ikWAM", label: "Rachel", description: "Kadın · sıcak" },
  { id: "EXAVITQu4vr4xnSDxMaL", label: "Bella", description: "Kadın · yumuşak" },
  { id: "ErXwobaYiN019PkySvjV", label: "Antoni", description: "Erkek · net" },
  { id: "pNInz6obpgDQGcFmaJgB", label: "Adam", description: "Erkek · derin" },
];

export const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

export function isKnownVoiceId(value: unknown): value is string {
  return typeof value === "string" && VOICE_OPTIONS.some((v) => v.id === value);
}
