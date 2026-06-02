"use client";

import { useState } from "react";
import type { AddonCode } from "@/lib/billing-plans";
import { ADDON_CATALOG, PLAN_CATALOG } from "@/lib/billing-plans";
import { requestInvoiceBilling } from "@/app/actions/billing";

export function EmployerBillingCheckout({
  currentPlan,
  billingStatus,
  isActive,
}: {
  currentPlan: string;
  billingStatus: string;
  isActive: boolean;
}) {
  const [selectedPlan, setSelectedPlan] = useState<string>("PLUS");
  const [addons, setAddons] = useState<AddonCode[]>([]);
  const [busy, setBusy] = useState(false);
  const [invoicePending, setInvoicePending] = useState(false);

  function toggleAddon(code: AddonCode) {
    setAddons((prev) => (prev.includes(code) ? prev.filter((a) => a !== code) : [...prev, code]));
  }

  async function payWithStripe() {
    setBusy(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selectedPlan, addons }),
    });
    setBusy(false);
    const data = (await res.json()) as { url?: string; error?: string };
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    alert(data.error || "Checkout nicht möglich — Stripe-Preis-IDs in .env prüfen.");
  }

  async function requestInvoice() {
    const fd = new FormData();
    fd.set("plan", selectedPlan);
    fd.set("note", `Add-ons: ${addons.join(", ") || "keine"}`);
    setBusy(true);
    await requestInvoiceBilling(fd);
    setBusy(false);
    setInvoicePending(true);
  }

  return (
    <div className="space-y-8">
      {isActive ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Aktives Paket: <strong>{currentPlan}</strong> · Status: {billingStatus}
        </p>
      ) : billingStatus === "PENDING" ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Rechnungsanfrage liegt beim Support. Zugang wird nach Freigabe aktiviert.
        </p>
      ) : (
        <p className="rounded-xl border border-[var(--gj-border)] bg-white px-4 py-3 text-sm text-[var(--gj-text-secondary)]">
          Unternehmen benötigen ein bezahltes Paket für den Talentpool und Stellenanzeigen.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {PLAN_CATALOG.map((plan) => (
          <label
            key={plan.code}
            className={`gj-card cursor-pointer p-5 transition ${
              selectedPlan === plan.code ? "ring-2 ring-[var(--gj-primary)]" : ""
            }`}
          >
            <input
              type="radio"
              name="plan"
              className="sr-only"
              checked={selectedPlan === plan.code}
              onChange={() => setSelectedPlan(plan.code)}
            />
            <p className="text-lg font-bold text-[var(--gj-text)]">{plan.name}</p>
            <p className="mt-1 text-2xl font-extrabold text-[var(--gj-primary)]">
              {plan.priceEur}€<span className="text-sm font-normal text-[var(--gj-muted)]">/Mo.</span>
            </p>
            <p className="mt-2 text-sm text-[var(--gj-muted)]">{plan.description}</p>
            <ul className="mt-4 space-y-1.5 text-xs text-[var(--gj-text-secondary)]">
              {plan.features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
          </label>
        ))}
      </div>

      <section className="gj-card p-5">
        <h3 className="text-sm font-semibold text-[var(--gj-text)]">Add-ons (monatlich)</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {ADDON_CATALOG.map((a) => (
            <label
              key={a.code}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                addons.includes(a.code)
                  ? "border-[var(--gj-primary)] bg-[var(--gj-primary-soft)]"
                  : "border-[var(--gj-border)]"
              }`}
            >
              <input
                type="checkbox"
                checked={addons.includes(a.code)}
                onChange={() => toggleAddon(a.code)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-semibold text-[var(--gj-text)]">
                  {a.name} · {a.priceEur}€/Mo.
                </span>
                <span className="mt-1 block text-xs text-[var(--gj-muted)]">{a.description}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => void payWithStripe()} className="gj-btn-primary">
          Mit Karte / SEPA bezahlen (Stripe)
        </button>
        <button
          type="button"
          disabled={busy || invoicePending}
          onClick={() => void requestInvoice()}
          className="gj-btn-secondary"
        >
          Auf Rechnung anfragen
        </button>
      </div>
      <p className="text-xs text-[var(--gj-muted)]">
        Nach erfolgreicher Zahlung (Stripe) oder Freigabe durch den Super-Admin (Rechnung) wird der Zugang
        automatisch aktiviert.
      </p>
    </div>
  );
}
