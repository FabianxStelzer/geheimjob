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
import { prisma } from "@/lib/prisma";
import { NotificationKind } from "@prisma/client";

export async function activateInvoiceBilling(formData: FormData): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") return { ok: false };

  const plan = String(formData.get("plan") || "STARTER");
  const addonsRaw = String(formData.get("addons") || "");
  const addonsList = addonsRaw
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  const parsed = await parseCheckoutSelection({ plan, addons: addonsList });
  if (!parsed) return { ok: false };

  const note = String(formData.get("note") || "").trim() || null;

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

/** @deprecated Alias — nutzt activateInvoiceBilling */
export async function requestInvoiceBilling(formData: FormData): Promise<{ ok: boolean }> {
  return activateInvoiceBilling(formData);
}
