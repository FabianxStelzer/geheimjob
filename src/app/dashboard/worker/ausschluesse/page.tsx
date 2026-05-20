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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Arbeitgeber ausschließen</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Verhindern Sie, dass ausgewählte Firmen (z. B. Ihr aktueller Arbeitgeber) Ihr Profil sehen
          oder Anfragen senden.
        </p>
      </div>

      <form
        action={addEmployerBlock}
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4"
      >
        <label className="block text-sm">
          <span className="text-zinc-600">Firmenname (Freitext)</span>
          <input name="blockedCompanyName" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" placeholder="z. B. Geheim AG" />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-600">Optional: User-ID des Arbeitgebers (falls bekannt)</span>
          <input name="blockedEmployerUserId" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs" placeholder="cuid…" />
        </label>
        <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">
          Ausschluss speichern
        </button>
      </form>

      <ul className="space-y-3">
        {profile.exclusions.length === 0 ? (
          <li className="text-sm text-zinc-500">Keine Einträge.</li>
        ) : (
          profile.exclusions.map((ex) => (
            <li
              key={ex.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div className="text-sm">
                <p className="font-medium">{ex.blockedCompanyName ?? "—"}</p>
                {ex.blockedEmployerUserId ? (
                  <p className="text-xs text-zinc-500">{ex.blockedEmployerUserId}</p>
                ) : null}
              </div>
              <form action={removeEmployerBlock}>
                <input type="hidden" name="blockId" value={ex.id} />
                <button type="submit" className="text-xs text-red-700 underline">
                  entfernen
                </button>
              </form>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
