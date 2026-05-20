import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/platform";
import { NotificationKind } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, props: Params) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { id } = await props.params;
  const body = (await req.json()) as { decision?: "accept" | "reject" };
  if (body.decision !== "accept" && body.decision !== "reject") {
    return Response.json({ error: "Ungültige Entscheidung." }, { status: 400 });
  }

  const match = await prisma.matchRequest.findUnique({
    where: { id },
    include: {
      workerProfile: true,
      employerProfile: true,
    },
  });

  if (!match || match.status !== "PENDING") {
    return Response.json({ error: "Anfrage nicht gefunden oder bereits entschieden." }, { status: 404 });
  }

  const workerUserId = match.workerProfile.userId;
  const employerUserId = match.employerProfile.userId;

  const recipientUserId =
    match.initiatorUserId === employerUserId ? workerUserId : employerUserId;

  if (session.user.id !== recipientUserId) {
    return Response.json({ error: "Nur die Gegenpartei kann antworten." }, { status: 403 });
  }

  const status = body.decision === "accept" ? "ACCEPTED" : "REJECTED";

  await prisma.matchRequest.update({
    where: { id },
    data:
      status === "ACCEPTED"
        ? { status, hiringStage: "BEWORBEN" }
        : { status },
  });

  const notifyTargetUserId =
    match.initiatorUserId === employerUserId ? employerUserId : workerUserId;

  if (status === "ACCEPTED") {
    await notifyUser(
      workerUserId,
      NotificationKind.MATCH_ACCEPTED,
      "Match bestätigt",
      "Der Kontakt wurde freigeschaltet — Sie können im Chat schreiben.",
      `/dashboard/worker/chat/${match.id}`,
    );
    await notifyUser(
      employerUserId,
      NotificationKind.MATCH_ACCEPTED,
      "Match bestätigt",
      "Der Kontakt wurde freigeschaltet — Sie können im Chat schreiben.",
      `/dashboard/employer/chat/${match.id}`,
    );

    await prisma.placementFee.upsert({
      where: { matchRequestId: match.id },
      create: { matchRequestId: match.id, amountCents: 0 },
      update: {},
    });
  } else {
    await notifyUser(
      match.initiatorUserId,
      NotificationKind.MATCH_REJECTED,
      "Anfrage abgelehnt",
      "Die andere Partei hat die Anfrage abgelehnt.",
      match.initiatorUserId === workerUserId
        ? `/dashboard/worker/anfragen`
        : `/dashboard/employer/anfragen`,
    );
  }

  return Response.json({ ok: true, status });
}
