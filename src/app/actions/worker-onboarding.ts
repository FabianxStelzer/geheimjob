"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isValidEmploymentKind } from "@/lib/employment-kinds";
import { WORKER_AVAILABILITY_OPTIONS } from "@/lib/worker-availability";
import { normalizeWhatsAppPhone } from "@/lib/phone-utils";
import {
  parseApplicationProfile,
  serializeApplicationProfile,
} from "@/lib/application-profile";
import { splitLinesInput } from "@/lib/cv-draft";
import { newExperience } from "@/lib/cv-draft";

const availabilitySet = new Set<string>(WORKER_AVAILABILITY_OPTIONS);

function revalidateWorkerPaths() {
  revalidatePath("/dashboard/worker/einrichtung");
  revalidatePath("/dashboard/worker/profil");
  revalidatePath("/dashboard/worker");
  revalidatePath("/dashboard/worker/gehalt");
  revalidatePath("/dashboard/employer/suche");
}

export async function saveOnboardingCareer(formData: FormData): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") return { ok: false };

  const availability = String(formData.get("availability") || "").trim();
  const employmentKindRaw = String(formData.get("employmentKind") || "").trim();
  const employmentKind = employmentKindRaw || null;
  const bio = String(formData.get("bio") || "").trim() || null;

  if (!availability || !availabilitySet.has(availability)) return { ok: false };
  if (employmentKind && !isValidEmploymentKind(employmentKind)) return { ok: false };

  await prisma.workerProfile.update({
    where: { userId: session.user.id },
    data: { availability, employmentKind, bio },
  });

  revalidateWorkerPaths();
  return { ok: true };
}

export async function saveOnboardingSalary(formData: FormData): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") return { ok: false };

  const salaryRaw = String(formData.get("salaryExpectation") || "").trim();
  const salaryExpectation = salaryRaw ? Number(salaryRaw) : null;
  const salaryKindRaw = String(formData.get("salaryKind") || "BRUTTO").trim();
  const salaryKind = salaryKindRaw === "NETTO" ? "NETTO" : "BRUTTO";
  const salaryPublic = formData.get("salaryPublic") === "on";

  if (salaryExpectation != null && (!Number.isFinite(salaryExpectation) || salaryExpectation < 0)) {
    return { ok: false };
  }

  await prisma.workerProfile.update({
    where: { userId: session.user.id },
    data: {
      salaryExpectation:
        salaryExpectation != null && Number.isFinite(salaryExpectation)
          ? salaryExpectation
          : null,
      salaryKind,
      salaryPublic,
    },
  });

  revalidateWorkerPaths();
  return { ok: true };
}

export async function saveOnboardingContact(formData: FormData): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") return { ok: false };

  const contactPhone = String(formData.get("contactPhone") || "").trim() || null;
  const contactEmail = String(formData.get("contactEmail") || "").trim() || null;
  const whatsappPhoneRaw = String(formData.get("whatsappPhone") || "").trim();
  const whatsappPhone = normalizeWhatsAppPhone(whatsappPhoneRaw) ?? (whatsappPhoneRaw || null);

  await prisma.workerProfile.update({
    where: { userId: session.user.id },
    data: { contactPhone, contactEmail, whatsappPhone },
  });

  revalidateWorkerPaths();
  return { ok: true };
}

export async function saveOnboardingApplication(formData: FormData): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") return { ok: false };

  const row = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!row) return { ok: false };

  const profile = parseApplicationProfile(row.applicationProfileJson);
  profile.headline = String(formData.get("headline") || "").trim();
  profile.skills = splitLinesInput(String(formData.get("skills") || ""));

  const expCompany = String(formData.get("expCompany") || "").trim();
  const expRole = String(formData.get("expRole") || "").trim();
  if (expCompany || expRole) {
    const exp = profile.experiences[0] ?? newExperience();
    exp.company = expCompany;
    exp.role = expRole;
    exp.from = String(formData.get("expFrom") || "").trim();
    exp.to = String(formData.get("expTo") || "").trim();
    exp.description = String(formData.get("expDescription") || "").trim();
    profile.experiences = [exp, ...profile.experiences.filter((e) => e.id !== exp.id)];
  }

  await prisma.workerProfile.update({
    where: { userId: session.user.id },
    data: { applicationProfileJson: serializeApplicationProfile(profile) },
  });

  revalidateWorkerPaths();
  return { ok: true };
}
