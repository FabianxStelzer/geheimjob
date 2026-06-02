import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addEmployerBlock, removeEmployerBlock } from "@/app/actions/dashboard";

export default async function WorkerBlocksPage() {
  const session = await auth();
  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session!.user.id },
    include: { exclusions: { orderBy: { id: "desc" } } },
  });

  if (!profile) return <p className="text-sm text-red-600">Kein Profil.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Ausschlüsse</h1>
        <p className="mt-2 text-sm text-[var(--gj-muted)]">
          Unternehmen können Sie nicht sehen oder kontaktieren, wenn Firmenname, Webseiten-Domain oder
          Name des Geschäftsführers zu einem Ihrer Ausschlüsse passt — z. B. Ihr aktueller Arbeitgeber.
        </p>
      </header>

      <section className="gj-card p-6">
        <h2 className="text-base font-semibold">Neuer Ausschluss</h2>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          Mindestens ein Feld ausfüllen. Mehrere Angaben erhöhen die Treffsicherheit.
        </p>
        <form action={addEmployerBlock} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="gj-label">Firmenname</span>
            <input
              name="blockedCompanyName"
              className="gj-input"
              placeholder="z. B. Geheim AG"
            />
          </label>
          <label>
            <span className="gj-label">Webseiten-Domain</span>
            <input
              name="blockedWebsiteDomain"
              className="gj-input"
              placeholder="beispiel.de oder www.beispiel.de"
            />
          </label>
          <label>
            <span className="gj-label">Geschäftsführer / Inhaber</span>
            <input
              name="blockedManagingDirectorName"
              className="gj-input"
              placeholder="z. B. Max Mustermann"
            />
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="gj-btn-primary">
              Ausschluss hinzufügen
            </button>
          </div>
        </form>
      </section>

      <section className="gj-card p-6">
        <h2 className="text-base font-semibold">Bestehende Ausschlüsse</h2>
        <ul className="mt-4 divide-y divide-[var(--gj-border)]">
          {profile.exclusions.length === 0 ? (
            <li className="py-4 text-sm text-[var(--gj-muted)]">Keine Einträge.</li>
          ) : (
            profile.exclusions.map((ex) => (
              <li key={ex.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
                <dl className="grid gap-1 text-sm">
                  {ex.blockedCompanyName ? (
                    <div>
                      <dt className="text-[11px] uppercase tracking-wide text-[var(--gj-muted)]">
                        Firma
                      </dt>
                      <dd className="font-medium">{ex.blockedCompanyName}</dd>
                    </div>
                  ) : null}
                  {ex.blockedWebsiteDomain ? (
                    <div>
                      <dt className="text-[11px] uppercase tracking-wide text-[var(--gj-muted)]">
                        Domain
                      </dt>
                      <dd>{ex.blockedWebsiteDomain}</dd>
                    </div>
                  ) : null}
                  {ex.blockedManagingDirectorName ? (
                    <div>
                      <dt className="text-[11px] uppercase tracking-wide text-[var(--gj-muted)]">
                        Geschäftsführer
                      </dt>
                      <dd>{ex.blockedManagingDirectorName}</dd>
                    </div>
                  ) : null}
                </dl>
                <form action={removeEmployerBlock}>
                  <input type="hidden" name="blockId" value={ex.id} />
                  <button type="submit" className="gj-btn-danger">
                    Entfernen
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
