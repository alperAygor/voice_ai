// Telefon numarasını gevşek E.164'e normalize eder. Boşluk/tire/parantez atılır;
// baştaki + korunur. Geçerli değilse null döner (7-15 hane). Saf, test edilebilir.
export function normalizePhoneNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/[^\d]/g, "");
  if (digits.length < 7 || digits.length > 15) return null;

  return `${hasPlus ? "+" : ""}${digits}`;
}
