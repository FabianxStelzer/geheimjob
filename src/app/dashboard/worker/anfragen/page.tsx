import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { recipientUserId } from "@/lib/match";
import { KanbanBoard } from "@/components/kanban-board";

export default async function WorkerAnfragenPage() {
  const session = await auth();
  const matches = await prisma.matchRequest.findMany({
    where: { workerProfile: { userId: session!.user.id } },
    include: { employerProfile: true, workerProfile: true },
    orderBy: { createdAt: "desc" },
  });

  const cards = matches.map((m) => {
    const rec = recipientUserId(m);
    const isRecipient = session!.user.id === rec;
    return {
      id: m.id,
      title: m.employerProfile.companyName,
      subtitle: `${m.employerProfile.industry} · ${m.employerProfile.region}`,
      meta: m.createdAt.toLocaleDateString("de-DE"),
      introMessage: m.introMessage,
      status: m.status,
      showRespondButtons: m.status === "PENDING" && isRecipient,
      chatHref: m.status === "ACCEPTED" ? `/dashboard/worker/chat/${m.id}` : undefined,
    };
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--gj-muted)]">
        {matches.length} Anfragen · Erst nach Bestätigung wird der Kontakt freigeschaltet.
      </p>
      <KanbanBoard cards={cards} />
    </div>
  );
}
