"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  id: string;
  body: string;
  senderUserId: string;
  createdAt: string;
};

export function ChatThread({
  matchId,
  currentUserId,
}: {
  matchId: string;
  currentUserId: string;
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
    <div className="flex flex-col gap-4">
      <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-zinc-500">Noch keine Nachrichten.</p>
        ) : (
          messages.map((m) => {
            const mine = m.senderUserId === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    mine
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className="mt-1 text-[10px] opacity-70">
                    {new Date(m.createdAt).toLocaleString("de-DE")}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottom} />
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Nachricht schreiben…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Senden
        </button>
      </form>
    </div>
  );
}
