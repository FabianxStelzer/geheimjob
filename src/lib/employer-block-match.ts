import type { WorkerEmployerBlock } from "@prisma/client";

export type EmployerBlockCheckInput = {
  workerProfileId: string;
  employerUserId: string;
  companyName: string;
  website?: string | null;
  managingDirectorName?: string | null;
  contactName?: string | null;
};

export function normalizeWebsiteDomain(input: string): string {
  let s = input.trim().toLowerCase();
  if (!s) return "";
  s = s.replace(/^https?:\/\//, "");
  s = s.replace(/^www\./, "");
  s = s.split("/")[0] ?? "";
  s = s.split(":")[0] ?? "";
  s = s.split("?")[0] ?? "";
  return s;
}

export function normalizeMatchText(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,]+$/g, "");
}

export function companyNamesMatch(blocked: string, employerName: string): boolean {
  const a = normalizeMatchText(blocked);
  const b = normalizeMatchText(employerName);
  if (!a || !b) return false;
  if (a === b) return true;
  return a.includes(b) || b.includes(a);
}

export function personNamesMatch(blocked: string, employerName: string): boolean {
  const a = normalizeMatchText(blocked);
  const b = normalizeMatchText(employerName);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;

  const significant = (parts: string[]) => parts.filter((p) => p.length >= 3);
  const aParts = significant(a.split(" "));
  const bParts = significant(b.split(" "));
  return aParts.some((p) => b.includes(p)) || bParts.some((p) => a.includes(p));
}

export function domainMatches(
  blockedDomain: string,
  employerWebsite: string | null | undefined,
): boolean {
  const bd = normalizeWebsiteDomain(blockedDomain);
  if (!bd) return false;
  const ed = normalizeWebsiteDomain(employerWebsite ?? "");
  if (!ed) return false;
  return ed === bd || ed.endsWith(`.${bd}`) || bd.endsWith(`.${ed}`);
}

export function blockMatchesEmployer(
  block: Pick<
    WorkerEmployerBlock,
    | "blockedEmployerUserId"
    | "blockedCompanyName"
    | "blockedWebsiteDomain"
    | "blockedManagingDirectorName"
  >,
  employer: Omit<EmployerBlockCheckInput, "workerProfileId">,
): boolean {
  if (block.blockedEmployerUserId && block.blockedEmployerUserId === employer.employerUserId) {
    return true;
  }
  if (
    block.blockedCompanyName &&
    companyNamesMatch(block.blockedCompanyName, employer.companyName)
  ) {
    return true;
  }
  if (block.blockedWebsiteDomain && domainMatches(block.blockedWebsiteDomain, employer.website)) {
    return true;
  }
  const directorName = employer.managingDirectorName || employer.contactName;
  if (
    block.blockedManagingDirectorName &&
    directorName &&
    personNamesMatch(block.blockedManagingDirectorName, directorName)
  ) {
    return true;
  }
  return false;
}

export function employerBlockCheckFromProfile(employer: {
  userId: string;
  companyName: string;
  website?: string | null;
  managingDirectorName?: string | null;
  contactName?: string | null;
}): Omit<EmployerBlockCheckInput, "workerProfileId"> {
  return {
    employerUserId: employer.userId,
    companyName: employer.companyName,
    website: employer.website,
    managingDirectorName: employer.managingDirectorName,
    contactName: employer.contactName,
  };
}
