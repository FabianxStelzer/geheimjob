import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  employerLogoDiskPath,
  employerLogoField,
  employerLogoPublicUrl,
  type EmployerLogoVariant,
} from "@/lib/employer-logo-storage";

const MAX_BYTES: Record<EmployerLogoVariant, number> = {
  square: 2 * 1024 * 1024,
  banner: 3 * 1024 * 1024,
};

function isJpeg(buf: Buffer) {
  return buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
}

function isPng(buf: Buffer) {
  return (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  );
}

function isWebp(buf: Buffer) {
  return (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  );
}

function validateImageBuffer(buf: Buffer, mime: string, name: string) {
  if (isJpeg(buf) || mime === "image/jpeg") return "jpg";
  if (isPng(buf) || mime === "image/png") return "png";
  if (isWebp(buf) || mime === "image/webp") return "webp";
  if (/\.(jpe?g)$/i.test(name) && buf.length > 0) return "jpg";
  if (/\.png$/i.test(name) && buf.length > 0) return "png";
  if (/\.webp$/i.test(name) && buf.length > 0) return "webp";
  return null;
}

function parseVariant(raw: string | null): EmployerLogoVariant | null {
  if (raw === "banner" || raw === "square") return raw;
  return null;
}

async function removeLogoFile(url: string | null | undefined) {
  if (!url?.startsWith("/api/media/employer/")) return;
  const parts = url.split("/").filter(Boolean);
  const userId = parts[3];
  const filename = parts[4];
  if (!userId || !filename) return;
  try {
    await unlink(employerLogoDiskPath(userId, filename));
  } catch {
    /* ok */
  }
}

function revalidateEmployerLogoPaths() {
  revalidatePath("/dashboard/employer/profil");
  revalidatePath("/dashboard/employer");
  revalidatePath("/dashboard/employer/stellen");
  revalidatePath("/dashboard/worker");
  revalidatePath("/dashboard/worker/unternehmen");
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return Response.json({ error: "Nicht berechtigt." }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const variant = parseVariant(String(formData.get("variant") || ""));
  if (!(file instanceof File) || !variant) {
    return Response.json({ error: "Datei oder Variante fehlt." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length === 0) {
    return Response.json({ error: "Leere Datei." }, { status: 400 });
  }
  if (buf.length > MAX_BYTES[variant]) {
    return Response.json({ error: "Datei zu groß." }, { status: 413 });
  }

  const ext = validateImageBuffer(buf, file.type, file.name);
  if (!ext) {
    return Response.json(
      { error: "Ungültiges Bildformat. Bitte JPEG, PNG oder WebP verwenden." },
      { status: 400 },
    );
  }

  const profile = await prisma.employerProfile.findUnique({
    where: { userId: session.user.id },
    select: { logoUrl: true, logoSquareUrl: true },
  });
  if (!profile) {
    return Response.json({ error: "Kein Profil." }, { status: 400 });
  }

  const field = employerLogoField(variant);
  const oldUrl = profile[field];

  const filename = `${variant}-${randomUUID()}.${ext === "jpg" ? "jpg" : ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "employer", session.user.id);
  await mkdir(dir, { recursive: true });
  await writeFile(employerLogoDiskPath(session.user.id, filename), buf);

  const url = employerLogoPublicUrl(session.user.id, filename);
  await prisma.employerProfile.update({
    where: { userId: session.user.id },
    data: { [field]: url },
  });

  await removeLogoFile(oldUrl);
  revalidateEmployerLogoPaths();

  return Response.json({ ok: true, variant, url });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return Response.json({ error: "Nicht berechtigt." }, { status: 401 });
  }

  const variant = parseVariant(new URL(req.url).searchParams.get("variant"));
  if (!variant) {
    return Response.json({ error: "Variante fehlt." }, { status: 400 });
  }

  const profile = await prisma.employerProfile.findUnique({
    where: { userId: session.user.id },
    select: { logoUrl: true, logoSquareUrl: true },
  });
  if (!profile) {
    return Response.json({ error: "Kein Profil." }, { status: 400 });
  }

  const field = employerLogoField(variant);
  const oldUrl = profile[field];
  await removeLogoFile(oldUrl);

  await prisma.employerProfile.update({
    where: { userId: session.user.id },
    data: { [field]: null },
  });

  revalidateEmployerLogoPaths();
  return Response.json({ ok: true, variant });
}

export const runtime = "nodejs";
