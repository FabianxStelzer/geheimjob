import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addEmployerBlock, removeEmployerBlock } from "@/app/actions/dashboard";

export default async function WorkerBlocksPage() {
  const session = await auth();
  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session!.user.id },
    include: { exclusions: true },
  });

  if (!profile) return <p className="text-sm text-red-600">Kein Profil.</p>;

  return (
    <div className="space-y-6">
      <p>
        <Link href="/dashboard/worker/profil" className="text-sm text-[var(--gj-primary)] hover:underline">
          ← Zurück zum Profil
        </Link>
      </p>

      <section className="gj-card p-6">
        <h2 className="text-base font-semibold">Neuer Ausschluss</h2>
        <p className="mt-1 text-sm text-[var(--gj-muted)]">
          Verhindern Sie, dass eine Firma Ihr Profil sieht oder Sie kontaktiert.
        </p>
        <form action={addEmployerBlock} className="mt-4 space-y-4">
          <label>
            <span className="gj-label">Firmenname (Freitext)</span>
            <input name="blockedCompanyName" className="gj-input" placeholder="z. B. Geheim AG" />
          </label>
          <label>
            <span className="gj-label">Optional: User-ID des Arbeitgebers</span>
            <input name="blockedEmployerUserId" className="gj-input font-mono text-xs" placeholder="cuid…" />
          </label>
          <button type="submit" className="gj-btn-primary">
            Ausschluss hinzufügen
          </button>
        </form>
      </section>

      <section className="gj-card p-6">
        <h2 className="text-base font-semibold">Bestehende Ausschlüsse</h2>
        <ul className="mt-4 divide-y divide-[var(--gj-border)]">
          {profile.exclusions.length === 0 ? (
            <li className="py-4 text-sm text-[var(--gj-muted)]">Keine Einträge.</li>
          ) : (
            profile.exclusions.map((ex) => (
              <li key={ex.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="text-sm">
                  <p className="font-medium">{ex.blockedCompanyName ?? "—"}</p>
                  {ex.blockedEmployerUserId ? (
                    <p className="text-xs text-[var(--gj-muted)]">{ex.blockedEmployerUserId}</p>
                  ) : null}
                </div>
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
