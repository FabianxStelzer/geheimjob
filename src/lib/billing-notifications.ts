import { notifyUser } from "@/lib/platform";
import { NotificationKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Premium: passende Arbeitnehmer bei neuer Stelle benachrichtigen. */
export async function notifyWorkersOnNewJob(opts: {
  jobPostingId: string;
  employerProfileId: string;
  title: string;
  tags: string;
  region: string;
}) {
  const employer = await prisma.employerProfile.findUnique({
    where: { id: opts.employerProfileId },
    include: { user: { include: { subscription: true } } },
  });
  if (!employer?.user.subscription) return;
  const sub = employer.user.subscription;
  if (sub.billingStatus !== "ACTIVE" || sub.plan !== "PREMIUM") return;

  const tagParts = opts.tags
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const workers = await prisma.workerProfile.findMany({
    where: {
      profileVisible: true,
      user: { deletedAt: null },
      OR: [
        { region: { contains: opts.region.split(" ")[0] || opts.region } },
        ...(tagParts.length
          ? tagParts.map((t) => ({ professionField: { contains: t } }))
          : []),
      ],
    },
    include: { user: true },
    take: 50,
  });

  for (const w of workers) {
    await notifyUser(
      w.user.id,
      NotificationKind.NEW_JOB_MATCH,
      "Neue Stelle passt zu Ihrem Profil",
      `${employer.companyName}: ${opts.title}`,
      "/dashboard/worker",
    );
  }
}

/** Premium-Arbeitgeber: neues Talent im Pool. */
export async function notifyPremiumEmployersOnNewTalent(worker: {
  professionField: string;
  region: string;
}) {
  const premiumEmployers = await prisma.user.findMany({
    where: {
      deletedAt: null,
      role: "EMPLOYER",
      subscription: {
        billingStatus: "ACTIVE",
        plan: "PREMIUM",
      },
    },
    select: { id: true },
  });

  for (const u of premiumEmployers) {
    await notifyUser(
      u.id,
      NotificationKind.NEW_TALENT,
      "Neues Talent verfügbar",
      `${worker.professionField} · ${worker.region} — jetzt im Talentpool.`,
      "/dashboard/employer",
    );
  }
}
