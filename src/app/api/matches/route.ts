import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  employerIsBlockedFromWorker,
  notifyUser,
} from "@/lib/platform";
import { NotificationKind } from "@prisma/client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const body = (await req.json()) as {
    workerProfileId?: string;
    employerProfileId?: string;
    introMessage?: string;
  };

  const introMessage = (body.introMessage || "").slice(0, 2000);

  if (session.user.role === "EMPLOYER") {
    const employer = await prisma.employerProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!employer || !body.workerProfileId) {
      return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }

    const blocked = await employerIsBlockedFromWorker({
      workerProfileId: body.workerProfileId,
      employerUserId: session.user.id,
      companyName: employer.companyName,
    });
    if (blocked) {
      return Response.json(
        { error: "Kandidat ist für Ihr Unternehmen nicht sichtbar." },
        { status: 403 },
      );
    }

    const worker = await prisma.workerProfile.findUnique({
      where: { id: body.workerProfileId },
      include: { user: true },
    });
    if (!worker || worker.user.deletedAt) {
      return Response.json({ error: "Profil nicht gefunden." }, { status: 404 });
    }

    const dup = await prisma.matchRequest.findFirst({
      where: {
        workerProfileId: body.workerProfileId,
        employerProfileId: employer.id,
        status: "PENDING",
      },
    });
    if (dup) {
      return Response.json({ error: "Offene Anfrage existiert bereits." }, { status: 409 });
    }

    const match = await prisma.matchRequest.create({
      data: {
        workerProfileId: body.workerProfileId,
        employerProfileId: employer.id,
        initiatorUserId: session.user.id,
        introMessage,
      },
    });

    await notifyUser(
      worker.userId,
      NotificationKind.MATCH_REQUEST,
      "Neues Interesse eines Unternehmens",
      `${employer.companyName} möchte Kontakt aufnehmen.`,
      "/dashboard/worker/anfragen",
    );

    return Response.json({ matchId: match.id });
  }

  if (session.user.role === "WORKER") {
    const worker = await prisma.workerProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!worker || !body.employerProfileId) {
      return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }

    const employer = await prisma.employerProfile.findUnique({
      where: { id: body.employerProfileId },
      include: { user: true },
    });
    if (!employer || employer.user.deletedAt) {
      return Response.json({ error: "Unternehmen nicht gefunden." }, { status: 404 });
    }

    const blocked = await employerIsBlockedFromWorker({
      workerProfileId: worker.id,
      employerUserId: employer.userId,
      companyName: employer.companyName,
    });
    if (blocked) {
      return Response.json(
        { error: "Sie haben dieses Unternehmen ausgeschlossen." },
        { status: 403 },
      );
    }

    const dup = await prisma.matchRequest.findFirst({
      where: {
        workerProfileId: worker.id,
        employerProfileId: employer.id,
        status: "PENDING",
      },
    });
    if (dup) {
      return Response.json({ error: "Offene Anfrage existiert bereits." }, { status: 409 });
    }

    const match = await prisma.matchRequest.create({
      data: {
        workerProfileId: worker.id,
        employerProfileId: employer.id,
        initiatorUserId: session.user.id,
        introMessage,
      },
    });

    await notifyUser(
      employer.userId,
      NotificationKind.MATCH_REQUEST,
      "Neue Kandidaten-Anfrage",
      "Ein Kandidat möchte mit Ihnen in Kontakt treten.",
      "/dashboard/employer/anfragen",
    );

    return Response.json({ matchId: match.id });
  }

  return Response.json({ error: "Rolle nicht unterstützt." }, { status: 403 });
}
