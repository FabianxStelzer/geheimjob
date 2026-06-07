"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  EMAIL_NOTIFICATION_LABELS,
  WORKER_WHATSAPP_EVENTS,
  WHATSAPP_PREF_FIELD,
  type EmailNotificationEvent,
} from "@/lib/email-notification-events";
import { normalizeWhatsAppPhone } from "@/lib/phone-utils";

const EVENT_KEYS = Object.keys(EMAIL_NOTIFICATION_LABELS) as EmailNotificationEvent[];

const FORM_TO_DB: Record<EmailNotificationEvent, string> = {
  matchRequest: "emailMatchRequest",
  matchAccepted: "emailMatchAccepted",
  matchRejected: "emailMatchRejected",
  cvRequest: "emailCvRequest",
  cvGranted: "emailCvGranted",
  newMessage: "emailNewMessage",
  hiringStage: "emailHiringStage",
  newJobMatch: "emailNewJobMatch",
  newTalent: "emailNewTalent",
  billing: "emailBilling",
};

export async function updateNotificationEmailPrefs(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const data: Record<string, boolean> = {};
  for (const key of EVENT_KEYS) {
    data[FORM_TO_DB[key]] = formData.get(`pref_${key}`) === "on";
  }

  await prisma.userNotificationPrefs.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  });

  revalidatePath("/dashboard/einstellungen");
}

const WHATSAPP_FORM_TO_DB: Partial<Record<EmailNotificationEvent, string>> = {};
for (const key of WORKER_WHATSAPP_EVENTS) {
  const field = WHATSAPP_PREF_FIELD[key];
  if (field) WHATSAPP_FORM_TO_DB[key] = field;
}

export async function updateWhatsAppNotificationPrefs(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") return;

  const whatsappEnabled = formData.get("whatsappEnabled") === "on";
  const whatsappPhoneRaw = String(formData.get("whatsappPhone") || "").trim();
  const whatsappPhone = normalizeWhatsAppPhone(whatsappPhoneRaw) ?? (whatsappPhoneRaw || null);

  const data: Record<string, boolean> = { whatsappEnabled };
  for (const key of WORKER_WHATSAPP_EVENTS) {
    const dbField = WHATSAPP_FORM_TO_DB[key];
    if (dbField) data[dbField] = formData.get(`wa_pref_${key}`) === "on";
  }

  await prisma.$transaction([
    prisma.userNotificationPrefs.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, ...data },
      update: data,
    }),
    prisma.workerProfile.update({
      where: { userId: session.user.id },
      data: { whatsappPhone },
    }),
  ]);

  revalidatePath("/dashboard/einstellungen");
  revalidatePath("/dashboard/worker/profil");
}
