"use client";

import { useState } from "react";
import Link from "next/link";
import type { HiringStage } from "@prisma/client";
import { BriefcaseIcon, ClockIcon, EuroIcon, MapPinIcon } from "@/components/icons";
import { MatchRespondButtons } from "@/components/match-respond-buttons";
import { MatchCvAccess } from "@/components/match-cv-access";
import { HIRING_STAGE_SEQUENCE } from "@/lib/application-pipeline";
import type { CvAccessUiState } from "@/lib/cv-access";

export type PipelineDrawerPayload = {
  viewerRole: "WORKER" | "EMPLOYER";
  matchId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  hiringStage: HiringStage;
  introMessage?: string | null;
  employer: {
    companyName: string;
    industry: string;
    region: string;
    logoUrl: string | null;
    contactName?: string;
  };
  worker?: {
    displayName: string;
    professionField: string;
    region: string;
    experienceYears: number;
    salaryExpectation: number | null;
    availability: string;
    anonymousSlug: string;
    bio: string | null;
    photoUrl: string | null;
  };
  job?: {
    title: string;
    headline: string | null;
    richDescription: string;
    tags: string[];
    productCostHint: string | null;
    commissionHint: string | null;
    targetIncomeHint: string | null;
    workModeHint: string | null;
    weeklyHoursHint: string | null;
  } | null;
  showRespondButtons: boolean;
  cvAccess: CvAccessUiState;
  hasPdf: boolean;
  cvDraftJson: string | null;
};

const STAGE_LABEL: Record<HiringStage, string> = {
  NONE: "—",
  BEWORBEN: "Beworben",
  EINGELADEN: "Eingeladen",
  INTERVIEW: "Interview",
  ENTSCHEIDUNG: "Entscheidung",
  EINGESTELLT: "Eingestellt",
};

