"use client";

import { useMemo, useState } from "react";
import {
  estimateMonthlyNetFromGross,
  formatEuro,
  GERMAN_FEDERAL_STATES,
  hasNetCalcSettings,
} from "@/lib/income-display";
import type { IncomeKind } from "@prisma/client";

type Props = {
  salaryExpectation: number | null;
  salaryKind: IncomeKind;
  taxClass: number | null;
  churchTax: boolean;
  federalState: string | null;
};

export function WorkerSalaryFields({
  salaryExpectation,
  salaryKind,
  taxClass,
  churchTax,
  federalState,
}: Props) {
  const [amount, setAmount] = useState(String(salaryExpectation ?? ""));
  const [kind, setKind] = useState<IncomeKind>(salaryKind);
  const [tax, setTax] = useState(taxClass ? String(taxClass) : "");
  const [church, setChurch] = useState(churchTax);
  const [state, setState] = useState(federalState ?? "");

  const netPreview = useMemo(() => {
    const monthly = Number(amount);
    const settings = hasNetCalcSettings({
      taxClass: Number(tax),
      churchTax: church,
      federalState: state || null,
    })
      ? { taxClass: Number(tax), churchTax: church, federalState: state || null }
      : null;

    if (!settings || !Number.isFinite(monthly) || monthly <= 0 || kind !== "BRUTTO") return null;
    return estimateMonthlyNetFromGross(monthly, settings);
  }, [amount, kind, tax, church, state]);

  return (
    <>
      <label>
        <span className="gj-label">Gehaltswunsch (€/Monat)</span>
        <input
          name="salaryExpectation"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="gj-input"
          placeholder="5000"
        />
      </label>
      <label>
        <span className="gj-label">Angabe als</span>
        <select
          name="salaryKind"
          className="gj-input"
          value={kind}
          onChange={(e) => setKind(e.target.value as IncomeKind)}
        >
          <option value="BRUTTO">Brutto</option>
          <option value="NETTO">Netto</option>
        </select>
      </label>
      {netPreview != null ? (
        <p className="text-sm text-[var(--gj-primary)] md:col-span-2">
          Ihr Gehaltswunsch entspricht ca. {formatEuro(netPreview)} netto/Monat.
        </p>
      ) : null}

      <div className="md:col-span-2 mt-2 rounded-xl border border-[var(--gj-border)] bg-[var(--gj-bg)]/60 p-4">
        <h3 className="text-sm font-semibold text-[var(--gj-text)]">Netto-Schätzung in der Job-Suche</h3>
        <p className="mt-1 text-xs text-[var(--gj-muted)]">
          Bei Stellen mit Brutto-Gehalt berechnen wir für Sie automatisch ein geschätztes Netto (ca.).
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label>
            <span className="gj-label">Steuerklasse</span>
            <select
              name="taxClass"
              className="gj-input"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
            >
              <option value="">— Bitte wählen —</option>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  Steuerklasse {n}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="gj-label">Bundesland</span>
            <select
              name="federalState"
              className="gj-input"
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              <option value="">— optional —</option>
              {GERMAN_FEDERAL_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-end gap-2 pb-1 text-sm">
            <input
              type="checkbox"
              name="churchTax"
              checked={church}
              onChange={(e) => setChurch(e.target.checked)}
            />
            Kirchensteuerpflichtig
          </label>
        </div>
      </div>
    </>
  );
}
