"use client";

import { useState } from "react";

export function ReviewForm() {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    if (res.ok) setDone(true);
  }

  if (done) {
    return <p className="text-sm text-emerald-700">Danke für Ihre Bewertung.</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
      <label className="block text-sm">
        <span className="text-zinc-600">Bewertung (Prozess / Plattform)</span>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} Sterne
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-zinc-600">Kommentar</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>
      <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">
        Bewertung senden
      </button>
    </form>
  );
}
