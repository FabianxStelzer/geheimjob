import { NextResponse } from "next/server";
import { notifyUser } from "@/lib/platform";
import { applySubscriptionFromStripe, parseStripeMetadata } from "@/lib/stripe-billing";
import { getStripe } from "@/lib/stripe";
import { NotificationKind } from "@prisma/client";
import type Stripe from "stripe";

function periodEndFromSubscription(sub: Stripe.Subscription): Date {
  const unix = (sub as unknown as { current_period_end?: number }).current_period_end;
  if (typeof unix === "number") return new Date(unix * 1000);
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook nicht konfiguriert." }, { status: 501 });
  }

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  if (!sig) {
    return NextResponse.json({ error: "Signatur fehlt." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Ungültige Signatur." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
        const sub = (await stripe.subscriptions.retrieve(subId)) as Stripe.Subscription;
        const meta = parseStripeMetadata(session.metadata ?? sub.metadata);
        if (meta) {
          const periodEnd = periodEndFromSubscription(sub);
          await applySubscriptionFromStripe({
            userId: meta.userId,
            plan: meta.plan,
            addons: meta.addons,
            stripeSubscriptionId: sub.id,
            stripeCustomerId:
              typeof sub.customer === "string" ? sub.customer : sub.customer.id,
            stripePriceId: sub.items.data[0]?.price.id ?? "",
            currentPeriodEnd: periodEnd,
          });
          await notifyUser(
            meta.userId,
            NotificationKind.BILLING,
            "Zugang aktiviert",
            "Ihr Paket ist aktiv — vielen Dank für Ihre Zahlung.",
            "/dashboard/employer",
          );
        }
      }
    }

    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription;
      const meta = parseStripeMetadata(sub.metadata);
      if (meta) {
        const status =
          sub.status === "active" || sub.status === "trialing"
            ? "ACTIVE"
            : sub.status === "past_due"
              ? "PAST_DUE"
              : "INACTIVE";
        const periodEnd = periodEndFromSubscription(sub);
        await applySubscriptionFromStripe({
          userId: meta.userId,
          plan: meta.plan,
          addons: meta.addons,
          stripeSubscriptionId: sub.id,
          stripeCustomerId:
            typeof sub.customer === "string" ? sub.customer : sub.customer.id,
          stripePriceId: sub.items.data[0]?.price.id ?? "",
          currentPeriodEnd: periodEnd,
        });
        if (status !== "ACTIVE") {
          const { prisma } = await import("@/lib/prisma");
          await prisma.subscription.update({
            where: { userId: meta.userId },
            data: { billingStatus: status, status: sub.status },
          });
        }
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const meta = parseStripeMetadata(sub.metadata);
      if (meta) {
        const { prisma } = await import("@/lib/prisma");
        await prisma.subscription.update({
          where: { userId: meta.userId },
          data: {
            billingStatus: "CANCELED",
            status: "canceled",
            plan: "NONE",
          },
        });
      }
    }
  } catch (err) {
    console.error("stripe webhook", err);
    return NextResponse.json({ error: "Verarbeitung fehlgeschlagen." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

export const runtime = "nodejs";
