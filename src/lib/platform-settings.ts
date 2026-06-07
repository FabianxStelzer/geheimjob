import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { BillingCatalogOverrides } from "@/lib/billing-catalog-types";

export type PlatformSettingsRecord = {
  stripeSecretKey: string | null;
  stripeWebhookSecret: string | null;
  stripePublishableKey: string | null;
  twilioAccountSid: string | null;
  twilioAuthToken: string | null;
  twilioWhatsAppFrom: string | null;
  smtpHost: string | null;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string | null;
  smtpPass: string | null;
  smtpFromEmail: string | null;
  billingOverrides: BillingCatalogOverrides;
  updatedAt: Date;
};

function parseOverrides(json: string): BillingCatalogOverrides {
  try {
    const parsed = JSON.parse(json) as BillingCatalogOverrides;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function loadSettings(): Promise<PlatformSettingsRecord> {
  let row = await prisma.platformSettings.findUnique({ where: { id: "default" } });
  if (!row) {
    row = await prisma.platformSettings.create({
      data: { id: "default", billingCatalogJson: "{}" },
    });
  }

  return {
    stripeSecretKey: row.stripeSecretKey,
    stripeWebhookSecret: row.stripeWebhookSecret,
    stripePublishableKey: row.stripePublishableKey,
    twilioAccountSid: row.twilioAccountSid,
    twilioAuthToken: row.twilioAuthToken,
    twilioWhatsAppFrom: row.twilioWhatsAppFrom,
    smtpHost: row.smtpHost,
    smtpPort: row.smtpPort ?? 587,
    smtpSecure: row.smtpSecure ?? false,
    smtpUser: row.smtpUser,
    smtpPass: row.smtpPass,
    smtpFromEmail: row.smtpFromEmail,
    billingOverrides: parseOverrides(row.billingCatalogJson),
    updatedAt: row.updatedAt,
  };
}

export const getPlatformSettings = cache(loadSettings);

export function maskSecret(value: string | null | undefined): string {
  if (!value || value.length < 8) return value ? "••••••••" : "";
  return `${value.slice(0, 7)}…${value.slice(-4)}`;
}

export async function getStripeSecretKey(): Promise<string | null> {
  const s = await getPlatformSettings();
  const fromDb = s.stripeSecretKey?.trim();
  if (fromDb) return fromDb;
  const fromEnv = process.env.STRIPE_SECRET_KEY?.trim();
  return fromEnv || null;
}

export async function getStripeWebhookSecret(): Promise<string | null> {
  const s = await getPlatformSettings();
  const fromDb = s.stripeWebhookSecret?.trim();
  if (fromDb) return fromDb;
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || null;
}

export async function getStripePublishableKey(): Promise<string | null> {
  const s = await getPlatformSettings();
  const fromDb = s.stripePublishableKey?.trim();
  if (fromDb) return fromDb;
  return process.env.STRIPE_PUBLISHABLE_KEY?.trim() || null;
}

export async function getTwilioAccountSid(): Promise<string | null> {
  const s = await getPlatformSettings();
  const fromDb = s.twilioAccountSid?.trim();
  if (fromDb) return fromDb;
  return process.env.TWILIO_ACCOUNT_SID?.trim() || null;
}

export async function getTwilioAuthToken(): Promise<string | null> {
  const s = await getPlatformSettings();
  const fromDb = s.twilioAuthToken?.trim();
  if (fromDb) return fromDb;
  return process.env.TWILIO_AUTH_TOKEN?.trim() || null;
}

export async function getTwilioWhatsAppFrom(): Promise<string | null> {
  const s = await getPlatformSettings();
  const fromDb = s.twilioWhatsAppFrom?.trim();
  if (fromDb) return fromDb;
  return process.env.TWILIO_WHATSAPP_FROM?.trim() || null;
}

export async function getAdminBootstrapEmail(): Promise<string | null> {
  const s = await getPlatformSettings();
  const fromDb = s.billingOverrides.adminBootstrapEmail?.toLowerCase().trim();
  if (fromDb) return fromDb;
  return process.env.ADMIN_BOOTSTRAP_EMAIL?.toLowerCase().trim() || null;
}

export async function getSmtpHost(): Promise<string | null> {
  const s = await getPlatformSettings();
  const fromDb = s.smtpHost?.trim();
  if (fromDb) return fromDb;
  return process.env.SMTP_HOST?.trim() || null;
}

export async function getSmtpPort(): Promise<number> {
  const s = await getPlatformSettings();
  if (s.smtpHost?.trim()) return s.smtpPort || 587;
  const envPort = Number(process.env.SMTP_PORT || 587);
  return Number.isFinite(envPort) ? envPort : 587;
}

export async function getSmtpSecure(): Promise<boolean> {
  const s = await getPlatformSettings();
  if (s.smtpHost?.trim()) return s.smtpSecure;
  return process.env.SMTP_SECURE === "true";
}

export async function getSmtpUser(): Promise<string | null> {
  const s = await getPlatformSettings();
  if (s.smtpHost?.trim()) return s.smtpUser?.trim() || null;
  return process.env.SMTP_USER?.trim() || null;
}

export async function getSmtpPass(): Promise<string | null> {
  const s = await getPlatformSettings();
  if (s.smtpHost?.trim()) return s.smtpPass?.trim() || null;
  return process.env.SMTP_PASS?.trim() || null;
}

export async function getSmtpFromEmail(): Promise<string | null> {
  const s = await getPlatformSettings();
  const fromDb = s.smtpFromEmail?.trim();
  if (fromDb) return fromDb;
  return process.env.SMTP_FROM?.trim() || null;
}

export type SmtpTransportConfig = {
  host: string;
  port: number;
  secure: boolean;
  from: string;
  auth?: { user: string; pass: string };
};

export async function getSmtpTransportConfig(): Promise<SmtpTransportConfig | null> {
  const host = await getSmtpHost();
  const from = await getSmtpFromEmail();
  if (!host || !from) return null;

  const port = await getSmtpPort();
  const secure = (await getSmtpSecure()) || port === 465;
  const user = await getSmtpUser();
  const pass = await getSmtpPass();

  return {
    host,
    port,
    secure,
    from,
    auth: user && pass ? { user, pass } : undefined,
  };
}

export async function isSmtpPlatformConfigured(): Promise<boolean> {
  const s = await getPlatformSettings();
  return Boolean(s.smtpHost?.trim() && s.smtpFromEmail?.trim());
}

export async function getBillingAutomationWebhookUrl(): Promise<string | null> {
  const s = await getPlatformSettings();
  const fromDb = s.billingOverrides.billingAutomationWebhookUrl?.trim();
  if (fromDb) return fromDb;
  return process.env.BILLING_AUTOMATION_WEBHOOK_URL?.trim() || null;
}
