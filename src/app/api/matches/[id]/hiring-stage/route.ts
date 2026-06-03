import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/platform";
import { NotificationKind, type HiringStage } from "@prisma/client";
import { HIRING_STAGE_SEQUENCE } from "@/lib/application-pipeline";

type Params = { params: Promise<{ id: string }> };

const LABELS: Record<HiringStage, string> = {
  NONE: "—",
  BEWORBEN: "Beworben",
  EINGELADEN: "Eingeladen",
  INTERVIEW: "Interview",
  ENTSCHEIDUNG: "Entscheidung",
  EINGESTELLT: "Eingestellt",
};

export async function PATCH(req: Request, props: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return Response.json({ error: "Nur Arbeitgeber." }, { status: 403 });
  }

  const { id } = await props.params;
  const body = (await req.json()) as { hiringStage?: HiringStage };
  const next = body.hiringStage;
  if (!next || !HIRING_STAGE_SEQUENCE.includes(next)) {
    return Response.json({ error: "Ungültige Stufe." }, { status: 400 });
  }

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!employer) return Response.json({ error: "Kein Arbeitgeber-Profil." }, { status: 404 });

  const match = await prisma.matchRequest.findFirst({
    where: { id, employerProfileId: employer.id },
    include: {
      workerProfile: { select: { userId: true, displayName: true } },
    },
  });

  if (!match || match.status !== "ACCEPTED") {
    return Response.json({ error: "Kein gültiges Match." }, { status: 404 });
  }

  await prisma.matchRequest.update({
    where: { id },
    data: { hiringStage: next },
  });

  await notifyUser(
    match.workerProfile.userId,
    NotificationKind.NEW_MESSAGE,
    "Stand Ihrer Bewerbung",
    `Neuer Status: ${LABELS[next]}`,
    `/dashboard/worker/anfragen`,
    "hiringStage",
  );

  return Response.json({ ok: true, hiringStage: next });
}
