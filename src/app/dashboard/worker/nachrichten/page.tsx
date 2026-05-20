import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EmptyConversation, MessagesShell, type ChatListItem } from "@/components/messages-shell";
import { redirect } from "next/navigation";

function fmt(d: Date) {
  const diff = Date.now() - d.getTime();
  const min = 60_000;
  if (diff < 60 * min) return `${Math.max(1, Math.floor(diff / min))}m`;
  if (diff < 24 * 60 * min) return `${Math.floor(diff / (60 * min))}h`;
  if (diff < 30 * 24 * 60 * min) return `${Math.floor(diff / (24 * 60 * min))}d`;
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

export default async function WorkerMessagesIndex() {
  const session = await auth();

  const matches = await prisma.matchRequest.findMany({
    where: { workerProfile: { userId: session!.user.id } },
    include: {
      employerProfile: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (matches.length === 0) {
    return (
      <MessagesShell items={[]} basePath="/dashboard/worker/chat">
        <EmptyConversation />
      </MessagesShell>
    );
  }

  // Auto-select first accepted chat if any, else first match.
  const firstAccepted = matches.find((m) => m.status === "ACCEPTED");
  const first = firstAccepted || matches[0];
  if (first.status === "ACCEPTED") {
    redirect(`/dashboard/worker/chat/${first.id}`);
  }

  const items: ChatListItem[] = matches.map((m) => ({
    matchId: m.id,
    title: m.employerProfile.companyName,
    preview: m.messages[0]?.body ?? m.introMessage ?? "Anfrage gesendet",
    updatedAt: fmt(m.updatedAt),
    status: m.status,
  }));

  return (
    <MessagesShell items={items} basePath="/dashboard/worker/chat">
      <EmptyConversation />
    </MessagesShell>
  );
}
