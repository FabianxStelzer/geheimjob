import { NotificationKind, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  blockMatchesEmployer,
  type EmployerBlockCheckInput,
} from "@/lib/employer-block-match";
import {
  emailEventForNotificationKind,
  type EmailNotificationEvent,
} from "@/lib/email-notification-events";
import { sendNotificationEmail } from "@/lib/email-notifications";
import { sendNotificationWhatsApp } from "@/lib/whatsapp-notifications";

export async function notifyUser(
  userId: string,
  kind: NotificationKind,
  title: string,
  body: string,
  href?: string,
  emailEvent?: EmailNotificationEvent,
) {
  await prisma.notification.create({
    data: { userId, kind, title, body, href },
  });

  const event = emailEvent ?? emailEventForNotificationKind(kind);
  if (event) {
    await sendNotificationEmail({ userId, event, title, body, href }).catch(() => {
      /* E-Mail optional; In-App-Benachrichtigung bleibt */
    });
    await sendNotificationWhatsApp({ userId, event, title, body, href }).catch(() => {
      /* WhatsApp optional; In-App-Benachrichtigung bleibt */
    });
  }
}

export async function employerIsBlockedFromWorker(opts: EmployerBlockCheckInput) {
  const blocks = await prisma.workerEmployerBlock.findMany({
    where: { workerProfileId: opts.workerProfileId },
  });
  return blocks.some((b) => blockMatchesEmployer(b, opts));
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
        contactPhone: null,
        contactEmail: null,
        whatsappPhone: null,
        applicationProfileJson: null,
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
        managingDirectorName: null,
        openPositionsNote: null,
        companyDescription: null,
        productsAndServices: null,
        companyBenefits: null,
        companyCulture: null,
        employeeCountRange: null,
        foundedYear: null,
      },
    }),
  ]);
}
