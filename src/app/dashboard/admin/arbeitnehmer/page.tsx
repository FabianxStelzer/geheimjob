import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminArbeitnehmerPage() {
  const workers = await prisma.user.findMany({
    where: { role: "WORKER", deletedAt: null },
    include: {
      workerProfile: {
        include: {
          _count: { select: { matchRequests: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <section className="gj-card p-6">
      <h2 className="text-base font-semibold">Arbeitnehmer ({workers.length})</h2>
      <p className="mt-1 text-sm text-[var(--gj-muted)]">
        Vollständige Profile, Bewerbungsdaten, Lebenslauf und Matches einsehen.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--gj-border)] text-xs uppercase text-[var(--gj-muted)]">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Berufsfeld</th>
              <th className="py-2 pr-4">E-Mail</th>
              <th className="py-2 pr-4">Region</th>
              <th className="py-2 pr-4">Sichtbar</th>
              <th className="py-2 pr-4">Matches</th>
              <th className="py-2 pr-4">Registriert</th>
              <th className="py-2">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((u) => (
              <tr key={u.id} className="border-b border-[var(--gj-border)]">
                <td className="py-2 pr-4 font-medium">{u.workerProfile?.displayName ?? "—"}</td>
                <td className="py-2 pr-4">{u.workerProfile?.professionField ?? "—"}</td>
                <td className="py-2 pr-4">{u.email}</td>
                <td className="py-2 pr-4">{u.workerProfile?.region ?? "—"}</td>
                <td className="py-2 pr-4">
                  {u.workerProfile?.profileVisible ? "Ja" : "Nein"}
                </td>
                <td className="py-2 pr-4">{u.workerProfile?._count.matchRequests ?? 0}</td>
                <td className="py-2 pr-4 text-[var(--gj-muted)]">
                  {u.createdAt.toLocaleDateString("de-DE")}
                </td>
                <td className="py-2">
                  <Link
                    href={`/dashboard/admin/arbeitnehmer/${u.id}`}
                    className="text-sm font-medium text-[var(--gj-primary)] hover:underline"
                  >
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
