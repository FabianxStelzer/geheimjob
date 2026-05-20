import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ChatThread } from "@/components/chat-thread";

type Props = { params: Promise<{ matchId: string }> };

export default async function WorkerChatPage(props: Props) {
  const { matchId } = await props.params;
  const session = await auth();

  const match = await prisma.matchRequest.findUnique({
    where: { id: matchId },
    include: {
      workerProfile: true,
      employerProfile: true,
    },
  });

  if (!match || match.workerProfile.userId !== session!.user.id) {
    notFound();
  }

  if (match.status !== "ACCEPTED") {
    return (
      <p className="text-sm text-zinc-600">
        Chat ist erst nach bestätigtem Match freigeschaltet. Status: {match.status}
      </p>
    );
  }

  const employerUser = await prisma.user.findUnique({
    where: { id: match.employerProfile.userId },
    select: { email: true },
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
      <div>
        <h1 className="text-2xl font-semibold">Chat mit {match.employerProfile.companyName}</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Kontakt nach Match:{" "}
          <span className="font-medium">{match.employerProfile.contactName}</span> ·{" "}
          <a className="underline" href={`mailto:${employerUser?.email}`}>
            {employerUser?.email}
          </a>
        </p>
        <div className="mt-6">
          <ChatThread matchId={match.id} currentUserId={session!.user.id} />
        </div>
      </div>
      <aside className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm shadow-sm">
        <h2 className="font-semibold">Unternehmen</h2>
        <p className="mt-2">{match.employerProfile.companyName}</p>
        <p className="text-zinc-600">{match.employerProfile.region}</p>
        <p className="mt-4 text-xs text-zinc-500">
          Ihr Lebenslauf (PDF) können Sie unter „Profil“ pflegen. Der Arbeitgeber lädt ihn über das
          eigene Dashboard nach bestätigtem Match herunter.
        </p>
      </aside>
    </div>
  );
}
