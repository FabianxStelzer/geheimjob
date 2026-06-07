import type { UserNotificationPrefs } from "@prisma/client";
import nodemailer from "nodemailer";
import { getAdminBootstrapEmail, getSmtpTransportConfig } from "@/lib/platform-settings";
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

export async function isSmtpConfigured(): Promise<boolean> {
  const cfg = await getSmtpTransportConfig();
  return cfg !== null;
}

async function getTransporter() {
  const cfg = await getSmtpTransportConfig();
  if (!cfg) throw new Error("SMTP nicht konfiguriert");
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.auth,
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
  if (!(await isSmtpConfigured())) return;

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

  const cfg = await getSmtpTransportConfig();
  if (!cfg) return;

  const transporter = await getTransporter();
  const text = `${opts.title}\n\n${opts.body}\n\nZur Plattform: ${link}\n\n— Geheimjob`;

  await transporter.sendMail({
    from: cfg.from,
    to: user.email,
    subject: `[Geheimjob] ${opts.title}`,
    text,
    html: `<p style="font-family:sans-serif;line-height:1.5"><strong>${escapeHtml(opts.title)}</strong></p><p style="font-family:sans-serif;line-height:1.5">${escapeHtml(opts.body)}</p><p style="font-family:sans-serif"><a href="${escapeHtml(link)}">In Geheimjob öffnen</a></p><p style="font-family:sans-serif;color:#666;font-size:12px">E-Mail-Einstellungen: ${escapeHtml(`${appBaseUrl()}/dashboard/einstellungen`)}</p>`,
  });
}

/** Direkt an Super-Admin(s) — unabhängig von Benachrichtigungs-Einstellungen. */
export async function sendAdminAlertEmail(opts: {
  subject: string;
  title: string;
  body: string;
  href?: string;
}): Promise<void> {
  if (!(await isSmtpConfigured())) return;

  const recipients = new Set<string>();
  const bootstrap = await getAdminBootstrapEmail();
  if (bootstrap) recipients.add(bootstrap);

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", deletedAt: null },
    select: { email: true },
  });
  for (const a of admins) {
    if (a.email && !a.email.startsWith("deleted_")) recipients.add(a.email.toLowerCase());
  }
  if (recipients.size === 0) return;

  const link = opts.href
    ? `${appBaseUrl()}${opts.href.startsWith("/") ? opts.href : `/${opts.href}`}`
    : `${appBaseUrl()}/dashboard/admin`;

  const cfg = await getSmtpTransportConfig();
  if (!cfg) return;

  const transporter = await getTransporter();
  const text = `${opts.title}\n\n${opts.body}\n\nZur Plattform: ${link}\n\n— Geheimjob`;

  await transporter.sendMail({
    from: cfg.from,
    to: [...recipients].join(", "),
    subject: `[Geheimjob Admin] ${opts.subject}`,
    text,
    html: `<p style="font-family:sans-serif;line-height:1.5"><strong>${escapeHtml(opts.title)}</strong></p><p style="font-family:sans-serif;line-height:1.5">${escapeHtml(opts.body)}</p><p style="font-family:sans-serif"><a href="${escapeHtml(link)}">In Geheimjob öffnen</a></p>`,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
