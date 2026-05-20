import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { deleteJobPosting, upsertJobPosting } from "@/app/actions/jobs";

export default async function EmployerStellenPage() {
  const session = await auth();
  const employer = await prisma.employerProfile.findUnique({
    where: { userId: session!.user.id },
    include: {
      jobPostings: { orderBy: { updatedAt: "desc" } },
    },
  });

  if (!employer) return <p className="text-sm text-red-600">Kein Unternehmensprofil.</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Stellen veröffentlichen</h1>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          Veröffentlichte Jobs erscheinen in der Arbeitnehmer-Job-Suche (ganze Breite, Detail-Drawer beim
          Klick wie bei ProviPanda).
        </p>
      </header>

      <details className="gj-card group-open:shadow-md" open>
        <summary className="cursor-pointer select-none px-5 py-4 text-base font-semibold">
          Neue Stellenanzeige
        </summary>
        <div className="border-t border-[var(--gj-border)] px-5 py-4">
          <JobForm hint="Nach dem Speichern erscheint die Stelle erst mit „Veröffentlichen“ bei den Kandidat:innen." />
        </div>
      </details>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--gj-muted)]">
          Ihre Ausschreibungen ({employer.jobPostings.length})
        </h2>
        {employer.jobPostings.length === 0 ? (
          <p className="text-sm text-[var(--gj-muted)]">Noch keine Einträge.</p>
        ) : (
          <ul className="space-y-3">
            {employer.jobPostings.map((j) => (
              <li key={j.id}>
                <details className="gj-card">
                  <summary className="cursor-pointer select-none px-5 py-3 text-sm font-medium">
                    <span>{j.title}</span>
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        j.published
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-zinc-100 text-[var(--gj-muted)]"
                      }`}
                    >
                      {j.published ? "Live" : "Entwurf"}
                    </span>
                  </summary>
                  <div className="border-t border-[var(--gj-border)] px-5 py-4">
                    <JobForm
                      job={{
                        id: j.id,
                        title: j.title,
                        headline: j.headline,
                        tags: j.tags,
                        productCostHint: j.productCostHint,
                        commissionHint: j.commissionHint,
                        targetIncomeHint: j.targetIncomeHint,
                        workModeHint: j.workModeHint,
                        weeklyHoursHint: j.weeklyHoursHint,
                        richDescription: j.richDescription,
                        published: j.published,
                      }}
                    />
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function JobForm({
  job,
  hint,
}: {
  job?: {
    id: string;
    title: string;
    headline: string | null;
    tags: string;
    productCostHint: string | null;
    commissionHint: string | null;
    targetIncomeHint: string | null;
    workModeHint: string | null;
    weeklyHoursHint: string | null;
    richDescription: string;
    published: boolean;
  };
  hint?: string;
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
          <span className="gj-label">Zieleinkommen</span>
          <input name="targetIncomeHint" className="gj-input" defaultValue={job?.targetIncomeHint ?? ""} placeholder="€75.000/Jahr" />
        </label>
        <label>
          <span className="gj-label">Arbeitsmodell</span>
          <input name="workModeHint" className="gj-input" defaultValue={job?.workModeHint ?? ""} placeholder="Hybrid / Remote" />
        </label>
        <label className="md:col-span-2">
          <span className="gj-label">Wochenstunden</span>
          <input name="weeklyHoursHint" className="gj-input" defaultValue={job?.weeklyHoursHint ?? ""} placeholder="40 Stunden / Wo" />
        </label>
        <label className="md:col-span-2">
          <span className="gj-label">Vollständige Jobbeschreibung</span>
          <textarea
            name="richDescription"
            rows={12}
            className="gj-textarea"
            defaultValue={job?.richDescription ?? ""}
          />
        </label>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" name="published" defaultChecked={job?.published ?? false} /> Veröffentlicht
          (sichtbar für Arbeitnehmer)
        </label>
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
