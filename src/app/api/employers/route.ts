import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return Response.json({ error: "Nicht berechtigt." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const industry = searchParams.get("industry") || undefined;
  const region = searchParams.get("region") || undefined;

  const employers = await prisma.employerProfile.findMany({
    where: {
      user: { deletedAt: null },
      ...(industry ? { industry: { contains: industry } } : {}),
      ...(region ? { region: { contains: region } } : {}),
    },
    take: 80,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      companyName: true,
      industry: true,
      region: true,
      openPositionsNote: true,
    },
  });

  return Response.json({ employers });
}
