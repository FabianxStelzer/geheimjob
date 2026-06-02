"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseCvDraft, serializeCvDraft, type CvDraft } from "@/lib/cv-draft";
import { generateCvPdfBuffer } from "@/lib/cv-pdf";

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

  try {
    const pdf = await generateCvPdfBuffer(draft, {
      displayName: profile.displayName,
      professionField: profile.professionField,
      region: profile.region,
      experienceYears: profile.experienceYears,
    });

    const dir = path.join(process.cwd(), "uploads", "cv");
    await mkdir(dir, { recursive: true });
    const filename = `${session.user.id}.pdf`;
    await writeFile(path.join(dir, filename), pdf);

    await prisma.workerProfile.update({
      where: { userId: session.user.id },
      data: {
        cvDraftJson: serializeCvDraft(draft),
        cvPdfFilename: filename,
      },
    });

    revalidatePath("/dashboard/worker/profil");
    return { ok: true };
  } catch {
    return { ok: false, error: "PDF konnte nicht erzeugt werden." };
  }
}
