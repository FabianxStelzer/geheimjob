import { cache } from "react";
import {
  ADDON_CATALOG_DEFAULT,
  PLAN_CATALOG_DEFAULT,
  type AddonDefinition,
  type AddonCode,
  type PlanDefinition,
} from "@/lib/billing-plans";
import type { BillingCatalogOverrides, PlanOverride } from "@/lib/billing-catalog-types";
import { getPlatformSettings } from "@/lib/platform-settings";
import type { EmployerPlan } from "@prisma/client";

function mergePlan(base: PlanDefinition, o?: PlanOverride): PlanDefinition {
  if (!o) return base;
  if (o.active === false) return { ...base, priceEur: 0 };
  return {
    ...base,
    name: o.name ?? base.name,
    priceEur: o.priceEur ?? base.priceEur,
    description: o.description ?? base.description,
    jobSlots: o.jobSlots ?? base.jobSlots,
    stripePriceId: o.stripePriceId ?? base.stripePriceId,
  };
}

function mergeAddon(base: AddonDefinition, o?: { name?: string; priceEur?: number; stripePriceId?: string; description?: string; active?: boolean }): AddonDefinition {
  if (!o) return base;
  return {
    ...base,
    name: o.name ?? base.name,
    priceEur: o.priceEur ?? base.priceEur,
    description: o.description ?? base.description,
    stripePriceId: o.stripePriceId ?? base.stripePriceId,
  };
}

async function buildCatalog(overrides: BillingCatalogOverrides) {
  const plans = PLAN_CATALOG_DEFAULT.map((p) =>
    mergePlan(p, overrides.plans?.[p.code as EmployerPlan]),
  ).filter((p) => overrides.plans?.[p.code as EmployerPlan]?.active !== false);

  const addons = ADDON_CATALOG_DEFAULT.map((a) =>
    mergeAddon(a, overrides.addons?.[a.code]),
  ).filter((a) => overrides.addons?.[a.code]?.active !== false);

  return { plans, addons };
}

export const getBillingCatalog = cache(async () => {
  const settings = await getPlatformSettings();
  return buildCatalog(settings.billingOverrides);
});

export async function getPlanCatalog(): Promise<PlanDefinition[]> {
  const { plans } = await getBillingCatalog();
  return plans;
}

export async function getAddonCatalog(): Promise<AddonDefinition[]> {
  const { addons } = await getBillingCatalog();
  return addons;
}

export async function planByCode(code: EmployerPlan): Promise<PlanDefinition | undefined> {
  const plans = await getPlanCatalog();
  return plans.find((p) => p.code === code);
}

export async function addonByCode(code: AddonCode): Promise<AddonDefinition | undefined> {
  const addons = await getAddonCatalog();
  return addons.find((a) => a.code === code);
}

export function stripePriceIdFromPlan(plan: PlanDefinition): string | null {
  if (plan.stripePriceId?.trim()) return plan.stripePriceId.trim();
  const envKey = plan.stripePriceEnv;
  const v = process.env[envKey];
  return v?.trim() || null;
}

export function stripePriceIdFromAddon(addon: AddonDefinition): string | null {
  if (addon.stripePriceId?.trim()) return addon.stripePriceId.trim();
  const v = process.env[addon.stripePriceEnv];
  return v?.trim() || null;
}
