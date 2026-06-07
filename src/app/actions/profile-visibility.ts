"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  visibilityToDbFields,
  type SectionVisibility,
  type WorkerProfileVisibilitySettings,
} from "@/lib/worker-profile-visibility";
import type { CvShareMode } from "@prisma/client";

function sectionFromForm(formData: FormData, key: string): SectionVisibility {
  const v = String(formData.get(key) || "PUBLIC");
  if (v === "ON_REQUEST" || v === "HIDDEN") return v;
  return "PUBLIC";
}

export async function updateProfileVisibility(formData: FormData): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") return { ok: false };

  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return { ok: false };

  const cvRaw = String(formData.get("vis_cv") || "ON_REQUEST");
  const cv: CvShareMode = cvRaw === "IMMEDIATE" ? "IMMEDIATE" : "ON_REQUEST";

  const settings: WorkerProfileVisibilitySettings = {
    version: 1,
    talentSearch: formData.get("vis_talentSearch") === "on",
    salary: formData.get("vis_salary") === "HIDDEN" ? "HIDDEN" : "PUBLIC",
    photos: sectionFromForm(formData, "vis_photos"),
    contact: sectionFromForm(formData, "vis_contact"),
    application: sectionFromForm(formData, "vis_application"),
    bio: sectionFromForm(formData, "vis_bio"),
    video: sectionFromForm(formData, "vis_video"),
    cv,
  };

  await prisma.workerProfile.update({
    where: { userId: session.user.id },
    data: visibilityToDbFields(settings),
  });

  revalidatePath("/dashboard/worker/profil");
  revalidatePath("/dashboard/employer/suche");
  revalidatePath("/p/[slug]", "page");
  return { ok: true };
}
