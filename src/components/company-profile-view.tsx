"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandAvatar } from "@/components/brand-logo";
import { BriefcaseIcon, ChatIcon, MapPinIcon } from "@/components/icons";
import { companyAgeYears } from "@/lib/employee-count-ranges";

type PublishedJob = {
  id: string;
  title: string;
  headline: string | null;
  employmentKind: string | null;
  workModeHint: string | null;
};

export type CompanyProfileData = {
  id: string;
  companyName: string;
  industry: string;
  region: string;
  logoUrl: string | null;
  website: string | null;
  openPositionsNote: string | null;
  companyDescription: string | null;
  productsAndServices: string | null;
  employeeCountRange: string | null;
  foundedYear: number | null;
  companyBenefits: string | null;
  companyCulture: string | null;
};

function FactChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="gj-chip gj-chip-neutral text-[11px]">{children}</span>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--gj-muted)]">
        {title}
      </h2>
      <div className="mt-3 text-sm leading-relaxed text-[var(--gj-text)]/90">{children}</div>
    </section>
  );
}

export function CompanyProfileView({
  company,
  jobs,
}: {
  company: CompanyProfileData;
  jobs: PublishedJob[];
}) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const initial = company.companyName.slice(0, 2).toUpperCase();
  const ageYears = companyAgeYears(company.foundedYear);

  async function showInterest() {
    setBusy(true);
    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employerProfileId: company.id,
        introMessage: "Ich möchte mich bei Ihnen vorstellen und mehr über Ihr Unternehmen erfahren.",
      }),
    });
    setBusy(false);
    if (res.ok || res.status === 409) {
      setSent(true);
    } else {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      alert(j.error || "Anfrage fehlgeschlagen.");
    }
  }

  const hasContent =
    company.productsAndServices ||
    company.companyDescription ||
    company.companyBenefits ||
    company.companyCulture ||
    company.openPositionsNote;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="gj-card overflow-hidden">
        <div className="border-b border-[var(--gj-border)] bg-[var(--gj-primary-softer)]/30 p-6 md:p-8">
          <div className="flex flex-wrap items-start gap-5">
            {company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logoUrl}
                alt=""
                className="max-h-24 max-w-[220px] rounded-2xl object-contain ring-4 ring-white shadow"
              />
            ) : (
              <BrandAvatar className="h-20 w-20 rounded-2xl text-xl">{initial}</BrandAvatar>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-[var(--gj-text)]">{company.companyName}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[var(--gj-muted)]">
                <span className="flex items-center gap-1">
                  <BriefcaseIcon className="h-4 w-4" /> {company.industry}
                </span>
                <span className="flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" /> {company.region}
                </span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {company.employeeCountRange ? (
                  <FactChip>{company.employeeCountRange} Mitarbeitende</FactChip>
                ) : null}
                {company.foundedYear ? (
                  <FactChip>
                    Seit {company.foundedYear}
                    {ageYears != null ? ` (${ageYears} Jahre)` : ""}
                  </FactChip>
                ) : null}
              </div>
              {company.website ? (
                <a
                  href={
                    company.website.startsWith("http") ? company.website : `https://${company.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-medium text-[var(--gj-primary)] hover:underline"
                >
                  Website besuchen
                </a>
              ) : null}
            </div>
            <button
              type="button"
              disabled={busy || sent}
              onClick={() => void showInterest()}
              className="gj-btn-primary shrink-0"
            >
              <ChatIcon /> {sent ? "Anfrage gesendet" : busy ? "Sende…" : "Interesse zeigen"}
            </button>
          </div>
        </div>

        <div className="space-y-8 p-6 md:p-8">
          {company.productsAndServices ? (
            <ProfileSection title="Was wir machen">
              <p className="whitespace-pre-wrap">{company.productsAndServices}</p>
            </ProfileSection>
          ) : null}

          {company.companyDescription ? (
            <ProfileSection title="Über uns">
              <p className="whitespace-pre-wrap">{company.companyDescription}</p>
            </ProfileSection>
          ) : null}

          {company.companyCulture ? (
            <ProfileSection title="Kultur & Arbeitsweise">
              <p className="whitespace-pre-wrap">{company.companyCulture}</p>
            </ProfileSection>
          ) : null}

          {company.companyBenefits ? (
            <ProfileSection title="Benefits">
              <p className="whitespace-pre-wrap">{company.companyBenefits}</p>
            </ProfileSection>
          ) : null}

          {company.openPositionsNote ? (
            <ProfileSection title="Offene Stellen / Hinweise">
              <p className="whitespace-pre-wrap">{company.openPositionsNote}</p>
            </ProfileSection>
          ) : null}

          {!hasContent ? (
            <p className="text-sm text-[var(--gj-muted)]">
              Das Unternehmen hat noch keine ausführliche Vorstellung hinterlegt.
            </p>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Aktuelle Stellenanzeigen</h2>
          <Link href="/dashboard/worker" className="gj-btn-ghost text-sm">
            Zur Job-Suche
          </Link>
        </div>
        {jobs.length === 0 ? (
          <div className="gj-card p-8 text-center text-sm text-[var(--gj-muted)]">
            Derzeit keine veröffentlichten Stellen — Interesse trotzdem zeigen.
          </div>
        ) : (
          <ul className="space-y-3">
            {jobs.map((job) => (
              <li key={job.id} className="gj-card p-4">
                <h3 className="font-semibold text-[var(--gj-text)]">{job.title}</h3>
                {job.headline ? (
                  <p className="mt-1 text-sm text-[var(--gj-muted)]">{job.headline}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.employmentKind ? (
                    <span className="gj-chip gj-chip-neutral text-[11px]">{job.employmentKind}</span>
                  ) : null}
                  {job.workModeHint ? (
                    <span className="gj-chip gj-chip-neutral text-[11px]">{job.workModeHint}</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
