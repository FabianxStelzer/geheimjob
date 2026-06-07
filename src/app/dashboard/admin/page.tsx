import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [
    activeUsers,
    workers,
    employers,
    matchesTotal,
    matchesAccepted,
    fees,
    referrals,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null, role: "WORKER" } }),
    prisma.user.count({ where: { deletedAt: null, role: "EMPLOYER" } }),
    prisma.matchRequest.count(),
    prisma.matchRequest.count({ where: { status: "ACCEPTED" } }),
    prisma.placementFee.findMany({
      orderBy: { id: "desc" },
      take: 15,
      include: { matchRequest: true },
    }),
    prisma.referralReward.count(),
  ]);

  const recentMatches = await prisma.matchRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 15,
    include: {
      workerProfile: true,
      employerProfile: true,
    },
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Aktive Nutzer:innen" value={activeUsers} />
        <StatCard label="Arbeitnehmer" value={workers} />
        <StatCard label="Arbeitgeber" value={employers} />
        <StatCard label="Matches gesamt" value={matchesTotal} />
        <StatCard label="Akzeptierte Matches" value={matchesAccepted} />
        <StatCard label="Referrals" value={referrals} />
      </section>

      <section className="gj-card p-6">
        <h2 className="text-base font-semibold">Letzte Matches</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--gj-border)] text-xs uppercase text-[var(--gj-muted)]">
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Kandidat</th>
                <th className="py-2 pr-4">Unternehmen</th>
                <th className="py-2">Datum</th>
              </tr>
            </thead>
            <tbody>
              {recentMatches.map((m) => (
                <tr key={m.id} className="border-b border-[var(--gj-border)]">
                  <td className="py-2 pr-4">{m.status}</td>
                  <td className="py-2 pr-4">
                    {m.workerProfile.displayName}
                    <span className="block text-xs text-[var(--gj-muted)]">
                      {m.workerProfile.professionField}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{m.employerProfile.companyName}</td>
                  <td className="py-2 text-[var(--gj-muted)]">{m.createdAt.toLocaleDateString("de-DE")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="gj-card p-6">
        <h2 className="text-base font-semibold">Provisionen</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--gj-border)] text-xs uppercase text-[var(--gj-muted)]">
                <th className="py-2 pr-4">Match</th>
                <th className="py-2 pr-4">Betrag (ct)</th>
                <th className="py-2">Bezahlt</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f.id} className="border-b border-[var(--gj-border)]">
                  <td className="py-2 pr-4 font-mono text-xs">{f.matchRequestId}</td>
                  <td className="py-2 pr-4">{f.amountCents}</td>
                  <td className="py-2 text-[var(--gj-muted)]">
                    {f.paidAt ? f.paidAt.toLocaleDateString("de-DE") : "offen"}
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="gj-card p-5">
      <p className="text-xs uppercase tracking-wider text-[var(--gj-muted)]">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-[var(--gj-text)]">{value}</p>
    </div>
  );
}
