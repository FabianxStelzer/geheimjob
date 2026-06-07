import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { deleteJobPosting, upsertJobPosting } from "@/app/actions/jobs";
import { getEmployerEntitlements } from "@/lib/employer-billing";
import { getEmployerJobPostingStats } from "@/lib/job-posting-stats";
import { JobStatsCompact, JobStatsGrid } from "@/components/job-posting-stats";
import { EMPLOYMENT_KIND_OPTIONS } from "@/lib/employment-kinds";
import { RichTextEditor } from "@/components/rich-text-editor";

export default async function EmployerStellenPage() {
  const session = await auth();
  const ent = await getEmployerEntitlements(session!.user.id);
  const employer = await prisma.employerProfile.findUnique({
    where: { userId: session!.user.id },
    include: {
      jobPostings: { orderBy: { updatedAt: "desc" } },
    },
  });

  if (!employer) return <p className="text-sm text-red-600">Kein Unternehmensprofil.</p>;

  const analytics = await getEmployerJobPostingStats(employer.id);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Stellenanzeigen</h1>
          <p className="mt-1 text-sm text-[var(--gj-muted)]">
            {ent.canPublishJobs ? (
              <>
                <span className="gj-chip gj-chip-solid mr-2">{ent.planName}</span>
                Stellen: {ent.publishedJobsCount} / {ent.maxPublishedJobs} veröffentlicht
              </>
            ) : (
              "Ihr Paket enthält keine Stellenanzeigen (Starter). Bitte Plus oder Premium unter Pakete buchen."
            )}
          </p>
        </div>
        {employer.jobPostings.length > 0 ? (
          <Link href="/dashboard/employer/anfragen" className="gj-btn-ghost text-sm">
            Bewerbungen ansehen →
          </Link>
        ) : null}
      </header>

      {employer.jobPostings.length > 0 ? (
        <section className="gj-card p-5 md:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--gj-muted)]">
            Auswertung (alle Stellen)
          </h2>
          <p className="mt-1 text-xs text-[var(--gj-muted)]">
            Aufrufe zählen, wenn Kandidaten die Detail-Ansicht einer Stelle öffnen.
          </p>
          <div className="mt-4">
            <JobStatsGrid stats={analytics.totals} />
          </div>
        </section>
      ) : null}

      <details className="gj-card group-open:shadow-md">
        <summary className="cursor-pointer select-none px-5 py-4 text-base font-semibold">
          + Neue Stellenanzeige
        </summary>
        <div className="border-t border-[var(--gj-border)] px-5 py-4">
          <JobForm
            canHighlight={ent.canHighlightJobs}
            hint="Nach dem Speichern erscheint die Stelle erst mit „Veröffentlichen“ bei den Kandidat:innen."
          />
        </div>
      </details>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--gj-muted)]">
          Ihre Ausschreibungen ({employer.jobPostings.length})
        </h2>
        {employer.jobPostings.length === 0 ? (
          <p className="gj-card p-8 text-center text-sm text-[var(--gj-muted)]">
            Noch keine Einträge — legen Sie oben Ihre erste Stelle an.
          </p>
        ) : (
          <ul className="space-y-4">
            {employer.jobPostings.map((j) => {
              const stats = analytics.byJobId[j.id];
              return (
                <li key={j.id} className="gj-card overflow-hidden">
                  <div className="border-b border-[var(--gj-border)] px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-[var(--gj-text)]">{j.title}</h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                              j.published
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-zinc-100 text-[var(--gj-muted)]"
                            }`}
                          >
                            {j.published ? "Live" : "Entwurf"}
                          </span>
                          {j.highlighted ? (
                            <span className="rounded-full bg-[var(--gj-primary-softer)] px-2 py-0.5 text-[10px] font-semibold text-[var(--gj-primary)]">
                              Hervorgehoben
                            </span>
                          ) : null}
                        </div>
                        {j.headline ? (
                          <p className="mt-1 text-sm text-[var(--gj-muted)]">{j.headline}</p>
                        ) : null}
                        <p className="mt-2 text-xs text-[var(--gj-muted)]">
                          Zuletzt bearbeitet{" "}
                          {new Date(j.updatedAt).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    {stats ? (
                      <div className="mt-4">
                        <JobStatsCompact stats={stats} />
                      </div>
                    ) : null}
                  </div>
                  <details className="group">
                    <summary className="cursor-pointer select-none px-5 py-3 text-sm font-medium text-[var(--gj-primary)] hover:bg-[var(--gj-bg)]/50">
                      Anzeige bearbeiten
                    </summary>
                    <div className="border-t border-[var(--gj-border)] px-5 py-4">
                      <JobForm
                        canHighlight={ent.canHighlightJobs}
                        job={{
                          id: j.id,
                          title: j.title,
                          headline: j.headline,
                          tags: j.tags,
                          productCostHint: j.productCostHint,
                          commissionHint: j.commissionHint,
                          targetIncomeHint: j.targetIncomeHint,
                          targetIncomeKind: j.targetIncomeKind,
                          workModeHint: j.workModeHint,
                          workLocationsHint: j.workLocationsHint,
                          startDateHint: j.startDateHint,
                          contractTermHint: j.contractTermHint,
                          weeklyHoursHint: j.weeklyHoursHint,
                          employmentKind: j.employmentKind,
                          richDescription: j.richDescription,
                          published: j.published,
                          highlighted: j.highlighted,
                        }}
                      />
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function JobForm({
  job,
  hint,
  canHighlight,
}: {
  job?: {
    id: string;
    title: string;
    headline: string | null;
    tags: string;
    productCostHint: string | null;
    commissionHint: string | null;
    targetIncomeHint: string | null;
    targetIncomeKind: "BRUTTO" | "NETTO";
    workModeHint: string | null;
    workLocationsHint: string | null;
    startDateHint: string | null;
    contractTermHint: string | null;
    weeklyHoursHint: string | null;
    employmentKind: string | null;
    richDescription: string;
    published: boolean;
    highlighted: boolean;
  };
  hint?: string;
  canHighlight?: boolean;
}) {
  return (
    <div className="space-y-4">
      {hint ? <p className="text-xs text-[var(--gj-muted)]">{hint}</p> : null}

      <form action={upsertJobPosting} className="grid gap-4 md:grid-cols-2">
        {job ? <input type="hidden" name="id" value={job.id} /> : null}
        <label className="md:col-span-2">
          <span className="gj-label">Rollentitel · Überschrift</span>
          <input name="title" required className="gj-input" defaultValue={job?.title ?? ""} maxLength={280} placeholder="z. B. Setter (m/w/d) — Remote, Fixum & Provision" />
        </label>
        <label className="md:col-span-2">
          <span className="gj-label">Einzeiler für die Liste (optional)</span>
          <input name="headline" className="gj-input" defaultValue={job?.headline ?? ""} placeholder="Kurz zusammengefasst — erscheint unter dem Titel" />
        </label>
        <label className="md:col-span-2">
          <span className="gj-label">Tags (mit | oder Komma)</span>
          <input name="tags" className="gj-input" defaultValue={job?.tags ?? ""} placeholder="Freiberuflich | Full-Remote | Fixum €2000" />
        </label>
        <label>
          <span className="gj-label">Projekt-/Produktdetails</span>
          <input name="productCostHint" className="gj-input" defaultValue={job?.productCostHint ?? ""} />
        </label>
        <label>
          <span className="gj-label">Provision</span>
          <input name="commissionHint" className="gj-input" defaultValue={job?.commissionHint ?? ""} />
        </label>
        <label>
          <span className="gj-label">Zieleinkommen (€)</span>
          <input
            name="targetIncomeHint"
            className="gj-input"
            defaultValue={job?.targetIncomeHint ?? ""}
            placeholder="75.000/Jahr oder 5.000/Monat"
          />
        </label>
        <label>
          <span className="gj-label">Angabe als</span>
          <select
            name="targetIncomeKind"
            className="gj-input"
            defaultValue={job?.targetIncomeKind ?? "BRUTTO"}
          >
            <option value="BRUTTO">Brutto</option>
            <option value="NETTO">Netto</option>
          </select>
        </label>
        <label>
          <span className="gj-label">Arbeitsmodell</span>
          <input name="workModeHint" className="gj-input" defaultValue={job?.workModeHint ?? ""} placeholder="Hybrid / Remote" />
        </label>
        <label>
          <span className="gj-label">Arbeitsorte</span>
          <input
            name="workLocationsHint"
            className="gj-input"
            defaultValue={job?.workLocationsHint ?? ""}
            placeholder="z. B. Berlin, Hamburg, bundesweit remote"
          />
        </label>
        <label>
          <span className="gj-label">Beginn</span>
          <input
            name="startDateHint"
            className="gj-input"
            defaultValue={job?.startDateHint ?? ""}
            placeholder="z. B. ab sofort, 01.09.2026"
          />
        </label>
        <label>
          <span className="gj-label">Befristung</span>
          <input
            name="contractTermHint"
            className="gj-input"
            defaultValue={job?.contractTermHint ?? ""}
            placeholder="z. B. unbefristet, 2 Jahre befristet"
          />
        </label>
        <label>
          <span className="gj-label">Beschäftigungsart</span>
          <select name="employmentKind" className="gj-input" defaultValue={job?.employmentKind ?? ""}>
            <option value="">Bitte wählen…</option>
            {EMPLOYMENT_KIND_OPTIONS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
        </label>
        <label className="md:col-span-2">
          <span className="gj-label">Wochenstunden</span>
          <input name="weeklyHoursHint" className="gj-input" defaultValue={job?.weeklyHoursHint ?? ""} placeholder="40 Stunden / Wo" />
        </label>
        <div className="md:col-span-2">
          <span className="gj-label">Vollständige Jobbeschreibung</span>
          <p className="mb-2 text-xs text-[var(--gj-muted)]">
            Formatierung mit Fett, Kursiv, Farbe und Aufzählungen möglich.
          </p>
          <RichTextEditor name="richDescription" defaultValue={job?.richDescription ?? ""} rows={12} />
        </div>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" name="published" defaultChecked={job?.published ?? false} /> Veröffentlicht
          (sichtbar für Arbeitnehmer)
        </label>
        {canHighlight ? (
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" name="highlighted" defaultChecked={job?.highlighted ?? false} /> Hervorgehoben
            in der Job-Suche
          </label>
        ) : null}
        <div className="md:col-span-2 flex flex-wrap gap-2">
          <button type="submit" className="gj-btn-primary">
            Speichern
          </button>
        </div>
      </form>

      {job ? (
        <form action={deleteJobPosting} className="pt-2">
          <input type="hidden" name="id" value={job.id} />
          <button type="submit" className="gj-btn-danger">
            Anzeige löschen
          </button>
        </form>
      ) : null}
    </div>
  );
}
