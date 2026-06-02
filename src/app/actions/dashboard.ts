"use server";

import { revalidatePath } from "next/cache";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const slugNano = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 12);

import { normalizeWebsiteDomain } from "@/lib/employer-block-match";

export async function addEmployerBlock(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") return;

  const company = String(formData.get("blockedCompanyName") || "").trim();
  const websiteDomain = normalizeWebsiteDomain(
    String(formData.get("blockedWebsiteDomain") || ""),
  );
  const managingDirector = String(formData.get("blockedManagingDirectorName") || "").trim();

  if (!company && !websiteDomain && !managingDirector) return;

  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return;

  await prisma.workerEmployerBlock.create({
    data: {
      workerProfileId: profile.id,
      blockedCompanyName: company || null,
      blockedWebsiteDomain: websiteDomain || null,
      blockedManagingDirectorName: managingDirector || null,
    },
  });

  revalidatePath("/dashboard/worker/ausschluesse");
}

export async function removeEmployerBlock(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") return;

  const blockId = String(formData.get("blockId") || "");
  if (!blockId) return;

  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return;

  await prisma.workerEmployerBlock.deleteMany({
    where: { id: blockId, workerProfileId: profile.id },
  });

  revalidatePath("/dashboard/worker/ausschluesse");
}

export async function updateWorkerProfile(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") return;

  const displayName = String(formData.get("displayName") || "").trim();
  const professionField = String(formData.get("professionField") || "").trim();
  const region = String(formData.get("region") || "").trim();
  const availability = String(formData.get("availability") || "").trim();
  const experienceYears = Number(formData.get("experienceYears") || 0);
  const salaryExpectation = formData.get("salaryExpectation")
    ? Number(formData.get("salaryExpectation"))
    : null;
  const salaryPublic = formData.get("salaryPublic") === "on";
  const salaryKindRaw = String(formData.get("salaryKind") || "BRUTTO").trim();
  const salaryKind = salaryKindRaw === "NETTO" ? "NETTO" : "BRUTTO";
  const bio = String(formData.get("bio") || "").trim() || null;
  const socialLinkedin =
    String(formData.get("socialLinkedin") || "").trim() || null;
  const socialXing = String(formData.get("socialXing") || "").trim() || null;
  const socialWebsite =
    String(formData.get("socialWebsite") || "").trim() || null;
  const profileVisible = formData.get("profileVisible") === "on";
  if (!displayName || !professionField || !region || !availability) return;

  await prisma.workerProfile.update({
    where: { userId: session.user.id },
    data: {
      displayName,
      professionField,
      region,
      availability,
      experienceYears: Number.isFinite(experienceYears) ? experienceYears : 0,
      salaryExpectation:
        salaryExpectation && Number.isFinite(salaryExpectation)
          ? salaryExpectation
          : null,
      salaryPublic,
      salaryKind,
      bio,
      socialLinkedin,
      socialXing,
      socialWebsite,
      profileVisible,
    },
  });

  revalidatePath("/dashboard/worker/profil");
  revalidatePath("/dashboard/worker/gehalt");
  revalidatePath("/dashboard/worker");
  revalidatePath("/dashboard/employer");
}

export async function updateWorkerNetCalcSettings(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") return;

  const taxClassRaw = formData.get("taxClass");
  const taxClass =
    taxClassRaw != null && String(taxClassRaw).trim() !== ""
      ? Number(taxClassRaw)
      : null;
  const churchTax = formData.get("churchTax") === "on";
  const federalState = String(formData.get("federalState") || "").trim() || null;

  if (taxClass == null || !Number.isFinite(taxClass) || taxClass < 1 || taxClass > 6) return;

  await prisma.workerProfile.update({
    where: { userId: session.user.id },
    data: {
      taxClass,
      churchTax,
      federalState,
    },
  });

  revalidatePath("/dashboard/worker/gehalt");
  revalidatePath("/dashboard/worker");
  revalidatePath("/dashboard/worker/anfragen");
}

export async function updateEmployerProfile(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") return;

  const companyName = String(formData.get("companyName") || "").trim();
  const industry = String(formData.get("industry") || "").trim();
  const region = String(formData.get("region") || "").trim();
  const contactName = String(formData.get("contactName") || "").trim();
  const managingDirectorName =
    String(formData.get("managingDirectorName") || "").trim() || null;
  const contactPhone = String(formData.get("contactPhone") || "").trim() || null;
  const website = String(formData.get("website") || "").trim() || null;
  const openPositionsNote =
    String(formData.get("openPositionsNote") || "").trim() || null;
  const logoUrl = String(formData.get("logoUrl") || "").trim() || null;

  if (!companyName || !industry || !region || !contactName) return;

  await prisma.employerProfile.update({
    where: { userId: session.user.id },
    data: {
      companyName,
      industry,
      region,
      contactName,
      managingDirectorName,
      contactPhone,
      website,
      openPositionsNote,
      logoUrl,
    },
  });

  revalidatePath("/dashboard/employer/profil");
  revalidatePath("/dashboard/employer/stellen");
  revalidatePath("/dashboard/worker");
}

export async function regenerateAnonymousSlug(): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") return;

  await prisma.workerProfile.update({
    where: { userId: session.user.id },
    data: { anonymousSlug: slugNano() },
  });

  revalidatePath("/dashboard/worker/profil");
}

export async function markNotificationRead(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.notification.updateMany({
    where: { id, userId: session.user.id },
    data: { read: true },
  });
  revalidatePath("/dashboard/benachrichtigungen");
}

export async function markAllNotificationsRead(_formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });
  revalidatePath("/dashboard/benachrichtigungen");
}
