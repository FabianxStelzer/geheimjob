import type { AddonCode } from "@/lib/billing-plans";
import {
  addonByCode,
  planByCode,
  stripePriceIdFromAddon,
  stripePriceIdFromPlan,
} from "@/lib/billing-catalog";
import type { EmployerPlan } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function applySubscriptionFromStripe(opts: {
  userId: string;
  plan: EmployerPlan;
  addons: AddonCode[];
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  currentPeriodEnd: Date;
}) {
  const extraJobSlots = opts.addons.filter((a) => a === "EXTRA_JOB").length;
  await prisma.subscription.upsert({
    where: { userId: opts.userId },
    create: {
      userId: opts.userId,
      plan: opts.plan,
      billingStatus: "ACTIVE",
      paymentMethod: "STRIPE",
      status: "active",
      stripeSubscriptionId: opts.stripeSubscriptionId,
      stripeCustomerId: opts.stripeCustomerId,
      stripePriceId: opts.stripePriceId,
      currentPeriodEnd: opts.currentPeriodEnd,
      extraJobSlots,
      addonHighlight: opts.addons.includes("HIGHLIGHT"),
      addonContactAll: opts.addons.includes("CONTACT_ALL"),
    },
    update: {
      plan: opts.plan,
      billingStatus: "ACTIVE",
      paymentMethod: "STRIPE",
      status: "active",
      stripeSubscriptionId: opts.stripeSubscriptionId,
      stripeCustomerId: opts.stripeCustomerId,
      stripePriceId: opts.stripePriceId,
      currentPeriodEnd: opts.currentPeriodEnd,
      extraJobSlots,
      addonHighlight: opts.addons.includes("HIGHLIGHT"),
      addonContactAll: opts.addons.includes("CONTACT_ALL"),
      cancelAtPeriodEnd: false,
    },
  });

  await prisma.employerProfile.updateMany({
    where: { userId: opts.userId },
    data: { stripeCustomerId: opts.stripeCustomerId },
  });
}

export async function buildStripeLineItems(plan: EmployerPlan, addons: AddonCode[]): Promise<{
  price: string;
  quantity: number;
}[]> {
  const planDef = await planByCode(plan);
  if (!planDef) throw new Error("Unbekanntes Paket");
  const mainPrice = stripePriceIdFromPlan(planDef);
  if (!mainPrice) throw new Error(`Stripe Price-ID fehlt für Paket ${planDef.name}`);

  const items: { price: string; quantity: number }[] = [{ price: mainPrice, quantity: 1 }];

  const counts = new Map<AddonCode, number>();
  for (const code of addons) {
    counts.set(code, (counts.get(code) ?? 0) + 1);
  }

  for (const [code, quantity] of counts) {
    const addon = await addonByCode(code);
    if (!addon) continue;
    const price = stripePriceIdFromAddon(addon);
    if (!price) throw new Error(`Stripe Price-ID fehlt für Add-on ${addon.name}`);
    items.push({ price, quantity });
  }

  return items;
}

export function parseStripeMetadata(meta: Stripe.Metadata | null | undefined): {
  userId: string;
  plan: EmployerPlan;
  addons: AddonCode[];
} | null {
  if (!meta?.userId || !meta?.plan) return null;
  const plan = meta.plan as EmployerPlan;
  let addons: AddonCode[] = [];
  if (meta.addons) {
    try {
      addons = JSON.parse(meta.addons) as AddonCode[];
    } catch {
      addons = [];
    }
  }
  return { userId: meta.userId, plan, addons };
}
