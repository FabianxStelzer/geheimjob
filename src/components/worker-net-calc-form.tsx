"use client";

import { useMemo, useState } from "react";
import {
  estimateMonthlyNetFromGross,
  formatEuro,
  formatTargetIncomeDisplay,
  GERMAN_FEDERAL_STATES,
  hasNetCalcSettings,
} from "@/lib/income-display";
import { updateWorkerNetCalcSettings } from "@/app/actions/dashboard";

type Props = {
  taxClass: number | null;
  churchTax: boolean;
  federalState: string | null;
};

export function WorkerNetCalcForm({ taxClass, churchTax, federalState }: Props) {
  const [tax, setTax] = useState(taxClass ? String(taxClass) : "");
  const [church, setChurch] = useState(churchTax);
  const [state, setState] = useState(federalState ?? "");
  const [exampleBrutto, setExampleBrutto] = useState("5000");

  const settings = useMemo(() => {
    const tc = Number(tax);
    if (!Number.isFinite(tc) || tc < 1 || tc > 6) return null;
    return { taxClass: tc, churchTax: church, federalState: state || null };
  }, [tax, church, state]);

  const exampleNet = useMemo(() => {
    const gross = Number(exampleBrutto);
    if (!settings || !Number.isFinite(gross) || gross <= 0) return null;
    return estimateMonthlyNetFromGross(gross, settings);
  }, [exampleBrutto, settings]);

  const jobPreview = useMemo(() => {
    if (!settings) return null;
    return formatTargetIncomeDisplay("75000/Jahr", "BRUTTO", settings);
  }, [settings]);

  return (
    <form action={updateWorkerNetCalcSettings} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <label>
          <span className="gj-label">Steuerklasse</span>
          <select
            name="taxClass"
            className="gj-input"
            value={tax}
            onChange={(e) => setTax(e.target.value)}
            required
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
          <span className="mt-1 block text-[11px] text-[var(--gj-muted)]">
            Relevant für die Kirchensteuer (8 % / 9 %).
          </span>
        </label>
        <label className="flex items-end gap-2 pb-6 text-sm md:pb-0">
          <input
            type="checkbox"
            name="churchTax"
            checked={church}
            onChange={(e) => setChurch(e.target.checked)}
          />
          Kirchensteuerpflichtig
        </label>
      </div>

      <section className="rounded-xl border border-[var(--gj-border)] bg-[var(--gj-bg)]/60 p-4">
        <h3 className="text-sm font-semibold text-[var(--gj-text)]">Vorschau-Rechner</h3>
        <p className="mt-1 text-xs text-[var(--gj-muted)]">
          Testen Sie, wie sich Ihre Angaben auf ein Beispielgehalt auswirken.
        </p>
        <label className="mt-4 block max-w-xs">
          <span className="gj-label">Beispiel Brutto (€/Monat)</span>
          <input
            type="number"
            className="gj-input"
            value={exampleBrutto}
            onChange={(e) => setExampleBrutto(e.target.value)}
            min={1}
          />
        </label>
        {exampleNet != null ? (
          <p className="mt-3 text-sm text-[var(--gj-primary)]">
            ca. {formatEuro(exampleNet)} netto/Monat
          </p>
        ) : (
          <p className="mt-3 text-sm text-[var(--gj-muted)]">
            Steuerklasse wählen, um eine Schätzung zu sehen.
          </p>
        )}
        {jobPreview ? (
          <div className="mt-4 rounded-lg border border-[var(--gj-border-strong)] bg-white/80 p-3 text-sm">
            <p className="text-[11px] uppercase tracking-wide text-[var(--gj-muted)]">
              So erscheint es in der Job-Suche
            </p>
            <p className="mt-1 font-medium text-[var(--gj-text)]">{jobPreview.primary}</p>
            {jobPreview.secondary ? (
              <p className="mt-1 text-[var(--gj-primary)]">{jobPreview.secondary}</p>
            ) : null}
          </div>
        ) : null}
      </section>

      <p className="text-xs text-[var(--gj-muted)]">
        Die Netto-Werte sind Näherungswerte (ca.) und ersetzen keine Lohnabrechnung oder Steuerberatung.
      </p>

      <button type="submit" className="gj-btn-primary" disabled={!hasNetCalcSettings(settings)}>
        Speichern
      </button>
    </form>
  );
}
