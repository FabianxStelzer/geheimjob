import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ChatThread } from "@/components/chat-thread";
import { MessagesShell, type ChatListItem } from "@/components/messages-shell";
import { BriefcaseIcon, MapPinIcon } from "@/components/icons";

type Props = { params: Promise<{ matchId: string }> };

function fmt(d: Date) {
  const diff = Date.now() - d.getTime();
  const min = 60_000;
  if (diff < 60 * min) return `${Math.max(1, Math.floor(diff / min))}m`;
  if (diff < 24 * 60 * min) return `${Math.floor(diff / (60 * min))}h`;
  if (diff < 30 * 24 * 60 * min) return `${Math.floor(diff / (24 * 60 * min))}d`;
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

export default async function WorkerChatPage(props: Props) {
  const { matchId } = await props.params;
  const session = await auth();

  const match = await prisma.matchRequest.findUnique({
    where: { id: matchId },
    include: { workerProfile: true, employerProfile: true },
  });

  if (!match || match.workerProfile.userId !== session!.user.id) notFound();

  const allMatches = await prisma.matchRequest.findMany({
    where: { workerProfile: { userId: session!.user.id } },
    include: { employerProfile: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  });

  const items: ChatListItem[] = allMatches.map((m) => ({
    matchId: m.id,
    title: m.employerProfile.companyName,
    preview: m.messages[0]?.body ?? m.introMessage ?? "Anfrage gesendet",
    updatedAt: fmt(m.updatedAt),
    status: m.status,
  }));

  const employerUser = await prisma.user.findUnique({
    where: { id: match.employerProfile.userId },
    select: { email: true },
  });

  if (match.status !== "ACCEPTED") {
    return (
      <MessagesShell items={items} basePath="/dashboard/worker/chat" activeMatchId={match.id}>
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            {match.status === "PENDING" ? "Warte auf Bestätigung" : match.status}
          </div>
          <p className="text-sm text-[var(--gj-muted)]">
            Der Chat wird erst nach Bestätigung des Matches freigeschaltet.
          </p>
        </div>
      </MessagesShell>
    );
  }

  return (
    <div className="flex min-h-[min(640px,calc(100dvh-10rem))] max-h-[calc(100dvh-10rem)] flex-col gap-4 lg:flex-row lg:gap-5">
      <aside className="gj-card flex max-h-[min(360px,40vh)] min-h-0 w-full shrink-0 flex-col overflow-hidden lg:max-h-none lg:h-auto lg:w-[260px]">
        <ul className="flex-1 overflow-y-auto p-2">
          {items.map((it) => {
            const active = it.matchId === match.id;
            return (
              <li key={it.matchId}>
                <Link
                  href={`/dashboard/worker/chat/${it.matchId}`}
                  className={`block rounded-xl px-3 py-2.5 ${active ? "bg-[var(--gj-primary-softer)]" : "hover:bg-[var(--gj-primary-softer)]"}`}
                >
                  <p className="truncate text-sm font-semibold">{it.title}</p>
                  <p className="truncate text-xs text-[var(--gj-muted)]">{it.preview}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="gj-card flex min-h-[280px] min-w-0 flex-1 flex-col overflow-hidden lg:min-h-0">
        <ChatThread
          matchId={match.id}
          currentUserId={session!.user.id}
          partnerName={match.employerProfile.companyName}
        />
      </section>

      <aside className="gj-card hidden min-h-0 w-full shrink-0 flex-col overflow-y-auto p-5 lg:flex lg:w-[280px]">
        <p className="text-xs uppercase tracking-wider text-[var(--gj-muted)]">Unternehmen</p>
        <h2 className="mt-2 text-lg font-semibold">{match.employerProfile.companyName}</h2>
        <p className="mt-3 flex items-center gap-2 text-sm text-[var(--gj-muted)]">
          <BriefcaseIcon className="h-4 w-4" /> {match.employerProfile.industry}
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm text-[var(--gj-muted)]">
          <MapPinIcon /> {match.employerProfile.region}
        </p>
        <div className="mt-5 rounded-xl bg-[var(--gj-primary-softer)] p-3">
          <p className="text-xs font-semibold text-[var(--gj-primary)]">Ansprechpartner</p>
          <p className="mt-1 text-sm text-[var(--gj-text)]">{match.employerProfile.contactName}</p>
          {employerUser?.email ? (
            <a href={`mailto:${employerUser.email}`} className="mt-1 block text-xs text-[var(--gj-primary)] hover:underline">
              {employerUser.email}
            </a>
          ) : null}
        </div>
        {match.employerProfile.openPositionsNote ? (
          <div className="mt-5 border-t border-[var(--gj-border)] pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gj-muted)]">Offene Stellen</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--gj-text)]/80">
              {match.employerProfile.openPositionsNote}
            </p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
