"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseCvDraft, serializeCvDraft, type CvDraft } from "@/lib/cv-draft";
import type { CvShareMode } from "@prisma/client";

function draftHasContent(draft: CvDraft): boolean {
  if (draft.summary.trim() || draft.headline.trim()) return true;
  if (draft.skills.length || draft.languages.length || draft.certificates.length) return true;
  if (draft.experiences.some((e) => e.company.trim() || e.role.trim())) return true;
  if (draft.education.some((e) => e.institution.trim() || e.degree.trim())) return true;
  return false;
}

export async function saveWorkerCvDraft(json: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return { ok: false, error: "Nicht angemeldet." };
  }

  const draft = parseCvDraft(json);
  if (!draftHasContent(draft)) {
    return { ok: false, error: "Bitte mindestens einen Abschnitt ausfüllen." };
  }

  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) {
    return { ok: false, error: "Kein Profil gefunden." };
  }

  await prisma.workerProfile.update({
    where: { userId: session.user.id },
    data: { cvDraftJson: serializeCvDraft(draft) },
  });

  revalidatePath("/dashboard/worker/profil");
  return { ok: true };
}

export async function saveCvShareMode(mode: CvShareMode): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return { ok: false, error: "Nicht angemeldet." };
  }
  if (mode !== "IMMEDIATE" && mode !== "ON_REQUEST") {
    return { ok: false, error: "Ungültige Einstellung." };
  }

  await prisma.workerProfile.update({
    where: { userId: session.user.id },
    data: { cvShareMode: mode },
  });

  revalidatePath("/dashboard/worker/profil");
  revalidatePath("/dashboard/worker/anfragen");
  return { ok: true };
}
