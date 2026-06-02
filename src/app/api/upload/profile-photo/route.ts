import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  profilePhotoDiskPath,
  profilePhotoPublicUrl,
} from "@/lib/profile-photo-storage";
import {
  MAX_PHOTOS,
  parseWorkerProfilePhotos,
  workerPhotosToDb,
  type WorkerProfilePhoto,
} from "@/lib/worker-profile-photos";

const MAX_BYTES = 2 * 1024 * 1024;

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

async function loadPhotos(userId: string) {
  const wp = await prisma.workerProfile.findUnique({
    where: { userId },
    select: { profilePhotosJson: true, photoUrl: true },
  });
  if (!wp) return null;
  return parseWorkerProfilePhotos(wp.profilePhotosJson, wp.photoUrl);
}

async function savePhotos(userId: string, photos: WorkerProfilePhoto[]) {
  const data = workerPhotosToDb(photos);
  await prisma.workerProfile.update({
    where: { userId },
    data,
  });
  revalidatePath("/dashboard/worker/profil");
  return data.photoUrl;
}

async function removePhotoFile(userId: string, photoUrl: string) {
  if (photoUrl.startsWith("/api/media/profile/")) {
    const parts = photoUrl.split("/").filter(Boolean);
    const filename = parts[parts.length - 1];
    if (filename) {
      try {
        await unlink(profilePhotoDiskPath(userId, filename));
      } catch {
        /* ok */
      }
    }
    return;
  }
  const rel = photoUrl.replace(/^\//, "");
  const diskPath = path.join(process.cwd(), "public", rel);
  try {
    await unlink(diskPath);
  } catch {
    /* ok */
  }
}

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

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length === 0) {
    return Response.json({ error: "Leere Datei." }, { status: 400 });
  }
  if (buf.length > MAX_BYTES) {
    return Response.json({ error: "Maximal 2 MB nach Zuschnitt." }, { status: 413 });
  }

  const ext = validateImageBuffer(buf, file.type, file.name);
  if (!ext) {
    return Response.json(
      { error: "Ungültiges Bildformat. Bitte JPEG, PNG oder WebP verwenden." },
      { status: 400 },
    );
  }

  const photos = await loadPhotos(session.user.id);
  if (!photos) {
    return Response.json({ error: "Kein Profil." }, { status: 400 });
  }
  if (photos.length >= MAX_PHOTOS) {
    return Response.json({ error: `Maximal ${MAX_PHOTOS} Fotos.` }, { status: 400 });
  }

  const id = randomUUID();
  const filename = `${id}.${ext === "jpg" ? "jpg" : ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "profile", session.user.id);
  await mkdir(dir, { recursive: true });

  await writeFile(profilePhotoDiskPath(session.user.id, filename), buf);

  const url = profilePhotoPublicUrl(session.user.id, filename);
  const next = [...photos, { id, url }];
  const primary = await savePhotos(session.user.id, next);

  return Response.json({ ok: true, photos: next, primaryPhotoUrl: primary });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return Response.json({ error: "Nicht berechtigt." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const photoId = searchParams.get("id");
  if (!photoId) {
    return Response.json({ error: "Foto-ID fehlt." }, { status: 400 });
  }

  const photos = await loadPhotos(session.user.id);
  if (!photos) {
    return Response.json({ error: "Kein Profil." }, { status: 400 });
  }

  const target = photos.find((p) => p.id === photoId);
  if (!target) {
    return Response.json({ error: "Foto nicht gefunden." }, { status: 404 });
  }

  await removePhotoFile(session.user.id, target.url);

  const next = photos.filter((p) => p.id !== photoId);
  const primary = await savePhotos(session.user.id, next);

  return Response.json({ ok: true, photos: next, primaryPhotoUrl: primary });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return Response.json({ error: "Nicht berechtigt." }, { status: 401 });
  }

  const body = (await req.json()) as { photoId?: string };
  const photoId = body.photoId?.trim();
  if (!photoId) {
    return Response.json({ error: "Foto-ID fehlt." }, { status: 400 });
  }

  const photos = await loadPhotos(session.user.id);
  if (!photos) {
    return Response.json({ error: "Kein Profil." }, { status: 400 });
  }

  const idx = photos.findIndex((p) => p.id === photoId);
  if (idx < 0) {
    return Response.json({ error: "Foto nicht gefunden." }, { status: 404 });
  }

  const next = [...photos];
  const [picked] = next.splice(idx, 1);
  next.unshift(picked);
  const primary = await savePhotos(session.user.id, next);

  return Response.json({ ok: true, photos: next, primaryPhotoUrl: primary });
}

export const runtime = "nodejs";
