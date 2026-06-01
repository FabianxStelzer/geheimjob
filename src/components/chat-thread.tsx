"use client";

import { useEffect, useRef, useState } from "react";
import { BrandAvatar } from "@/components/brand-logo";
import { SendIcon } from "@/components/icons";

type Msg = {
  id: string;
  body: string;
  senderUserId: string;
  createdAt: string;
};

export function ChatThread({
  matchId,
  currentUserId,
  partnerName,
  partnerInitial,
}: {
  matchId: string;
  currentUserId: string;
  partnerName?: string;
  partnerInitial?: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(`/api/chat/${matchId}`);
    if (!res.ok) return;
    const data = (await res.json()) as { messages: Msg[] };
    setMessages(data.messages);
  }

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 4000);
    return () => clearInterval(id);
  }, [matchId]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    const res = await fetch(`/api/chat/${matchId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: t }),
    });
    if (res.ok) {
      setText("");
      void load();
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {partnerName ? (
        <div className="flex items-center gap-3 border-b border-[var(--gj-border)] px-5 py-4">
          <BrandAvatar rounded="full" className="h-10 w-10 text-xs font-semibold">
            {partnerInitial ?? partnerName.slice(0, 2).toUpperCase()}
          </BrandAvatar>
          <div>
            <p className="text-sm font-semibold text-[var(--gj-text)]">{partnerName}</p>
            <p className="text-[11px] text-[var(--gj-muted)]">Online · Sofort-Chat</p>
          </div>
        </div>
      ) : null}

      <div className="flex-1 space-y-3 overflow-y-auto bg-[var(--gj-bg)]/40 px-5 py-5">
        {messages.length === 0 ? (
          <p className="text-center text-xs text-[var(--gj-muted)]">Noch keine Nachrichten.</p>
        ) : (
          messages.map((m) => {
            const mine = m.senderUserId === currentUserId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    mine
                      ? "rounded-br-md bg-[var(--gj-primary)] text-white"
                      : "rounded-bl-md bg-white text-[var(--gj-text)]"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                  <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-[var(--gj-muted)]"}`}>
                    {new Date(m.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottom} />
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-[var(--gj-border)] bg-white p-3">
        <input
          className="gj-input mt-0 flex-1"
          placeholder="Nachricht eingeben…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="gj-btn-primary !p-2.5">
          <SendIcon />
        </button>
      </form>
    </div>
  );
}
