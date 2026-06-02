import { prisma } from "@/lib/prisma";
import { employerIsBlockedFromWorker } from "@/lib/platform";

export type JobFeedItem = {
  id: string;
  title: string;
  headline: string | null;
  tags: string[];
  productCostHint: string | null;
  commissionHint: string | null;
  targetIncomeHint: string | null;
  workModeHint: string | null;
  weeklyHoursHint: string | null;
  richDescription: string;
  updatedAt: string;
  highlighted: boolean;
  employer: {
    companyName: string;
    region: string;
    industry: string;
    logoUrl: string | null;
    employerProfileId: string;
    contactName: string;
  };
};

export function splitJobPostingTags(raw: string) {
  return raw
    .split(/[|,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 16);
}

export async function listPublishedJobsForWorkerProfile(workerProfileId: string): Promise<JobFeedItem[]> {
  const postings = await prisma.jobPosting.findMany({
    where: {
      published: true,
      employerProfile: { user: { deletedAt: null } },
    },
    include: {
      employerProfile: {
        select: {
          id: true,
          companyName: true,
          region: true,
          industry: true,
          logoUrl: true,
          userId: true,
          contactName: true,
        },
      },
    },
    orderBy: [{ highlighted: "desc" }, { updatedAt: "desc" }],
    take: 120,
  });

  const out: JobFeedItem[] = [];

  for (const p of postings) {
    const e = p.employerProfile;
    const blocked = await employerIsBlockedFromWorker({
      workerProfileId,
      employerUserId: e.userId,
      companyName: e.companyName,
    });
    if (blocked) continue;

    out.push({
      id: p.id,
      title: p.title,
      headline: p.headline,
      tags: splitJobPostingTags(p.tags),
      productCostHint: p.productCostHint,
      commissionHint: p.commissionHint,
      targetIncomeHint: p.targetIncomeHint,
      workModeHint: p.workModeHint,
      weeklyHoursHint: p.weeklyHoursHint,
      richDescription: p.richDescription,
      updatedAt: p.updatedAt.toISOString(),
      highlighted: p.highlighted,
      employer: {
        companyName: e.companyName,
        region: e.region,
        industry: e.industry,
        logoUrl: e.logoUrl,
        employerProfileId: e.id,
        contactName: e.contactName,
      },
    });
  }

  return out;
}
