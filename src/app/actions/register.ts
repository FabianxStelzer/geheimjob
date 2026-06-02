"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { notifyPremiumEmployersOnNewTalent } from "@/lib/billing-notifications";
import { prisma } from "@/lib/prisma";
import { WORKER_AVAILABILITY_OPTIONS } from "@/lib/worker-availability";
import { isValidEmploymentKind } from "@/lib/employment-kinds";

function parseCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export type RegisterState = { error?: string };

async function registerWorkerCore(formData: FormData): Promise<RegisterState> {
  const email = String(formData.get("email") || "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") || "");
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
  const salaryPublic = parseCheckbox(formData, "salaryPublic");
  const bio = String(formData.get("bio") || "").trim() || null;
  const referralCode = String(formData.get("referralCode") || "").trim() || null;

  const availabilityOptions = new Set<string>(WORKER_AVAILABILITY_OPTIONS);

  if (!parseCheckbox(formData, "gdprConsent"))
    return { error: "Bitte Datenschutzerklärung und Einwilligung bestätigen." };
  if (!parseCheckbox(formData, "termsConsent"))
    return { error: "Bitte Nutzungsbedingungen akzeptieren." };
  if (!email || !password || password.length < 8)
    return { error: "Gültige E-Mail und Passwort (min. 8 Zeichen) erforderlich." };
  if (!displayName || !professionField || !region || !availability)
    return { error: "Bitte alle Pflichtfelder ausfüllen." };
  if (!availabilityOptions.has(availability))
    return { error: "Bitte eine gültige Verfügbarkeit wählen." };
  if (employmentKind && !isValidEmploymentKind(employmentKind))
    return { error: "Bitte eine gültige Beschäftigungsart wählen." };

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "Diese E-Mail ist bereits registriert." };

  let referredByUserId: string | undefined;
  if (referralCode) {
    const ref = await prisma.user.findFirst({
      where: { referralCode, deletedAt: null, role: "WORKER" },
    });
    if (ref) referredByUserId = ref.id;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "WORKER",
      gdprConsentAt: new Date(),
      termsAcceptedAt: new Date(),
      referredByUserId,
      workerProfile: {
        create: {
          displayName,
          professionField,
          experienceYears: Number.isFinite(experienceYears) ? experienceYears : 0,
          region,
          salaryExpectation:
            salaryExpectation && Number.isFinite(salaryExpectation)
              ? salaryExpectation
              : null,
          salaryPublic,
          availability,
          employmentKind,
          bio,
        },
      },
    },
  });

  if (referredByUserId) {
    await prisma.referralReward.create({
      data: {
        referrerUserId: referredByUserId,
        referredUserId: user.id,
        status: "REGISTERED",
        bonusCents: null,
      },
    });
  }

  await notifyPremiumEmployersOnNewTalent({
    professionField,
    region,
  });

  return {};
}

async function registerEmployerCore(formData: FormData): Promise<RegisterState> {
  const email = String(formData.get("email") || "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") || "");
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

  if (!parseCheckbox(formData, "gdprConsent"))
    return { error: "Bitte Datenschutzerklärung und Einwilligung bestätigen." };
  if (!parseCheckbox(formData, "termsConsent"))
    return { error: "Bitte Nutzungsbedingungen akzeptieren." };
  if (!email || !password || password.length < 8)
    return { error: "Gültige E-Mail und Passwort (min. 8 Zeichen) erforderlich." };
  if (!companyName || !industry || !region || !contactName)
    return { error: "Bitte alle Pflichtfelder ausfüllen." };

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "Diese E-Mail ist bereits registriert." };

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "EMPLOYER",
      gdprConsentAt: new Date(),
      termsAcceptedAt: new Date(),
      employerProfile: {
        create: {
          companyName,
          industry,
          region,
          contactName,
          managingDirectorName,
          contactPhone,
          website,
          openPositionsNote,
        },
      },
      subscription: {
        create: {
          plan: "NONE",
          billingStatus: "INACTIVE",
          status: "inactive",
        },
      },
    },
  });

  return {};
}

export async function registerWorkerAction(
  _prev: RegisterState | undefined,
  formData: FormData,
): Promise<RegisterState> {
  const email = String(formData.get("email") || "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") || "");

  const result = await registerWorkerCore(formData);
  if (result.error) return result;

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/dashboard/worker",
  });

  redirect("/dashboard/worker");
}

export async function registerEmployerAction(
  _prev: RegisterState | undefined,
  formData: FormData,
): Promise<RegisterState> {
  const result = await registerEmployerCore(formData);
  if (result.error) return result;
  redirect("/login?registered=1");
}
