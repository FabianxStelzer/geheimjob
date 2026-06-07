"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { activateInvoiceBilling, cancelEmployerSubscription } from "@/app/actions/billing";
import type { AddonDefinition, PlanDefinition } from "@/lib/billing-plans";
import { MAX_EXTRA_JOB_SLOTS } from "@/lib/employer-billing";
import type { EmployerPlan, PaymentMethod } from "@prisma/client";

type Props = {
  plans: PlanDefinition[];
  addons: AddonDefinition[];
  currentPlan: string;
  currentPlanCode: EmployerPlan;
  billingStatus: string;
  paymentMethod: PaymentMethod | null;
  isActive: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  maxPublishedJobs: number;
  publishedJobsCount: number;
  initialExtraJobCount: number;
  initialAddonHighlight: boolean;
  initialAddonContactAll: boolean;
  planIncludesHighlight: boolean;
};

function planCardClass(opts: { isPurchased: boolean; isSelected: boolean; featured?: boolean }): string {
  const base = "relative w-full rounded-2xl border-2 p-6 text-left transition";
  if (opts.isPurchased && opts.isSelected) {
    return `${base} border-emerald-500 bg-emerald-50/40 shadow-md`;
  }
  if (opts.isPurchased) {
    return `${base} border-emerald-500 bg-emerald-50/30`;
  }
  if (opts.isSelected) {
    return `${base} border-[var(--gj-primary)] bg-[var(--gj-primary-softer)]/30 shadow-md`;
  }
  if (opts.featured) {
    return `${base} border-[var(--gj-border)] bg-white hover:border-[var(--gj-primary)]/50`;
  }
  return `${base} border-[var(--gj-border)] bg-white hover:border-[var(--gj-primary)]/40`;
}

function formatEur(n: number): string {
  return n.toLocaleString("de-DE");
}

