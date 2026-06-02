import { auth } from "@/auth";
import { cvAccessUiState } from "@/lib/cv-access";
import { notifyUser } from "@/lib/platform";
import { prisma } from "@/lib/prisma";
import { NotificationKind } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, props: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return Response.json({ error: "Nicht berechtigt." }, { status: 401 });
  }

  const { id } = await props.params;
  const match = await prisma.matchRequest.findUnique({
    where: { id },
    include: { workerProfile: true, employerProfile: true },
  });

  if (!match || match.status !== "ACCEPTED") {
    return Response.json({ error: "Kein aktiver Match." }, { status: 404 });
  }
  if (match.employerProfile.userId !== session.user.id) {
    return Response.json({ error: "Kein Zugriff." }, { status: 403 });
  }

  const state = cvAccessUiState(match, match.workerProfile);
  if (!state.hasCv) {
    return Response.json({ error: "Kandidat hat keinen Lebenslauf hinterlegt." }, { status: 400 });
  }
  if (state.shareMode !== "ON_REQUEST") {
    return Response.json({ error: "Lebenslauf ist ohne Anfrage verfügbar." }, { status: 400 });
  }
  if (state.canView) {
    return Response.json({ ok: true, alreadyGranted: true });
  }
  if (state.requested) {
    return Response.json({ ok: true, alreadyRequested: true });
  }

  await prisma.matchRequest.update({
    where: { id },
    data: { cvRequestedAt: new Date() },
  });

  await notifyUser(
    match.workerProfile.userId,
    NotificationKind.CV_REQUEST,
    "Lebenslauf-Anfrage",
    `${match.employerProfile.companyName} möchte Ihren Lebenslauf einsehen.`,
    "/dashboard/worker/anfragen",
  );

  return Response.json({ ok: true });
}
