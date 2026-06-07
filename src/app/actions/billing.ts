"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  activateEmployerSubscription,
  ensureEmployerSubscription,
  parseCheckoutSelection,
} from "@/lib/employer-billing";
import { notifyAdminOfPackagePurchase } from "@/lib/billing-purchase-notify";
import { notifyUser } from "@/lib/platform";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { NotificationKind } from "@prisma/client";

function addonNote(sel: {
  extraJobCount: number;
  addonHighlight: boolean;
  addonContactAll: boolean;
}): string {
  const parts: string[] = [];
  if (sel.extraJobCount > 0) parts.push(`${sel.extraJobCount}× Zusatzstelle`);
  if (sel.addonHighlight) parts.push("Hervorhebung");
  if (sel.addonContactAll) parts.push("Alle kontaktieren");
  return parts.length ? `Add-ons: ${parts.join(", ")}` : "Add-ons: keine";
}

export async function activateInvoiceBilling(formData: FormData): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") return { ok: false };

  const plan = String(formData.get("plan") || "STARTER");
  const extraJobCount = Number(formData.get("extraJobCount") || 0);
  const addonHighlight = formData.get("addonHighlight") === "on";
  const addonContactAll = formData.get("addonContactAll") === "on";

  const parsed = await parseCheckoutSelection({
    plan,
    extraJobCount,
    addonHighlight,
    addonContactAll,
  });
  if (!parsed) return { ok: false };

  const note = String(formData.get("note") || "").trim() || addonNote(parsed.selection);

  await ensureEmployerSubscription(session.user.id);
  await activateEmployerSubscription({
    userId: session.user.id,
    plan: parsed.plan,
    addons: parsed.addons,
    paymentMethod: "INVOICE",
    adminNote: note,
  });

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: session.user.id },
    select: { companyName: true },
  });

  await notifyUser(
    session.user.id,
    NotificationKind.BILLING,
    "Paket aktiviert",
    "Ihr Paket ist sofort aktiv. Die Rechnung erhalten Sie in Kürze per E-Mail.",
    "/dashboard/employer",
  );

  await notifyAdminOfPackagePurchase({
    employerUserId: session.user.id,
    employerEmail: session.user.email ?? "",
    companyName: employer?.companyName ?? null,
    plan: parsed.plan,
    addons: parsed.addons,
    paymentMethod: "INVOICE",
  });

  revalidatePath("/dashboard/employer/abrechnung");
  revalidatePath("/dashboard/employer");
  return { ok: true };
}

export async function cancelEmployerSubscription(): Promise<{ ok: boolean; message?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return { ok: false, message: "Nicht berechtigt." };
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!sub || sub.billingStatus !== "ACTIVE" || sub.plan === "NONE") {
    return { ok: false, message: "Kein aktives Paket vorhanden." };
  }
  if (sub.cancelAtPeriodEnd) {
    return { ok: false, message: "Das Paket ist bereits zum Laufzeitende gekündigt." };
  }

  if (sub.stripeSubscriptionId) {
    const stripe = await getStripe();
    if (stripe) {
      try {
        await stripe.subscriptions.update(sub.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
      } catch {
        return { ok: false, message: "Stripe-Kündigung fehlgeschlagen. Bitte Support kontaktieren." };
      }
    }
  }

  await prisma.subscription.update({
    where: { userId: session.user.id },
    data: { cancelAtPeriodEnd: true },
  });

  const endLabel = sub.currentPeriodEnd
    ? sub.currentPeriodEnd.toLocaleDateString("de-DE")
    : "Ende der Laufzeit";

  await notifyUser(
    session.user.id,
    NotificationKind.BILLING,
    "Paket gekündigt",
    `Ihr Paket endet am ${endLabel}. Bis dahin bleibt der Zugang aktiv.`,
    "/dashboard/employer/abrechnung",
  );

  revalidatePath("/dashboard/employer/abrechnung");
  revalidatePath("/dashboard/employer");
  return { ok: true, message: `Gekündigt — Zugang bis ${endLabel}.` };
}

/** @deprecated Alias — nutzt activateInvoiceBilling */
export async function requestInvoiceBilling(formData: FormData): Promise<{ ok: boolean }> {
  return activateInvoiceBilling(formData);
}
