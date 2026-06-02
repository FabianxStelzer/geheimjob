"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/platform";
import type { BillingStatus, EmployerPlan, PaymentMethod } from "@prisma/client";
import { NotificationKind } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function adminSetEmployerSubscription(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;

  const userId = String(formData.get("userId") || "").trim();
  const plan = String(formData.get("plan") || "NONE") as EmployerPlan;
  const billingStatus = String(formData.get("billingStatus") || "INACTIVE") as BillingStatus;
  const paymentMethod = String(formData.get("paymentMethod") || "") as PaymentMethod | "";
  const extraJobSlots = Number(formData.get("extraJobSlots") || 0);
  const addonHighlight = formData.get("addonHighlight") === "on";
  const addonContactAll = formData.get("addonContactAll") === "on";
  const adminNote = String(formData.get("adminNote") || "").trim() || null;
  const days = Number(formData.get("periodDays") || 30);

  if (!userId) return;

  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + (Number.isFinite(days) ? days : 30));

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan,
      billingStatus,
      paymentMethod: paymentMethod || null,
      status: billingStatus === "ACTIVE" ? "active" : "inactive",
      extraJobSlots: Number.isFinite(extraJobSlots) ? extraJobSlots : 0,
      addonHighlight,
      addonContactAll,
      currentPeriodEnd: billingStatus === "ACTIVE" ? periodEnd : null,
      adminNote,
    },
    update: {
      plan,
      billingStatus,
      paymentMethod: paymentMethod || null,
      status: billingStatus === "ACTIVE" ? "active" : "inactive",
      extraJobSlots: Number.isFinite(extraJobSlots) ? extraJobSlots : 0,
      addonHighlight,
      addonContactAll,
      currentPeriodEnd: billingStatus === "ACTIVE" ? periodEnd : null,
      adminNote,
    },
  });

  if (billingStatus === "ACTIVE") {
    await notifyUser(
      userId,
      NotificationKind.BILLING,
      "Zugang freigeschaltet",
      "Ihr Unternehmenszugang wurde vom Support aktiviert.",
      "/dashboard/employer",
    );
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/unternehmen");
  revalidatePath("/dashboard/admin/abonnements");
}

export async function adminRevokeEmployerSubscription(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;
  const userId = String(formData.get("userId") || "").trim();
  if (!userId) return;

  await prisma.subscription.updateMany({
    where: { userId },
    data: {
      plan: "NONE",
      billingStatus: "INACTIVE",
      status: "inactive",
      extraJobSlots: 0,
      addonHighlight: false,
      addonContactAll: false,
      currentPeriodEnd: null,
    },
  });

  revalidatePath("/dashboard/admin/unternehmen");
}
