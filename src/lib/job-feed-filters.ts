import type { JobFeedItem } from "@/lib/job-postings-for-worker";

export type JobFeedFilters = {
  q: string;
  region: string;
  industry: string;
  workMode: string;
  employmentKind: string;
};

export function emptyJobFeedFilters(): JobFeedFilters {
  return {
    q: "",
    region: "",
    industry: "",
    workMode: "",
    employmentKind: "",
  };
}

export function jobFeedFilterOptions(jobs: JobFeedItem[]) {
  const regions = new Set<string>();
  const industries = new Set<string>();
  const workModes = new Set<string>();
  const employmentKinds = new Set<string>();

  for (const j of jobs) {
    if (j.employer.region) regions.add(j.employer.region);
    if (j.employer.industry) industries.add(j.employer.industry);
    if (j.workModeHint) workModes.add(j.workModeHint);
    if (j.employmentKind) employmentKinds.add(j.employmentKind);
  }

  const sort = (a: string, b: string) => a.localeCompare(b, "de");
  return {
    regions: [...regions].sort(sort),
    industries: [...industries].sort(sort),
    workModes: [...workModes].sort(sort),
    employmentKinds: [...employmentKinds].sort(sort),
  };
}

export function filterJobFeedItems(jobs: JobFeedItem[], f: JobFeedFilters): JobFeedItem[] {
  const q = f.q.trim().toLowerCase();
  const region = f.region.trim().toLowerCase();
  const industry = f.industry.trim().toLowerCase();
  const workMode = f.workMode.trim().toLowerCase();
  const employmentKind = f.employmentKind.trim().toLowerCase();

  return jobs.filter((job) => {
    if (region && !job.employer.region.toLowerCase().includes(region)) return false;
    if (industry && !job.employer.industry.toLowerCase().includes(industry)) return false;
    if (workMode) {
      const wm = (job.workModeHint ?? "").toLowerCase();
      if (!wm.includes(workMode)) return false;
    }
    if (employmentKind) {
      const ek = (job.employmentKind ?? "").toLowerCase();
      if (!ek.includes(employmentKind)) return false;
    }

    if (q) {
      const haystack = [
        job.title,
        job.headline,
        job.employer.companyName,
        job.employer.industry,
        job.employer.region,
        job.workModeHint,
        job.weeklyHoursHint,
        job.employmentKind,
        job.productCostHint,
        job.commissionHint,
        job.targetIncomeHint,
        ...job.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}
