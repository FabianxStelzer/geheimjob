import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return Response.json({ error: "Nur Arbeitgeber können bewerten." }, { status: 401 });
  }

  const body = (await req.json()) as { rating?: number; comment?: string };
  const rating = Number(body.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return Response.json({ error: "Bewertung 1–5 erforderlich." }, { status: 400 });
  }

  await prisma.platformReview.create({
    data: {
      employerUserId: session.user.id,
      rating: Math.round(rating),
      comment: String(body.comment || "").trim().slice(0, 2000) || null,
    },
  });

  return Response.json({ ok: true });
}
