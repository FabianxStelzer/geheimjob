"use client";

import { BrandAvatar } from "@/components/brand-logo";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { JobFeedItem } from "@/lib/job-postings-for-worker";
import {
  emptyJobFeedFilters,
  filterJobFeedItems,
  jobFeedFilterOptions,
  type JobFeedFilters,
} from "@/lib/job-feed-filters";
import { BriefcaseIcon, MapPinIcon, ClockIcon } from "@/components/icons";
import { SlideOver } from "@/components/slide-over";

const SAVED_JOBS_LS = "geheimjob-saved-job-ids";

function loadSavedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SAVED_JOBS_LS);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x) => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function toggleSaved(jobId: string) {
  const s = loadSavedIds();
  if (s.has(jobId)) s.delete(jobId);
  else s.add(jobId);
  localStorage.setItem(SAVED_JOBS_LS, JSON.stringify([...s]));
}

export default function WorkerJobExplorer({ initialJobs }: { initialJobs: JobFeedItem[] }) {
  const [tab, setTab] = useState<"all" | "saved">("all");
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const [detail, setDetail] = useState<JobFeedItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobFeedFilters>(() => emptyJobFeedFilters());
  const [filtersOpen, setFiltersOpen] = useState(true);

  const filterOptions = useMemo(() => jobFeedFilterOptions(initialJobs), [initialJobs]);

  useEffect(() => {
    setSaved(loadSavedIds());
  }, []);

  const jobs = useMemo(() => {
    let list = filterJobFeedItems(initialJobs, filters);
    if (tab === "saved") list = list.filter((j) => saved.has(j.id));
    return list;
  }, [initialJobs, saved, tab, filters]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.q.trim()) n++;
    if (filters.region) n++;
    if (filters.industry) n++;
    if (filters.workMode) n++;
    if (filters.tag) n++;
    if (filters.onlyHighlighted) n++;
    return n;
  }, [filters]);

  async function apply(job: JobFeedItem) {
    setBusyId(job.id);
    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobPostingId: job.id,
        introMessage:
          `Bewerbung auf: «${job.title}» (${job.employer.companyName}). Ich freue mich auf Ihre Rückmeldung.`,
      }),
    });
    setBusyId(null);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      alert(j.error || "Bewerbung fehlgeschlagen.");
      return;
    }
    alert("Bewerbung verschickt. Sie finden den Status unter „Bewerbungen“.");
    window.location.href = "/dashboard/worker/anfragen";
  }

  function bookmark(jobId: string) {
    toggleSaved(jobId);
    setSaved(loadSavedIds());
  }

  return (
    <div className="w-full max-w-[1200px] xl:max-w-none">
      <header className="flex flex-wrap items-center justify-between gap-4 pb-6">
        <div>
          <div className="inline-flex rounded-full border border-[var(--gj-border)] bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setTab("all")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                tab === "all" ? "bg-[var(--gj-primary)] text-white shadow-md" : "text-[var(--gj-muted)]"
              }`}
            >
              Alle Stellen
            </button>
            <button
              type="button"
              onClick={() => setTab("saved")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                tab === "saved"
                  ? "bg-[var(--gj-primary)] text-white shadow-md"
                  : "text-[var(--gj-muted)]"
              }`}
            >
              Gespeichert
            </button>
          </div>
          <p className="mt-4 text-sm text-[var(--gj-muted)]">
            Wir haben <span className="font-semibold text-[var(--gj-primary)]">{jobs.length}</span>{" "}
            {tab === "saved" ? "gespeicherte " : ""}Treffer für Sie.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/worker/anfragen" className="gj-btn-ghost text-sm">
            Meine Bewerbungen
          </Link>
          <Link href="/dashboard/worker/nachrichten" className="gj-btn-ghost text-sm">
            Nachrichten
          </Link>
        </div>
      </header>

      <section className="gj-card p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[var(--gj-text)]">Filter</h2>
          <div className="flex flex-wrap gap-2">
            {activeFilterCount > 0 ? (
              <button
                type="button"
                className="gj-btn-ghost text-xs"
                onClick={() => setFilters(emptyJobFeedFilters())}
              >
                Filter zurücksetzen ({activeFilterCount})
              </button>
            ) : null}
            <button
              type="button"
              className="gj-btn-ghost text-xs"
              onClick={() => setFiltersOpen((v) => !v)}
            >
              {filtersOpen ? "Einklappen" : "Ausklappen"}
            </button>
          </div>
        </div>
        {filtersOpen ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <label className="md:col-span-2 lg:col-span-3">
              <span className="gj-label">Stichwort</span>
              <input
                className="gj-input"
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                placeholder="Titel, Firma, Branche, Tags…"
              />
            </label>
            <label>
              <span className="gj-label">Region</span>
              <select
                className="gj-input"
                value={filters.region}
                onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value }))}
              >
                <option value="">Alle Regionen</option>
                {filterOptions.regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="gj-label">Branche</span>
              <select
                className="gj-input"
                value={filters.industry}
                onChange={(e) => setFilters((f) => ({ ...f, industry: e.target.value }))}
              >
                <option value="">Alle Branchen</option>
                {filterOptions.industries.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="gj-label">Arbeitsmodell</span>
              <select
                className="gj-input"
                value={filters.workMode}
                onChange={(e) => setFilters((f) => ({ ...f, workMode: e.target.value }))}
              >
                <option value="">Alle Modelle</option>
                {filterOptions.workModes.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="gj-label">Tag</span>
              <select
                className="gj-input"
                value={filters.tag}
                onChange={(e) => setFilters((f) => ({ ...f, tag: e.target.value }))}
              >
                <option value="">Alle Tags</option>
                {filterOptions.tags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-end gap-2 pb-1 md:col-span-2">
              <input
                id="only-highlighted"
                type="checkbox"
                checked={filters.onlyHighlighted}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, onlyHighlighted: e.target.checked }))
                }
              />
              <span className="text-sm text-[var(--gj-text-secondary)]">
                Nur hervorgehobene Stellen
              </span>
            </label>
          </div>
        ) : null}
      </section>

      {jobs.length === 0 ? (
        <div className="gj-card p-12 text-center text-sm text-[var(--gj-muted)]">
          Keine passenden Anzeigen. Filter anpassen, Stellen speichern oder Tab wechseln.
        </div>
      ) : (
        <ul className="flex flex-col gap-6">
          {jobs.map((job, idx) => (
            <li key={job.id} className="w-full">
              <article
                className={`gj-card relative overflow-hidden p-5 shadow-md md:p-7 ${
                  job.highlighted
                    ? "border-2 border-[var(--gj-primary)] ring-2 ring-[var(--gj-primary)]/20"
                    : "border-2 border-[var(--gj-primary)]/25"
                }`}
              >
                {idx < 2 ? (
                  <div className="gj-ribbon" style={{ top: 22, left: -36 }}>
                    Top
                  </div>
                ) : null}

                <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                  <EmployerLogo name={job.employer.companyName} logoUrl={job.employer.logoUrl} />

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-bold leading-snug text-[var(--gj-text)] md:text-xl">
                            {job.title}
                          </h2>
                          <span className="gj-chip gj-chip-solid text-[10px] uppercase">Neu</span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-[var(--gj-muted)]">
                          <span className="text-[var(--gj-text)]">{job.employer.companyName}</span> ·{" "}
                          {job.employer.industry}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Speichern"
                        onClick={() => bookmark(job.id)}
                        className={`rounded-xl border px-3 py-2 text-sm transition ${
                          saved.has(job.id)
                            ? "border-[var(--gj-primary)] bg-[var(--gj-primary-soft)] text-[var(--gj-primary)]"
                            : "border-[var(--gj-border-strong)] hover:border-[var(--gj-primary)]"
                        }`}
                      >
                        {saved.has(job.id) ? "★" : "☆"}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="gj-chip">
                        <BriefcaseIcon /> {job.employer.industry}
                      </span>
                      <span className="gj-chip gj-chip-neutral">
                        <MapPinIcon /> {job.employer.region}
                      </span>
                      {job.workModeHint ? (
                        <span className="gj-chip gj-chip-neutral">{job.workModeHint}</span>
                      ) : null}
                      {job.weeklyHoursHint ? (
                        <span className="gj-chip gj-chip-neutral">
                          <ClockIcon /> {job.weeklyHoursHint}
                        </span>
                      ) : null}
                    </div>

                    <SummaryRow job={job} />

                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((t) => (
                        <span key={`${job.id}-${t}`} className="gj-chip gj-chip-neutral text-[11px]">
                          {t}
                        </span>
                      ))}
                    </div>

                    {job.headline ? (
                      <p className="text-sm leading-relaxed text-[var(--gj-text)]/85">{job.headline}</p>
                    ) : null}

                    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--gj-border)] pt-4">
                      <p className="text-xs text-[var(--gj-muted)]">
                        Aktualisiert {new Date(job.updatedAt).toLocaleDateString("de-DE")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setDetail(job)} className="gj-btn-ghost">
                          Details
                        </button>
                        <button
                          type="button"
                          disabled={busyId === job.id}
                          onClick={() => void apply(job)}
                          className="gj-btn-primary"
                        >
                          {busyId === job.id ? "Senden…" : "Bewerben"}
                        </button>
                      </div>
                    </footer>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      <SlideOver title={detail?.title ?? "Details"} open={detail != null} onClose={() => setDetail(null)}>
        {detail ? (
          <div className="space-y-6">
            <div className="flex gap-3">
              <EmployerLogo name={detail.employer.companyName} logoUrl={detail.employer.logoUrl} />
              <div>
                <p className="font-semibold text-[var(--gj-text)]">{detail.employer.companyName}</p>
                <p className="text-sm text-[var(--gj-muted)]">
                  Ansprechpartner: {detail.employer.contactName}
                </p>
              </div>
            </div>
            <SummaryRow job={detail} variant="compact" />
            <div className="flex flex-wrap gap-2">
              {detail.tags.map((t) => (
                <span key={`d-${detail.id}-${t}`} className="gj-chip gj-chip-neutral">
                  {t}
                </span>
              ))}
            </div>
            <section>
              <h3 className="text-sm font-semibold text-[var(--gj-text)]">Über diesen Job</h3>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--gj-text)]/90">
                {detail.richDescription || "Keine weiteren Angaben vom Arbeitgeber."}
              </div>
            </section>
            <div className="flex gap-3">
              <button type="button" className="gj-btn-primary flex-1" onClick={() => void apply(detail)}>
                Bewerben
              </button>
              <button type="button" className="gj-btn-ghost flex-1" onClick={() => setDetail(null)}>
                Schließen
              </button>
            </div>
          </div>
        ) : null}
      </SlideOver>
    </div>
  );
}

