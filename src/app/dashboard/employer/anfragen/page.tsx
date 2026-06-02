import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { recipientUserId } from "@/lib/match";
import {
  ApplicationsPipelineBoard,
  type PipelineCardVM,
} from "@/components/applications-pipeline-board";
import { pipelineColumnForMatch } from "@/lib/application-pipeline";
import { splitJobPostingTags } from "@/lib/job-postings-for-worker";
import type { PipelineDrawerPayload } from "@/components/pipeline-drawer";
import { buildMatchCvFields } from "@/lib/match-cv-props";

export default async function EmployerAnfragenPage() {
  const session = await auth();
  const matches = await prisma.matchRequest.findMany({
    where: { employerProfile: { userId: session!.user.id } },
    include: { employerProfile: true, workerProfile: true, jobPosting: true },
    orderBy: { createdAt: "desc" },
  });

  const cards: PipelineCardVM[] = matches.map((m) => {
    const rec = recipientUserId(m);
    const isRecipient = session!.user.id === rec;
    const column = pipelineColumnForMatch(m);
    const job = m.jobPosting
      ? {
          title: m.jobPosting.title,
          headline: m.jobPosting.headline,
          richDescription: m.jobPosting.richDescription,
          tags: splitJobPostingTags(m.jobPosting.tags),
          productCostHint: m.jobPosting.productCostHint,
          commissionHint: m.jobPosting.commissionHint,
          targetIncomeHint: m.jobPosting.targetIncomeHint,
          targetIncomeKind: m.jobPosting.targetIncomeKind,
          workModeHint: m.jobPosting.workModeHint,
          weeklyHoursHint: m.jobPosting.weeklyHoursHint,
        }
      : null;

    const drawer: PipelineDrawerPayload = {
      viewerRole: "EMPLOYER",
      matchId: m.id,
      status: m.status,
      hiringStage: m.hiringStage,
      introMessage: m.introMessage,
      employer: {
        companyName: m.employerProfile.companyName,
        industry: m.employerProfile.industry,
        region: m.employerProfile.region,
        logoUrl: m.employerProfile.logoUrl,
        contactName: m.employerProfile.contactName,
      },
      worker: {
        displayName: m.workerProfile.displayName,
        professionField: m.workerProfile.professionField,
        region: m.workerProfile.region,
        experienceYears: m.workerProfile.experienceYears,
        salaryExpectation:
          m.workerProfile.salaryPublic && m.workerProfile.salaryExpectation != null
            ? m.workerProfile.salaryExpectation
            : null,
        availability: m.workerProfile.availability,
        anonymousSlug: m.workerProfile.anonymousSlug,
        bio: m.workerProfile.bio,
        photoUrl: m.workerProfile.photoUrl,
      },
      job,
      showRespondButtons: m.status === "PENDING" && isRecipient,
      ...buildMatchCvFields(m, m.workerProfile),
    };

    const title = m.jobPosting
      ? `${m.workerProfile.professionField} · ${m.jobPosting.title}`
      : m.workerProfile.professionField;
    const subtitle = m.jobPosting
      ? m.jobPosting.headline ?? m.workerProfile.region
      : `${m.workerProfile.region} · ${m.workerProfile.experienceYears} J.`;

    return {
      id: m.id,
      column,
      title,
      subtitle,
      meta: m.createdAt.toLocaleDateString("de-DE"),
      introPreview: m.introMessage,
      avatarUrl: m.workerProfile.photoUrl,
      avatarInitials: m.workerProfile.displayName.slice(0, 2) || m.workerProfile.professionField.slice(0, 2),
      drawer,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-3xl text-sm text-[var(--gj-muted)]">
          Karte anklicken: Kandidat und Stellenanzeige im Seitenfenster. Pipeline-Stufen steuern Sie dort —
          keine zusätzliche Seite nötig.
        </p>
        <Link href="/dashboard/employer/stellen" className="gj-btn-ghost text-sm">
          Stellen
        </Link>
      </div>
      <ApplicationsPipelineBoard cards={cards} />
    </div>
  );
}
