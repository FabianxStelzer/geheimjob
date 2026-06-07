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
import { employerAvatarLogo } from "@/lib/employer-logo-storage";

export default async function WorkerAnfragenPage() {
  const session = await auth();
  const worker = await prisma.workerProfile.findUnique({
    where: { userId: session!.user.id },
  });
  const workerNetCalcSettings =
    worker?.taxClass && worker.taxClass >= 1 && worker.taxClass <= 6
      ? {
          taxClass: worker.taxClass,
          churchTax: worker.churchTax,
          federalState: worker.federalState,
        }
      : null;

  const matches = await prisma.matchRequest.findMany({
    where: { workerProfile: { userId: session!.user.id } },
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
          workLocationsHint: m.jobPosting.workLocationsHint,
          startDateHint: m.jobPosting.startDateHint,
          contractTermHint: m.jobPosting.contractTermHint,
          weeklyHoursHint: m.jobPosting.weeklyHoursHint,
        }
      : null;

    const drawer: PipelineDrawerPayload = {
      viewerRole: "WORKER",
      matchId: m.id,
      status: m.status,
      hiringStage: m.hiringStage,
      introMessage: m.introMessage,
      employer: {
        companyName: m.employerProfile.companyName,
        industry: m.employerProfile.industry,
        region: m.employerProfile.region,
        logoUrl: employerAvatarLogo(
          m.employerProfile.logoSquareUrl,
          m.employerProfile.logoUrl,
        ),
        contactName: m.employerProfile.contactName,
      },
      job,
      showRespondButtons: m.status === "PENDING" && isRecipient,
      workerNetCalcSettings,
      ...buildMatchCvFields(m, m.workerProfile),
    };

    const title = m.jobPosting?.title ?? m.employerProfile.companyName;
    const subtitle = m.jobPosting
      ? m.employerProfile.companyName
      : `${m.employerProfile.industry} · ${m.employerProfile.region}`;

    return {
      id: m.id,
      column,
      title,
      subtitle,
      meta: m.createdAt.toLocaleDateString("de-DE"),
      introPreview: m.introMessage,
      avatarUrl: employerAvatarLogo(
        m.employerProfile.logoSquareUrl,
        m.employerProfile.logoUrl,
      ),
      avatarInitials: m.employerProfile.companyName.slice(0, 2),
      drawer,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-3xl text-sm text-[var(--gj-muted)]">
          Klick auf eine Karte öffnet Stellenbeschreibung oder Unternehmenskontext im Seitenfenster — ohne
          die Seite zu verlassen. Chat und Annahme finden Sie dort ebenfalls.
        </p>
        <Link href="/dashboard/worker" className="gj-btn-ghost text-sm">
          Job-Suche
        </Link>
      </div>
      <ApplicationsPipelineBoard cards={cards} />
    </div>
  );
}
