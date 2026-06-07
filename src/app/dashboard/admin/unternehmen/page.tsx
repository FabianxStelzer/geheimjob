import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { planByCode } from "@/lib/billing-catalog";

export default async function AdminUnternehmenPage() {
  const employers = await prisma.user.findMany({
    where: { role: "EMPLOYER", deletedAt: null },
    include: {
      employerProfile: {
        include: {
          _count: { select: { jobPostings: true, matchRequests: true } },
        },
      },
      subscription: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const employersEnriched = await Promise.all(
    employers.map(async (u) => ({
      ...u,
      planName: (await planByCode(u.subscription?.plan ?? "NONE"))?.name ?? "—",
    })),
  );

  return (
    <section className="gj-card p-6">
      <h2 className="text-base font-semibold">Unternehmen ({employers.length})</h2>
      <p className="mt-1 text-sm text-[var(--gj-muted)]">
        Vollständige Firmenprofile, Stellen, Abonnements und Matches einsehen.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--gj-border)] text-xs uppercase text-[var(--gj-muted)]">
              <th className="py-2 pr-4">Unternehmen</th>
              <th className="py-2 pr-4">E-Mail</th>
              <th className="py-2 pr-4">Branche</th>
              <th className="py-2 pr-4">Region</th>
              <th className="py-2 pr-4">Paket</th>
              <th className="py-2 pr-4">Stellen</th>
              <th className="py-2 pr-4">Matches</th>
              <th className="py-2 pr-4">Registriert</th>
              <th className="py-2">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {employersEnriched.map((u) => {
              const p = u.employerProfile;
              const sub = u.subscription;
              return (
                <tr key={u.id} className="border-b border-[var(--gj-border)]">
                  <td className="py-2 pr-4 font-medium">{p?.companyName ?? "—"}</td>
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4">{p?.industry ?? "—"}</td>
                  <td className="py-2 pr-4">{p?.region ?? "—"}</td>
                  <td className="py-2 pr-4">
                    <span className="gj-chip text-[11px]">{u.planName}</span>
                    <span className="ml-1 text-xs text-[var(--gj-muted)]">
                      {sub?.billingStatus ?? "INACTIVE"}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{p?._count.jobPostings ?? 0}</td>
                  <td className="py-2 pr-4">{p?._count.matchRequests ?? 0}</td>
                  <td className="py-2 pr-4 text-[var(--gj-muted)]">
                    {u.createdAt.toLocaleDateString("de-DE")}
                  </td>
                  <td className="py-2">
                    <Link
                      href={`/dashboard/admin/unternehmen/${u.id}`}
                      className="text-sm font-medium text-[var(--gj-primary)] hover:underline"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
