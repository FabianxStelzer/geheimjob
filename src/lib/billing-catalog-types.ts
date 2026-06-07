import type { AddonCode } from "@/lib/billing-plans";
import type { EmployerPlan } from "@prisma/client";

export type PlanOverride = {
  name?: string;
  priceEur?: number;
  stripePriceId?: string;
  description?: string;
  jobSlots?: number;
  active?: boolean;
};

export type AddonOverride = {
  name?: string;
  priceEur?: number;
  stripePriceId?: string;
  description?: string;
  active?: boolean;
};

export type BillingCatalogOverrides = {
  adminBootstrapEmail?: string;
  /** Webhook-URL für n8n, Zapier, Make o. Ä. bei Paketbuchungen */
  billingAutomationWebhookUrl?: string;
  plans?: Partial<Record<EmployerPlan, PlanOverride>>;
  addons?: Partial<Record<AddonCode, AddonOverride>>;
};
