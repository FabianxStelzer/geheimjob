import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NotificationKind } from "@prisma/client";

async function assertChatAccess(matchId: string, userId: string) {
  const match = await prisma.matchRequest.findUnique({
    where: { id: matchId },
    include: {
      workerProfile: true,
      employerProfile: true,
    },
  });
  if (!match || match.status !== "ACCEPTED") return null;
  const participant =
    match.workerProfile.userId === userId ||
    match.employerProfile.userId === userId;
  if (!participant) return null;
  return match;
}

type Params = { params: Promise<{ matchId: string }> };

export async function GET(_req: Request, props: Params) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { matchId } = await props.params;
  const match = await assertChatAccess(matchId, session.user.id);
  if (!match) {
    return Response.json({ error: "Kein Zugriff." }, { status: 403 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { matchRequestId: matchId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      body: true,
      senderUserId: true,
      createdAt: true,
    },
  });

  return Response.json({
    messages,
    me: session.user.id,
  });
}

export async function POST(req: Request, props: Params) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { matchId } = await props.params;
  const match = await assertChatAccess(matchId, session.user.id);
  if (!match) {
    return Response.json({ error: "Kein Zugriff." }, { status: 403 });
  }

  const body = (await req.json()) as { text?: string };
  const text = (body.text || "").trim().slice(0, 8000);
  if (!text) {
    return Response.json({ error: "Leere Nachricht." }, { status: 400 });
  }

  const msg = await prisma.chatMessage.create({
    data: {
      matchRequestId: matchId,
      senderUserId: session.user.id,
      body: text,
    },
  });

  const recipientId =
    session.user.id === match.workerProfile.userId
      ? match.employerProfile.userId
      : match.workerProfile.userId;

  const recipientIsWorker = recipientId === match.workerProfile.userId;
  const href = recipientIsWorker
    ? `/dashboard/worker/chat/${matchId}`
    : `/dashboard/employer/chat/${matchId}`;

  await prisma.notification.create({
    data: {
      userId: recipientId,
      kind: NotificationKind.NEW_MESSAGE,
      title: "Neue Chat-Nachricht",
      body: text.slice(0, 140),
      href,
    },
  });

  return Response.json({ id: msg.id });
}
