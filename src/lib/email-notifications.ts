import type { UserNotificationPrefs } from "@prisma/client";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import {
  EMAIL_PREF_FIELD,
  type EmailNotificationEvent,
} from "@/lib/email-notification-events";

function appBaseUrl(): string {
  return (
    process.env.AUTH_URL?.replace(/\/$/, "") ||
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

async function getTransporter() {
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

export async function getOrCreateNotificationPrefs(
  userId: string,
): Promise<UserNotificationPrefs> {
  const existing = await prisma.userNotificationPrefs.findUnique({
    where: { userId },
  });
  if (existing) return existing;
  return prisma.userNotificationPrefs.create({ data: { userId } });
}

function prefAllowsEmail(
  prefs: UserNotificationPrefs,
  event: EmailNotificationEvent,
): boolean {
  const field = EMAIL_PREF_FIELD[event];
  return Boolean(prefs[field as keyof UserNotificationPrefs]);
}

export async function sendNotificationEmail(opts: {
  userId: string;
  event: EmailNotificationEvent;
  title: string;
  body: string;
  href?: string;
}): Promise<void> {
  if (!smtpConfigured()) return;

  const user = await prisma.user.findUnique({
    where: { id: opts.userId },
    select: { email: true, deletedAt: true },
  });
  if (!user?.email || user.deletedAt) return;
  if (user.email.startsWith("deleted_")) return;

  const prefs = await getOrCreateNotificationPrefs(opts.userId);
  if (!prefAllowsEmail(prefs, opts.event)) return;

  const link = opts.href
    ? `${appBaseUrl()}${opts.href.startsWith("/") ? opts.href : `/${opts.href}`}`
    : `${appBaseUrl()}/dashboard/benachrichtigungen`;

  const transporter = await getTransporter();
  const from = process.env.SMTP_FROM!;
  const text = `${opts.title}\n\n${opts.body}\n\nZur Plattform: ${link}\n\n— Geheimjob`;

  await transporter.sendMail({
    from,
    to: user.email,
    subject: `[Geheimjob] ${opts.title}`,
    text,
    html: `<p style="font-family:sans-serif;line-height:1.5"><strong>${escapeHtml(opts.title)}</strong></p><p style="font-family:sans-serif;line-height:1.5">${escapeHtml(opts.body)}</p><p style="font-family:sans-serif"><a href="${escapeHtml(link)}">In Geheimjob öffnen</a></p><p style="font-family:sans-serif;color:#666;font-size:12px">E-Mail-Einstellungen: ${escapeHtml(`${appBaseUrl()}/dashboard/einstellungen`)}</p>`,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
