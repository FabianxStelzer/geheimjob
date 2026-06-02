import type { IncomeKind } from "@prisma/client";

export type WorkerNetCalcSettings = {
  taxClass: number;
  churchTax: boolean;
  federalState: string | null;
};

export type ParsedIncome = {
  amount: number;
  period: "year" | "month";
};

const EMPLOYEE_SOCIAL_RATE = 0.2045;

const CHURCH_TAX_8_STATES = new Set(["BY", "BW"]);

/** Grober Grundtarif 2024 (zvE), Ergebnis in €/Jahr. */
function grundtarif2024(zve: number): number {
  if (zve <= 11604) return 0;
  if (zve <= 17005) {
    const y = (zve - 11604) / 10000;
    return (922.98 * y + 1400) * y;
  }
  if (zve <= 66760) {
    const z = (zve - 17005) / 10000;
    return (181.19 * z + 2397) * z + 966.53;
  }
  if (zve <= 277825) return 0.42 * zve - 9267.53;
  return 0.45 * zve - 17602.28;
}

function taxClassFactor(taxClass: number): number {
  switch (taxClass) {
    case 2:
      return 0.88;
    case 3:
      return 0.58;
    case 4:
      return 1;
    case 5:
      return 1.32;
    case 6:
      return 1.42;
    default:
      return 1;
  }
}

function churchTaxRate(state: string | null): number {
  if (!state) return 0.09;
  const code = state.trim().toUpperCase();
  return CHURCH_TAX_8_STATES.has(code) ? 0.08 : 0.09;
}

/** Schätzt monatliches Netto aus monatlichem Brutto (ca., keine Garantie). */
export function estimateMonthlyNetFromGross(
  grossMonthly: number,
  settings: WorkerNetCalcSettings,
): number {
  if (!Number.isFinite(grossMonthly) || grossMonthly <= 0) return 0;

  const taxClass = Math.min(6, Math.max(1, settings.taxClass));
  const annualGross = grossMonthly * 12;
  const annualSocial = annualGross * EMPLOYEE_SOCIAL_RATE;
  const zve = Math.max(0, annualGross - annualSocial);

  let incomeTax = grundtarif2024(zve) * taxClassFactor(taxClass);
  if (settings.churchTax) {
    incomeTax += incomeTax * churchTaxRate(settings.federalState);
  }

  const annualNet = annualGross - annualSocial - incomeTax;
  return Math.max(0, Math.round(annualNet / 12));
}

/** Schätzt monatliches Brutto aus monatlichem Netto (Umkehrung per Iteration). */
export function estimateMonthlyGrossFromNet(
  netMonthly: number,
  settings: WorkerNetCalcSettings,
): number {
  if (!Number.isFinite(netMonthly) || netMonthly <= 0) return 0;

  let low = netMonthly;
  let high = netMonthly * 2.5;
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    const est = estimateMonthlyNetFromGross(mid, settings);
    if (est < netMonthly) low = mid;
    else high = mid;
  }
  return Math.round((low + high) / 2);
}

export function parseIncomeHint(hint: string | null | undefined): ParsedIncome | null {
  if (!hint?.trim()) return null;

  const lower = hint.toLowerCase();
  let period: ParsedIncome["period"];
  if (/monat|\/m\b|pro monat|monthly|mtl/.test(lower)) {
    period = "month";
  } else if (/jahr|\/j\b|pro jahr|yearly|p\.?a\.?|annual/.test(lower)) {
    period = "year";
  } else {
    period = "year";
  }

  const digits = hint.replace(/\./g, "").match(/\d+/g);
  if (!digits?.length) return null;

  const nums = digits.map((d) => Number(d)).filter((n) => Number.isFinite(n) && n > 0);
  if (!nums.length) return null;

  let amount = nums[0];
  if (nums.length >= 2 && nums[0] < 1000 && nums[1] >= 1000) {
    amount = nums[1];
  }

  if (!/monat|jahr|\/m|\/j|month|year/i.test(lower)) {
    period = amount >= 15000 ? "year" : "month";
  }

  if (period === "month" && amount > 50000) {
    amount = Math.round(amount / 12);
  }

  if (amount < 100) return null;
  return { amount, period };
}

export function toMonthlyAmount(parsed: ParsedIncome): number {
  return parsed.period === "year" ? Math.round(parsed.amount / 12) : parsed.amount;
}

export function formatEuro(amount: number, compact = false): string {
  if (compact && amount >= 1000) {
    return `${amount.toLocaleString("de-DE")} €`;
  }
  return `${amount.toLocaleString("de-DE")} €`;
}

export function incomeKindLabel(kind: IncomeKind | null | undefined): string {
  return kind === "NETTO" ? "netto" : "brutto";
}

export type TargetIncomeDisplay = {
  primary: string;
  secondary: string | null;
};

export function formatTargetIncomeDisplay(
  hint: string | null,
  kind: IncomeKind | null | undefined,
  netSettings: WorkerNetCalcSettings | null,
): TargetIncomeDisplay | null {
  if (!hint?.trim()) return null;

  const parsed = parseIncomeHint(hint);
  const incomeKind = kind ?? "BRUTTO";
  const periodLabel = parsed?.period === "month" ? "Monat" : "Jahr";

  let primary: string;
  if (parsed) {
    primary = `${formatEuro(parsed.amount)} ${incomeKindLabel(incomeKind)}/${periodLabel}`;
  } else {
    const hasEuro = hint.includes("€");
    primary = hasEuro ? hint.trim() : `${hint.trim()} €`;
    if (!/brutto|netto/i.test(primary)) {
      primary = `${primary} (${incomeKindLabel(incomeKind)})`;
    }
  }

  let secondary: string | null = null;
  if (parsed && netSettings?.taxClass) {
    const monthly =
      incomeKind === "BRUTTO"
        ? toMonthlyAmount(parsed)
        : estimateMonthlyGrossFromNet(toMonthlyAmount(parsed), netSettings);

    if (incomeKind === "BRUTTO") {
      const net = estimateMonthlyNetFromGross(monthly, netSettings);
      secondary = `ca. ${formatEuro(net)} netto/Monat`;
    } else {
      const gross = estimateMonthlyGrossFromNet(toMonthlyAmount(parsed), netSettings);
      secondary = `ca. ${formatEuro(gross)}/Monat brutto`;
    }
  }

  return { primary, secondary };
}

export function hasNetCalcSettings(
  settings: WorkerNetCalcSettings | null | undefined,
): settings is WorkerNetCalcSettings {
  return !!settings?.taxClass && settings.taxClass >= 1 && settings.taxClass <= 6;
}

export const GERMAN_FEDERAL_STATES = [
  { code: "BW", label: "Baden-Württemberg" },
  { code: "BY", label: "Bayern" },
  { code: "BE", label: "Berlin" },
  { code: "BB", label: "Brandenburg" },
  { code: "HB", label: "Bremen" },
  { code: "HH", label: "Hamburg" },
  { code: "HE", label: "Hessen" },
  { code: "MV", label: "Mecklenburg-Vorpommern" },
  { code: "NI", label: "Niedersachsen" },
  { code: "NW", label: "Nordrhein-Westfalen" },
  { code: "RP", label: "Rheinland-Pfalz" },
  { code: "SL", label: "Saarland" },
  { code: "SN", label: "Sachsen" },
  { code: "ST", label: "Sachsen-Anhalt" },
  { code: "SH", label: "Schleswig-Holstein" },
  { code: "TH", label: "Thüringen" },
] as const;
