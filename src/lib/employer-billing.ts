import type { AddonCode } from "@/lib/billing-plans";
import { addonByCode, getAddonCatalog, getPlanCatalog, planByCode } from "@/lib/billing-catalog";
import { prisma } from "@/lib/prisma";
import type {
  BillingStatus,
  EmployerPlan,
  PaymentMethod,
  Subscription,
} from "@prisma/client";

export type AddonSelection = {
  extraJobCount: number;
  addonHighlight: boolean;
  addonContactAll: boolean;
};

export const MAX_EXTRA_JOB_SLOTS = 25;

export type EmployerEntitlements = {
  isActive: boolean;
  plan: EmployerPlan;
  planName: string;
  paymentMethod: PaymentMethod | null;
  billingStatus: BillingStatus;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  extraJobSlots: number;
  addonHighlight: boolean;
  addonContactAll: boolean;
  planIncludesHighlight: boolean;
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
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    extraJobSlots: active ? sub.extraJobSlots : 0,
    addonHighlight: active && sub.addonHighlight,
    addonContactAll: active && sub.addonContactAll,
    planIncludesHighlight: def?.includesHighlight ?? false,
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

export function buildAddonsFromSelection(sel: AddonSelection): AddonCode[] {
  const extra = Math.min(
    MAX_EXTRA_JOB_SLOTS,
    Math.max(0, Math.floor(sel.extraJobCount) || 0),
  );
  const addons: AddonCode[] = [];
  for (let i = 0; i < extra; i++) addons.push("EXTRA_JOB");
  if (sel.addonHighlight) addons.push("HIGHLIGHT");
  if (sel.addonContactAll) addons.push("CONTACT_ALL");
  return addons;
}

export function addonSelectionFromSubscription(
  sub: Pick<Subscription, "extraJobSlots" | "addonHighlight" | "addonContactAll">,
): AddonSelection {
  return {
    extraJobCount: sub.extraJobSlots,
    addonHighlight: sub.addonHighlight,
    addonContactAll: sub.addonContactAll,
  };
}

export async function parseCheckoutSelection(body: {
  plan?: string;
  addons?: string[];
  extraJobCount?: number;
  addonHighlight?: boolean;
  addonContactAll?: boolean;
}): Promise<{ plan: EmployerPlan; addons: AddonCode[]; selection: AddonSelection } | null> {
  const plan = body.plan as EmployerPlan;
  const plans = await getPlanCatalog();
  if (!plans.some((p) => p.code === plan)) return null;

  let selection: AddonSelection;
  if (
    body.extraJobCount !== undefined ||
    body.addonHighlight !== undefined ||
    body.addonContactAll !== undefined
  ) {
    selection = {
      extraJobCount: body.extraJobCount ?? 0,
      addonHighlight: Boolean(body.addonHighlight),
      addonContactAll: Boolean(body.addonContactAll),
    };
  } else {
    const addonList = await getAddonCatalog();
    const legacy = (body.addons || []).filter((a): a is AddonCode =>
      addonList.some((x) => x.code === a),
    );
    selection = {
      extraJobCount: legacy.filter((a) => a === "EXTRA_JOB").length,
      addonHighlight: legacy.includes("HIGHLIGHT"),
      addonContactAll: legacy.includes("CONTACT_ALL"),
    };
  }

  return { plan, addons: buildAddonsFromSelection(selection), selection };
}

export function subscriptionAddonFields(addons: AddonCode[]) {
  return {
    extraJobSlots: addons.filter((a) => a === "EXTRA_JOB").length,
    addonHighlight: addons.includes("HIGHLIGHT"),
    addonContactAll: addons.includes("CONTACT_ALL"),
  };
}

export async function activateEmployerSubscription(opts: {
  userId: string;
  plan: EmployerPlan;
  addons: AddonCode[];
  paymentMethod: PaymentMethod;
  adminNote?: string | null;
  periodDays?: number;
}): Promise<void> {
  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + (opts.periodDays ?? 30));

  await prisma.subscription.update({
    where: { userId: opts.userId },
    data: {
      plan: opts.plan,
      billingStatus: "ACTIVE",
      paymentMethod: opts.paymentMethod,
      status: "active",
      currentPeriodEnd: periodEnd,
      adminNote: opts.adminNote ?? null,
      cancelAtPeriodEnd: false,
      ...subscriptionAddonFields(opts.addons),
    },
  });
}
