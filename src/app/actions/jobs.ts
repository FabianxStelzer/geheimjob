"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { notifyWorkersOnNewJob } from "@/lib/billing-notifications";
import { canPublishAnotherJob, getEmployerEntitlements } from "@/lib/employer-billing";
import { prisma } from "@/lib/prisma";
import { isValidEmploymentKind } from "@/lib/employment-kinds";

async function employerProfileFromSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") return null;
  return prisma.employerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, region: true, userId: true },
  });
}

export async function upsertJobPosting(formData: FormData): Promise<void> {
  const emp = await employerProfileFromSession();
  if (!emp) return;

  const id = String(formData.get("id") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const headline = String(formData.get("headline") || "").trim() || null;
  const tags = String(formData.get("tags") || "").trim();
  const productCostHint = String(formData.get("productCostHint") || "").trim() || null;
  const commissionHint = String(formData.get("commissionHint") || "").trim() || null;
  const targetIncomeHint = String(formData.get("targetIncomeHint") || "").trim() || null;
  const targetIncomeKindRaw = String(formData.get("targetIncomeKind") || "BRUTTO").trim();
  const targetIncomeKind = targetIncomeKindRaw === "NETTO" ? "NETTO" : "BRUTTO";
  const workModeHint = String(formData.get("workModeHint") || "").trim() || null;
  const weeklyHoursHint = String(formData.get("weeklyHoursHint") || "").trim() || null;
  const employmentKindRaw = String(formData.get("employmentKind") || "").trim();
  const employmentKind = employmentKindRaw || null;
  const richDescription = String(formData.get("richDescription") || "").trim();
  const publishedRaw = formData.get("published");
  const published = publishedRaw === "on" || publishedRaw === "true";
  const highlightedRequested =
    formData.get("highlighted") === "on" || formData.get("highlighted") === "true";

  if (!title || title.length > 280) return;
  if (employmentKind && !isValidEmploymentKind(employmentKind)) return;

  const ent = await getEmployerEntitlements(emp.userId);
  const allowHighlight = ent.canHighlightJobs;

  if (id) {
    const existing = await prisma.jobPosting.findFirst({
      where: { id, employerProfileId: emp.id },
    });
    if (!existing) return;

    const highlighted = allowHighlight ? highlightedRequested : existing.highlighted;

    const newlyPublishing = published && !existing.published;
    if (newlyPublishing) {
      const check = await canPublishAnotherJob(emp.userId);
      if (!check.ok) return;
    }

    await prisma.jobPosting.update({
      where: { id },
      data: {
        title,
        headline,
        tags,
        productCostHint,
        commissionHint,
        targetIncomeHint,
        targetIncomeKind,
        workModeHint,
        weeklyHoursHint,
        employmentKind,
        richDescription,
        published,
        highlighted,
      },
    });
    if (newlyPublishing) {
      await notifyWorkersOnNewJob({
        jobPostingId: id,
        employerProfileId: emp.id,
        title,
        tags,
        region: emp.region,
      });
    }
  } else {
    if (published) {
      const check = await canPublishAnotherJob(emp.userId);
      if (!check.ok) return;
    }

    const created = await prisma.jobPosting.create({
      data: {
        employerProfileId: emp.id,
        title,
        headline,
        tags,
        productCostHint,
        commissionHint,
        targetIncomeHint,
        targetIncomeKind,
        workModeHint,
        weeklyHoursHint,
        employmentKind,
        richDescription,
        published,
        highlighted: allowHighlight && highlightedRequested,
      },
    });
    if (published) {
      await notifyWorkersOnNewJob({
        jobPostingId: created.id,
        employerProfileId: emp.id,
        title: created.title,
        tags: created.tags,
        region: emp.region,
      });
    }
  }

  revalidatePath("/dashboard/employer/stellen");
  revalidatePath("/dashboard/worker");
}

export async function deleteJobPosting(formData: FormData): Promise<void> {
  const emp = await employerProfileFromSession();
  if (!emp) return;
  const id = String(formData.get("id") || "").trim();
  if (!id) return;

  await prisma.jobPosting.deleteMany({
    where: { id, employerProfileId: emp.id },
  });

  revalidatePath("/dashboard/employer/stellen");
}
