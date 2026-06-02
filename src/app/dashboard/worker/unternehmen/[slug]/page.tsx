import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { employerIsBlockedFromWorker } from "@/lib/platform";
import { CompanyProfileView } from "@/components/company-profile-view";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") return null;

  const { slug } = await params;
  const worker = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!worker) return null;

  const employer = await prisma.employerProfile.findFirst({
    where: { publicSlug: slug, user: { deletedAt: null } },
    include: {
      jobPostings: {
        where: { published: true },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          headline: true,
          employmentKind: true,
          workModeHint: true,
        },
      },
    },
  });

  if (!employer) notFound();

  const blocked = await employerIsBlockedFromWorker({
    workerProfileId: worker.id,
    employerUserId: employer.userId,
    companyName: employer.companyName,
    website: employer.website,
    managingDirectorName: employer.managingDirectorName,
    contactName: employer.contactName,
  });
  if (blocked) notFound();

  return (
    <CompanyProfileView
      company={{
        id: employer.id,
        companyName: employer.companyName,
        industry: employer.industry,
        region: employer.region,
        logoUrl: employer.logoUrl,
        website: employer.website,
        openPositionsNote: employer.openPositionsNote,
        companyDescription: employer.companyDescription,
      }}
      jobs={employer.jobPostings}
    />
  );
}
