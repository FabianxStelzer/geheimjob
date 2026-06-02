"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import type { AddonCode } from "@/lib/billing-plans";
import { PLAN_CATALOG_DEFAULT, ADDON_CATALOG_DEFAULT } from "@/lib/billing-plans";
import type { BillingCatalogOverrides } from "@/lib/billing-catalog-types";
import { prisma } from "@/lib/prisma";
import type { EmployerPlan } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) || "").trim();
}

export async function saveStripePlatformSettings(formData: FormData): Promise<void> {
  if (!(await requireAdmin())) return;

  const row = await prisma.platformSettings.upsert({
    where: { id: "default" },
    create: { id: "default", billingCatalogJson: "{}" },
    update: {},
  });

  const patch: {
    stripeSecretKey?: string | null;
    stripeWebhookSecret?: string | null;
    stripePublishableKey?: string | null;
  } = {};

  const secret = str(formData, "stripeSecretKey");
  const webhook = str(formData, "stripeWebhookSecret");
  const publishable = str(formData, "stripePublishableKey");

  if (formData.get("clearStripeSecret") === "on") patch.stripeSecretKey = null;
  else if (secret) patch.stripeSecretKey = secret;

  if (formData.get("clearStripeWebhook") === "on") patch.stripeWebhookSecret = null;
  else if (webhook) patch.stripeWebhookSecret = webhook;

  if (formData.get("clearStripePublishable") === "on") patch.stripePublishableKey = null;
  else if (publishable) patch.stripePublishableKey = publishable;

  await prisma.platformSettings.update({
    where: { id: row.id },
    data: patch,
  });

  revalidatePath("/dashboard/admin/einstellungen");
}

export async function saveBillingCatalogSettings(formData: FormData): Promise<void> {
  if (!(await requireAdmin())) return;

  const overrides: BillingCatalogOverrides = { plans: {}, addons: {} };

  for (const base of PLAN_CATALOG_DEFAULT) {
    const code = base.code;
    overrides.plans![code] = {
      name: str(formData, `plan_${code}_name`) || base.name,
      priceEur: Number(formData.get(`plan_${code}_priceEur`) || base.priceEur),
      stripePriceId: str(formData, `plan_${code}_stripePriceId`) || undefined,
      description: str(formData, `plan_${code}_description`) || base.description,
      jobSlots: Number(formData.get(`plan_${code}_jobSlots`) ?? base.jobSlots),
      active: formData.get(`plan_${code}_active`) === "on",
    };
  }

  for (const base of ADDON_CATALOG_DEFAULT) {
    const code = base.code;
    overrides.addons![code] = {
      name: str(formData, `addon_${code}_name`) || base.name,
      priceEur: Number(formData.get(`addon_${code}_priceEur`) || base.priceEur),
      stripePriceId: str(formData, `addon_${code}_stripePriceId`) || undefined,
      description: str(formData, `addon_${code}_description`) || base.description,
      active: formData.get(`addon_${code}_active`) === "on",
    };
  }

  await prisma.platformSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      billingCatalogJson: JSON.stringify(overrides),
    },
    update: {
      billingCatalogJson: JSON.stringify(overrides),
    },
  });

  revalidatePath("/dashboard/admin/einstellungen");
  revalidatePath("/dashboard/admin/pakete");
  revalidatePath("/dashboard/employer/abrechnung");
}

export async function adminResetUserPassword(formData: FormData): Promise<void> {
  if (!(await requireAdmin())) return;

  const email = str(formData, "resetEmail").toLowerCase();
  const newPassword = str(formData, "newPassword");

  if (!email || newPassword.length < 8) return;

  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  });
  if (!user) return;

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  revalidatePath("/dashboard/admin/einstellungen");
}

export async function saveAdminBootstrapEmail(formData: FormData): Promise<void> {
  if (!(await requireAdmin())) return;

  const email = str(formData, "adminBootstrapEmail").toLowerCase();
  const row = await prisma.platformSettings.findUnique({ where: { id: "default" } });
  let parsed: BillingCatalogOverrides = {};
  if (row?.billingCatalogJson) {
    try {
      parsed = JSON.parse(row.billingCatalogJson) as BillingCatalogOverrides;
    } catch {
      parsed = {};
    }
  }
  parsed.adminBootstrapEmail = email || undefined;

  await prisma.platformSettings.upsert({
    where: { id: "default" },
    create: { id: "default", billingCatalogJson: JSON.stringify(parsed) },
    update: { billingCatalogJson: JSON.stringify(parsed) },
  });

  revalidatePath("/dashboard/admin/einstellungen");
}

export async function saveSupportSettings(formData: FormData): Promise<void> {
  if (!(await requireAdmin())) return;

  await prisma.platformSettings.upsert({
    where: { id: "default" },
    create: { id: "default", billingCatalogJson: "{}" },
    update: {
      supportEmail: str(formData, "supportEmail") || null,
      supportPhone: str(formData, "supportPhone") || null,
      supportIntro: str(formData, "supportIntro") || null,
    },
  });

  revalidatePath("/dashboard/admin/einstellungen");
  revalidatePath("/dashboard/support");
}

export async function saveLegalContent(formData: FormData): Promise<void> {
  if (!(await requireAdmin())) return;

  await prisma.platformSettings.upsert({
    where: { id: "default" },
    create: { id: "default", billingCatalogJson: "{}" },
    update: {
      privacyContent: str(formData, "privacyContent") || null,
      termsContent: str(formData, "termsContent") || null,
    },
  });

  revalidatePath("/dashboard/admin/einstellungen");
  revalidatePath("/datenschutz");
  revalidatePath("/agb");
}
