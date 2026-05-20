import { NotificationKind, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function notifyUser(
  userId: string,
  kind: NotificationKind,
  title: string,
  body: string,
  href?: string,
) {
  await prisma.notification.create({
    data: { userId, kind, title, body, href },
  });
}

export async function employerIsBlockedFromWorker(opts: {
  workerProfileId: string;
  employerUserId: string;
  companyName: string;
}) {
  const { workerProfileId, employerUserId, companyName } = opts;
  const normalizedCompany = companyName.toLowerCase().trim();
  const blocks = await prisma.workerEmployerBlock.findMany({
    where: { workerProfileId },
  });
  return blocks.some((b) => {
    if (b.blockedEmployerUserId === employerUserId) return true;
    if (
      b.blockedCompanyName &&
      b.blockedCompanyName.toLowerCase().trim() === normalizedCompany
    )
      return true;
    return false;
  });
}

export function parseSalaryRange(param: string | null): Prisma.IntNullableFilter | undefined {
  if (!param) return undefined;
  const [minS, maxS] = param.split("-");
  const min = minS ? Number(minS) : NaN;
  const max = maxS ? Number(maxS) : NaN;
  if (!Number.isFinite(min) && !Number.isFinite(max)) return undefined;
  const filter: Prisma.IntNullableFilter = {};
  if (Number.isFinite(min)) filter.gte = min;
  if (Number.isFinite(max)) filter.lte = max;
  return filter;
}

/** Soft-Delete: Nutzer anonymisieren und als gelöscht markieren (DSGVO-Freundlich erweiterbar). */
export async function softDeleteUser(userId: string) {
  const anon = `deleted_${userId.slice(0, 8)}_${Date.now()}`;
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        email: anon,
        passwordHash: "",
      },
    }),
    prisma.workerProfile.updateMany({
      where: { userId },
      data: {
        displayName: "Gelöscht",
        bio: null,
        socialLinkedin: null,
        socialXing: null,
        socialWebsite: null,
        cvPdfFilename: null,
        cvDraftJson: null,
        videoIntroUrl: null,
        profileVisible: false,
      },
    }),
    prisma.employerProfile.updateMany({
      where: { userId },
      data: {
        companyName: "Gelöscht",
        contactName: "—",
        contactPhone: null,
        website: null,
        openPositionsNote: null,
      },
    }),
  ]);
}
