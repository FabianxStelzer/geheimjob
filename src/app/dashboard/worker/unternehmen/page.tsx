import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CompanyBrowseGrid } from "@/components/company-browse-grid";

export default async function WorkerUnternehmenPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") return null;

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!worker) return null;

  const employers = await prisma.employerProfile.findMany({
    where: { user: { deletedAt: null } },
    orderBy: { updatedAt: "desc" },
    take: 80,
    select: {
      id: true,
      publicSlug: true,
      companyName: true,
      industry: true,
      region: true,
      logoUrl: true,
      openPositionsNote: true,
      companyDescription: true,
      _count: { select: { jobPostings: { where: { published: true } } } },
    },
  });

  const cards = employers.map((e) => ({
    id: e.id,
    publicSlug: e.publicSlug,
    companyName: e.companyName,
    industry: e.industry,
    region: e.region,
    logoUrl: e.logoUrl,
    openPositionsNote: e.openPositionsNote,
    descriptionPreview: e.companyDescription?.slice(0, 140) ?? e.openPositionsNote?.slice(0, 140) ?? null,
    publishedJobsCount: e._count.jobPostings,
    isNew: e._count.jobPostings > 0,
  }));

  return (
    <div className="space-y-6">
      <header>
        <p className="max-w-2xl text-sm text-[var(--gj-muted)]">
          Unternehmen entdecken, Profile ansehen und bei Interesse eine Anfrage senden.
        </p>
      </header>
      <CompanyBrowseGrid companies={cards} />
    </div>
  );
}
