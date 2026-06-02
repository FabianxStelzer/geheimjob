import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  MAX_PHOTOS,
  parseWorkerProfilePhotos,
  workerPhotosToDb,
  type WorkerProfilePhoto,
} from "@/lib/worker-profile-photos";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

function extForMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
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
  return data.photoUrl;
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
  if (!allowed.has(file.type)) {
    return Response.json({ error: "Nur JPEG, PNG oder WebP." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > 3 * 1024 * 1024) {
    return Response.json({ error: "Maximal 3 MB pro Bild." }, { status: 413 });
  }

  const photos = await loadPhotos(session.user.id);
  if (!photos) {
    return Response.json({ error: "Kein Profil." }, { status: 400 });
  }
  if (photos.length >= MAX_PHOTOS) {
    return Response.json({ error: `Maximal ${MAX_PHOTOS} Fotos.` }, { status: 400 });
  }

  const ext = extForMime(file.type);
  const id = randomUUID();
  const dir = path.join(process.cwd(), "public", "uploads", "profile", session.user.id);
  await mkdir(dir, { recursive: true });
  const filename = `${id}.${ext}`;
  await writeFile(path.join(dir, filename), buf);

  const url = `/uploads/profile/${session.user.id}/${filename}`;
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

  const rel = target.url.replace(/^\//, "");
  const diskPath = path.join(process.cwd(), "public", rel);
  try {
    await unlink(diskPath);
  } catch {
    /* Datei evtl. schon weg */
  }

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
