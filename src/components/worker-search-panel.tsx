"use client";

import { useMemo, useState } from "react";

type WorkerRow = {
  id: string;
  professionField: string;
  experienceYears: number;
  region: string;
  availability: string;
  salaryExpectation: number | null;
  anonymousSlug: string;
  bioPreview: string | null;
};

export function WorkerSearchPanel() {
  const [professionField, setProfessionField] = useState("");
  const [region, setRegion] = useState("");
  const [availability, setAvailability] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [workers, setWorkers] = useState<WorkerRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setIntro] = useState("");

  const salaryParam = useMemo(() => {
    if (!salaryMin && !salaryMax) return "";
    return `${salaryMin || ""}-${salaryMax || ""}`;
  }, [salaryMin, salaryMax]);

  async function search() {
    setLoading(true);
    const q = new URLSearchParams();
    if (professionField) q.set("professionField", professionField);
    if (region) q.set("region", region);
    if (availability) q.set("availability", availability);
    if (salaryParam) q.set("salary", salaryParam);
    const res = await fetch(`/api/workers/search?${q.toString()}`);
    const data = (await res.json()) as { workers?: WorkerRow[] };
    setWorkers(data.workers ?? []);
    setLoading(false);
  }

  async function contact(workerProfileId: string) {
    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workerProfileId,
        introMessage: msg || "Wir möchten Sie kennenlernen.",
      }),
    });
    if (!res.ok) {
      alert("Anfrage fehlgeschlagen.");
      return;
    }
    alert("Anfrage gesendet.");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="block text-zinc-600">Berufsfeld</span>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            value={professionField}
            onChange={(e) => setProfessionField(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="block text-zinc-600">Region</span>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="block text-zinc-600">Verfügbarkeit</span>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder="z. B. ab sofort"
          />
        </label>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <label>
            <span className="block text-zinc-600">Gehalt von (€)</span>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
            />
          </label>
          <label>
            <span className="block text-zinc-600">Gehalt bis (€)</span>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
            />
          </label>
        </div>
      </div>
      <label className="block text-sm">
        <span className="block text-zinc-600">Nachricht an Kandidaten (optional)</span>
        <textarea
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          rows={3}
          value={msg}
          onChange={(e) => setIntro(e.target.value)}
        />
      </label>
      <button
        type="button"
        onClick={() => void search()}
        disabled={loading}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Suche…" : "Suchen"}
      </button>

      {workers && (
        <ul className="space-y-4">
          {workers.length === 0 ? (
            <li className="text-sm text-zinc-500">Keine Treffer.</li>
          ) : (
            workers.map((w) => (
              <li
                key={w.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{w.professionField}</p>
                    <p className="text-sm text-zinc-600">
                      {w.region} · {w.experienceYears} J. Erfahrung ·{" "}
                      {w.availability}
                    </p>
                    <p className="text-sm text-zinc-600">
                      Gehalt:{" "}
                      {w.salaryExpectation != null
                        ? `${w.salaryExpectation.toLocaleString("de-DE")} €`
                        : "nicht öffentlich"}
                    </p>
                    {w.bioPreview && (
                      <p className="mt-2 text-sm text-zinc-700">{w.bioPreview}…</p>
                    )}
                    <p className="mt-2 text-xs text-zinc-500">
                      Öffentliches Profil:{" "}
                      <a className="underline" href={`/p/${w.anonymousSlug}`}>
                        /p/{w.anonymousSlug}
                      </a>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void contact(w.id)}
                    className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white"
                  >
                    Interesse bekunden
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
