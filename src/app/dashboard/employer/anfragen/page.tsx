import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { recipientUserId } from "@/lib/match";
import { MatchRespondButtons } from "@/components/match-respond-buttons";

export default async function EmployerMatchesPage() {
  const session = await auth();
  const matches = await prisma.matchRequest.findMany({
    where: { employerProfile: { userId: session!.user.id } },
    include: { employerProfile: true, workerProfile: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Anfragen & Matches</h1>
      </header>
      <ul className="space-y-4">
        {matches.map((m) => {
          const rec = recipientUserId(m);
          const showRespond = m.status === "PENDING" && session!.user.id === rec;
          return (
            <li key={m.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{m.workerProfile.professionField}</p>
                  <p className="text-xs text-zinc-500">{m.status}</p>
                  {m.introMessage ? (
                    <p className="mt-3 text-sm text-zinc-700 whitespace-pre-wrap">{m.introMessage}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-zinc-500">
                    Öffentliches Profil:{" "}
                    <Link href={`/p/${m.workerProfile.anonymousSlug}`} className="underline">
                      /p/{m.workerProfile.anonymousSlug}
                    </Link>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {m.status === "ACCEPTED" ? (
                    <Link
                      href={`/dashboard/employer/chat/${m.id}`}
                      className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white"
                    >
                      Zum Chat
                    </Link>
                  ) : null}
                  {showRespond ? <MatchRespondButtons matchId={m.id} /> : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
