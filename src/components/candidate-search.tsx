"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CandidateCard, type CandidateCardData } from "@/components/candidate-card";
import { CandidateProfilePanel } from "@/components/candidate-profile-panel";
import { SlideOver } from "@/components/slide-over";
import { EMPLOYMENT_KIND_OPTIONS } from "@/lib/employment-kinds";
import { WORKER_AVAILABILITY_OPTIONS } from "@/lib/worker-availability";
import { BriefcaseIcon, EuroIcon, MapPinIcon, UsersIcon } from "@/components/icons";

export function CandidateSearch() {
  const [professionField, setProfessionField] = useState("");
  const [region, setRegion] = useState("");
  const [availability, setAvailability] = useState("");
  const [employmentKind, setEmploymentKind] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [workers, setWorkers] = useState<CandidateCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [active, setActive] = useState<CandidateCardData | null>(null);

  const salaryParam = useMemo(() => {
    if (!salaryMin && !salaryMax) return "";
    return `${salaryMin || ""}-${salaryMax || ""}`;
  }, [salaryMin, salaryMax]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (professionField.trim()) n++;
    if (region.trim()) n++;
    if (availability) n++;
    if (employmentKind) n++;
    if (salaryMin || salaryMax) n++;
    return n;
  }, [professionField, region, availability, employmentKind, salaryMin, salaryMax]);

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams();
    if (professionField.trim()) q.set("professionField", professionField.trim());
    if (region.trim()) q.set("region", region.trim());
    if (availability) q.set("availability", availability);
    if (employmentKind) q.set("employmentKind", employmentKind);
    if (salaryParam) q.set("salary", salaryParam);
    const res = await fetch(`/api/workers/search?${q.toString()}`);
    const data = (await res.json()) as { workers?: CandidateCardData[] };
    setWorkers(data.workers ?? []);
    setLoading(false);
  }, [professionField, region, availability, employmentKind, salaryParam]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 350);
    return () => window.clearTimeout(timer);
  }, [load]);

  function resetFilters() {
    setProfessionField("");
    setRegion("");
    setAvailability("");
    setEmploymentKind("");
    setSalaryMin("");
    setSalaryMax("");
  }

  function openCandidate(data: CandidateCardData) {
    setActive(data);
    setDrawerOpen(true);
  }

  const requestContact = useCallback(async (): Promise<{ ok: boolean; matchId?: string }> => {
    if (!active) return { ok: false };
    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workerProfileId: active.id,
        introMessage: "Wir möchten Sie gerne kennenlernen.",
      }),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: string; matchId?: string };
    if (res.status === 409) {
      return { ok: true };
    }
    if (!res.ok) {
      alert(j.error || "Anfrage fehlgeschlagen.");
      return { ok: false };
    }
    return { ok: true, matchId: j.matchId };
  }, [active]);

  return (
    <>
      <div className="space-y-5">
        <section className="overflow-hidden rounded-2xl border border-[var(--gj-border)] bg-white shadow-sm">
          <div className="border-b border-[var(--gj-border)] bg-[var(--gj-primary-softer)]/40 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[var(--gj-primary)] shadow-sm">
                  <UsersIcon className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-[var(--gj-text)]">Kandidaten filtern</h2>
                  <p className="text-xs text-[var(--gj-muted)]">
                    {loading ? "Suche läuft…" : `${workers.length} Treffer`}
                    {activeFilterCount > 0 ? ` · ${activeFilterCount} Filter aktiv` : ""}
                  </p>
                </div>
              </div>
              {activeFilterCount > 0 ? (
                <button type="button" className="gj-btn-ghost text-xs" onClick={resetFilters}>
                  Alle zurücksetzen
                </button>
              ) : null}
            </div>
          </div>

          <div className="space-y-5 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="gj-label flex items-center gap-1.5">
                  <BriefcaseIcon className="h-3.5 w-3.5" /> Berufsfeld
                </span>
                <input
                  className="gj-input"
                  value={professionField}
                  onChange={(e) => setProfessionField(e.target.value)}
                  placeholder="z. B. Vertrieb, IT, Pflege"
                />
              </label>
              <label>
                <span className="gj-label flex items-center gap-1.5">
                  <MapPinIcon className="h-3.5 w-3.5" /> PLZ / Ort
                </span>
                <input
                  className="gj-input"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="Berlin, München, Remote"
                />
              </label>
            </div>

            <div>
              <span className="gj-label">Beschäftigungsart</span>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setEmploymentKind("")}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    !employmentKind
                      ? "border-[var(--gj-primary)] bg-[var(--gj-primary-soft)] text-[var(--gj-primary)]"
                      : "border-[var(--gj-border)] text-[var(--gj-muted)] hover:border-[var(--gj-primary)]/40"
                  }`}
                >
                  Alle
                </button>
                {EMPLOYMENT_KIND_OPTIONS.map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => setEmploymentKind(kind)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      employmentKind === kind
                        ? "border-[var(--gj-primary)] bg-[var(--gj-primary-soft)] text-[var(--gj-primary)]"
                        : "border-[var(--gj-border)] text-[var(--gj-muted)] hover:border-[var(--gj-primary)]/40"
                    }`}
                  >
                    {kind}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label>
                <span className="gj-label">Verfügbarkeit</span>
                <select
                  className="gj-input"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                >
                  <option value="">Alle</option>
                  {WORKER_AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="gj-label flex items-center gap-1.5">
                  <EuroIcon className="h-3.5 w-3.5" /> Gehalt ab (€/Monat)
                </span>
                <input
                  type="number"
                  className="gj-input"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="3000"
                />
              </label>
              <label>
                <span className="gj-label flex items-center gap-1.5">
                  <EuroIcon className="h-3.5 w-3.5" /> Gehalt bis (€/Monat)
                </span>
                <input
                  type="number"
                  className="gj-input"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="8000"
                />
              </label>
            </div>
          </div>
        </section>

        {loading && workers.length === 0 ? (
          <div className="gj-card p-12 text-center text-sm text-[var(--gj-muted)]">Lade Kandidaten…</div>
        ) : workers.length === 0 ? (
          <div className="gj-card p-12 text-center text-sm text-[var(--gj-muted)]">
            Keine Treffer — Filter anpassen oder zurücksetzen.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workers.map((w) => (
              <CandidateCard key={w.id} data={w} onOpen={openCandidate} />
            ))}
          </div>
        )}
      </div>

      <SlideOver title="Kandidat" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {active ? (
          <CandidateProfilePanel
            slug={active.anonymousSlug}
            cardPreview={active}
            onContact={requestContact}
          />
        ) : null}
      </SlideOver>
    </>
  );
}
