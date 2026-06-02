import type { AddonCode } from "@/lib/billing-plans";
import { addonByCode, getAddonCatalog, getPlanCatalog, planByCode } from "@/lib/billing-catalog";
import { prisma } from "@/lib/prisma";
import type { BillingStatus, EmployerPlan, Subscription } from "@prisma/client";

export type EmployerEntitlements = {
  isActive: boolean;
  plan: EmployerPlan;
  planName: string;
  paymentMethod: string | null;
  billingStatus: BillingStatus;
  currentPeriodEnd: Date | null;
  talentPool: boolean;
  maxPublishedJobs: number;
  canPublishJobs: boolean;
  canHighlightJobs: boolean;
  contactAll: boolean;
  notifyTalentsOnNewJob: boolean;
  notifyOnNewTalentSignup: boolean;
  publishedJobsCount: number;
  remainingJobSlots: number;
};

export async function ensureEmployerSubscription(userId: string): Promise<Subscription> {
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.subscription.create({
    data: { userId, plan: "NONE", billingStatus: "INACTIVE", status: "inactive" },
  });
}

export function subscriptionIsActive(sub: Pick<Subscription, "billingStatus" | "currentPeriodEnd">): boolean {
  if (sub.billingStatus !== "ACTIVE") return false;
  if (sub.currentPeriodEnd && sub.currentPeriodEnd < new Date()) return false;
  return true;
}

export async function getEmployerEntitlements(userId: string): Promise<EmployerEntitlements> {
  const sub = await ensureEmployerSubscription(userId);
  const employer = await prisma.employerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  const publishedJobsCount = employer
    ? await prisma.jobPosting.count({
        where: { employerProfileId: employer.id, published: true },
      })
    : 0;

  const active = subscriptionIsActive(sub);
  const def = await planByCode(sub.plan);
  const baseSlots = active && def ? def.jobSlots : 0;
  const maxPublishedJobs = baseSlots + (active ? sub.extraJobSlots : 0);

  const canHighlightJobs =
    active &&
    ((def?.includesHighlight ?? false) || sub.addonHighlight);

  return {
    isActive: active && sub.plan !== "NONE",
    plan: sub.plan,
    planName: def?.name ?? "Kein Paket",
    paymentMethod: sub.paymentMethod,
    billingStatus: sub.billingStatus,
    currentPeriodEnd: sub.currentPeriodEnd,
    talentPool: active && (def?.talentPool ?? false),
    maxPublishedJobs,
    canPublishJobs: active && (def?.canPublishJobs ?? false),
    canHighlightJobs,
    contactAll: active && sub.addonContactAll,
    notifyTalentsOnNewJob: active && (def?.notifyTalentsOnNewJob ?? false),
    notifyOnNewTalentSignup: active && (def?.notifyOnNewTalentSignup ?? false),
    publishedJobsCount,
    remainingJobSlots: Math.max(0, maxPublishedJobs - publishedJobsCount),
  };
}

export async function requireActiveEmployerBilling(userId: string): Promise<EmployerEntitlements | null> {
  const ent = await getEmployerEntitlements(userId);
  if (!ent.isActive) return null;
  return ent;
}

export async function canPublishAnotherJob(userId: string): Promise<{ ok: boolean; reason?: string }> {
  const ent = await getEmployerEntitlements(userId);
  if (!ent.isActive) {
    return { ok: false, reason: "Bitte buchen Sie zuerst ein Paket unter Pakete." };
  }
  if (!ent.canPublishJobs) {
    return { ok: false, reason: "Ihr Paket (Starter) enthält keine Stellenanzeigen. Upgrade auf Plus oder Premium." };
  }
  if (ent.remainingJobSlots <= 0) {
    return {
      ok: false,
      reason: `Stellenlimit erreicht (${ent.publishedJobsCount}/${ent.maxPublishedJobs}). Zusatzstelle buchen oder Paket upgraden.`,
    };
  }
  return { ok: true };
}

export async function parseCheckoutSelection(body: {
  plan?: string;
  addons?: string[];
}): Promise<{ plan: EmployerPlan; addons: AddonCode[] } | null> {
  const plan = body.plan as EmployerPlan;
  const plans = await getPlanCatalog();
  if (!plans.some((p) => p.code === plan)) return null;
  const addonList = await getAddonCatalog();
  const addons = (body.addons || []).filter((a): a is AddonCode =>
    addonList.some((x) => x.code === a),
  );
  return { plan, addons };
}
