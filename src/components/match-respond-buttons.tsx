"use client";

import { CheckIcon, CloseIcon } from "@/components/icons";

export function MatchRespondButtons({ matchId }: { matchId: string }) {
  async function respond(decision: "accept" | "reject") {
    const res = await fetch(`/api/matches/${matchId}/respond`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    if (!res.ok) {
      alert("Aktion fehlgeschlagen.");
      return;
    }
    window.location.reload();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => void respond("accept")}
        className="gj-btn-primary"
      >
        <CheckIcon /> Annehmen
      </button>
      <button
        type="button"
        onClick={() => void respond("reject")}
        className="gj-btn-danger"
      >
        <CloseIcon /> Ablehnen
      </button>
    </div>
  );
}
