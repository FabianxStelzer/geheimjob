"use client";

import Link from "next/link";
import { useState } from "react";
import { ChatIcon } from "@/components/icons";

export type ChatListItem = {
  matchId: string;
  title: string;
  preview: string;
  updatedAt: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
};

const STATUS_DOT: Record<ChatListItem["status"], string> = {
  PENDING: "bg-amber-400",
  ACCEPTED: "bg-emerald-500",
  REJECTED: "bg-rose-400",
  WITHDRAWN: "bg-slate-400",
};

export function MessagesShell({
  items,
  basePath,
  activeMatchId,
  children,
}: {
  items: ChatListItem[];
  basePath: string;
  activeMatchId?: string;
  children: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const filtered = items.filter((i) =>
    i.title.toLowerCase().includes(query.toLowerCase()) || i.preview.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="grid h-[calc(100vh-9rem)] grid-cols-1 gap-4 md:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="gj-card flex min-h-0 flex-col">
        <div className="border-b border-[var(--gj-border)] p-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suche Nachrichten…"
            className="gj-input mt-0"
          />
        </div>
        <ul className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-xs text-[var(--gj-muted)]">
              Keine Konversationen
            </li>
          ) : (
            filtered.map((it) => {
              const active = it.matchId === activeMatchId;
              return (
                <li key={it.matchId}>
                  <Link
                    href={`${basePath}/${it.matchId}`}
                    className={`flex items-start gap-3 rounded-xl px-3 py-3 transition-colors ${
                      active
                        ? "bg-[var(--gj-primary-softer)] ring-1 ring-[var(--gj-primary)]/30"
                        : "hover:bg-[var(--gj-primary-softer)]"
                    }`}
                  >
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[it.status]}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-[var(--gj-text)]">{it.title}</p>
                        <span className="shrink-0 text-[10px] text-[var(--gj-muted)]">{it.updatedAt}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[var(--gj-muted)]">{it.preview}</p>
                    </div>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      </aside>

      <section className="gj-card flex min-h-0 flex-col overflow-hidden">{children}</section>
    </div>
  );
}

export function EmptyConversation() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-sm text-[var(--gj-muted)]">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--gj-primary-soft)] text-[var(--gj-primary)]">
        <ChatIcon />
      </span>
      <p className="font-medium">Keine Konversation ausgewählt</p>
      <p className="text-xs">Wähle einen Chat aus, um Nachrichten anzuzeigen.</p>
    </div>
  );
}
