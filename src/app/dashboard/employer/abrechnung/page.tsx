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

      <EmployerBillingCheckout
        plans={plans}
        addons={addons}
        currentPlan={planLabel}
        currentPlanCode={ent.plan}
        billingStatus={ent.billingStatus}
        paymentMethod={ent.paymentMethod}
        isActive={ent.isActive}
        cancelAtPeriodEnd={ent.cancelAtPeriodEnd}
        extraJobsCancelCount={ent.extraJobsCancelCount}
        cancelHighlightAtPeriodEnd={ent.cancelHighlightAtPeriodEnd}
        cancelContactAllAtPeriodEnd={ent.cancelContactAllAtPeriodEnd}
        currentPeriodEnd={ent.currentPeriodEnd?.toISOString() ?? null}
        maxPublishedJobs={ent.maxPublishedJobs}
        publishedJobsCount={ent.publishedJobsCount}
        initialExtraJobCount={ent.extraJobSlots}
        remainingExtraJobSlots={ent.remainingExtraJobSlots}
        initialAddonHighlight={ent.addonHighlight}
        initialAddonContactAll={ent.addonContactAll}
        planIncludesHighlight={ent.planIncludesHighlight}
      />
    </div>
  );
}
