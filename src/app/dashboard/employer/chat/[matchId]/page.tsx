import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ChatThread } from "@/components/chat-thread";

type Props = { params: Promise<{ matchId: string }> };

export default async function EmployerChatPage(props: Props) {
  const { matchId } = await props.params;
  const session = await auth();

  const match = await prisma.matchRequest.findUnique({
    where: { id: matchId },
    include: {
      workerProfile: true,
      employerProfile: true,
    },
  });

  if (!match || match.employerProfile.userId !== session!.user.id) {
    notFound();
  }

  if (match.status !== "ACCEPTED") {
    return (
      <p className="text-sm text-zinc-600">
        Chat erst nach Match-Freigabe. Status: {match.status}
      </p>
    );
  }

  const workerUser = await prisma.user.findUnique({
    where: { id: match.workerProfile.userId },
    select: { email: true },
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
      <div>
        <h1 className="text-2xl font-semibold">
          Chat mit {match.workerProfile.professionField}
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Kontakt:{" "}
          <span className="font-medium">{match.workerProfile.displayName}</span> ·{" "}
          <a className="underline" href={`mailto:${workerUser?.email}`}>
            {workerUser?.email}
          </a>
        </p>
        <div className="mt-6">
          <ChatThread matchId={match.id} currentUserId={session!.user.id} />
        </div>
      </div>
      <aside className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm shadow-sm space-y-4">
        <div>
          <h2 className="font-semibold">Lebenslauf</h2>
          <Link href={`/api/cv/match/${match.id}`} className="mt-2 inline-block text-emerald-700 underline">
            PDF herunterladen
          </Link>
        </div>
        {match.workerProfile.videoIntroUrl ? (
          <div>
            <h2 className="font-semibold">Kurzvideo</h2>
            <video className="mt-2 w-full rounded-xl border border-zinc-200" controls src={match.workerProfile.videoIntroUrl} />
          </div>
        ) : null}
      </aside>
    </div>
  );
}
