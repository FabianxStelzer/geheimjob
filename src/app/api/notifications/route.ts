import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const items = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  return Response.json({ items });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const body = (await req.json()) as { markAllRead?: boolean; id?: string };
  if (body.markAllRead) {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    });
    return Response.json({ ok: true });
  }

  if (body.id) {
    await prisma.notification.updateMany({
      where: { id: body.id, userId: session.user.id },
      data: { read: true },
    });
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Ungültig." }, { status: 400 });
}
