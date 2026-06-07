import type { AddonCode } from "@/lib/billing-plans";
import { planByCode } from "@/lib/billing-catalog";
import { addonByCode } from "@/lib/billing-catalog";
import { sendAdminAlertEmail } from "@/lib/email-notifications";
import { getBillingAutomationWebhookUrl } from "@/lib/platform-settings";
import { prisma } from "@/lib/prisma";
import type { EmployerPlan, PaymentMethod } from "@prisma/client";
import { NotificationKind } from "@prisma/client";

export async function notifyAdminOfPackagePurchase(opts: {
  employerUserId: string;
  employerEmail: string;
  companyName: string | null;
  plan: EmployerPlan;
  addons: AddonCode[];
  paymentMethod: PaymentMethod;
}): Promise<void> {
  const planDef = await planByCode(opts.plan);
  const planName = planDef?.name ?? opts.plan;
  const addonNames = (
    await Promise.all(opts.addons.map((code) => addonByCode(code).then((a) => a?.name ?? code)))
  ).join(", ");

  const company = opts.companyName?.trim() || opts.employerEmail;
  const paymentLabel = opts.paymentMethod === "STRIPE" ? "Stripe (Karte/SEPA)" : "Rechnung";
  const title = "Neues Paket gebucht";
  const body = `${company} hat „${planName}“ gebucht (${paymentLabel}).${
    addonNames ? ` Add-ons: ${addonNames}.` : ""
  } Bitte Rechnung zusenden, falls Zahlung auf Rechnung.`;

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", deletedAt: null },
    select: { id: true, email: true },
  });

  const href = `/dashboard/admin/unternehmen/${opts.employerUserId}`;
  for (const admin of admins) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        kind: NotificationKind.BILLING,
        title,
        body,
        href,
      },
    });
  }

  await sendAdminAlertEmail({
    subject: title,
    title,
    body,
    href,
  }).catch(() => {
    /* optional */
  });

  const webhookUrl = await getBillingAutomationWebhookUrl();
  if (webhookUrl) {
    const payload = {
      event: "package.purchased",
      paymentMethod: opts.paymentMethod,
      purchasedAt: new Date().toISOString(),
      employer: {
        userId: opts.employerUserId,
        email: opts.employerEmail,
        companyName: opts.companyName,
      },
      package: {
        plan: opts.plan,
        planName,
        priceEur: planDef?.priceEur ?? null,
        addons: opts.addons,
        addonNames: addonNames ? addonNames.split(", ") : [],
      },
    };

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {
      /* Webhook optional */
    });
  }
}
