/** Normalisiert Telefonnummern für WhatsApp (E.164, z. B. +491701234567). */
export function normalizeWhatsAppPhone(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;

  let s = raw.trim().replace(/[\s\-()./]/g, "");
  if (s.startsWith("00")) s = `+${s.slice(2)}`;
  if (s.startsWith("0") && !s.startsWith("+")) s = `+49${s.slice(1)}`;
  if (!s.startsWith("+")) s = `+${s}`;

  const digits = s.slice(1);
  if (!/^\d{8,15}$/.test(digits)) return null;
  return `+${digits}`;
}
