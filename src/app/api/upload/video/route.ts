import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const allowed = new Set(["video/mp4", "video/webm", "video/quicktime"]);

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
  if (!allowed.has(file.type)) {
    return Response.json({ error: "Nur MP4/WebM erlaubt." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > 80 * 1024 * 1024) {
    return Response.json({ error: "Maximal 80 MB." }, { status: 413 });
  }

  const ext = file.type.includes("webm") ? "webm" : "mp4";
  const dir = path.join(process.cwd(), "public", "uploads", "video");
  await mkdir(dir, { recursive: true });
  const filename = `${session.user.id}.${ext}`;
  await writeFile(path.join(dir, filename), buf);

  const publicPath = `/uploads/video/${filename}`;
  await prisma.workerProfile.update({
    where: { userId: session.user.id },
    data: { videoIntroUrl: publicPath },
  });

  return Response.json({ ok: true, url: publicPath });
}

export const runtime = "nodejs";
