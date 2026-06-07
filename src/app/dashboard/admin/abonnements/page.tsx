import { prisma } from "@/lib/prisma";
import { planByCode } from "@/lib/billing-catalog";

export default async function AdminAbonnementsPage() {
  const subs = await prisma.subscription.findMany({
    include: {
      user: { include: { employerProfile: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const invoiceActive = subs.filter(
    (s) => s.billingStatus === "ACTIVE" && s.paymentMethod === "INVOICE",
  );

  const subsEnriched = await Promise.all(
    subs.map(async (s) => ({
      ...s,
      planName: (await planByCode(s.plan))?.name ?? s.plan,
    })),
  );

  return (
    <div className="space-y-6">
      {invoiceActive.length > 0 ? (
        <section className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950">
          <strong>{invoiceActive.length} Rechnungs-Paket(e) aktiv</strong> — Rechnungen an diese
          Unternehmen versenden (Details unter Unternehmen).
        </section>
      ) : null}

      <section className="gj-card p-6">
        <h2 className="text-base font-semibold">Alle Abonnements</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--gj-border)] text-xs uppercase text-[var(--gj-muted)]">
                <th className="py-2 pr-4">Unternehmen</th>
                <th className="py-2 pr-4">Paket</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Zahlung</th>
                <th className="py-2 pr-4">Add-ons</th>
                <th className="py-2">bis</th>
              </tr>
            </thead>
            <tbody>
              {subsEnriched.map((s) => (
                <tr key={s.id} className="border-b border-[var(--gj-border)]">
                  <td className="py-2 pr-4">
                    {s.user.employerProfile?.companyName ?? s.user.email}
                  </td>
                  <td className="py-2 pr-4">{s.planName}</td>
                  <td className="py-2 pr-4">{s.billingStatus}</td>
                  <td className="py-2 pr-4">{s.paymentMethod ?? "—"}</td>
                  <td className="py-2 pr-4 text-xs">
                    {s.extraJobSlots ? `+${s.extraJobSlots} Stellen ` : ""}
                    {s.addonHighlight ? "Highlight " : ""}
                    {s.addonContactAll ? "Alle kontaktieren" : ""}
                  </td>
                  <td className="py-2 text-[var(--gj-muted)]">
                    {s.currentPeriodEnd?.toLocaleDateString("de-DE") ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
