import { readFile } from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return Response.json({ error: "Nicht berechtigt." }, { status: 401 });
  }

  const wp = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!wp?.cvPdfFilename) {
    return Response.json({ error: "Kein Lebenslauf." }, { status: 404 });
  }

  const fp = path.join(process.cwd(), "uploads", "cv", wp.cvPdfFilename);
  const file = await readFile(fp);
  return new Response(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="lebenslauf.pdf"',
    },
  });
}

export const runtime = "nodejs";
