"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ensureEmployerSubscription } from "@/lib/employer-billing";
import { notifyUser } from "@/lib/platform";
import { prisma } from "@/lib/prisma";
import { NotificationKind } from "@prisma/client";

export async function requestInvoiceBilling(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") return;

  const plan = String(formData.get("plan") || "STARTER");
  const note = String(formData.get("note") || "").trim() || null;

  await ensureEmployerSubscription(session.user.id);
  await prisma.subscription.update({
    where: { userId: session.user.id },
    data: {
      plan: plan as "STARTER" | "PLUS" | "PREMIUM",
      billingStatus: "PENDING",
      paymentMethod: "INVOICE",
      status: "pending",
      adminNote: note,
    },
  });

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", deletedAt: null },
    select: { id: true },
  });
  for (const a of admins) {
    await notifyUser(
      a.id,
      NotificationKind.BILLING,
      "Rechnungsanfrage",
      `${session.user.email} möchte Paket ${plan} auf Rechnung.`,
      "/dashboard/admin/unternehmen",
    );
  }

  revalidatePath("/dashboard/employer/abrechnung");
}
