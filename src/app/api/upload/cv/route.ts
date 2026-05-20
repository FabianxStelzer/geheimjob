import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return Response.json({ error: "Nicht berechtigt." }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Keine Datei." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return Response.json({ error: "Nur PDF erlaubt." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > 5 * 1024 * 1024) {
    return Response.json({ error: "Maximal 5 MB." }, { status: 413 });
  }

  const dir = path.join(process.cwd(), "uploads", "cv");
  await mkdir(dir, { recursive: true });
  const filename = `${session.user.id}.pdf`;
  await writeFile(path.join(dir, filename), buf);

  await prisma.workerProfile.update({
    where: { userId: session.user.id },
    data: { cvPdfFilename: filename },
  });

  return Response.json({ ok: true });
}

export const runtime = "nodejs";
