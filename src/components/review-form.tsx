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
    <form onSubmit={submit} className="space-y-3">
      <label>
        <span className="gj-label">Bewertung</span>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="gj-select"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} Sterne
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="gj-label">Kommentar</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="gj-textarea"
        />
      </label>
      <button type="submit" className="gj-btn-primary">
        Bewertung senden
      </button>
    </form>
  );
}
