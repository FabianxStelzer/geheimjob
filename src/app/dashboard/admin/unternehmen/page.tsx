import { prisma } from "@/lib/prisma";
import { AdminEmployerForm } from "@/components/admin-employer-form";
import { planByCode } from "@/lib/billing-plans";

export default async function AdminUnternehmenPage() {
  const employers = await prisma.user.findMany({
    where: { role: "EMPLOYER", deletedAt: null },
    include: { employerProfile: true, subscription: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="gj-card p-6">
      <h2 className="text-base font-semibold">Unternehmen ({employers.length})</h2>
      <p className="mt-1 text-sm text-[var(--gj-muted)]">
        Paket freischalten (Rechnung), Status ändern oder Zugang entziehen.
      </p>
      <ul className="mt-6 space-y-4">
        {employers.map((u) => {
          const sub = u.subscription;
          const planName = planByCode(sub?.plan ?? "NONE")?.name ?? "—";
          return (
            <li key={u.id} className="rounded-xl border border-[var(--gj-border)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[var(--gj-text)]">
                    {u.employerProfile?.companyName ?? "—"}
                  </p>
                  <p className="text-sm text-[var(--gj-muted)]">{u.email}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="gj-chip">{planName}</span>
                  <span className="gj-chip gj-chip-neutral">{sub?.billingStatus ?? "INACTIVE"}</span>
                  {sub?.paymentMethod ? (
                    <span className="gj-chip gj-chip-neutral">{sub.paymentMethod}</span>
                  ) : null}
                </div>
              </div>
              <AdminEmployerForm
                userId={u.id}
                companyName={u.employerProfile?.companyName ?? "—"}
                email={u.email}
                plan={sub?.plan ?? "NONE"}
                billingStatus={sub?.billingStatus ?? "INACTIVE"}
                paymentMethod={sub?.paymentMethod ?? ""}
                extraJobSlots={sub?.extraJobSlots ?? 0}
                addonHighlight={sub?.addonHighlight ?? false}
                addonContactAll={sub?.addonContactAll ?? false}
                adminNote={sub?.adminNote ?? ""}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
