import type { Role } from "@prisma/client";
import { buildMatchCvFields } from "@/lib/match-cv-props";
import { prisma } from "@/lib/prisma";

export async function getMatchCvStatusForUser(matchId: string, userId: string, role: Role) {
  const match = await prisma.matchRequest.findUnique({
    where: { id: matchId },
    include: { workerProfile: true, employerProfile: true },
  });

  if (!match) return null;

  const isEmployer = match.employerProfile.userId === userId;
  const isWorker = match.workerProfile.userId === userId;
  if (role === "EMPLOYER" && !isEmployer) return null;
  if (role === "WORKER" && !isWorker) return null;

  const cvFields = buildMatchCvFields(match, match.workerProfile);

  return {
    status: match.status,
    employerCompanyName: match.employerProfile.companyName,
    workerMeta: {
      displayName: match.workerProfile.displayName,
      professionField: match.workerProfile.professionField,
      region: match.workerProfile.region,
    },
    ...cvFields,
  };
}
