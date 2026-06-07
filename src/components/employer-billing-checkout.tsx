"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  activateInvoiceBilling,
  cancelEmployerAddon,
  cancelEmployerSubscription,
  reactivateEmployerAddon,
  reactivateEmployerSubscription,
  type EmployerAddonCancelType,
} from "@/app/actions/billing";
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
  extraJobsCancelCount: number;
  cancelHighlightAtPeriodEnd: boolean;
  cancelContactAllAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  maxPublishedJobs: number;
  publishedJobsCount: number;
  initialExtraJobCount: number;
  remainingExtraJobSlots: number;
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
  extraJobsCancelCount,
  cancelHighlightAtPeriodEnd,
  cancelContactAllAtPeriodEnd,
  currentPeriodEnd,
  maxPublishedJobs,
  publishedJobsCount,
  initialExtraJobCount,
  remainingExtraJobSlots,
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
  const [extraCancelModalOpen, setExtraCancelModalOpen] = useState(false);
  const [extraCancelCount, setExtraCancelCount] = useState(1);

  const committedExtraJobs = isActive ? initialExtraJobCount : 0;
  const committedHighlight = isActive && initialAddonHighlight;
  const committedContact = isActive && initialAddonContactAll;
  const periodEndLabel = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("de-DE")
    : null;
  const cancellableExtraJobs = isActive ? remainingExtraJobSlots : 0;
  const hasPartialExtraCancel = extraJobsCancelCount > 0;

  const selectedPlanDef = selectablePlans.find((p) => p.code === selectedPlan);
  const selectedIncludesHighlight = selectedPlanDef?.includesHighlight ?? false;
  const showHighlightAddon = !selectedIncludesHighlight && Boolean(highlightAddon);

  const hasPendingChanges = useMemo(() => {
    if (!isActive) return true;
    const planChanged = selectedPlan !== currentPlanCode;
    const extraChanged = extraJobCount !== committedExtraJobs;
    const highlightChanged =
      showHighlightAddon && addonHighlight !== initialAddonHighlight;
    const contactChanged = addonContactAll !== initialAddonContactAll;
    return planChanged || extraChanged || highlightChanged || contactChanged;
  }, [
    isActive,
    selectedPlan,
    currentPlanCode,
    extraJobCount,
    committedExtraJobs,
    showHighlightAddon,
    addonHighlight,
    initialAddonHighlight,
    addonContactAll,
    initialAddonContactAll,
  ]);

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

  const checkoutPayload = (mode?: "change" | "new") => ({
    plan: selectedPlan,
    extraJobCount,
    addonHighlight: showHighlightAddon ? addonHighlight : false,
    addonContactAll,
    ...(mode ? { mode } : {}),
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
      body: JSON.stringify(
        checkoutPayload(isActive && hasPendingChanges ? "change" : "new"),
      ),
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
    if (isActive && hasPendingChanges) fd.set("mode", "change");
    setBusy(true);
    setStatus(null);
    const res = await activateInvoiceBilling(fd);
    setBusy(false);
    if (res.ok) {
      setStatus(
        isActive
          ? "Änderung aktiv — Ihre Anpassung ist sofort wirksam."
          : "Paket aktiviert — Sie können sofort loslegen. Die Rechnung folgt per E-Mail.",
      );
      router.refresh();
      return;
    }
    setStatus("Aktivierung fehlgeschlagen. Bitte erneut versuchen.");
  }

  async function confirmExtraJobCancel() {
    if (cancellableExtraJobs <= 0) return;
    setBusy(true);
    setStatus(null);
    const res = await cancelEmployerAddon("EXTRA_JOB", extraCancelCount);
    setBusy(false);
    setExtraCancelModalOpen(false);
    if (res.ok) {
      setStatus(res.message ?? "Zusatzstellen gekündigt.");
      router.refresh();
      return;
    }
    setStatus(res.message ?? "Kündigung fehlgeschlagen.");
  }

  async function cancelAddon(type: EmployerAddonCancelType, label: string) {
    if (
      !window.confirm(
        `${label} wirklich kündigen? Es bleibt bis zum Laufzeitende aktiv.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setStatus(null);
    const res = await cancelEmployerAddon(type);
    setBusy(false);
    if (res.ok) {
      setStatus(res.message ?? `${label} gekündigt.`);
      router.refresh();
      return;
    }
    setStatus(res.message ?? "Kündigung fehlgeschlagen.");
  }

  async function reactivateAddon(type: EmployerAddonCancelType, label: string) {
    setBusy(true);
    setStatus(null);
    const res = await reactivateEmployerAddon(type);
    setBusy(false);
    if (res.ok) {
      setStatus(res.message ?? `${label} reaktiviert.`);
      router.refresh();
      return;
    }
    setStatus(res.message ?? "Reaktivierung fehlgeschlagen.");
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

  async function reactivateSubscription() {
    setBusy(true);
    setStatus(null);
    const res = await reactivateEmployerSubscription();
    setBusy(false);
    if (res.ok) {
      setStatus(res.message ?? "Paket reaktiviert.");
      router.refresh();
      return;
    }
    setStatus(res.message ?? "Reaktivierung fehlgeschlagen.");
  }

  function openExtraCancelModal() {
    setExtraCancelCount(Math.min(1, cancellableExtraJobs));
    setExtraCancelModalOpen(true);
  }

  return (
    <div className="space-y-10">
      {extraCancelModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="extra-cancel-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-[var(--gj-border)] bg-white p-6 shadow-xl">
            <h4 id="extra-cancel-title" className="text-lg font-semibold text-[var(--gj-text)]">
              Zusatzstellen kündigen
            </h4>
            <p className="mt-2 text-sm text-[var(--gj-muted)]">
              Sie haben {committedExtraJobs} Zusatzstelle(n) gebucht
              {hasPartialExtraCancel
                ? `, davon ${extraJobsCancelCount} bereits zur Kündigung vorgemerkt`
                : null}
              . Wie viele möchten Sie zusätzlich kündigen?
            </p>
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                type="button"
                aria-label="Weniger kündigen"
                disabled={extraCancelCount <= 1}
                onClick={() => setExtraCancelCount((n) => Math.max(1, n - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--gj-border)] bg-white text-lg font-bold hover:border-[var(--gj-primary)] disabled:opacity-40"
              >
                −
              </button>
              <span className="min-w-[3rem] text-center text-2xl font-bold text-[var(--gj-text)]">
                {extraCancelCount}
              </span>
              <button
                type="button"
                aria-label="Mehr kündigen"
                disabled={extraCancelCount >= cancellableExtraJobs}
                onClick={() =>
                  setExtraCancelCount((n) => Math.min(cancellableExtraJobs, n + 1))
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--gj-border)] bg-white text-lg font-bold hover:border-[var(--gj-primary)] disabled:opacity-40"
              >
                +
              </button>
            </div>
            <p className="mt-3 text-center text-sm text-emerald-800">
              <strong>{committedExtraJobs - extraJobsCancelCount - extraCancelCount}</strong>{" "}
              Stelle(n) bleiben nach der Kündigung aktiv (bis {periodEndLabel ?? "Laufzeitende"}{" "}
              nutzbar).
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => void confirmExtraJobCancel()}
                className="gj-btn-primary flex-1"
              >
                Kündigung bestätigen
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setExtraCancelModalOpen(false)}
                className="gj-btn-secondary flex-1"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
              {cancelAtPeriodEnd ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void reactivateSubscription()}
                  className="gj-btn-secondary text-sm"
                >
                  Paket reaktivieren
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void cancelSubscription()}
                  className="gj-btn-ghost text-sm text-red-700 hover:bg-red-50"
                >
                  Paket kündigen
                </button>
              )}
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
                {committedExtraJobs}
                {hasPartialExtraCancel ? (
                  <span className="ml-1 text-sm font-normal text-amber-800">
                    ({remainingExtraJobSlots} bleiben aktiv)
                  </span>
                ) : null}
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
              Sie können die Kündigung jederzeit zurücknehmen.
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
                    setExtraJobCount(committedExtraJobs);
                    if (!committedHighlight) setAddonHighlight(false);
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

      <section className="rounded-2xl border border-[var(--gj-border)] bg-white p-6">
        <h3 className="text-lg font-semibold text-[var(--gj-text)]">Add-ons</h3>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          Gebuchte Add-ons bleiben aktiv, bis Sie sie kündigen. Sie können jederzeit weitere
          hinzubuchen.
        </p>

        <div className="mt-6 space-y-4">
          {extraJobAddon && selectedPlanDef?.canPublishJobs ? (
            <div
              className={`rounded-xl border p-4 ${
                committedExtraJobs > 0
                  ? "border-emerald-200 bg-emerald-50/40"
                  : "border-[var(--gj-border)] bg-[var(--gj-bg)]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[var(--gj-text)]">{extraJobAddon.name}</p>
                    {committedExtraJobs > 0 ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                        {hasPartialExtraCancel ? "Teilweise gekündigt" : "Gebucht"}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-[var(--gj-muted)]">{extraJobAddon.description}</p>
                  <p className="mt-2 text-sm font-medium text-[var(--gj-primary)]">
                    {formatEur(extraJobAddon.priceEur)}€ / Stelle / Monat
                  </p>
                  {hasPartialExtraCancel && periodEndLabel ? (
                    <p className="mt-2 text-xs text-amber-800">
                      {extraJobsCancelCount} Stelle(n) enden am {periodEndLabel} —{" "}
                      {remainingExtraJobSlots} bleiben danach aktiv. Bis dahin alle gebuchten Stellen
                      nutzbar.
                    </p>
                  ) : committedExtraJobs > 0 ? (
                    <p className="mt-2 text-xs text-[var(--gj-muted)]">
                      Reduzierung nur per Kündigung — Anzahl beim Kündigen angeben.
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Weniger Stellen"
                      disabled={extraJobCount <= committedExtraJobs}
                      onClick={() =>
                        setExtraJobCount((n) => Math.max(committedExtraJobs, n - 1))
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--gj-border)] bg-white text-lg font-bold hover:border-[var(--gj-primary)] disabled:cursor-not-allowed disabled:opacity-40"
                      title={
                        extraJobCount <= committedExtraJobs
                          ? "Gebuchte Stellen nur per Kündigung entfernen"
                          : undefined
                      }
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
                  {hasPartialExtraCancel ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void reactivateAddon("EXTRA_JOB", "Zusatzstellen")}
                      className="text-sm font-medium text-emerald-700 hover:underline"
                    >
                      Kündigung zurücknehmen
                    </button>
                  ) : cancellableExtraJobs > 0 ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={openExtraCancelModal}
                      className="text-sm font-medium text-red-700 hover:underline"
                    >
                      Kündigen
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : selectedPlanDef && !selectedPlanDef.canPublishJobs ? (
            <p className="rounded-xl border border-dashed border-[var(--gj-border)] px-4 py-3 text-sm text-[var(--gj-muted)]">
              Zusatzstellen sind ab Paket <strong>Plus</strong> oder <strong>Premium</strong> verfügbar.
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            {showHighlightAddon && highlightAddon ? (
              committedHighlight ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[var(--gj-text)]">
                        {highlightAddon.name} · {formatEur(highlightAddon.priceEur)}€/Mo.
                      </p>
                      <p className="mt-1 text-sm text-[var(--gj-muted)]">{highlightAddon.description}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                      {cancelHighlightAtPeriodEnd ? "Gekündigt" : "Gebucht"}
                    </span>
                  </div>
                  {cancelHighlightAtPeriodEnd && periodEndLabel ? (
                    <>
                      <p className="mt-3 text-xs text-amber-800">Endet am {periodEndLabel}.</p>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void reactivateAddon("HIGHLIGHT", "Hervorhebung")}
                        className="mt-3 text-sm font-medium text-emerald-700 hover:underline"
                      >
                        Reaktivieren
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void cancelAddon("HIGHLIGHT", "Hervorhebung")}
                      className="mt-3 text-sm font-medium text-red-700 hover:underline"
                    >
                      Kündigen
                    </button>
                  )}
                </div>
              ) : (
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
              )
            ) : selectedIncludesHighlight ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-sm text-emerald-900">
                <strong>Hervorhebung</strong> ist in Ihrem gewählten Paket inklusive.
              </div>
            ) : null}

            {contactAddon ? (
              committedContact ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[var(--gj-text)]">
                        {contactAddon.name} · {formatEur(contactAddon.priceEur)}€/Mo.
                      </p>
                      <p className="mt-1 text-sm text-[var(--gj-muted)]">{contactAddon.description}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                      {cancelContactAllAtPeriodEnd ? "Gekündigt" : "Gebucht"}
                    </span>
                  </div>
                  {cancelContactAllAtPeriodEnd && periodEndLabel ? (
                    <>
                      <p className="mt-3 text-xs text-amber-800">Endet am {periodEndLabel}.</p>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void reactivateAddon("CONTACT_ALL", contactAddon.name)}
                        className="mt-3 text-sm font-medium text-emerald-700 hover:underline"
                      >
                        Reaktivieren
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void cancelAddon("CONTACT_ALL", contactAddon.name)}
                      className="mt-3 text-sm font-medium text-red-700 hover:underline"
                    >
                      Kündigen
                    </button>
                  )}
                </div>
              ) : (
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
              )
            ) : null}
          </div>
        </div>
      </section>

      {hasPendingChanges ? (
        <section className="rounded-2xl border-2 border-[var(--gj-primary)]/20 bg-[var(--gj-primary-softer)]/20 p-6">
          <h3 className="text-lg font-semibold text-[var(--gj-text)]">
            {isActive ? "Änderung aktivieren" : "Paket aktivieren"}
          </h3>
          <p className="mt-1 text-sm text-[var(--gj-muted)]">
            {isActive
              ? "Ihre Auswahl weicht vom aktiven Paket ab. Bestätigen Sie die Änderung per Zahlung oder Rechnung."
              : "Bestätigen Sie Ihre Auswahl per Zahlung oder Rechnung."}
          </p>
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
        </section>
      ) : isActive ? (
        <p className="rounded-xl border border-[var(--gj-border)] bg-[var(--gj-bg)] px-4 py-3 text-sm text-[var(--gj-muted)]">
          Keine ausstehenden Änderungen. Wählen Sie ein anderes Paket oder buchen Sie weitere Add-ons,
          um „Änderung aktivieren“ anzuzeigen.
          {status ? (
            <span className="mt-2 block text-[var(--gj-text-secondary)]" role="status">
              {status}
            </span>
          ) : null}
        </p>
      ) : status ? (
        <p className="text-sm text-[var(--gj-text-secondary)]" role="status">
          {status}
        </p>
      ) : null}

      {hasPendingChanges ? (
        <p className="text-xs text-[var(--gj-muted)]">
          Gebuchte Add-ons können nur über „Kündigen“ entfernt werden (aktiv bis Laufzeitende).
          Gekündigte Pakete und Add-ons können vor Ablauf reaktiviert werden.
        </p>
      ) : null}
    </div>
  );
}
