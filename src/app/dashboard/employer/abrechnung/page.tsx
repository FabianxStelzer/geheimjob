import { auth } from "@/auth";
import { EmployerBillingCheckout } from "@/components/employer-billing-checkout";
import { getEmployerEntitlements, ensureEmployerSubscription } from "@/lib/employer-billing";
import { planByCode } from "@/lib/billing-catalog";
import { getAddonCatalog, getPlanCatalog } from "@/lib/billing-catalog";

export default async function EmployerBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ bezahlt?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  await ensureEmployerSubscription(session.user.id);
  const ent = await getEmployerEntitlements(session.user.id);
  const sp = await searchParams;
  const [plans, addons, planLabel] = await Promise.all([
    getPlanCatalog(),
    getAddonCatalog(),
    planByCode(ent.plan).then((p) => p?.name ?? "Kein Paket"),
  ]);

  return (
    <div className="space-y-6">
      {sp.bezahlt === "1" ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Vielen Dank — die Zahlung wird verarbeitet. Der Zugang ist aktiv, sobald Stripe bestätigt hat.
        </p>
      ) : null}

      <section className="gj-card p-6">
        <h2 className="text-lg font-semibold text-[var(--gj-text)]">Mitgliedschaft verwalten</h2>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          Paket wählen, Add-ons buchen und per Karte/SEPA (Stripe) oder auf Rechnung aktivieren.
        </p>
        <div className="mt-6">
          <EmployerBillingCheckout
            plans={plans}
            addons={addons}
            currentPlan={planLabel}
            currentPlanCode={ent.plan}
            billingStatus={ent.billingStatus}
            isActive={ent.isActive}
            currentPeriodEnd={ent.currentPeriodEnd?.toISOString() ?? null}
          />
        </div>
      </section>
    </div>
  );
}
