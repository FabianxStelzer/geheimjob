"use client";

import { useMemo, useState } from "react";

type EmployerRow = {
  id: string;
  companyName: string;
  industry: string;
  region: string;
  openPositionsNote: string | null;
};

export function EmployerBrowsePanel() {
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [employers, setEmployers] = useState<EmployerRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const qs = useMemo(() => {
    const q = new URLSearchParams();
    if (industry) q.set("industry", industry);
    if (region) q.set("region", region);
    return q.toString();
  }, [industry, region]);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/employers?${qs}`);
    const data = (await res.json()) as { employers?: EmployerRow[] };
    setEmployers(data.employers ?? []);
    setLoading(false);
  }

  async function apply(employerProfileId: string) {
    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employerProfileId,
        introMessage: msg || "Ich möchte mich bei Ihnen bewerben.",
      }),
    });
    if (!res.ok) alert("Anfrage fehlgeschlagen.");
    else alert("Anfrage gesendet.");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="text-zinc-600">Branche</span>
          <input className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" value={industry} onChange={(e) => setIndustry(e.target.value)} />
        </label>
        <label className="text-sm">
          <span className="text-zinc-600">Region</span>
          <input className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" value={region} onChange={(e) => setRegion(e.target.value)} />
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-zinc-600">Anschreiben (optional)</span>
        <textarea rows={3} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" value={msg} onChange={(e) => setMsg(e.target.value)} />
      </label>
      <button
        type="button"
        disabled={loading}
        onClick={() => void load()}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Lädt…" : "Unternehmen laden"}
      </button>

      {employers && (
        <ul className="space-y-3">
          {employers.length === 0 ? (
            <li className="text-sm text-zinc-500">Keine Treffer.</li>
          ) : (
            employers.map((em) => (
              <li key={em.id} className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{em.companyName}</p>
                    <p className="text-sm text-zinc-600">
                      {em.industry} · {em.region}
                    </p>
                    {em.openPositionsNote ? (
                      <p className="mt-2 text-sm text-zinc-700">{em.openPositionsNote}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => void apply(em.id)}
                    className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white"
                  >
                    Interesse zeigen
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
