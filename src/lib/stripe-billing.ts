import type { AddonCode } from "@/lib/billing-plans";
import { addonByCode, planByCode, stripePriceIdFromEnv } from "@/lib/billing-plans";
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
    },
  });

  await prisma.employerProfile.updateMany({
    where: { userId: opts.userId },
    data: { stripeCustomerId: opts.stripeCustomerId },
  });
}

export function buildStripeLineItems(plan: EmployerPlan, addons: AddonCode[]): {
  price: string;
  quantity: number;
}[] {
  const planDef = planByCode(plan);
  if (!planDef) throw new Error("Unbekanntes Paket");
  const mainPrice = stripePriceIdFromEnv(planDef.stripePriceEnv);
  if (!mainPrice) throw new Error(`Stripe-Preis fehlt (${planDef.stripePriceEnv})`);

  const items: { price: string; quantity: number }[] = [{ price: mainPrice, quantity: 1 }];

  for (const code of addons) {
    const addon = addonByCode(code);
    if (!addon) continue;
    const price = stripePriceIdFromEnv(addon.stripePriceEnv);
    if (!price) throw new Error(`Stripe-Preis fehlt (${addon.stripePriceEnv})`);
    items.push({ price, quantity: 1 });
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
