import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { BillingCatalogOverrides } from "@/lib/billing-catalog-types";

export type PlatformSettingsRecord = {
  stripeSecretKey: string | null;
  stripeWebhookSecret: string | null;
  stripePublishableKey: string | null;
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

export async function getAdminBootstrapEmail(): Promise<string | null> {
  const s = await getPlatformSettings();
  const fromDb = s.billingOverrides.adminBootstrapEmail?.toLowerCase().trim();
  if (fromDb) return fromDb;
  return process.env.ADMIN_BOOTSTRAP_EMAIL?.toLowerCase().trim() || null;
}
