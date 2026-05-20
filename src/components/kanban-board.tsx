import Link from "next/link";
import type { MatchStatus } from "@prisma/client";
import { CheckIcon, CloseIcon, ChatIcon } from "@/components/icons";
import { MatchRespondButtons } from "@/components/match-respond-buttons";

export type KanbanColumnKey = MatchStatus | "ACCEPTED_INACTIVE";

type KanbanCard = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  introMessage?: string | null;
  status: MatchStatus;
  showRespondButtons?: boolean;
  chatHref?: string;
  detailHref?: string;
};

const COLUMNS: { key: KanbanColumnKey; label: string; accent: string }[] = [
  { key: "PENDING", label: "Offen", accent: "bg-violet-500" },
  { key: "ACCEPTED", label: "Akzeptiert · Chat aktiv", accent: "bg-emerald-500" },
  { key: "REJECTED", label: "Abgelehnt", accent: "bg-rose-500" },
  { key: "WITHDRAWN", label: "Zurückgezogen", accent: "bg-slate-400" },
];

function StatusIcon({ status }: { status: MatchStatus }) {
  if (status === "ACCEPTED") return <CheckIcon className="h-4 w-4 text-emerald-600" />;
  if (status === "REJECTED" || status === "WITHDRAWN") return <CloseIcon className="h-4 w-4 text-rose-600" />;
  return null;
}

export function KanbanBoard({ cards }: { cards: KanbanCard[] }) {
  const grouped: Record<string, KanbanCard[]> = {};
  for (const col of COLUMNS) grouped[col.key] = [];
  for (const card of cards) {
    grouped[card.status]?.push(card);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {COLUMNS.map((col) => {
        const items = grouped[col.key] || [];
        return (
          <section key={col.key} className="flex flex-col">
            <header className="mb-3 flex items-center gap-2 px-1">
              <span className={`h-2.5 w-2.5 rounded-full ${col.accent}`} />
              <h2 className="text-sm font-semibold text-[var(--gj-text)]">{col.label}</h2>
              <span className="ml-1 text-xs text-[var(--gj-muted)]">{items.length}</span>
            </header>
            <div className="flex flex-col gap-3">
              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--gj-border-strong)] p-6 text-center text-xs text-[var(--gj-muted)]">
                  Keine Einträge
                </div>
              ) : (
                items.map((c) => (
                  <article key={c.id} className="gj-card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-[var(--gj-text)]">
                          {c.title}
                        </h3>
                        {c.subtitle ? (
                          <p className="mt-0.5 truncate text-xs text-[var(--gj-muted)]">
                            {c.subtitle}
                          </p>
                        ) : null}
                      </div>
                      <StatusIcon status={c.status} />
                    </div>
                    {c.meta ? (
                      <p className="mt-2 text-[11px] text-[var(--gj-muted)]">{c.meta}</p>
                    ) : null}
                    {c.introMessage ? (
                      <p className="mt-3 line-clamp-3 rounded-lg bg-[var(--gj-primary-softer)] p-2.5 text-xs italic text-[var(--gj-text)]/80">
                        “{c.introMessage}”
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--gj-border)] pt-3">
                      {c.showRespondButtons ? <MatchRespondButtons matchId={c.id} /> : null}
                      {c.chatHref ? (
                        <Link href={c.chatHref} className="gj-btn-primary">
                          <ChatIcon /> Chat
                        </Link>
                      ) : null}
                      {c.detailHref ? (
                        <Link href={c.detailHref} className="gj-btn-ghost">
                          Details
                        </Link>
                      ) : null}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
