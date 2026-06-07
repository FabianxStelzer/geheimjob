"use server";

import { revalidatePath } from "next/cache";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const slugNano = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 12);

import { normalizeWebsiteDomain } from "@/lib/employer-block-match";
import { isValidEmploymentKind } from "@/lib/employment-kinds";
import { isValidEmployeeCountRange } from "@/lib/employee-count-ranges";
import { normalizeWhatsAppPhone } from "@/lib/phone-utils";

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
  const employmentKindRaw = String(formData.get("employmentKind") || "").trim();
  const employmentKind = employmentKindRaw || null;
  const experienceYears = Number(formData.get("experienceYears") || 0);
  const salaryExpectation = formData.get("salaryExpectation")
    ? Number(formData.get("salaryExpectation"))
    : null;
  const salaryKindRaw = String(formData.get("salaryKind") || "BRUTTO").trim();
  const salaryKind = salaryKindRaw === "NETTO" ? "NETTO" : "BRUTTO";
  const bio = String(formData.get("bio") || "").trim() || null;
  const socialLinkedin =
    String(formData.get("socialLinkedin") || "").trim() || null;
  const socialXing = String(formData.get("socialXing") || "").trim() || null;
  const socialWebsite =
    String(formData.get("socialWebsite") || "").trim() || null;
  const contactPhone = String(formData.get("contactPhone") || "").trim() || null;
  const contactEmail = String(formData.get("contactEmail") || "").trim() || null;
  const whatsappPhoneRaw = String(formData.get("whatsappPhone") || "").trim();
  const whatsappPhone = normalizeWhatsAppPhone(whatsappPhoneRaw) ?? (whatsappPhoneRaw || null);
  if (!displayName || !professionField || !region || !availability) return;
  if (employmentKind && !isValidEmploymentKind(employmentKind)) return;

  await prisma.workerProfile.update({
    where: { userId: session.user.id },
    data: {
      displayName,
      professionField,
      region,
      availability,
      employmentKind,
      experienceYears: Number.isFinite(experienceYears) ? experienceYears : 0,
      salaryExpectation:
        salaryExpectation && Number.isFinite(salaryExpectation)
          ? salaryExpectation
          : null,
      salaryKind,
      bio,
      socialLinkedin,
      socialXing,
      socialWebsite,
      contactPhone,
      contactEmail,
      whatsappPhone,
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
  const companyDescription =
    String(formData.get("companyDescription") || "").trim() || null;
  const productsAndServices =
    String(formData.get("productsAndServices") || "").trim() || null;
  const companyBenefits = String(formData.get("companyBenefits") || "").trim() || null;
  const companyCulture = String(formData.get("companyCulture") || "").trim() || null;
  const employeeCountRangeRaw = String(formData.get("employeeCountRange") || "").trim();
  const employeeCountRange =
    employeeCountRangeRaw && isValidEmployeeCountRange(employeeCountRangeRaw)
      ? employeeCountRangeRaw
      : null;
  const foundedYearRaw = String(formData.get("foundedYear") || "").trim();
  const foundedYearNum = foundedYearRaw ? Number(foundedYearRaw) : null;
  const foundedYear =
    foundedYearNum && Number.isFinite(foundedYearNum) && foundedYearNum >= 1800
      ? Math.min(foundedYearNum, new Date().getFullYear())
      : null;

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
      companyDescription,
      productsAndServices,
      companyBenefits,
      companyCulture,
      employeeCountRange,
      foundedYear,
    },
  });

  revalidatePath("/dashboard/employer/profil");
  revalidatePath("/dashboard/employer/stellen");
  revalidatePath("/dashboard/worker");
  revalidatePath("/dashboard/worker/unternehmen");
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

export type AccountSettingsState = { error?: string; success?: string };

export async function updateAccountName(
  _prev: AccountSettingsState | undefined,
  formData: FormData,
): Promise<AccountSettingsState> {
  const session = await auth();
  if (!session?.user) return { error: "Nicht angemeldet." };

  const name = String(formData.get("name") || "").trim();
  if (!name || name.length < 2) {
    return { error: "Bitte einen gültigen Namen eingeben (min. 2 Zeichen)." };
  }

  if (session.user.role === "WORKER") {
    await prisma.workerProfile.update({
      where: { userId: session.user.id },
      data: { displayName: name },
    });
    revalidatePath("/dashboard/worker/profil");
    revalidatePath("/dashboard/worker/referral");
  } else if (session.user.role === "EMPLOYER") {
    await prisma.employerProfile.update({
      where: { userId: session.user.id },
      data: { contactName: name },
    });
    revalidatePath("/dashboard/employer/profil");
  } else {
    return { error: "Für diese Rolle ist keine Namensänderung hinterlegt." };
  }

  revalidatePath("/dashboard/einstellungen");
  return { success: "Name gespeichert." };
}

export type ContactFormState = { error?: string; success?: string };

export async function submitContactInquiry(
  _prev: ContactFormState | undefined,
  formData: FormData,
): Promise<ContactFormState> {
  const session = await auth();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const message = String(formData.get("message") || "").trim();

  if (!name || !email || message.length < 10) {
    return { error: "Bitte Name, E-Mail und eine Nachricht (min. 10 Zeichen) ausfüllen." };
  }

  await prisma.contactInquiry.create({
    data: {
      userId: session?.user?.id,
      name,
      email,
      message,
    },
  });

  return { success: "Vielen Dank — Ihre Nachricht wurde übermittelt. Wir melden uns bei Ihnen." };
}
