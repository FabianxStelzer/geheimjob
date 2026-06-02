import { prisma } from "@/lib/prisma";

export type JobPostingStats = {
  detailViewCount: number;
  uniqueViewCount: number;
  applicationsTotal: number;
  applicationsPending: number;
  applicationsAccepted: number;
  applicationsRejected: number;
  conversionRate: number | null;
};

export type EmployerJobsOverview = {
  totals: JobPostingStats;
  byJobId: Record<string, JobPostingStats>;
};

function emptyStats(): JobPostingStats {
  return {
    detailViewCount: 0,
    uniqueViewCount: 0,
    applicationsTotal: 0,
    applicationsPending: 0,
    applicationsAccepted: 0,
    applicationsRejected: 0,
    conversionRate: null,
  };
}

function withConversion(stats: Omit<JobPostingStats, "conversionRate">): JobPostingStats {
  const conversionRate =
    stats.uniqueViewCount > 0
      ? Math.round((stats.applicationsTotal / stats.uniqueViewCount) * 1000) / 10
      : null;
  return { ...stats, conversionRate };
}

export async function getEmployerJobPostingStats(
  employerProfileId: string,
): Promise<EmployerJobsOverview> {
  const jobs = await prisma.jobPosting.findMany({
    where: { employerProfileId },
    select: { id: true, detailViewCount: true },
  });

  const jobIds = jobs.map((j) => j.id);
  const byJobId: Record<string, JobPostingStats> = {};
  for (const job of jobs) {
    byJobId[job.id] = withConversion({
      ...emptyStats(),
      detailViewCount: job.detailViewCount,
    });
  }

  if (!jobIds.length) {
    return { totals: emptyStats(), byJobId };
  }

  const [uniqueViews, matches] = await Promise.all([
    prisma.jobPostingView.groupBy({
      by: ["jobPostingId"],
      where: { jobPostingId: { in: jobIds } },
      _count: { _all: true },
    }),
    prisma.matchRequest.findMany({
      where: { jobPostingId: { in: jobIds } },
      select: { jobPostingId: true, status: true },
    }),
  ]);

  for (const row of uniqueViews) {
    if (!row.jobPostingId || !byJobId[row.jobPostingId]) continue;
    byJobId[row.jobPostingId].uniqueViewCount = row._count._all;
  }

  for (const m of matches) {
    if (!m.jobPostingId || !byJobId[m.jobPostingId]) continue;
    const s = byJobId[m.jobPostingId];
    s.applicationsTotal += 1;
    if (m.status === "PENDING") s.applicationsPending += 1;
    if (m.status === "ACCEPTED") s.applicationsAccepted += 1;
    if (m.status === "REJECTED") s.applicationsRejected += 1;
  }

  for (const id of jobIds) {
    byJobId[id] = withConversion(byJobId[id]);
  }

  const totals = withConversion(
    jobIds.reduce(
      (acc, id) => {
        const s = byJobId[id];
        acc.detailViewCount += s.detailViewCount;
        acc.uniqueViewCount += s.uniqueViewCount;
        acc.applicationsTotal += s.applicationsTotal;
        acc.applicationsPending += s.applicationsPending;
        acc.applicationsAccepted += s.applicationsAccepted;
        acc.applicationsRejected += s.applicationsRejected;
        return acc;
      },
      {
        detailViewCount: 0,
        uniqueViewCount: 0,
        applicationsTotal: 0,
        applicationsPending: 0,
        applicationsAccepted: 0,
        applicationsRejected: 0,
      },
    ),
  );

  return { totals, byJobId };
}

export async function recordJobPostingDetailView(jobPostingId: string, workerUserId: string) {
  const posting = await prisma.jobPosting.findFirst({
    where: { id: jobPostingId, published: true },
    select: { id: true },
  });
  if (!posting) return { ok: false as const };

  await prisma.$transaction([
    prisma.jobPosting.update({
      where: { id: jobPostingId },
      data: { detailViewCount: { increment: 1 } },
    }),
    prisma.jobPostingView.upsert({
      where: {
        jobPostingId_workerUserId: { jobPostingId, workerUserId },
      },
      create: { jobPostingId, workerUserId },
      update: {},
    }),
  ]);

  return { ok: true as const };
}
