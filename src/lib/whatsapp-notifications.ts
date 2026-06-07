import type { UserNotificationPrefs } from "@prisma/client";
import twilio from "twilio";
import { prisma } from "@/lib/prisma";
import {
  WHATSAPP_PREF_FIELD,
  type EmailNotificationEvent,
} from "@/lib/email-notification-events";
import { getOrCreateNotificationPrefs } from "@/lib/email-notifications";
import { normalizeWhatsAppPhone } from "@/lib/phone-utils";
import {
  getTwilioAccountSid,
  getTwilioAuthToken,
  getTwilioWhatsAppFrom,
} from "@/lib/platform-settings";

function appBaseUrl(): string {
  return (
    process.env.AUTH_URL?.replace(/\/$/, "") ||
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export async function twilioWhatsAppConfigured(): Promise<boolean> {
  const [sid, token, from] = await Promise.all([
    getTwilioAccountSid(),
    getTwilioAuthToken(),
    getTwilioWhatsAppFrom(),
  ]);
  return Boolean(sid && token && from);
}

function prefAllowsWhatsApp(
  prefs: UserNotificationPrefs,
  event: EmailNotificationEvent,
): boolean {
  if (!prefs.whatsappEnabled) return false;
  const field = WHATSAPP_PREF_FIELD[event];
  if (!field) return false;
  return Boolean(prefs[field as keyof UserNotificationPrefs]);
}

export async function sendNotificationWhatsApp(opts: {
  userId: string;
  event: EmailNotificationEvent;
  title: string;
  body: string;
  href?: string;
}): Promise<void> {
  const [accountSid, authToken, fromRaw] = await Promise.all([
    getTwilioAccountSid(),
    getTwilioAuthToken(),
    getTwilioWhatsAppFrom(),
  ]);
  if (!accountSid || !authToken || !fromRaw) return;

  const user = await prisma.user.findUnique({
    where: { id: opts.userId },
    select: {
      role: true,
      deletedAt: true,
      workerProfile: { select: { whatsappPhone: true, contactPhone: true } },
    },
  });

  if (!user || user.deletedAt || user.role !== "WORKER") return;

  const rawPhone = user.workerProfile?.whatsappPhone ?? user.workerProfile?.contactPhone;
  const phone = normalizeWhatsAppPhone(rawPhone);
  if (!phone) return;

  const prefs = await getOrCreateNotificationPrefs(opts.userId);
  if (!prefAllowsWhatsApp(prefs, opts.event)) return;

  const link = opts.href
    ? `${appBaseUrl()}${opts.href.startsWith("/") ? opts.href : `/${opts.href}`}`
    : `${appBaseUrl()}/dashboard/benachrichtigungen`;

  const text = `*Geheimjob*\n${opts.title}\n\n${opts.body}\n\nÖffnen: ${link}`;

  const from = fromRaw.startsWith("whatsapp:") ? fromRaw : `whatsapp:${fromRaw}`;
  const to = `whatsapp:${phone}`;

  const client = twilio(accountSid, authToken);
  await client.messages.create({ from, to, body: text });
}