function SummaryRow({
  job,
  variant = "default",
}: {
  job: JobFeedItem;
  variant?: "default" | "compact";
}) {
  const rows = [
    job.productCostHint && { label: "Produkte / Projekt", value: job.productCostHint },
    job.commissionHint && { label: "Provision / Bonus", value: job.commissionHint },
    job.targetIncomeHint && { label: "Zieleinkommen", value: job.targetIncomeHint },
  ].filter(Boolean) as { label: string; value: string }[];

  if (!rows.length) return null;

  return (
    <dl
      className={`grid gap-2 rounded-2xl border border-[var(--gj-border-strong)] bg-[var(--gj-primary-softer)]/40 p-4 text-sm ${
        variant === "compact" ? "gap-3" : ""
      }`}
    >
      {rows.map((r) => (
        <div key={r.label + r.value} className="flex justify-between gap-4">
          <dt className="text-[var(--gj-muted)]">{r.label}</dt>
          <dd className="text-right font-medium text-[var(--gj-text)]">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function EmployerLogo({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  const initials = name.slice(0, 2).toUpperCase();
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt=""
        className="mx-auto h-16 w-16 shrink-0 rounded-full object-cover ring-4 ring-white shadow lg:mx-0"
      />
    );
  }
  return (
    <BrandAvatar rounded="full" className="mx-auto h-16 w-16 text-lg lg:mx-0">
      {initials}
    </BrandAvatar>
  );
}