function HiringStageAdvance({ matchId, current }: { matchId: string; current: HiringStage }) {
  const [busy, setBusy] = useState(false);

  async function patch(next: HiringStage) {
    setBusy(true);
    const res = await fetch(`/api/matches/${matchId}/hiring-stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hiringStage: next }),
    });
    setBusy(false);
    if (!res.ok) alert("Status konnte nicht aktualisiert werden.");
    else window.location.reload();
  }

  const options = HIRING_STAGE_SEQUENCE;

  return (
    <div className="mt-4">
      <label className="gj-label">Nächster Schritt im Prozess</label>
      <select
        className="gj-select mt-2"
        disabled={busy}
        defaultValue=""
        onChange={(e) => {
          const v = e.target.value as HiringStage;
          e.target.selectedIndex = 0;
          if (v && v !== current) void patch(v);
        }}
      >
        <option value="" disabled>
          Stufe wählen…
        </option>
        {options.map((s) => (
          <option key={s} value={s} disabled={s === current}>
            {STAGE_LABEL[s]}
            {s === current ? " (aktuell)" : ""}
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs text-[var(--gj-muted)]">Aktuell: {STAGE_LABEL[current]}</p>
    </div>
  );
}

export function PipelineDetailPanel({ payload }: { payload: PipelineDrawerPayload }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        {payload.job ? (
          <span className="gj-chip gj-chip-neutral">Stellenanzeige</span>
        ) : (
          <span className="gj-chip gj-chip-neutral">Kontaktanfrage</span>
        )}
        <span className={`gj-chip ${payload.status === "PENDING" ? "gj-chip-warning" : "gj-chip-success"}`}>
          {payload.status}
        </span>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--gj-border)] bg-[var(--gj-bg)]/60 p-5 text-center sm:flex-row sm:text-left">
        {payload.viewerRole === "WORKER" ? (
          <EmployerBadge logoUrl={payload.employer.logoUrl} label={payload.employer.companyName} large />
        ) : (
          <WorkerBadge photoUrl={payload.worker?.photoUrl} label={payload.worker?.displayName ?? "?"} large />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-semibold text-[var(--gj-text)]">
            {payload.viewerRole === "WORKER"
              ? payload.employer.companyName
              : payload.worker?.displayName}
          </h3>
          <p className="mt-1 text-sm text-[var(--gj-muted)]">
            {payload.viewerRole === "WORKER"
              ? `${payload.employer.industry} · ${payload.employer.region}`
              : `${payload.worker?.professionField} · ${payload.worker?.region}`}
          </p>
        </div>
      </div>

      {payload.job ? (
        <section className="rounded-xl border border-[var(--gj-border-strong)] bg-[var(--gj-primary-softer)]/40 p-4">
          <h4 className="text-sm font-semibold text-[var(--gj-primary)]">{payload.job.title}</h4>
          {payload.job.headline ? (
            <p className="mt-1 text-sm text-[var(--gj-text)]">{payload.job.headline}</p>
          ) : null}
          <dl className="mt-3 grid gap-2 text-sm">
            {payload.job.productCostHint ? (
              <Row label="Details" val={payload.job.productCostHint} />
            ) : null}
            {payload.job.commissionHint ? <Row label="Provision" val={payload.job.commissionHint} /> : null}
            {payload.job.targetIncomeHint ? <Row label="Zieleinkommen" val={payload.job.targetIncomeHint} /> : null}
          </dl>
          <div className="mt-3 flex flex-wrap gap-2">
            {payload.job.tags.map((t) => (
              <span key={t} className="gj-chip gj-chip-neutral text-[11px]">
                {t}
              </span>
            ))}
          </div>
          <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--gj-text)]/90">
            {payload.job.richDescription}
          </div>
        </section>
      ) : null}

      {payload.viewerRole === "EMPLOYER" && payload.worker ? (
        <section className="space-y-2 text-sm">
          <div className="flex flex-wrap gap-2">
            <span className="gj-chip gj-chip-neutral">
              <MapPinIcon /> {payload.worker.region}
            </span>
            <span className="gj-chip gj-chip-neutral">
              <ClockIcon /> {payload.worker.availability}
            </span>
            {payload.worker.salaryExpectation != null ? (
              <span className="gj-chip">
                <EuroIcon /> {payload.worker.salaryExpectation.toLocaleString("de-DE")} €
              </span>
            ) : null}
          </div>
          {payload.worker.bio ? (
            <p className="text-[var(--gj-text)]/85 whitespace-pre-wrap">
              {payload.worker.bio.length > 900
                ? `${payload.worker.bio.slice(0, 900)}…`
                : payload.worker.bio}
            </p>
          ) : null}
          <MatchCvAccess
            matchId={payload.matchId}
            viewerRole="EMPLOYER"
            status={payload.status}
            cvAccess={payload.cvAccess}
            hasPdf={payload.hasPdf}
            cvDraftJson={payload.cvDraftJson}
            workerMeta={{
              displayName: payload.worker.displayName,
              professionField: payload.worker.professionField,
              region: payload.worker.region,
            }}
          />
        </section>
      ) : null}

      {payload.viewerRole === "WORKER" ? (
        <MatchCvAccess
          matchId={payload.matchId}
          viewerRole="WORKER"
          status={payload.status}
          cvAccess={payload.cvAccess}
          hasPdf={payload.hasPdf}
          cvDraftJson={payload.cvDraftJson}
          workerMeta={{
            displayName: payload.worker?.displayName ?? "",
            professionField: payload.worker?.professionField ?? "",
            region: payload.worker?.region ?? "",
          }}
          employerCompanyName={payload.employer.companyName}
        />
      ) : null}

      {payload.viewerRole === "WORKER" && payload.employer.contactName ? (
        <section className="text-sm text-[var(--gj-muted)]">
          <div className="flex items-start gap-2">
            <BriefcaseIcon /> {payload.employer.contactName}
          </div>
        </section>
      ) : null}

      <p className="text-xs text-[var(--gj-muted)]">
        Pipeline:{" "}
        <span className="font-medium text-[var(--gj-primary)]">{STAGE_LABEL[payload.hiringStage]}</span>
      </p>

      {payload.introMessage ? (
        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--gj-muted)]">
            Anschreiben
          </h4>
          <blockquote className="rounded-lg bg-[var(--gj-bg)] p-3 text-sm italic whitespace-pre-wrap">
            {payload.introMessage}
          </blockquote>
        </section>
      ) : null}

      {payload.status === "ACCEPTED" && payload.viewerRole === "EMPLOYER" ? (
        <HiringStageAdvance matchId={payload.matchId} current={payload.hiringStage === "NONE" ? "BEWORBEN" : payload.hiringStage} />
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-[var(--gj-border)] pt-4">
        {payload.showRespondButtons ? <MatchRespondButtons matchId={payload.matchId} /> : null}
        {(payload.status === "ACCEPTED" || payload.status === "PENDING") && payload.viewerRole === "EMPLOYER" ? (
          <Link href={`/dashboard/employer/chat/${payload.matchId}`} className="gj-btn-primary">
            Chat / Nachricht senden
          </Link>
        ) : null}
        {(payload.status === "ACCEPTED" || payload.status === "PENDING") && payload.viewerRole === "WORKER" ? (
          <Link href={`/dashboard/worker/chat/${payload.matchId}`} className="gj-btn-primary">
            Nachrichten
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function Row({ label, val }: { label: string; val: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--gj-muted)]">{label}</dt>
      <dd className="font-medium text-[var(--gj-text)]">{val}</dd>
    </div>
  );
}

function EmployerBadge({
  logoUrl,
  label,
  large = false,
}: {
  logoUrl: string | null;
  label: string;
  large?: boolean;
}) {
  const initials = label.slice(0, 2).toUpperCase();
  const sizeClass = large
    ? "h-32 w-32 shrink-0 rounded-2xl text-2xl ring-4"
    : "h-14 w-14 shrink-0 rounded-2xl text-sm ring-2";
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={logoUrl}
        alt=""
        className={`${sizeClass} object-cover ring-[var(--gj-primary-soft)] shadow-md`}
      />
    );
  }
  return (
    <span
      className={`gj-gradient-primary flex items-center justify-center font-bold text-white ${sizeClass}`}
    >
      {initials}
    </span>
  );
}

function WorkerBadge({
  photoUrl,
  label,
  large = false,
}: {
  photoUrl: string | null | undefined;
  label: string;
  large?: boolean;
}) {
  const initials = label.slice(0, 2).toUpperCase();
  const sizeClass = large
    ? "h-32 w-32 shrink-0 rounded-2xl text-2xl ring-4"
    : "h-14 w-14 shrink-0 rounded-full text-sm ring-2";
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt=""
        className={`${sizeClass} object-cover ring-[var(--gj-primary-soft)] shadow-md`}
      />
    );
  }
  return (
    <span
      className={`flex items-center justify-center bg-[var(--gj-primary-soft)] font-bold text-[var(--gj-primary)] ${sizeClass} ring-[var(--gj-primary-soft)]`}
    >
      {initials}
    </span>
  );
}
