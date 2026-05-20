import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CompanyCard, type CompanyCardData } from "@/components/company-card";

export default async function WorkerHome() {
  const session = await auth();
  if (!session?.user) return null;

  const employers = await prisma.employerProfile.findMany({
    where: { user: { deletedAt: null } },
    orderBy: { updatedAt: "desc" },
    take: 60,
    select: {
      id: true,
      companyName: true,
      industry: true,
      region: true,
      openPositionsNote: true,
      createdAt: true,
    },
  });

  const now = Date.now();
  const items: CompanyCardData[] = employers.map((e) => ({
    id: e.id,
    companyName: e.companyName,
    industry: e.industry,
    region: e.region,
    openPositionsNote: e.openPositionsNote,
    isNew: now - new Date(e.createdAt).getTime() < 1000 * 60 * 60 * 24 * 14,
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--gj-muted)]">
            Wir haben{" "}
            <span className="font-semibold text-[var(--gj-primary)]">{items.length}</span>{" "}
            Unternehmen für Sie gefunden
          </p>
        </div>
        <Link href="/dashboard/worker/anfragen" className="gj-btn-ghost">
          Meine Bewerbungen
        </Link>
      </header>

      {items.length === 0 ? (
        <div className="gj-card p-12 text-center">
          <p className="text-sm text-[var(--gj-muted)]">
            Noch keine Unternehmen verfügbar. Schauen Sie später wieder vorbei.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((c) => (
            <CompanyCard key={c.id} data={c} />
          ))}
        </div>
      )}
    </div>
  );
}
