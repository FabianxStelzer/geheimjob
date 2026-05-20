"use client";

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
        className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white"
      >
        Match bestätigen
      </button>
      <button
        type="button"
        onClick={() => void respond("reject")}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs"
      >
        Ablehnen
      </button>
    </div>
  );
}
