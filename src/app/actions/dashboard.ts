"use server";

import { revalidatePath } from "next/cache";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const slugNano = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 12);

export async function addEmployerBlock(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") return;

  const company = String(formData.get("blockedCompanyName") || "").trim();
  const employerUserIdRaw = String(formData.get("blockedEmployerUserId") || "").trim();
  const blockedEmployerUserId = employerUserIdRaw || null;

  if (!company && !blockedEmployerUserId) return;

  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return;

  await prisma.workerEmployerBlock.create({
    data: {
      workerProfileId: profile.id,
      blockedCompanyName: company || null,
      blockedEmployerUserId,
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
      bio,
      socialLinkedin,
      socialXing,
      socialWebsite,
      profileVisible,
    },
  });

  revalidatePath("/dashboard/worker/profil");
  revalidatePath("/dashboard/employer");
}

export async function updateEmployerProfile(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") return;

  const companyName = String(formData.get("companyName") || "").trim();
  const industry = String(formData.get("industry") || "").trim();
  const region = String(formData.get("region") || "").trim();
  const contactName = String(formData.get("contactName") || "").trim();
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
