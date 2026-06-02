import { readFile } from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { employerMayAccessCv } from "@/lib/cv-access";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ matchId: string }> };

export async function GET(_req: Request, props: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return Response.json({ error: "Nicht berechtigt." }, { status: 401 });
  }

  const { matchId } = await props.params;
  const match = await prisma.matchRequest.findUnique({
    where: { id: matchId },
    include: { workerProfile: true, employerProfile: true },
  });

  if (!match || match.status !== "ACCEPTED") {
    return Response.json({ error: "Kein Zugriff." }, { status: 403 });
  }
  if (match.employerProfile.userId !== session.user.id) {
    return Response.json({ error: "Kein Zugriff." }, { status: 403 });
  }

  if (!employerMayAccessCv(match, match.workerProfile)) {
    return Response.json(
      { error: "Lebenslauf noch nicht freigegeben oder nicht verfügbar." },
      { status: 403 },
    );
  }

  const fn = match.workerProfile.cvPdfFilename;
  if (!fn) {
    return Response.json({ error: "Kein PDF-Lebenslauf hinterlegt." }, { status: 404 });
  }

  const fp = path.join(process.cwd(), "uploads", "cv", fn);
  const file = await readFile(fp);
  return new Response(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="lebenslauf.pdf"',
    },
  });
}

export const runtime = "nodejs";
