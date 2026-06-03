"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  EMAIL_NOTIFICATION_LABELS,
  type EmailNotificationEvent,
} from "@/lib/email-notification-events";

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
