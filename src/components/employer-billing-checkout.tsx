"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AddonCode } from "@/lib/billing-plans";
import type { AddonDefinition, PlanDefinition } from "@/lib/billing-plans";
import type { EmployerPlan } from "@prisma/client";
import { activateInvoiceBilling } from "@/app/actions/billing";

function planCardClass(opts: { isPurchased: boolean; isSelected: boolean }): string {
  const base = "gj-card w-full p-5 text-left transition border-2";
  if (opts.isPurchased && opts.isSelected) {
    return `${base} border-emerald-500 ring-2 ring-emerald-400/60 shadow-md`;
  }
  if (opts.isPurchased) {
    return `${base} border-emerald-500 ring-2 ring-emerald-300/50`;
  }
  if (opts.isSelected) {
    return `${base} border-[var(--gj-primary)] ring-2 ring-[var(--gj-primary)]/40 shadow-md`;
  }
  return `${base} border-transparent hover:border-[var(--gj-primary)]/30`;
}

export function EmployerBillingCheckout({
  plans,
  addons,
  currentPlan,
  currentPlanCode,
  billingStatus,
  isActive,
  currentPeriodEnd,
}: {
  plans: PlanDefinition[];
  addons: AddonDefinition[];
  currentPlan: string;
  currentPlanCode: EmployerPlan;
  billingStatus: string;
  isActive: boolean;
  currentPeriodEnd: string | null;
}) {
  const router = useRouter();
  const selectablePlans = plans.filter((p) => p.code !== "NONE");
  const initialPlan =
    selectablePlans.find((p) => p.code === currentPlanCode)?.code ??
    selectablePlans[0]?.code ??
    "PLUS";

  const [selectedPlan, setSelectedPlan] = useState<string>(initialPlan);
  const [selectedAddons, setSelectedAddons] = useState<AddonCode[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  function toggleAddon(code: AddonCode) {
    setSelectedAddons((prev) =>
      prev.includes(code) ? prev.filter((a) => a !== code) : [...prev, code],
    );
  }

  async function payWithStripe() {
    if (!selectedPlan) {
      alert("Bitte wählen Sie ein Paket.");
      return;
    }
    setBusy(true);
    setStatus(null);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selectedPlan, addons: selectedAddons }),
    });
    setBusy(false);
    const data = (await res.json()) as { url?: string; error?: string };
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    alert(data.error || "Checkout nicht möglich — Stripe-Preis-IDs im Super-Admin prüfen.");
  }

  async function activateOnInvoice() {
    if (!selectedPlan) {
      alert("Bitte wählen Sie ein Paket.");
      return;
    }
    const fd = new FormData();
    fd.set("plan", selectedPlan);
    fd.set("addons", selectedAddons.join(","));
    fd.set("note", `Add-ons: ${selectedAddons.join(", ") || "keine"}`);
    setBusy(true);
    setStatus(null);
    const res = await activateInvoiceBilling(fd);
    setBusy(false);
    if (res.ok) {
      setStatus("Paket aktiviert — Sie können sofort loslegen. Die Rechnung folgt per E-Mail.");
      router.refresh();
      return;
    }
    setStatus("Aktivierung fehlgeschlagen. Bitte erneut versuchen.");
  }

  return (
    <div className="space-y-8">
      {isActive ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
          <p>
            <strong>Ihre Mitgliedschaft:</strong> {currentPlan}
          </p>
          <p className="mt-1">Status: {billingStatus}</p>
          {currentPeriodEnd ? (
            <p className="mt-1 text-xs">
              Laufzeit bis: {new Date(currentPeriodEnd).toLocaleDateString("de-DE")}
            </p>
          ) : null}
          <p className="mt-3 text-xs text-emerald-800">
            Unten können Sie ein anderes Paket wählen oder Add-ons hinzubuchen.
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-[var(--gj-border)] bg-white px-4 py-3 text-sm text-[var(--gj-text-secondary)]">
          Wählen Sie ein Paket, um den Talentpool und ggf. Stellenanzeigen zu nutzen.
        </p>
      )}

      <div>
        <h3 className="text-sm font-semibold text-[var(--gj-text)]">Paket wählen</h3>
        <p className="mt-1 text-xs text-[var(--gj-muted)]">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--gj-primary)] align-middle" />{" "}
          Ausgewählt ·{" "}
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 align-middle" /> Aktives
          Paket
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {selectablePlans.map((plan) => {
            const isSelected = selectedPlan === plan.code;
            const isPurchased = isActive && currentPlanCode === plan.code;
            return (
              <button
                key={plan.code}
                type="button"
                onClick={() => setSelectedPlan(plan.code)}
                className={planCardClass({ isPurchased, isSelected })}
              >
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
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {isPurchased ? (
                    <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                      Aktives Paket
                    </span>
                  ) : null}
                  {isSelected ? (
                    <span className="inline-block rounded-full bg-[var(--gj-primary-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--gj-primary)]">
                      Ausgewählt
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <section className="gj-card p-5">
        <h3 className="text-sm font-semibold text-[var(--gj-text)]">Add-ons (monatlich, optional)</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {addons.map((a) => (
            <button
              key={a.code}
              type="button"
              onClick={() => toggleAddon(a.code)}
              className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition ${
                selectedAddons.includes(a.code)
                  ? "border-[var(--gj-primary)] bg-[var(--gj-primary-soft)]"
                  : "border-[var(--gj-border)] hover:border-[var(--gj-primary)]/40"
              }`}
            >
              <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                  selectedAddons.includes(a.code)
                    ? "border-[var(--gj-primary)] bg-[var(--gj-primary)] text-white"
                    : "border-[var(--gj-border-strong)]"
                }`}
                aria-hidden
              >
                {selectedAddons.includes(a.code) ? "✓" : ""}
              </span>
              <span>
                <span className="block text-sm font-semibold text-[var(--gj-text)]">
                  {a.name} · {a.priceEur}€/Mo.
                </span>
                <span className="mt-1 block text-xs text-[var(--gj-muted)]">{a.description}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => void payWithStripe()} className="gj-btn-primary">
          Mit Karte / SEPA bezahlen (Stripe)
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void activateOnInvoice()}
          className="gj-btn-secondary"
        >
          Auf Rechnung aktivieren
        </button>
      </div>
      {status ? (
        <p className="text-sm text-[var(--gj-muted)]" role="status">
          {status}
        </p>
      ) : null}
      <p className="text-xs text-[var(--gj-muted)]">
        Bei „Auf Rechnung aktivieren“ ist der Zugang sofort frei — Sie erhalten die Rechnung separat per
        E-Mail. Stripe-Zahlungen werden ebenfalls sofort aktiviert.
      </p>
    </div>
  );
}