export function EmployerBillingCheckout({
  plans,
  addons,
  currentPlan,
  currentPlanCode,
  billingStatus,
  paymentMethod,
  isActive,
  cancelAtPeriodEnd,
  currentPeriodEnd,
  maxPublishedJobs,
  publishedJobsCount,
  initialExtraJobCount,
  initialAddonHighlight,
  initialAddonContactAll,
  planIncludesHighlight,
}: Props) {
  const router = useRouter();
  const selectablePlans = plans.filter((p) => p.code !== "NONE");
  const initialPlan =
    selectablePlans.find((p) => p.code === currentPlanCode)?.code ??
    selectablePlans.find((p) => p.code === "PLUS")?.code ??
    selectablePlans[0]?.code ??
    "PLUS";

  const extraJobAddon = addons.find((a) => a.code === "EXTRA_JOB");
  const highlightAddon = addons.find((a) => a.code === "HIGHLIGHT");
  const contactAddon = addons.find((a) => a.code === "CONTACT_ALL");

  const [selectedPlan, setSelectedPlan] = useState<string>(initialPlan);
  const [extraJobCount, setExtraJobCount] = useState(
    isActive ? initialExtraJobCount : 0,
  );
  const [addonHighlight, setAddonHighlight] = useState(
    isActive ? initialAddonHighlight : false,
  );
  const [addonContactAll, setAddonContactAll] = useState(
    isActive ? initialAddonContactAll : false,
  );
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const selectedPlanDef = selectablePlans.find((p) => p.code === selectedPlan);
  const selectedIncludesHighlight = selectedPlanDef?.includesHighlight ?? false;
  const showHighlightAddon = !selectedIncludesHighlight && Boolean(highlightAddon);

  const monthlyTotal = useMemo(() => {
    if (!selectedPlanDef) return 0;
    let total = selectedPlanDef.priceEur;
    if (extraJobAddon) total += extraJobCount * extraJobAddon.priceEur;
    if (showHighlightAddon && addonHighlight && highlightAddon) {
      total += highlightAddon.priceEur;
    }
    if (addonContactAll && contactAddon) total += contactAddon.priceEur;
    return total;
  }, [
    selectedPlanDef,
    extraJobCount,
    extraJobAddon,
    showHighlightAddon,
    addonHighlight,
    highlightAddon,
    addonContactAll,
    contactAddon,
  ]);

  const checkoutPayload = () => ({
    plan: selectedPlan,
    extraJobCount,
    addonHighlight: showHighlightAddon ? addonHighlight : false,
    addonContactAll,
  });

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
      body: JSON.stringify(checkoutPayload()),
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
    fd.set("extraJobCount", String(extraJobCount));
    if (showHighlightAddon && addonHighlight) fd.set("addonHighlight", "on");
    if (addonContactAll) fd.set("addonContactAll", "on");
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

  async function cancelSubscription() {
    if (
      !window.confirm(
        "Paket wirklich kündigen? Der Zugang bleibt bis zum Ende der Laufzeit aktiv.",
      )
    ) {
      return;
    }
    setBusy(true);
    setStatus(null);
    const res = await cancelEmployerSubscription();
    setBusy(false);
    if (res.ok) {
      setStatus(res.message ?? "Paket gekündigt.");
      router.refresh();
      return;
    }
    setStatus(res.message ?? "Kündigung fehlgeschlagen.");
  }

  return (
    <div className="space-y-10">
      {/* Aktueller Status */}
      {isActive ? (
        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <div className="border-b border-emerald-100 px-6 py-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Ihre Mitgliedschaft
                </p>
                <h3 className="mt-1 text-2xl font-bold text-[var(--gj-text)]">{currentPlan}</h3>
                <p className="mt-1 text-sm text-emerald-800">
                  {paymentMethod === "STRIPE" ? "Zahlung per Stripe" : "Zahlung auf Rechnung"}
                  {currentPeriodEnd
                    ? ` · aktiv bis ${new Date(currentPeriodEnd).toLocaleDateString("de-DE")}`
                    : null}
                </p>
              </div>
              {!cancelAtPeriodEnd ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void cancelSubscription()}
                  className="gj-btn-ghost text-sm text-red-700 hover:bg-red-50"
                >
                  Paket kündigen
                </button>
              ) : null}
            </div>
          </div>
          <div className="grid gap-px bg-emerald-100 sm:grid-cols-3">
            <div className="bg-white/80 px-6 py-4">
              <p className="text-xs text-[var(--gj-muted)]">Stellen-Slots</p>
              <p className="mt-1 text-lg font-semibold text-[var(--gj-text)]">
                {publishedJobsCount} / {maxPublishedJobs}
              </p>
            </div>
            <div className="bg-white/80 px-6 py-4">
              <p className="text-xs text-[var(--gj-muted)]">Zusatzstellen</p>
              <p className="mt-1 text-lg font-semibold text-[var(--gj-text)]">
                {initialExtraJobCount}
              </p>
            </div>
            <div className="bg-white/80 px-6 py-4">
              <p className="text-xs text-[var(--gj-muted)]">Status</p>
              <p className="mt-1 text-lg font-semibold text-[var(--gj-text)]">
                {cancelAtPeriodEnd ? "Gekündigt" : billingStatus}
              </p>
            </div>
          </div>
          {cancelAtPeriodEnd && currentPeriodEnd ? (
            <p className="border-t border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-900">
              Gekündigt — Zugang bleibt bis{" "}
              <strong>{new Date(currentPeriodEnd).toLocaleDateString("de-DE")}</strong> aktiv.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--gj-border)] bg-[var(--gj-bg)] px-6 py-5">
          <h3 className="text-lg font-semibold text-[var(--gj-text)]">Noch kein Paket aktiv</h3>
          <p className="mt-1 text-sm text-[var(--gj-muted)]">
            Wählen Sie ein Paket und optional Zusatzstellen, um den Talentpool und Stellenanzeigen zu
            nutzen.
          </p>
        </div>
      )}

      {/* Pakete */}
      <div>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-[var(--gj-text)]">Paket wählen</h3>
            <p className="mt-1 text-sm text-[var(--gj-muted)]">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--gj-primary)] align-middle" />{" "}
              Ausgewählt ·{" "}
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 align-middle" />{" "}
              Aktives Paket
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {selectablePlans.map((plan) => {
            const isSelected = selectedPlan === plan.code;
            const isPurchased = isActive && currentPlanCode === plan.code;
            const featured = plan.code === "PLUS";
            return (
              <button
                key={plan.code}
                type="button"
                onClick={() => {
                  setSelectedPlan(plan.code);
                  if (!plan.canPublishJobs) {
                    setExtraJobCount(0);
                    setAddonHighlight(false);
                  }
                }}
                className={planCardClass({ isPurchased, isSelected, featured })}
              >
                {featured ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--gj-primary)] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Beliebt
                  </span>
                ) : null}
                <p className="text-xl font-bold text-[var(--gj-text)]">{plan.name}</p>
                <p className="mt-2">
                  <span className="text-3xl font-extrabold text-[var(--gj-primary)]">
                    {formatEur(plan.priceEur)}€
                  </span>
                  <span className="text-sm text-[var(--gj-muted)]"> / Monat</span>
                </p>
                <p className="mt-3 text-sm text-[var(--gj-muted)]">{plan.description}</p>
                <ul className="mt-5 space-y-2 border-t border-[var(--gj-border)] pt-4 text-sm text-[var(--gj-text-secondary)]">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-emerald-600">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {isPurchased ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                      Aktiv
                    </span>
                  ) : null}
                  {isSelected ? (
                    <span className="rounded-full bg-[var(--gj-primary-soft)] px-2.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--gj-primary)]">
                      Ausgewählt
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add-ons */}
      <section className="rounded-2xl border border-[var(--gj-border)] bg-white p-6">
        <h3 className="text-lg font-semibold text-[var(--gj-text)]">Add-ons</h3>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          Monatlich optional — Zusatzstellen nach Bedarf wählen.
        </p>

        <div className="mt-6 space-y-4">
          {extraJobAddon && selectedPlanDef?.canPublishJobs ? (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--gj-border)] bg-[var(--gj-bg)] p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--gj-text)]">{extraJobAddon.name}</p>
                <p className="mt-1 text-sm text-[var(--gj-muted)]">{extraJobAddon.description}</p>
                <p className="mt-2 text-sm font-medium text-[var(--gj-primary)]">
                  {formatEur(extraJobAddon.priceEur)}€ / Stelle / Monat
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Weniger Stellen"
                  disabled={extraJobCount <= 0}
                  onClick={() => setExtraJobCount((n) => Math.max(0, n - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--gj-border)] bg-white text-lg font-bold hover:border-[var(--gj-primary)] disabled:opacity-40"
                >
                  −
                </button>
                <span className="min-w-[3rem] text-center text-xl font-bold text-[var(--gj-text)]">
                  {extraJobCount}
                </span>
                <button
                  type="button"
                  aria-label="Mehr Stellen"
                  disabled={extraJobCount >= MAX_EXTRA_JOB_SLOTS}
                  onClick={() =>
                    setExtraJobCount((n) => Math.min(MAX_EXTRA_JOB_SLOTS, n + 1))
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--gj-border)] bg-white text-lg font-bold hover:border-[var(--gj-primary)] disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>
          ) : selectedPlanDef && !selectedPlanDef.canPublishJobs ? (
            <p className="rounded-xl border border-dashed border-[var(--gj-border)] px-4 py-3 text-sm text-[var(--gj-muted)]">
              Zusatzstellen sind ab Paket <strong>Plus</strong> oder <strong>Premium</strong> verfügbar.
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            {showHighlightAddon && highlightAddon ? (
              <button
                type="button"
                onClick={() => setAddonHighlight((v) => !v)}
                className={`rounded-xl border p-4 text-left transition ${
                  addonHighlight
                    ? "border-[var(--gj-primary)] bg-[var(--gj-primary-soft)]"
                    : "border-[var(--gj-border)] hover:border-[var(--gj-primary)]/40"
                }`}
              >
                <p className="font-semibold text-[var(--gj-text)]">
                  {highlightAddon.name} · {formatEur(highlightAddon.priceEur)}€/Mo.
                </p>
                <p className="mt-1 text-sm text-[var(--gj-muted)]">{highlightAddon.description}</p>
              </button>
            ) : selectedIncludesHighlight ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-sm text-emerald-900">
                <strong>Hervorhebung</strong> ist in Ihrem gewählten Paket inklusive.
              </div>
            ) : null}

            {contactAddon ? (
              <button
                type="button"
                onClick={() => setAddonContactAll((v) => !v)}
                className={`rounded-xl border p-4 text-left transition ${
                  addonContactAll
                    ? "border-[var(--gj-primary)] bg-[var(--gj-primary-soft)]"
                    : "border-[var(--gj-border)] hover:border-[var(--gj-primary)]/40"
                }`}
              >
                <p className="font-semibold text-[var(--gj-text)]">
                  {contactAddon.name} · {formatEur(contactAddon.priceEur)}€/Mo.
                </p>
                <p className="mt-1 text-sm text-[var(--gj-muted)]">{contactAddon.description}</p>
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {/* Zusammenfassung & Checkout */}
      <section className="rounded-2xl border-2 border-[var(--gj-primary)]/20 bg-[var(--gj-primary-softer)]/20 p-6">
        <h3 className="text-lg font-semibold text-[var(--gj-text)]">Zusammenfassung</h3>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--gj-muted)]">Paket</dt>
            <dd className="font-medium text-[var(--gj-text)]">
              {selectedPlanDef?.name ?? "—"} ({formatEur(selectedPlanDef?.priceEur ?? 0)}€)
            </dd>
          </div>
          {extraJobCount > 0 && extraJobAddon ? (
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--gj-muted)]">Zusatzstellen ({extraJobCount}×)</dt>
              <dd className="font-medium text-[var(--gj-text)]">
                {formatEur(extraJobCount * extraJobAddon.priceEur)}€
              </dd>
            </div>
          ) : null}
          {showHighlightAddon && addonHighlight && highlightAddon ? (
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--gj-muted)]">Hervorhebung</dt>
              <dd className="font-medium text-[var(--gj-text)]">
                {formatEur(highlightAddon.priceEur)}€
              </dd>
            </div>
          ) : null}
          {addonContactAll && contactAddon ? (
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--gj-muted)]">Alle kontaktieren</dt>
              <dd className="font-medium text-[var(--gj-text)]">
                {formatEur(contactAddon.priceEur)}€
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 border-t border-[var(--gj-border)] pt-3 text-base">
            <dt className="font-semibold text-[var(--gj-text)]">Monatlich gesamt</dt>
            <dd className="font-bold text-[var(--gj-primary)]">{formatEur(monthlyTotal)}€</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void payWithStripe()}
            className="gj-btn-primary"
          >
            Mit Karte / SEPA bezahlen
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
          <p className="mt-4 text-sm text-[var(--gj-text-secondary)]" role="status">
            {status}
          </p>
        ) : null}
        <p className="mt-4 text-xs text-[var(--gj-muted)]">
          Bei Rechnung ist der Zugang sofort frei. Kündigung zum Laufzeitende jederzeit möglich.
        </p>
      </section>
    </div>
  );
}
