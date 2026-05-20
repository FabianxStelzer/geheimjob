"use client";

import { useEffect, useMemo, useState } from "react";
import { CandidateCard, type CandidateCardData } from "@/components/candidate-card";

export function CandidateSearch() {
  const [professionField, setProfessionField] = useState("");
  const [region, setRegion] = useState("");
  const [availability, setAvailability] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [workers, setWorkers] = useState<CandidateCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const salaryParam = useMemo(() => {
    if (!salaryMin && !salaryMax) return "";
    return `${salaryMin || ""}-${salaryMax || ""}`;
  }, [salaryMin, salaryMax]);

  async function load() {
    setLoading(true);
    const q = new URLSearchParams();
    if (professionField) q.set("professionField", professionField);
    if (region) q.set("region", region);
    if (availability) q.set("availability", availability);
    if (salaryParam) q.set("salary", salaryParam);
    const res = await fetch(`/api/workers/search?${q.toString()}`);
    const data = (await res.json()) as { workers?: CandidateCardData[] };
    setWorkers(data.workers ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void load();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="gj-card p-4 md:p-6">
        <div className="grid gap-3 md:grid-cols-5">
          <label className="md:col-span-2">
            <span className="gj-label">Berufsfeld</span>
            <input className="gj-input" value={professionField} onChange={(e) => setProfessionField(e.target.value)} placeholder="z. B. Vertrieb" />
          </label>
          <label>
            <span className="gj-label">Region</span>
            <input className="gj-input" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Berlin" />
          </label>
          <label>
            <span className="gj-label">Verfügbarkeit</span>
            <input className="gj-input" value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="ab sofort" />
          </label>
          <div className="flex items-end gap-2">
            <label className="flex-1">
              <span className="gj-label">€ min</span>
              <input type="number" className="gj-input" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
            </label>
            <label className="flex-1">
              <span className="gj-label">€ max</span>
              <input type="number" className="gj-input" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
            </label>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button type="submit" className="gj-btn-primary" disabled={loading}>
            {loading ? "Lade…" : "Suchen"}
          </button>
        </div>
      </form>

      <p className="text-sm text-[var(--gj-muted)]">
        Wir haben <span className="font-semibold text-[var(--gj-primary)]">{workers.length}</span> Kandidaten gefunden
      </p>

      {loading && workers.length === 0 ? (
        <div className="gj-card p-12 text-center text-sm text-[var(--gj-muted)]">Lade…</div>
      ) : workers.length === 0 ? (
        <div className="gj-card p-12 text-center text-sm text-[var(--gj-muted)]">
          Keine Treffer mit diesen Filtern.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workers.map((w) => (
            <CandidateCard key={w.id} data={w} />
          ))}
        </div>
      )}
    </div>
  );
}
